import { formatPrice } from "@/lib/format-price";
import { orderService } from "@/services/order-service";

function getPaymentMethodLabel(order, payment) {
  if (payment?.paymentMethod) return payment.paymentMethod;
  if (payment?.status === "PAID") return "Razorpay";
  if (payment?.status === "PENDING") return "Cash on Delivery";
  return order?.status === "PENDING" ? "Cash on Delivery" : "Razorpay";
}

export const invoiceService = {
  async getInvoiceData(orderId) {
    const order = await orderService.getById(orderId);
    if (!order) return null;

    const payment = order.payments[0];

    return {
      invoiceNumber: order.orderNumber,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: payment?.status ?? "PENDING",
      paymentMethod: getPaymentMethodLabel(order, payment),
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

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${data.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 30px; }
    .brand { flex: 1; }
    .brand h1 { font-size: 32px; font-weight: 700; letter-spacing: 0.15em; margin-bottom: 5px; }
    .brand p { font-size: 13px; color: #666; margin-top: 5px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
    .invoice-info p { font-size: 13px; color: #666; margin: 3px 0; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
    .detail-box { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
    .detail-box h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-box p { font-size: 13px; margin: 4px 0; color: #444; }
    .detail-box p.label { color: #999; }
    .address-box { grid-column: 1 / -1; }
    .address-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .address-section > div h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .address-section > div { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
    .address-section p { font-size: 13px; margin: 4px 0; color: #444; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    table thead { background: #000; color: #fff; }
    table thead th { padding: 15px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    table tbody tr { border-bottom: 1px solid #e0e0e0; }
    table tbody td { padding: 15px; font-size: 13px; }
    table .product-name { font-weight: 600; }
    table .product-details { font-size: 11px; color: #999; margin-top: 2px; }
    table .qty { text-align: center; }
    table .amount { text-align: right; font-weight: 600; }
    .totals { display: flex; justify-content: flex-end; margin: 40px 0; }
    .totals-box { width: 350px; }
    .totals-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; }
    .totals-row.label { color: #666; }
    .totals-row.total { border-top: 2px solid #000; padding-top: 12px; font-weight: 700; font-size: 16px; margin-top: 5px; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #f0f0f0; margin-top: 30px; }
    .footer p { font-size: 12px; color: #999; }
    .footer a { color: #0066cc; text-decoration: none; }
    @media print { body { background: none; } }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <h1>Shoes House</h1>
        <p>Premium Sneaker Ecommerce</p>
        <p style="margin-top: 10px; font-size: 12px;">support@shoeshouse.com</p>
      </div>
      <div class="invoice-info">
        <h2>Invoice</h2>
        <p><strong>Invoice #:</strong> ${data.orderNumber}</p>
        <p><strong>Order #:</strong> ${data.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(data.createdAt).toLocaleDateString("en-IN")}</p>
      </div>
    </div>

    <!-- Customer & Payment Details -->
    <div class="details-grid">
      <div class="detail-box">
        <h3>Customer Details</h3>
        <p><strong>${data.customer.name}</strong></p>
        ${data.customer.email ? `<p>${data.customer.email}</p>` : ""}
        <p>${data.customer.phone}</p>
      </div>
      <div class="detail-box">
        <h3>Payment Details</h3>
        <p><span class="label">Payment Method:</span> <strong>${data.paymentMethod}</strong></p>
        <p><span class="label">Payment Status:</span> <strong>${data.paymentStatus}</strong></p>
        ${data.razorpayPaymentId ? `<p><span class="label">Payment ID:</span> <code style="font-size: 11px; word-break: break-all;">${data.razorpayPaymentId}</code></p>` : ""}
      </div>

      <!-- Shipping & Billing -->
      <div class="address-box">
        <div class="address-section">
          <div>
            <h3>Shipping Address</h3>
            <p>Shoes House</p>
            <p>Sanchore Road, Dhorimanna</p>
            <p>Dhorimanna, Rajasthan</p>
            <p>India - 344704</p>
          </div>
          <div>
            <h3>Delivery Address</h3>
            <p>${data.customer.name}</p>
            <p>${data.shipping.line1}</p>
            ${data.shipping.line2 ? `<p>${data.shipping.line2}</p>` : ""}
            <p>${data.shipping.city}, ${data.shipping.state}</p>
            <p>${data.shipping.country} - ${data.shipping.pincode}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item) => `
          <tr>
            <td>
              <div class="product-name">${item.name}</div>
              <div class="product-details">SKU: ${item.sku} ${item.color ? `• ${item.color}` : ""} ${item.size ? `• Size ${item.size}` : ""}</div>
            </td>
            <td class="qty">${item.quantity}</td>
            <td style="text-align: right;">${formatPrice(item.unitPrice)}</td>
            <td class="amount">${formatPrice(item.lineTotal)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row label">
          <span>Subtotal</span>
          <span>${formatPrice(data.subtotal)}</span>
        </div>
        <div class="totals-row label">
          <span>Shipping</span>
          <span>${formatPrice(data.shippingCost)}</span>
        </div>
        <div class="totals-row total">
          <span>Grand Total</span>
          <span>${formatPrice(data.total)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for shopping with Shoes House. For order status and support, visit our website.</p>
      <p style="margin-top: 8px; font-size: 11px;">This is not a GST invoice. For tax purposes, refer to your order confirmation email.</p>
    </div>
  </div>
</body>
</html>
`;
  },
};
