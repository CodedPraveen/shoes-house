export class InsufficientStockError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "InsufficientStockError";
    this.code = "OUT_OF_STOCK";
    this.meta = meta;
  }
}

export class PaymentAmountMismatchError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "PaymentAmountMismatchError";
    this.code = "PAYMENT_AMOUNT_MISMATCH";
    this.meta = meta;
  }
}
