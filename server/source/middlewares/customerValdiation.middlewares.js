import mongoose from "mongoose";
import { Customer } from "../models/customer.models.js";
import ApiError from "../utils/apiError.js";

const customerValidation = async (req, res, next) => {
    try {
        const {
            customerId,
            customerName,
            customerPhone,
            customerEmail,
            customerBillingAddress,
            customerShippingAddress,
        } = req.body;
        if (!customerId) {
            return next(
                new ApiError("Customer is required", 400)
            );
        }
        const customerIdString = String(customerId);
        const isNewCustomer = customerIdString.startsWith("temp_");
        let customer;
        let isNewCustomerFlag = false;
        if (!isNewCustomer) {
            if (!mongoose.Types.ObjectId.isValid(customerIdString)) {
                return next(
                    new ApiError("Invalid customer ID", 400)
                );
            }
            customer = await Customer.findById(customerIdString);
            if (!customer) {
                return next(
                    new ApiError("Customer not found", 404)
                );
            }
        }
        else {
            isNewCustomerFlag = true;
            const name = String(customerName || "").trim();
            const phone = String(customerPhone || "").trim();
            if (!name) {
                return next(
                    new ApiError("Customer name is required", 400)
                );
            }
            if (!phone) {
                return next(
                    new ApiError("Customer phone is required for a new customer", 400)
                );
            }
            const existingCustomer = await Customer.findOne({ workingPhone: phone });
            if (existingCustomer) {
                customer = existingCustomer;
            }
            else {
                const billingAddress = {
                    attention: customerBillingAddress?.attention || "",
                    country: customerBillingAddress?.country || "India",
                    street1: customerBillingAddress?.street1 || "",
                    street2: customerBillingAddress?.street2 || "",
                    city: customerBillingAddress?.city || "",
                    state: customerBillingAddress?.state || "",
                    pincode: customerBillingAddress?.pincode || "",
                    phone: customerBillingAddress?.phone || phone,
                    fax: customerBillingAddress?.fax || "",
                };
                const shippingAddress = {
                    attention: customerShippingAddress?.attention || billingAddress.attention,
                    country: customerShippingAddress?.country || billingAddress.country,
                    street1: customerShippingAddress?.street1 || billingAddress.street1,
                    street2: customerShippingAddress?.street2 || billingAddress.street2,
                    city: customerShippingAddress?.city || billingAddress.city,
                    state: customerShippingAddress?.state || billingAddress.state,
                    pincode: customerShippingAddress?.pincode || billingAddress.pincode,
                    phone: customerShippingAddress?.phone || phone,
                    fax: customerShippingAddress?.fax || billingAddress.fax,
                };
                customer = await Customer.create({
                    customerType: "Individual",
                    customerName: name,
                    companyName: "",
                    displayName: name,
                    workingPhone: phone,
                    email: customerEmail?.trim() ? customerEmail.trim().toLowerCase() : undefined,
                    mobile: phone,
                    addressSame: true,
                    billingAddress,
                    shippingAddress,
                });
            }
        }
        req.isNewCustomerFlag = isNewCustomerFlag
        req.customer = customer;
        req.body.customerId = customer._id.toString();
        req.body.customerName = customer.displayName || "";
        req.body.customerPhone = customer.workingPhone || customer.mobile || "";
        req.body.customerEmail = customer.email || "";
        req.body.customerBillingAddress = {
            attention: customer.billingAddress?.attention || "",
            country: customer.billingAddress?.country || "India",
            street1: customer.billingAddress?.street1 || "",
            street2: customer.billingAddress?.street2 || "",
            city: customer.billingAddress?.city || "",
            state: customer.billingAddress?.state || "",
            pincode: customer.billingAddress?.pincode || "",
            phone: customer.billingAddress?.phone || customer.workingPhone || "",
            fax: customer.billingAddress?.fax || "",
        };
        next();
    } catch (error) {
        console.error("Error in customerValidation:", error);
        if (error?.code === 11000) {
            return next(
                new ApiError("A customer with this phone or email already exists.", 409, error)
            );
        }
        return next(
            new ApiError(error.message || "Failed to validate/create customer", 500, error
            )
        );
    }
};


export {
    customerValidation
};