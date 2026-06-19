import mongoose from "mongoose";

const addressSchemaDefinition = {
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
};

const customerSchema = new mongoose.Schema(
  {
    customerType: {
      type: String,
      enum: ["Individual", "Business"],
      default: "Individual",
    },
    customerName: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    workingPhone: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    addressSame: {
      type: Boolean,
      default: true,
    },
    billingAddress: addressSchemaDefinition,
    shippingAddress: addressSchemaDefinition,
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema);