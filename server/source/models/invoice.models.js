import mongoose from 'mongoose';

const invoiceItemsSchema = new mongoose.Schema({
    itemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        default: null,
    },
    quantity: {
        type: Number,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    itemMRP: {
        type: Number,
        required: true,
    },
    itemSellingPrice: {
        type: Number,
        required: true,
    },
    itemDiscount: {
        type: Number,
        required: true,
    },
    itemDiscountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    itemImage: {
        type: String,
        default: null,
    },
    itemDiscountAmount: {
        type: Number,
        required: true,
    },
})

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    invoiceDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    invoiceItems: [invoiceItemsSchema],
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true,
    },
    grandTotal: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
    },
    terms: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Overdue'],
        default: 'Unpaid',
    }
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);


const invoiceCounterSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sequence: {
      type: Number,
      default: 0,
    },
  }, {timestamps: true})

  export const InvoiceCounter = mongoose.model('InvoiceCounter', invoiceCounterSchema);