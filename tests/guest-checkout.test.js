import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validateAddressInput } from "../lib/address-validation.js";
import { getCheckoutIdempotencyKey } from "../lib/checkout-client-idempotency.js";
import { buildOrderConfirmationEmail } from "../emails/order-confirmation.js";
import { guestOrderAccessService } from "../services/guest/guest-order-access-service.js";
import { razorpayService } from "../services/payment/razorpay-service.js";
import {
  assertPaymentMatchesCheckout,
  validateRazorpayPaymentState,
} from "../services/payment/payment-validation.js";
import {
  decryptNotificationToken,
  encryptNotificationToken,
} from "../services/notifications/notification-token-crypto.js";
import { buildGuestOrderUrl } from "../services/notifications/order-notification-outbox.js";
import { normalizeIndianPhone } from "../services/notifications/phone.js";
import {
  isWhatsAppConfigured,
  sendWhatsAppOrderConfirmation,
} from "../services/notifications/whatsapp-client.js";
import { checkoutPayloadFingerprint } from "../services/checkout-idempotency-service.js";
import {
  ClerkIdentityConflictError,
  assertEmailIsUnclaimed,
  isClerkIdentityConflict,
} from "../lib/clerk-identity-conflict.js";
import { resolveDbUserFromClerk } from "../lib/db-user-resolution.js";
import { getCheckoutIdentity } from "../lib/checkout-identity.js";
import { processClerkWebhookEvent } from "../lib/clerk-webhook-event.js";
import { guestOrderErrorResponse, guestOrderResponse } from "../lib/guest-order-response.js";

const validAddress = {
  fullName: "Guest Customer",
  email: "registered@example.com",
  phone: "9876543210",
  line1: "12 Market Road",
  city: "Jaipur",
  state: "Rajasthan",
  country: "India",
  pincode: "302001",
};

test("guest contact and shipping validation accepts a registered-style email", () => {
  const result = validateAddressInput(validAddress, { requireEmail: true });
  assert.equal(result.isValid, true);
  assert.equal(result.address.email, "registered@example.com");
});

test("signed-out guest does not synchronize a Clerk identity", async () => {
  let lookupCalls = 0;
  let upsertCalls = 0;
  const result = await resolveDbUserFromClerk({
      throwIfMissing: false,
      auth: async () => ({ userId: null }),
      userService: {
        getByClerkId: async () => { lookupCalls += 1; },
        upsertFromClerk: async () => { upsertCalls += 1; },
      },
      clerkClient: async () => { throw new Error("must not load Clerk user"); },
  });
  assert.equal(result, null);
  assert.equal(lookupCalls, 0);
  assert.equal(upsertCalls, 0);
});

test("guest checkout keeps form email and nullable ownership", async () => {
  const email = "existing-customer@example.com";
  assert.deepEqual(getCheckoutIdentity(null, { email }), { userId: null, email });
});

test("matching email never links different Clerk identities", async () => {
  const updates = [];
  const db = {
    user: {
      findUnique: async ({ where }) => (where.email ? { id: "historical-user" } : null),
      update: async (value) => { updates.push(value); return value; },
      create: async () => { throw new Error("must not create or link"); },
    },
  };
  await assert.rejects(
    async () => assertEmailIsUnclaimed(
      await db.user.findUnique({ where: { email: "existing-customer@example.com" } }),
    ),
    (error) => isClerkIdentityConflict(error),
  );
  assert.equal(updates.length, 0);
});

test("expected identity conflicts are predictable for optional database users", async () => {
  const conflict = new ClerkIdentityConflictError();
  const result = await resolveDbUserFromClerk({
      throwIfMissing: false,
      auth: async () => ({ userId: "clerk-conflict" }),
      userService: {
        getByClerkId: async () => null,
        upsertFromClerk: async () => { throw conflict; },
      },
      clerkClient: async () => ({ users: { getUser: async () => ({ id: "clerk-conflict", emailAddresses: [{ emailAddress: "existing@example.com" }] }) } }),
  });
  assert.equal(result, null);
});

test("unexpected database user-resolution failures are not downgraded to guests", async () => {
  await assert.rejects(
    resolveDbUserFromClerk({
      throwIfMissing: false,
      auth: async () => ({ userId: "clerk-user" }),
      userService: { getByClerkId: async () => { throw new Error("database unavailable"); } },
      clerkClient: async () => { throw new Error("must not load Clerk user"); },
    }),
    /database unavailable/,
  );
});

test("Clerk webhooks safely acknowledge expected identity conflicts", async () => {
  const result = await processClerkWebhookEvent(
    { type: "user.created", data: { id: "clerk-conflict", email_addresses: [{ email_address: "existing@example.com" }] } },
    {
      userService: { upsertFromClerk: async () => { throw new ClerkIdentityConflictError(); } },
      isAdminUser: () => false,
    },
  );
  assert.deepEqual(result, { received: true, skipped: true, reason: "identity_conflict" });
});

