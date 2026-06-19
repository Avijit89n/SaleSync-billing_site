import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    imagePublicId: {
        type: String,
    },
    MRP: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Avtive"
    },
    unit: {
        type: String,
        required: true,
    }
}, { timestamps: true })

export const Item = mongoose.model('Item', itemSchema);