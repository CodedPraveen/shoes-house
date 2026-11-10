
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

export function buildOrderConfirmationEmail({ order, accessUrl }) {
  const items = (order.items ?? []).map((item) => `
  < tr >
      <td style="padding:14px 0;border-bottom:1px solid #292525;font-size:13px;color:#ffffff">
        ${escapeHtml(item.productName)}
        <span style="color:#999999"> (Size ${escapeHtml(item.size)}) × ${escapeHtml(item.quantity)}</span>
      </td>
      <td align="right" style="padding:14px 0;border-bottom:1px solid #292525;font-size:13px;color:#ffffff;white-space:nowrap">
        ₹${(Number(item.priceAtPurchase || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}
      </td>
    </ >
  `).join("");

  const total = Number(order.total || 0).toLocaleString("en-IN");

  const paid = order.payments?.some(
    (payment) => payment.status === "PAID"
  );

  const paymentMethod = paid ? "Razorpay" : "Cash on Delivery";

  const paymentStatus = paid
    ? "Paid"
    : "Pending (Cash on Delivery)";

  const continueUrl = new URL("/shoes", accessUrl).toString();

  const address = [
    order.shipLine1,
    order.shipLandmark,
    order.shipLine2,
    `${order.shipCity}, ${order.shipState} ${order.shipPincode} `,
    order.shipCountry,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");

  return {
    subject: `Post Mart order confirmed — ${escapeHtml(order.orderNumber)} `,

    html: `
  < !DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >
    <html dir="ltr" lang="en">
      <head>
        <meta content="width=device-width" name="viewport" />
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
      </head>

      <body style="background-color:#000000;margin:0;padding:0;color:#ffffff;font-family:Arial,Helvetica,sans-serif">

        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#000000">
          <tbody>
            <tr>
              <td align="center" style="padding:24px 12px">

                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                  style="max-width:600px;background-color:#090707;color:#ffffff">

                  <tbody>
                    <tr>
                      <td style="padding:28px 24px">

                        <!-- BRAND -->
                        <p style="margin:0 0 28px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#ffffff">
                          POST MART
                        </p>

                        <!-- HEADING -->
                        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.3;font-weight:600;color:#ffffff">
                          Thank you for your order!
                        </h1>

                        <p style="margin:0 0 26px;font-size:14px;line-height:1.8;color:#bdbdbd">
                          Hi ${escapeHtml(order.shipFullName)},
                          <br /><br />
                          Great news! Your order has been successfully placed with Post Mart.
                          We're getting everything ready and will keep you updated as your order progresses.
                        </p>

                        <!-- ORDER INFORMATION -->
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                          style="border:1px solid #292525;border-collapse:collapse">
                          <tbody>
                            <tr>
                              <td style="padding:16px">
                                <p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;color:#888888">
                                  ORDER NUMBER
                                </p>
                                <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff">
                                  ${escapeHtml(order.orderNumber)}
                                </p>
                              </td>
                              <td align="right" style="padding:16px">
                                <p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;color:#888888">
                                  ORDER STATUS
                                </p>
                                <p style="margin:0;font-size:13px;font-weight:600;color:#d6b77a">
                                  Confirmed
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- ORDER SUMMARY -->
                        <h2 style="margin:30px 0 14px;font-size:16px;color:#ffffff">
                          Order Summary
                        </h2>

                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                          style="border-collapse:collapse">
                          <tbody>
                            ${items}
                          </tbody>
                        </table>

                        <!-- TOTAL -->
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                          style="margin-top:16px;border-top:1px solid #292525">
                          <tbody>
                            <tr>
                              <td style="padding:16px 0;font-size:17px;font-weight:600;color:#ffffff">
                                Total Paid
                              </td>
                              <td align="right" style="padding:16px 0;font-size:19px;font-weight:600;color:#ffffff">
                                ₹${total}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- PAYMENT INFORMATION -->
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                          style="margin-top:12px;background-color:#111010">
                          <tbody>
                            <tr>
                              <td style="padding:16px">
                                <p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;color:#888888">
                                  PAYMENT INFORMATION
                                </p>
                                <p style="margin:0;font-size:13px;line-height:1.8;color:#ffffff">
                                  Payment Method: ${paymentMethod}
                                  <br />
                                  Payment Status: ${paymentStatus}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- SHIPPING ADDRESS -->
                        <h2 style="margin:30px 0 12px;font-size:16px;color:#ffffff">
                          Delivery Address
                        </h2>

                        <p style="margin:0;font-size:13px;line-height:1.9;color:#bdbdbd">
                          ${escapeHtml(order.shipFullName)}
                          <br />
                          ${address}
                          <br />
                          Phone: ${escapeHtml(order.shipPhone)}
                        </p>

                        <!-- ORDER BUTTON -->
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:30px">
                          <tbody>
                            <tr>
                              <td align="center" style="background-color:#ffffff">
                                <a
                                  href="${escapeHtml(accessUrl)}"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style="display:inline-block;padding:14px 24px;color:#000000;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:.04em"
                                >
                                  VIEW YOUR ORDER
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- NEXT STEPS -->
                        <p style="margin:30px 0 8px;font-size:14px;color:#ffffff">
                          What's next?
                        </p>

                        <p style="margin:0;font-size:13px;line-height:1.8;color:#999999">
                          We'll notify you when your order is ready for dispatch and when it's on its way to your doorstep.
                        </p>

                        <!-- FOOTER -->
                        <p style="margin:26px 0 0;font-size:13px;line-height:1.8;color:#bdbdbd">
                          Thank you for choosing Post Mart.
                          <br />
                          We appreciate your trust and hope you enjoy your purchase!
                        </p>

                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                          style="margin-top:32px;border-top:1px solid #292525">
                          <tbody>
                            <tr>
                              <td style="padding-top:20px">
                                <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;color:#ffffff">
                                  POST MART
                                </p>

                                <p style="margin:0;font-size:11px;line-height:1.8;color:#666666">
                                  Premium footwear. Everyday style.
                                  <br />
                                  This is an automated order confirmation email. Please do not reply directly to this message.
                                  <br /><br />
                                  © ${new Date().getFullYear()} Post Mart. All rights reserved.
                                </p>

                                <p style="margin:18px 0 0;font-size:12px">
                                  <a
                                    href="${escapeHtml(continueUrl)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style="color:#999999;text-decoration:underline"
                                  >
                                    Continue shopping
                                  </a>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                      </td>
                    </tr>
                  </tbody>
                </table>

              </td>
            </tr>
          </tbody>
        </table>

      </body>
    </html>
`,
  };
}
