/**
 * Invoice generation — future PDF download via @react-pdf/renderer or puppeteer.
 */

export const invoiceService = {
  async generatePdf(orderId) {
    return {
      ok: false,
      orderId,
      message: "PDF invoice generation not implemented.",
    };
  },

  async getInvoiceData(orderId) {
    return {
      orderId,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  },
};
