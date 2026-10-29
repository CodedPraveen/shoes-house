
import { checkoutService } from "@/services/checkout-service";
import { addressService, toCheckoutAddress } from "@/services/address-service";
import { assertRateLimit } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/require-db-user";
import { firstAddressError, validateAddressInput } from "@/lib/address-validation";
import { razorpayService } from "@/services/payment/razorpay-service";
import { fulfillPaidCheckout } from "@/services/order-fulfillment-service";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  return requireDbUser({ throwIfMissing: false });
}

async function resolveShippingAddress(userId, input, options = {}) {
  let candidate = { ...input };

  if (input.addressId) {
    if (!userId) {
      throw new Error("Guests cannot use saved addresses");
    }

    const saved = await addressService.getByIdForUser(
      userId,
      input.addressId
    );

    if (!saved) throw new Error("Saved address not found");

    candidate = {
      ...toCheckoutAddress(saved),
      email: input.email,
    };
  }

  const result = validateAddressInput(candidate, options);

  if (!result.isValid) {
    throw new Error(firstAddressError(result.errors));
  }

  return result.address;
}

async function getCheckoutIdentity(user, input) {
  const email = user?.email || input.email;

  if (!user && !email) {
    throw new Error("Email address is required for guest checkout");
  }

  return {
    userId: user?.id ?? null,
    email,
  };
}

export async function createBuyNowCheckoutSession(input) {
  try {
    await assertRateLimit({
      prefix: "checkout-buy-now",
      limit: 8,
      windowMs: 60000,
    });

    const user = await getCurrentUser();
    const identity = await getCheckoutIdentity(user, input);

    const shipping = await resolveShippingAddress(
      user?.id ?? null,
      { ...input, email: identity.email },
      { requireEmail: true }
    );

    shipping.saveShippingAddress = Boolean(
      user && input.saveShippingAddress && !input.addressId
    );

    const {
      productId,
      size,
      quantity = 1,
      paymentMethod = "razorpay",
    } = input;

    if (!productId || !size) {
      return { ok: false, error: "Missing product selection" };
    }

    const address = {
      ...shipping,
      email: identity.email,
    };

    if (paymentMethod === "cod") {
      const order = await checkoutService.createBuyNowOrder(
        identity.userId,
        address,
        { productId, size, quantity },
        "cod"
      );

      return {
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        guestAccessToken: order.guestAccessToken ?? null,
      };
    }

    const session = await checkoutService.createBuyNowPaymentSession(
      identity.userId,
      address,
      { productId, size, quantity }
    );

    return { ok: true, ...session };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Checkout failed",
    };
  }
}

export async function createCartCheckoutSession(input) {
  try {
    await assertRateLimit({
      prefix: "checkout",
      limit: 8,
      windowMs: 60000,
    });

    const user = await getCurrentUser();
    const identity = await getCheckoutIdentity(user, input);

    const shipping = await resolveShippingAddress(
      identity.userId,
      { ...input, email: identity.email },
      { requireEmail: true }
    );

    shipping.saveShippingAddress = Boolean(
      user && input.saveShippingAddress && !input.addressId
    );

    const address = {
      ...shipping,
      email: identity.email,
    };

    const paymentMethod = input.paymentMethod || "razorpay";

    if (paymentMethod === "cod") {
      const order = await checkoutService.createCartOrder(
        identity.userId,
        address,
        "cod",
        input.cartItems
      );

      return {
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        guestAccessToken: order.guestAccessToken ?? null,
      };
    }

    const session = await checkoutService.createPaymentSession(
      identity.userId,
      address,
      input.cartItems
    );

    return { ok: true, ...session };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Checkout failed",
    };
  }
}

export async function verifyRazorpayPayment(input) {
  try {
    await assertRateLimit({
      prefix: "checkout-verify",
      limit: 12,
      windowMs: 60000,
    });

    const user = await getCurrentUser();

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = input || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return {
        ok: false,
        error: "Payment details are incomplete.",
      };
    }

    if (!razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      signature: razorpaySignature,
    })) {
      return { ok: false, error: "Payment verification failed." };
    }

    const payment = await razorpayService.getPayment(razorpayPaymentId);

    if (
      payment.order_id !== razorpayOrderId ||
      (payment.status !== "captured" && payment.captured !== true)
    ) {
      return {
        ok: false,
        pending: true,
        error: "Payment is still being confirmed.",
      };
    }

    const result = await fulfillPaidCheckout({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaise: Number(payment.amount),
      expectedUserId: user?.id ?? null,
      rawPayload: {
        source: "checkout-verification",
        payment: {
          id: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          captured: payment.captured,
        },
      },
    });

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return {
      ok: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      guestAccessToken: result.guestAccessToken ?? null,
      duplicate: Boolean(result.duplicate),
    };
  } catch (error) {
    console.error("[checkout] verification failed:", error);

    return {
      ok: false,
      error: error.message || "Payment verification failed.",
    };
  }
}