test("Clerk webhook preserves administrator role selection", async () => {
  let payload;
  await processClerkWebhookEvent(
    { type: "user.updated", data: { id: "admin-clerk", email_addresses: [{ email_address: "admin@example.com" }], public_metadata: { role: "admin" } } },
    {
      userService: { upsertFromClerk: async (value) => { payload = value; } },
      isAdminUser: (user) => user.publicMetadata.role === "admin",
    },
  );
  assert.equal(payload.role, "admin");
});

test("guest validation rejects invalid mobile, missing fields, and invalid address", () => {
  const invalidPhone = validateAddressInput({ ...validAddress, phone: "123" }, { requireEmail: true });
  assert.equal(invalidPhone.isValid, false);
  assert.match(invalidPhone.errors.phone, /valid 10-digit/);

  const missing = validateAddressInput({}, { requireEmail: true });
  assert.equal(missing.isValid, false);
  assert.ok(missing.errors.fullName && missing.errors.email && missing.errors.line1);

  const invalidPincode = validateAddressInput({ ...validAddress, pincode: "000000" }, { requireEmail: true });
  assert.equal(invalidPincode.isValid, false);
});

test("guest tokens are high entropy and only the matching token validates", () => {
  const first = guestOrderAccessService.createToken();
  const second = guestOrderAccessService.createToken();
  assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(guestOrderAccessService.validateToken(first.token, first.tokenHash), true);
  assert.equal(guestOrderAccessService.validateToken(second.token, first.tokenHash), false);
});

test("guest order access binds token to order and rejects expired/revoked links", async () => {
  const access = guestOrderAccessService.createToken();
  const baseOrder = {
    id: "order_1234567890",
    guestAccessTokenHash: access.tokenHash,
    guestAccessExpiresAt: new Date(Date.now() + 60_000),
    guestAccessRevokedAt: null,
  };
  const prisma = {
    order: {
      findFirst: async ({ where }) =>
        where.id === baseOrder.id && where.guestAccessTokenHash === access.tokenHash
          ? baseOrder
          : null,
    },
  };
  assert.equal((await guestOrderAccessService.getOrderAccess(prisma, access.token, baseOrder.id)).status, "valid");
  assert.equal((await guestOrderAccessService.getOrderAccess(prisma, access.token, "order_other_123")).status, "invalid");

  baseOrder.guestAccessExpiresAt = new Date(Date.now() - 1);
  assert.equal((await guestOrderAccessService.getOrderAccess(prisma, access.token, baseOrder.id)).status, "expired");
  baseOrder.guestAccessExpiresAt = new Date(Date.now() + 60_000);
  baseOrder.guestAccessRevokedAt = new Date();
  assert.equal((await guestOrderAccessService.getOrderAccess(prisma, access.token, baseOrder.id)).status, "invalid");
});

test("guest order API maps access outcomes to safe HTTP responses", () => {
  const order = {
    id: "order_1234567890",
    userId: null,
    guestAccessTokenHash: "secret-hash",
    guestAccessExpiresAt: new Date(),
    guestAccessRevokedAt: null,
    guestEmail: "registered@example.com",
  };
  const valid = guestOrderResponse({ status: "valid", order });
  assert.equal(valid.status, 200);
  assert.equal(valid.body.id, order.id);
  assert.equal("guestAccessTokenHash" in valid.body, false);
  assert.equal("userId" in valid.body, false);
  assert.equal(valid.headers["Cache-Control"], "no-store, private");
  assert.equal(valid.headers["Referrer-Policy"], "no-referrer");
  assert.equal(guestOrderResponse({ status: "invalid", order: null }).status, 404);
  assert.equal(guestOrderResponse({ status: "expired", order: null }).status, 410);
  assert.equal(guestOrderErrorResponse({ code: "RATE_LIMITED" }).status, 429);
  assert.equal(guestOrderErrorResponse(new Error("database unavailable")).status, 500);
});

