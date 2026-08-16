"use server";

import { checkoutService } from "@/services/checkout-service";
import {
  addressService,
  toCheckoutAddress,
} from "@/services/address-service";
import { assertRateLimit } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/require-db-user";
import {
  firstAddressError,
  validateAddressInput,
} from "@/lib/address-validation";
import { razorpayService } from "@/services/payment/razorpay-service";
import { fulfillPaidCheckout } from "@/services/order-fulfillment-service";
import { revalidatePath } from "next/cache";

async function resolveShippingAddress(userId, { addressId, ...manual }) {
  if (addressId) {
    const saved = await addressService.getByIdForUser(userId, addressId);
    if (!saved) throw new Error("Saved address not found");
    return toCheckoutAddress(saved);
  }

  const result = validateAddressInput(manual);
  if (!result.isValid) {
    throw new Error(firstAddressError(result.errors));
  }

  return result.address;
}

export async function createBuyNowCheckoutSessionAction(input) {
  const user = await requireDbUser();

  try {
    await assertRateLimit({ prefix: "checkout-buy-now", limit: 8, windowMs: 60_000 });
    const shipping = await resolveShippingAddress(user.id, input);
    shipping.saveShippingAddress = Boolean(input.saveShippingAddress && !input.addressId);
    const { productId, size, quantity = 1, paymentMethod = "razorpay" } = input;

    if (!productId || !size) {
      return { ok: false, error: "Missing product selection" };
    }

    if (paymentMethod === "cod") {
      const order = await checkoutService.createBuyNowOrder(
        user.id,
        { ...shipping, email: user.email },
        { productId, size, quantity: Number(quantity) || 1 },
        paymentMethod,
      );
      return { ok: true, orderId: order.id };
    }

    const session = await checkoutService.createBuyNowPaymentSession(
      user.id,
      { ...shipping, email: user.email },
      { productId, size, quantity: Number(quantity) || 1 },
    );
    return { ok: true, ...session };
  } catch (err) {
    return { ok: false, error: err.message || "Checkout failed" };
  }
}

export async function createCheckoutSessionAction(input) {
  const user = await requireDbUser();

  try {
    await assertRateLimit({
      prefix: "checkout",
      limit: 8,
      windowMs: 60_000,
    });

    const shipping = await resolveShippingAddress(user.id, input);
    shipping.saveShippingAddress = Boolean(input.saveShippingAddress && !input.addressId);

    const { paymentMethod = "razorpay" } = input;

    if (paymentMethod === "cod") {
      const order = await checkoutService.createCartOrder(
        user.id,
        {
          ...shipping,
          email: user.email,
        },
        paymentMethod
      );

      return {
        ok: true,
        orderId: order.id,
      };
    }

    const session = await checkoutService.createPaymentSession(user.id, {
      ...shipping,
      email: user.email,
    });

    return { ok: true, ...session };
  } catch (err) {
    return {
      ok: false,
      error: err.message || "Checkout failed",
    };
  }
}

export async function verifyRazorpayPaymentAction(input) {
  const user = await requireDbUser();

  try {
    await assertRateLimit({
      prefix: "checkout-verify",
      limit: 12,
      windowMs: 60_000,
    });

    const razorpayOrderId =
      typeof input?.razorpayOrderId === "string" ? input.razorpayOrderId : "";
    const razorpayPaymentId =
      typeof input?.razorpayPaymentId === "string" ? input.razorpayPaymentId : "";
    const razorpaySignature =
      typeof input?.razorpaySignature === "string" ? input.razorpaySignature : "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return {
        ok: false,
        error: "Payment details are incomplete. Please check My Orders before retrying.",
      };
    }

    if (
      !razorpayService.verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        signature: razorpaySignature,
      })
    ) {
      return { ok: false, error: "Payment verification failed." };
    }

    const payment = await razorpayService.getPayment(razorpayPaymentId);

    if (payment.order_id !== razorpayOrderId) {
      return { ok: false, error: "Payment does not match this checkout." };
    }

    if (payment.status !== "captured" && payment.captured !== true) {
      return {
        ok: false,
        pending: true,
        error:
          "Payment was received and is still being confirmed. Please check My Orders shortly.",
      };
    }

    const result = await fulfillPaidCheckout({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaise: Number(payment.amount),
      expectedUserId: user.id,
      rawPayload: {
        source: "checkout-verification",
        payment: {
          id: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          captured: payment.captured,
        },
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${result.orderId}`);
    revalidatePath("/admin/orders");

    return {
      ok: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      duplicate: Boolean(result.duplicate),
    };
  } catch (error) {
    console.error("[checkout] Razorpay payment persistence failed", {
      razorpayOrderId: input?.razorpayOrderId,
      razorpayPaymentId: input?.razorpayPaymentId,
      message: error?.message,
    });

    return {
      ok: false,
      paid: true,
      recoverable: true,
      error:
        "Payment was received, but we could not finish saving the order yet. Please check My Orders shortly; do not pay again.",
    };
  }
}
