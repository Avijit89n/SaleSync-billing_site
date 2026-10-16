
import mongoose from "mongoose";

const { Schema } = mongoose;

const moneyField = (defaultValue = 0) => ({
  type: Number,
  required: true,
  default: defaultValue,
  min: 0,
  max: 999999999999.99,
  validate: {
    validator(value) {
      return (
        Number.isFinite(value) &&
        Math.abs(value - Math.round(value * 100) / 100) < 0.000001
      );
    },
    message: "Amount must have at most two decimal places.",
  },
});

const addressSchema = new Schema(
  {
    attention: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "India" },
    street1: { type: String, trim: true, default: "" },
    street2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    fax: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const invoiceItemSchema = new Schema(
  {
    itemID: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.000001,
      validate: {
        validator: Number.isFinite,
        message: "Quantity must be a valid number.",
      },
    },
    itemMRP: { ...moneyField(0), required: false },
    itemSellingPrice: { ...moneyField(0), required: true },
    itemDiscount: { ...moneyField(0), required: false },
    itemDiscountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      required: true,
    },
    itemDiscountAmount: { ...moneyField(0), required: false },
    discountedPrice: { ...moneyField(0), required: false },
    itemAmount: { ...moneyField(0), required: true },
    itemUnit: { type: String, trim: true, default: "" },
    itemDescription: { type: String, trim: true, default: "" },
    itemImage: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const paymentSchema = new Schema(
  {
    amount: {
      ...moneyField(0),
      validate: [
        {
          validator(value) {
            return Number.isFinite(value) && value > 0;
          },
          message: "Payment must be greater than zero.",
        },
      ],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Other"],
      default: "Cash",
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      immutable: true,
    },
    customerID: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 50,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 254,
      validate: {
        validator(value) {
          return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid customer email.",
      },
    },
    customerBillingAddress: {
      type: addressSchema,
      default: () => ({}),
    },
    customerShippingAddress: {
      type: addressSchema,
      default: () => ({}),
    },
    invoiceItems: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "An invoice must contain at least one item.",
      },
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    subtotal: moneyField(0),
    discount: moneyField(0),
    tax: moneyField(0),
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    grandTotal: moneyField(0),
    payments: {
      type: [paymentSchema],
      default: [],
    },
    paidAmount: moneyField(0),
    balanceAmount: moneyField(0),
    status: {
      type: String,
      enum: ["Paid", "Partially Paid", "Unpaid", "Cancel"],
      default: "Unpaid",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },
    terms: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
    strict: "throw",
    minimize: false,
    optimisticConcurrency: true,
  }
);

// Keep only indexes that are not already declared by field options.
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ customerID: 1, invoiceDate: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

invoiceSchema.pre("validate", function () {
  const roundMoney = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  if (
    this.invoiceDate &&
    this.dueDate &&
    this.dueDate < this.invoiceDate
  ) {
    this.invalidate("dueDate", "Due date cannot precede invoice date.");
  }

  const subtotal = roundMoney(this.subtotal);
  const discount = roundMoney(this.discount);
  const tax = roundMoney(this.tax);
  const total = roundMoney(this.grandTotal);
  const paid = roundMoney(this.paidAmount);
  const balance = roundMoney(this.balanceAmount);

  if (discount > subtotal) {
    this.invalidate("discount", "Discount cannot exceed subtotal.");
  }

  if (roundMoney(subtotal - discount + tax) !== total) {
    this.invalidate("grandTotal", "Invoice totals do not match.");
  }

  if (paid > total) {
    this.invalidate("paidAmount", "Paid amount cannot exceed grand total.");
  }

  if (balance !== roundMoney(Math.max(0, total - paid))) {
    this.invalidate("balanceAmount", "Incorrect remaining balance.");
  }

  const paymentsTotal = roundMoney(
    (this.payments || []).reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0
    )
  );

  if (Math.abs(paymentsTotal - paid) > 0.01) {
    this.invalidate(
      "payments",
      "Payment history does not match paid amount."
    );
  }

  let expectedStatus = "Unpaid";

  if (total > 0 && balance === 0) {
    expectedStatus = "Paid";
  } else if (paid > 0) {
    expectedStatus = "Partially Paid";
  }

  if (this.status !== "Cancel" && this.status !== expectedStatus) {
    this.invalidate("status", `Expected status: ${expectedStatus}.`);
  }
});

const invoiceCounterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator(value) {
          return Number.isSafeInteger(value);
        },
        message: "Invoice counter sequence must be a safe integer.",
      },
    },
  },
  { timestamps: true }
);

// The unique option on the name field already declares this index.

export const Invoice =
  mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);

export const InvoiceCounter =
  mongoose.models.InvoiceCounter ||
  mongoose.model("InvoiceCounter", invoiceCounterSchema);

export default Invoice;