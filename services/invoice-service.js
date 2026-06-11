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


    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <script src="https://cdn.tailwindcss.com"></script>

  <title>Invoice ${data.invoiceNumber}</title>  
</head>

<body class="bg-white text-gray-900">

<div class="max-w-5xl mx-auto p-8">

  <!-- Header -->
  <div class="flex justify-between items-start border-b pb-6">
    
    <div>
      <h1 class="text-4xl font-bold tracking-[0.3em]">
        AERÉ
      </h1>

      <p class="text-gray-500 mt-2">
        Premium Footwear
      </p>

      <p class="text-sm text-gray-500">
        support@aere.com
      </p>
    </div>

    <div class="text-right">
      <h2 class="text-2xl font-semibold">
        Invoice
      </h2>

      <p class="text-sm text-gray-600 mt-2">
        Invoice #: ${data.invoiceNumber}
      </p>

      <p class="text-sm text-gray-600">
        Order #: ${data.orderNumber}
      </p>

      <p class="text-sm text-gray-600">
        ${new Date(data.createdAt).toLocaleDateString("en-IN")}
      </p>
    </div>

  </div>

  <!-- Customer + Payment -->
  <div class="grid grid-cols-2 gap-6 mt-8">

    <div class="border rounded-xl p-5">
      <h3 class="font-semibold text-lg mb-3">
        Customer Details
      </h3>

      <p class="font-medium">
        ${data.customer.name}
      </p>

      ${data.customer.email
        ? `<p class="text-gray-600">${data.customer.email}</p>`
        : ""
      }

      <p class="text-gray-600">
        ${data.customer.phone}
      </p>
    </div>

    <div class="border rounded-xl p-5">
      <h3 class="font-semibold text-lg mb-3">
        Payment Details
      </h3>

      <p>
        <span class="font-medium">
          Status:
        </span>
        ${data.paymentStatus}
      </p>

      <p>
        <span class="font-medium">
          Method:
        </span>
        ${data.paymentMethod}
      </p>

      ${data.razorpayPaymentId
        ? `
            <p class="break-all">
              <span class="font-medium">
                Payment ID:
              </span>
              ${data.razorpayPaymentId}
            </p>
          `
        : ""
      }
    </div>

  </div>

  <!-- Shipping -->
  <div class="border rounded-xl p-5 mt-6">

    <h3 class="font-semibold text-lg mb-3">
      Shipping Address
    </h3>

    <p>${data.customer.name}</p>

    <p>${data.shipping.line1}</p>

    ${data.shipping.line2
        ? `<p>${data.shipping.line2}</p>`
        : ""
      }

    <p>
      ${data.shipping.city},
      ${data.shipping.state}
    </p>

    <p>
      ${data.shipping.country}
      -
      ${data.shipping.pincode}
    </p>

  </div>

  <!-- Items -->
  <div class="mt-8">

    <table class="w-full border border-gray-200">

      <thead class="bg-black text-white">

        <tr>
          <th class="text-left p-3">
            Product
          </th>

          <th class="p-3">
            Qty
          </th>

          <th class="text-right p-3">
            Unit Price
          </th>

          <th class="text-right p-3">
            Total
          </th>
        </tr>

      </thead>

      <tbody>

        ${data.items
        .map(
          (item) => `
            <tr class="border-t">

              <td class="p-4">

                <div class="font-medium">
                  ${item.name}
                </div>

                <div class="text-xs text-gray-500 mt-1">
                  SKU: ${item.sku}
                  ${item.color ? ` • ${item.color}` : ""}
                  ${item.size ? ` • ${item.size}` : ""}
                </div>

              </td>

              <td class="text-center">
                ${item.quantity}
              </td>

              <td class="text-right p-4">
                ${formatPrice(item.unitPrice)}
              </td>

              <td class="text-right p-4 font-medium">
                ${formatPrice(item.lineTotal)}
              </td>

            </tr>
          `,
        )
        .join("")}

      </tbody>

    </table>

  </div>

  <!-- Totals -->
  <div class="flex justify-end mt-8">

    <div class="w-80">

      <div class="flex justify-between py-2">
        <span>Subtotal</span>
        <span>${formatPrice(data.subtotal)}</span>
      </div>

      <div class="flex justify-between py-2">
        <span>Shipping</span>
        <span>${formatPrice(data.shippingCost)}</span>
      </div>

      <div class="flex justify-between py-4 border-t text-xl font-bold">
        <span>Total</span>
        <span>${formatPrice(data.total)}</span>
      </div>

    </div>

  </div>

  <div class="mt-12 text-center text-sm text-gray-500">
    Thank you for shopping with AERÉ.
  </div>

</div>

</body>
</html>
`;
  },
};
