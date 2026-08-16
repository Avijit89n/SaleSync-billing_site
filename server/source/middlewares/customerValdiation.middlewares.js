import mongoose from "mongoose";
import { Customer } from "../models/customer.models.js";
import ApiError from "../utils/apiError.js";

const customerValidation = async (req, res, next) => {
    console.log("customerValidation middleware called");
    
    try {
        const { customerId, customerName, customerPhone } = req.body;
        if (!customerId || !customerName) {
            return next(new ApiError("Customer name and ID are required", 400));
        }
        const isValidObjectId = mongoose.Types.ObjectId.isValid(customerId);

        if (!isValidObjectId) {
            const newCustomer = await Customer.create({
                displayName: customerName,
                workingPhone: customerPhone || "",
            });

            console.log("New customer created with ID:", newCustomer._id);
            req.body.customerId = newCustomer._id.toString();
        }
        next();

    } catch (error) {
        console.error("Error in customerValidation:", error);
        return next(new ApiError(error.message || "Failed to validate/create customer", 500, error));
    }
}

export { customerValidation }