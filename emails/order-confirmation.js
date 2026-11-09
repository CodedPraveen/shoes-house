function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function buildOrderConfirmationEmail({ order, accessUrl }) {
  const items = (order.items ?? []).map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee">${escapeHtml(item.productName)} (Size ${escapeHtml(item.size)}) × ${escapeHtml(item.quantity)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">₹${(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}</td>
    </tr>`).join("");
  const total = Number(order.total || 0).toLocaleString("en-IN");
  const paid = order.payments?.some((payment) => payment.status === "PAID");
  const paymentMethod = paid ? "Razorpay" : "Cash on Delivery";
  const continueUrl = new URL("/shoes", accessUrl).toString();
  const address = [
    order.shipLine1,
    order.shipLandmark,
    order.shipLine2,
    `${order.shipCity}, ${order.shipState} ${order.shipPincode}`,
    order.shipCountry,
  ].filter(Boolean).map(escapeHtml).join("<br>");
  return {
    subject: `Shoes House order confirmed — ${escapeHtml(order.orderNumber)}`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171717;line-height:1.5">
      <main style="max-width:600px;margin:32px auto;padding:24px">
        <p style="font-size:13px;letter-spacing:.14em;text-transform:uppercase">Shoes House</p>
        <h1 style="font-size:24px">Your order is confirmed</h1>
        <p>Hello ${escapeHtml(order.shipFullName)}, we have received your order.</p>
        <p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}</p>
        <table style="width:100%;border-collapse:collapse">${items}</table>
        <p style="text-align:right;font-size:18px"><strong>Total: ₹${total}</strong></p>
        <p><strong>Payment method:</strong> ${paymentMethod}<br><strong>Payment status:</strong> ${paid ? "Paid" : "Pending (Cash on Delivery)"}</p>
        <h2 style="font-size:16px">Shipping to</h2>
        <p>${escapeHtml(order.shipFullName)}<br>${address}<br>${escapeHtml(order.shipPhone)}</p>
        <p><a href="${escapeHtml(accessUrl)}" style="display:inline-block;background:#171717;color:white;padding:12px 18px;text-decoration:none">View order details</a></p>
        <p><a href="${escapeHtml(continueUrl)}">Continue shopping</a></p>
        <p style="font-size:12px;color:#666">This private link grants access to your order. Do not share it with anyone. It expires automatically.</p>
      </main></body></html>`,
  };
}
