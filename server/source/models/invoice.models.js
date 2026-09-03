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
    itemUnit: {
        type: String,
        default: 'pcs',
    },
    itemDescription: {
        type: String,
        default: null,
    },
    itemImage: {
        type: String,
        default: null,
    },
    itemDiscountAmount: {
        type: Number,
        required: true,
    },
});


// Payment transaction schema
const invoicePaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        enum: [
            'Cash',
            'UPI',
            'Card',
            'Bank Transfer',
            'Other',
        ],
        default: 'Cash',
        required: true,
    },
    note: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});


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

    customerPhone: {
        type: String,
        required: true,
        trim: true,
    },

    customerEmail: {
        type: String,
    },

    customerBillingAddress: {
        attention: {
            type: String,
            trim: true,
            default: ""
        },

        country: {
            type: String,
            trim: true,
            default: "India"
        },

        street1: {
            type: String,
            trim: true,
            default: ""
        },

        street2: {
            type: String,
            trim: true,
            default: ""
        },

        city: {
            type: String,
            trim: true,
            default: ""
        },

        state: {
            type: String,
            trim: true,
            default: ""
        },

        pincode: {
            type: String,
            trim: true,
            default: ""
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        fax: {
            type: String,
            trim: true,
            default: ""
        }
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

    // Payment history
    payments: {
        type: [invoicePaymentSchema],
        default: [],
    },

    // Total paid so far
    paidAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Remaining amount
    balanceAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

    status: {
        type: String,
        enum: [
            'Paid',
            'Partially Paid',
            'Unpaid',
            'Cancel',
        ],
        default: 'Unpaid',
    },

    notes: {
        type: String,
    },

    terms: {
        type: String,
    },

}, {
    timestamps: true,
});


export const Invoice = mongoose.model(
    'Invoice',
    invoiceSchema
);


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

}, {
    timestamps: true,
});


export const InvoiceCounter = mongoose.model(
    'InvoiceCounter',
    invoiceCounterSchema
);