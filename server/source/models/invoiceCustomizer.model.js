import mongoose from 'mongoose';

const invoiceCustomizerSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyAddress: {
        type: String,
        required: true,
    },
    companyPhone: {
        type: String,
        required: true,
    },
    companyEmail: {
        type: String,
        required: true,
    },
    companyGSTIN: {
        type: String,
        required: true,
    },
    companyLogo: {
        type: String,
    },
    companyLogoPublicId: {
        type: String,
    },
    companyInvoiceLayoutId:{
        type: String,
        default: "invoiceDesign1",
    },
    companySignature: {
        type: String,
    },
    companySignaturePublicId: {
        type: String,
    },
}, { timestamps: true })

export const InvoiceCustomizer = mongoose.model('InvoiceCustomizer', invoiceCustomizerSchema);