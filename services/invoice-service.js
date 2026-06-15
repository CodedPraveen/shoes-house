import { formatPrice } from "@/lib/format-price";
import { orderService } from "@/services/order-service";

export const invoiceService = {
  async getInvoiceData(orderId) {
    const order = await orderService.getById(orderId);
    if (!order) return null;

    const payment = order.payments[0];

    return {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: payment?.status ?? "PENDING",
      razorpayPaymentId: payment?.razorpayPaymentId,
      customer: {
        name: order.shipFullName,
        phone: order.shipPhone,
        email: order.user?.email,
      },
      shipping: {
        line1: order.shipLine1,
        line2: order.shipLine2,
        city: order.shipCity,
        state: order.shipState,
        country: order.shipCountry,
        pincode: order.shipPincode,
      },
      items: order.items.map((item) => ({
        name: item.productName,
        sku: item.productSku,
        image: item.productImage,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.priceAtPurchase,
        lineTotal: item.priceAtPurchase * item.quantity,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
    };
  },

  buildInvoiceHtml(data) {
    if (!data) return "";

    const rows = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          ${item.name}<br/>
          <span style="color:#666;font-size:12px;">SKU: ${item.sku} · ${item.color} · ${item.size}</span>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.lineTotal)}</td>
      </tr>`,
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Invoice ${data.orderNumber}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;color:#111;">
  <h1 style="letter-spacing:0.2em;font-weight:600;">Shoes House</h1>
  <p style="color:#666;">Tax Invoice / Receipt</p>
  <p><strong>Order:</strong> ${data.orderNumber}<br/>
  <strong>Date:</strong> ${new Date(data.createdAt).toLocaleDateString("en-IN")}<br/>
  <strong>Payment:</strong> ${data.paymentStatus}${data.razorpayPaymentId ? ` · ${data.razorpayPaymentId}` : ""}</p>
  <h3>Ship to</h3>
  <p>${data.customer.name}<br/>${data.shipping.line1}${data.shipping.line2 ? `<br/>${data.shipping.line2}` : ""}<br/>
  ${data.shipping.city}, ${data.shipping.state} ${data.shipping.pincode}<br/>${data.shipping.country}<br/>${data.customer.phone}</p>
  <table style="width:100%;border-collapse:collapse;margin-top:24px;">
    <thead><tr style="text-align:left;border-bottom:2px solid #111;">
      <th style="padding:8px;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:24px;text-align:right;">
    <p>Subtotal: ${formatPrice(data.subtotal)}</p>
    <p>Shipping: ${formatPrice(data.shippingCost)}</p>
    <p style="font-size:18px;font-weight:600;">Total: ${formatPrice(data.total)}</p>
  </div>
  <p style="margin-top:40px;font-size:12px;color:#888;">Domestic shipping only. Thank you for shopping with Shoes House.</p>
</body>
</html>`;
  },
};