test("Razorpay signatures and captured payment state are validated", () => {
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_SECRET = "test-secret";
  try {
    const orderId = "order_test";
    const paymentId = "pay_test";
    const signature = createHmac("sha256", "test-secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    assert.equal(razorpayService.verifyPaymentSignature({ razorpayOrderId: orderId, razorpayPaymentId: paymentId, signature }), true);
    assert.equal(razorpayService.verifyPaymentSignature({ razorpayOrderId: orderId, razorpayPaymentId: paymentId, signature: "0".repeat(64) }), false);

    assert.deepEqual(validateRazorpayPaymentState({ order_id: orderId, currency: "INR", status: "captured", captured: true }, orderId), { ok: true });
    assert.equal(validateRazorpayPaymentState({ order_id: "other", currency: "INR", status: "captured" }, orderId).ok, false);
    assert.equal(validateRazorpayPaymentState({ order_id: orderId, currency: "USD", status: "captured" }, orderId).ok, false);
    assert.equal(validateRazorpayPaymentState({ order_id: orderId, currency: "INR", status: "authorized" }, orderId).pending, true);
  } finally {
    if (originalSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
    else process.env.RAZORPAY_KEY_SECRET = originalSecret;
  }
});

test("checkout amount comparison rejects underpayment, overpayment, and wrong currency", () => {
  assert.doesNotThrow(() => assertPaymentMatchesCheckout({ amountPaise: 129900, currency: "INR", expectedTotal: 1299 }));
  assert.throws(() => assertPaymentMatchesCheckout({ amountPaise: 129899, currency: "INR", expectedTotal: 1299 }), /mismatch/);
  assert.throws(() => assertPaymentMatchesCheckout({ amountPaise: 129901, currency: "INR", expectedTotal: 1299 }), /mismatch/);
  assert.throws(() => assertPaymentMatchesCheckout({ amountPaise: 129900, currency: "USD", expectedTotal: 1299 }), /mismatch/);
});

test("COD idempotency fingerprints are stable and client keys rotate only when details change", () => {
  assert.equal(
    checkoutPayloadFingerprint({ b: 2, a: { d: 4, c: 3 } }),
    checkoutPayloadFingerprint({ a: { c: 3, d: 4 }, b: 2 }),
  );
  const ref = { current: null };
  const first = getCheckoutIdempotencyKey(ref, { item: "shoe", quantity: 1 });
  const replay = getCheckoutIdempotencyKey(ref, { item: "shoe", quantity: 1 });
  const changed = getCheckoutIdempotencyKey(ref, { item: "shoe", quantity: 2 });
  assert.equal(first, replay);
  assert.notEqual(first, changed);
});

test("notification token payloads are encrypted and private URLs preserve order binding", () => {
  const originalKey = process.env.NOTIFICATION_TOKEN_ENCRYPTION_KEY;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NOTIFICATION_TOKEN_ENCRYPTION_KEY = "11".repeat(32);
  process.env.NEXT_PUBLIC_APP_URL = "https://shop.example";
  try {
    const encrypted = encryptNotificationToken("private-token-value");
    assert.doesNotMatch(encrypted, /private-token-value/);
    assert.equal(decryptNotificationToken(encrypted), "private-token-value");
    const url = new URL(buildGuestOrderUrl("order_123", "private-token-value"));
    assert.equal(url.pathname, "/orders/order_123");
    assert.equal(url.searchParams.get("token"), "private-token-value");
  } finally {
    if (originalKey === undefined) delete process.env.NOTIFICATION_TOKEN_ENCRYPTION_KEY;
    else process.env.NOTIFICATION_TOKEN_ENCRYPTION_KEY = originalKey;
    if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

test("phone normalization accepts Indian E.164 input and rejects invalid numbers", () => {
  assert.equal(normalizeIndianPhone("98765 43210"), "+919876543210");
  assert.equal(normalizeIndianPhone("+91 98765 43210"), "+919876543210");
  assert.equal(normalizeIndianPhone("12345"), null);
});

test("WhatsApp is optional and provider failures stay at the notification boundary", async () => {
  const names = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_API_VERSION", "WHATSAPP_ORDER_TEMPLATE_NAME"];
  const original = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  try {
    for (const name of names) delete process.env[name];
    assert.equal(isWhatsAppConfigured(), false);
    assert.deepEqual(await sendWhatsAppOrderConfirmation({}), { skipped: true });

    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "phone-id";
    process.env.WHATSAPP_API_VERSION = "v1";
    process.env.WHATSAPP_ORDER_TEMPLATE_NAME = "order_confirmation";
    globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({}) });
    await assert.rejects(
      sendWhatsAppOrderConfirmation({
        order: { orderNumber: "ORD-1", total: 1000, payments: [] },
        recipient: "+919876543210",
        accessUrl: "https://shop.example/orders/order_1?token=secret",
      }),
      /503/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name];
      else process.env[name] = original[name];
    }
  }
});

test("order confirmation email contains order, products, payment, shipping, and escaped customer data", () => {
  const message = buildOrderConfirmationEmail({
    order: {
      orderNumber: "ORD-123",
      shipFullName: "Guest <Customer>",
      shipPhone: "9876543210",
      shipLine1: "12 Market Road",
      shipCity: "Jaipur",
      shipState: "Rajasthan",
      shipPincode: "302001",
      shipCountry: "India",
      total: 1499,
      items: [{ productName: "Runner", size: 9, quantity: 2, priceAtPurchase: 675 }],
      payments: [{ status: "PAID" }],
    },
    accessUrl: "https://shop.example/orders/order_123?token=private",
  });
  assert.match(message.subject, /ORD-123/);
  assert.match(message.html, /Runner/);
  assert.match(message.html, /Razorpay/);
  assert.match(message.html, /Jaipur/);
  assert.match(message.html, /Guest &lt;Customer&gt;/);
  assert.match(message.html, /Continue shopping/);
});
