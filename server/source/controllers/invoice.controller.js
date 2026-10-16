
import mongoose from "mongoose";

import { Invoice, InvoiceCounter } from "../models/invoice.models.js";
import { Item } from "../models/item.models.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const roundMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round((number + Number.EPSILON) * 100) / 100;
};

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizePaymentMethod = (method) => {
  const allowed = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Other"];
  return allowed.includes(method) ? method : "Cash";
};

const getAddressSnapshot = (address = {}, fallbackPhone = "") => ({
  attention: address?.attention || "",
  country: address?.country || "India",
  street1: address?.street1 || "",
  street2: address?.street2 || "",
  city: address?.city || "",
  state: address?.state || "",
  pincode: address?.pincode || "",
  phone: address?.phone || fallbackPhone || "",
  fax: address?.fax || "",
});

const getInvoiceStatus = (grandTotal, paidAmount, balanceAmount) => {
  if (grandTotal > 0 && balanceAmount <= 0) return "Paid";
  if (paidAmount > 0) return "Partially Paid";
  return "Unpaid";
};

const getStatusFilter = (status, today) => {
  if (!status || status === "All") return {};
  if (status === "Paid") return { status: "Paid" };
  if (status === "Cancel") return { status: "Cancel" };

  if (status === "Overdue") {
    return {
      status: { $in: ["Unpaid", "Partially Paid"] },
      dueDate: { $lt: today },
    };
  }

  if (status === "Partially Paid" || status === "Unpaid") {
    return {
      status,
      $or: [
        { dueDate: { $gte: today } },
        { dueDate: null },
        { dueDate: { $exists: false } },
      ],
    };
  }

  return {};
};

const formatInvoiceListItem = (invoice) => ({
  _id: invoice._id,
  id: invoice._id,
  date: invoice.invoiceDate,
  invoiceNo: invoice.invoiceNumber,
  customer: invoice.customerName,
  status: invoice.status,
  amount: invoice.grandTotal,
  paidAmount: invoice.paidAmount,
  balanceAmount: invoice.balanceAmount,
  dueDate: invoice.dueDate,
  invoiceItems: invoice.invoiceItems || [],
});

const addInvoice = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      customerId,
      items,
      invoiceDate,
      dueDate,
      taxRate,
      tax,
      notes = "",
      terms = "",
      paidAmount = 0,
      payments = [],
      customerBillingAddress,
      customerShippingAddress,
    } = req.body || {};

    const customer = req.customer;
    const isNewCustomerFlag = req.isNewCustomerFlag;

    if (!customer) {
      throw new ApiError("Customer validation failed", 400);
    }

    if (!customerId) {
      throw new ApiError("Customer is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError("Invalid customer ID", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError("At least one item is required", 400);
    }

    if (!customer._id) {
      throw new ApiError("Resolved customer has no database ID", 400);
    }

    const parsedInvoiceDate = invoiceDate
      ? new Date(invoiceDate)
      : new Date();

    const parsedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(parsedInvoiceDate);

    if (Number.isNaN(parsedInvoiceDate.getTime())) {
      throw new ApiError("Invalid invoice date", 400);
    }

    if (Number.isNaN(parsedDueDate.getTime())) {
      throw new ApiError("Invalid due date", 400);
    }

    if (parsedDueDate < parsedInvoiceDate) {
      throw new ApiError("Due date cannot precede invoice date", 400);
    }

    const invoiceCustomerName = String(
      customer.displayName || customer.name || ""
    ).trim();

    if (!invoiceCustomerName) {
      throw new ApiError("Customer name is required", 400);
    }

    const invoiceCustomerPhone = String(
      customer.workingPhone || customer.mobile || ""
    );

    const invoiceCustomerEmail = String(customer.email || "")
      .trim()
      .toLowerCase();

    const billingAddress = getAddressSnapshot(
      customerBillingAddress || customer.billingAddress,
      invoiceCustomerPhone
    );

    const shippingAddress = getAddressSnapshot(
      customerShippingAddress || customer.shippingAddress,
      invoiceCustomerPhone
    );

    const year = parsedInvoiceDate.getFullYear();

    const counter = await InvoiceCounter.findOneAndUpdate(
      { name: `invoice-${year}` },
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true,
        session,
        setDefaultsOnInsert: true,
      }
    );

    if (!counter || !Number.isFinite(Number(counter.sequence))) {
      throw new ApiError("Unable to generate invoice number", 500);
    }

    const invoiceNumber = `INV-${year}-${String(
      counter.sequence
    ).padStart(6, "0")}`;

    const invoiceItems = [];
    let calculatedSubtotal = 0;
    let discountedItemsTotal = 0;

    for (const [index, rawItem] of items.entries()) {
      const itemName = String(
        rawItem?.name || rawItem?.itemName || ""
      ).trim();

      if (!itemName) {
        throw new ApiError(
          `Item name is required at row ${index + 1}`,
          400
        );
      }

      const quantity = toFiniteNumber(rawItem.quantity, 0);
      const sellingPrice = roundMoney(rawItem.sellingPrice);
      const mrp = roundMoney(
        rawItem.MRP ?? rawItem.itemMRP ?? rawItem.sellingPrice
      );

      const rawDiscount = Math.max(
        0,
        toFiniteNumber(rawItem.discount, 0)
      );

      const rawDiscountType = rawItem.discountType || "%";

      const isPercentage =
        rawDiscountType === "%" ||
        rawDiscountType === "percentage";

      if (quantity <= 0) {
        throw new ApiError(`Invalid quantity for ${itemName}`, 400);
      }

      if (sellingPrice < 0 || mrp < 0) {
        throw new ApiError(
          `Price cannot be negative for ${itemName}`,
          400
        );
      }

      let dbItemId = null;

      if (rawItem.itemId) {
        if (!mongoose.Types.ObjectId.isValid(rawItem.itemId)) {
          throw new ApiError(
            `Invalid inventory item ID for ${itemName}`,
            400
          );
        }

        const dbItem = await Item.findById(rawItem.itemId).session(session);

        if (!dbItem) {
          throw new ApiError(
            `${itemName} does not exist in inventory`,
            400
          );
        }

        if (dbItem.status && dbItem.status !== "Active") {
          throw new ApiError(
            `${dbItem.name || itemName} is inactive`,
            400
          );
        }

        dbItemId = dbItem._id;
      }

      // Discounts use MRP, matching the Add Invoice page.
      // Fixed discounts apply per unit and are capped at MRP.
      const discountPerUnit = isPercentage
        ? roundMoney((mrp * Math.min(rawDiscount, 100)) / 100)
        : roundMoney(rawDiscount);

      const discountIsApplicable =
        sellingPrice > 0 && rawDiscount > 0 && mrp > 0;

      const safeDiscountPerUnit = discountIsApplicable
        ? Math.min(discountPerUnit, mrp)
        : 0;

      const itemDiscountAmount = roundMoney(
        safeDiscountPerUnit * quantity
      );

      const discountedUnitPrice = discountIsApplicable
        ? roundMoney(Math.max(0, mrp - safeDiscountPerUnit))
        : sellingPrice;

      const itemAmount = roundMoney(
        discountedUnitPrice * quantity
      );

      const itemBaseAmount = roundMoney(
        sellingPrice * quantity
      );

      calculatedSubtotal = roundMoney(
        calculatedSubtotal + itemBaseAmount
      );

      discountedItemsTotal = roundMoney(
        discountedItemsTotal + itemAmount
      );

      invoiceItems.push({
        itemID: dbItemId,
        itemName,
        quantity,
        itemMRP: mrp,
        itemSellingPrice: sellingPrice,
        itemDiscount: discountIsApplicable ? rawDiscount : 0,
        itemDiscountType: isPercentage ? "percentage" : "fixed",
        itemDiscountAmount,
        discountedPrice: discountedUnitPrice,
        itemAmount,
        itemUnit: String(rawItem.unit || rawItem.itemUnit || "pcs"),
        itemDescription: String(
          rawItem.description || rawItem.itemDescription || ""
        ),
        itemImage: String(rawItem.image || rawItem.itemImage || ""),
      });
    }

    const calculatedDiscount = roundMoney(
      calculatedSubtotal - discountedItemsTotal
    );

    if (calculatedDiscount < 0) {
      throw new ApiError(
        "The calculated discounted item total exceeds the subtotal. Check item prices and discounts.",
        400
      );
    }

    // The current frontend may send the tax amount without taxRate.
    // Derive the percentage from the amount if the rate is missing.
    const providedTaxRate =
      taxRate === undefined || taxRate === null || taxRate === ""
        ? null
        : toFiniteNumber(taxRate, 0);

    const requestedTaxAmount = Math.max(
      0,
      toFiniteNumber(tax, 0)
    );

    const inferredTaxRate = discountedItemsTotal > 0
      ? (requestedTaxAmount / discountedItemsTotal) * 100
      : 0;

    const safeTaxRate = Math.min(
      100,
      Math.max(
        0,
        providedTaxRate === null
          ? inferredTaxRate
          : providedTaxRate
      )
    );

    const calculatedTax = roundMoney(
      discountedItemsTotal * (safeTaxRate / 100)
    );

    const safeGrandTotal = roundMoney(
      discountedItemsTotal + calculatedTax
    );

    if (safeGrandTotal <= 0) {
      throw new ApiError(
        "Invoice total must be greater than zero",
        400
      );
    }

    const requestedPaidAmount = roundMoney(
      toFiniteNumber(paidAmount, 0)
    );

    if (requestedPaidAmount < 0) {
      throw new ApiError("Paid amount cannot be negative", 400);
    }

    if (requestedPaidAmount > safeGrandTotal) {
      throw new ApiError(
        "Paid amount cannot exceed the invoice total",
        400
      );
    }

    const finalPaidAmount = requestedPaidAmount;

    const calculatedBalance = roundMoney(
      Math.max(0, safeGrandTotal - finalPaidAmount)
    );

    const computedStatus = getInvoiceStatus(
      safeGrandTotal,
      finalPaidAmount,
      calculatedBalance
    );

    const initialPayments = [];

    if (finalPaidAmount > 0) {
      const frontendPayment = Array.isArray(payments)
        ? payments[0] || {}
        : {};

      const parsedPaymentDate = frontendPayment.paymentDate
        ? new Date(frontendPayment.paymentDate)
        : parsedInvoiceDate;

      if (Number.isNaN(parsedPaymentDate.getTime())) {
        throw new ApiError("Invalid initial payment date", 400);
      }

      initialPayments.push({
        amount: finalPaidAmount,
        paymentDate: parsedPaymentDate,
        paymentMethod: normalizePaymentMethod(
          frontendPayment.paymentMethod
        ),
        note: String(
          frontendPayment.note ||
          "Initial payment on invoice creation"
        ).trim(),
      });
    }

    const createdInvoices = await Invoice.create(
      [
        {
          invoiceNumber,
          invoiceDate: parsedInvoiceDate,
          dueDate: parsedDueDate,
          customerID: customer._id,
          customerName: invoiceCustomerName,
          customerPhone: invoiceCustomerPhone,
          customerEmail: invoiceCustomerEmail,
          customerBillingAddress: billingAddress,
          customerShippingAddress: shippingAddress,
          invoiceItems,
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          tax: calculatedTax,
          taxRate: safeTaxRate,
          grandTotal: safeGrandTotal,
          payments: initialPayments,
          paidAmount: finalPaidAmount,
          balanceAmount: calculatedBalance,
          status: computedStatus,
          notes: String(notes || "").trim(),
          terms: String(terms || "").trim(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json(
      new apiResponse("Invoice created successfully", 201, {
        customer,
        isNewCustomerFlag,
        data: createdInvoices[0],
      })
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.code === 11000) {
      throw new ApiError(
        "Invoice number already exists. Please retry.",
        409,
        error
      );
    }

    console.error("Error creating invoice:", error);

    throw new ApiError(
      error.message || "Failed to create invoice",
      400,
      error
    );
  } finally {
    await session.endSession();
  }
};

const addPaymentRecord = async (req, res) => {
  const { id } = req.params;

  const {
    amount,
    paymentMethod = "Cash",
    paymentDate = new Date(),
    note = "",
  } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid invoice ID", 400);
  }

  const paymentAmount = roundMoney(amount);

  if (!Number.isFinite(Number(amount)) || paymentAmount <= 0) {
    throw new ApiError("A valid payment amount is required", 400);
  }

  const parsedPaymentDate = new Date(paymentDate);

  if (Number.isNaN(parsedPaymentDate.getTime())) {
    throw new ApiError("Invalid payment date", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const invoice = await Invoice.findById(id).session(session);

    if (!invoice) {
      throw new ApiError("Invoice not found", 404);
    }

    if (invoice.status === "Cancel") {
      throw new ApiError(
        "Cannot add a payment to a canceled invoice",
        400
      );
    }

    if (invoice.balanceAmount <= 0) {
      throw new ApiError(
        "This invoice is already fully paid",
        400
      );
    }

    if (paymentAmount > invoice.balanceAmount) {
      throw new ApiError(
        `Payment amount (₹${paymentAmount.toFixed(2)}) cannot exceed the remaining balance (₹${Number(invoice.balanceAmount).toFixed(2)})`,
        400
      );
    }

    invoice.payments.push({
      amount: paymentAmount,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      paymentDate: parsedPaymentDate,
      note: String(note || "").trim(),
    });

    invoice.paidAmount = roundMoney(
      Number(invoice.paidAmount || 0) + paymentAmount
    );

    invoice.balanceAmount = roundMoney(
      Math.max(0, Number(invoice.grandTotal) - invoice.paidAmount)
    );

    invoice.status = getInvoiceStatus(
      Number(invoice.grandTotal),
      invoice.paidAmount,
      invoice.balanceAmount
    );

    await invoice.save({ session });
    await session.commitTransaction();

    return res.status(200).json(
      new apiResponse(
        "Payment record added successfully",
        200,
        invoice
      )
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Error adding invoice payment:", error);

    throw new ApiError(
      error.message || "Failed to add payment",
      400,
      error
    );
  } finally {
    await session.endSession();
  }
};

const getNextInvoiceNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const counter = await InvoiceCounter.findOne({
      name: `invoice-${year}`,
    });

    const nextSequence = Number(counter?.sequence || 0) + 1;

    const invoiceNumber = `INV-${year}-${String(
      nextSequence
    ).padStart(6, "0")}`;

    return res.status(200).json(
      new apiResponse(
        "Invoice number generated successfully",
        { invoiceNumber },
        true
      )
    );
  } catch (error) {
    console.error("Error generating invoice number:", error);

    throw new ApiError(
      "Failed to generate invoice number",
      500,
      error
    );
  }
};

const getAllInvoice = async (req, res) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    100
  );

  const lastCreatedAt = req.query.lastCreatedAt;
  const filterStatus = req.query.status;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = {
    ...getStatusFilter(filterStatus, today),
  };

  if (lastCreatedAt) {
    const cursorDate = new Date(lastCreatedAt);

    if (Number.isNaN(cursorDate.getTime())) {
      throw new ApiError(
        "Invalid invoice pagination cursor",
        400
      );
    }

    query.createdAt = { $lt: cursorDate };
  }

  try {
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const isEnd = invoices.length <= limit;

    if (!isEnd) {
      invoices.pop();
    }

    const nextCursor =
      !isEnd && invoices.length
        ? invoices[invoices.length - 1].createdAt
        : null;

    return res.status(200).json(
      new apiResponse("Invoices fetched successfully", 200, {
        invoices: invoices.map(formatInvoiceListItem),
        isEnd,
        nextCursor,
      })
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Failed to fetch invoices",
      500,
      error
    );
  }
};

const invoiceSearch = async (req, res) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    50
  );

  const search = String(req.query.search || "").trim();
  const cursor = req.query.cursor;
  const filterStatus = req.query.status;

  if (!search) {
    throw new ApiError("Search query is required", 400);
  }

  try {
    const searchStage = {
      index: "invoices_auto",
      compound: {
        should: [
          {
            autocomplete: {
              query: search,
              path: "invoiceNumber",
              score: {
                boost: { value: 5 },
              },
            },
          },
          {
            autocomplete: {
              query: search,
              path: "customerName",
              fuzzy: { maxEdits: 1 },
            },
          },
        ],
        minimumShouldMatch: 1,
      },
    };

    if (cursor) {
      searchStage.searchAfter = cursor;
    }

    const pipeline = [
      { $search: searchStage },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          invoiceDate: 1,
          customerName: 1,
          status: 1,
          grandTotal: 1,
          paidAmount: 1,
          balanceAmount: 1,
          dueDate: 1,
          createdAt: 1,
          invoiceItems: 1,
          paginationToken: {
            $meta: "searchSequenceToken",
          },
        },
      },
    ];

    if (filterStatus && filterStatus !== "All") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const match = getStatusFilter(filterStatus, today);

      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }
    }

    pipeline.push({ $limit: limit + 1 });

    const results = await Invoice.aggregate(pipeline);

    const isEnd = results.length <= limit;

    if (!isEnd) {
      results.pop();
    }

    const nextCursor =
      !isEnd && results.length
        ? results[results.length - 1].paginationToken || null
        : null;

    return res.status(200).json(
      new apiResponse("Invoices fetched successfully", 200, {
        invoices: results.map(formatInvoiceListItem),
        nextCursor,
        isEnd,
      })
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Invoice search error:", error);

    throw new ApiError(
      "Failed to search invoices",
      500,
      error
    );
  }
};

const cancelInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid invoice ID", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const invoice = await Invoice.findById(id).session(session);

    if (!invoice) {
      throw new ApiError("Invoice not found", 404);
    }

    if (invoice.status === "Cancel") {
      throw new ApiError("Invoice is already canceled", 400);
    }

    // Stock is not deducted during invoice creation in the supplied
    // controller, so cancellation must not add stock back.
    invoice.status = "Cancel";

    await invoice.save({ session });
    await session.commitTransaction();

    return res.status(200).json(
      new apiResponse(
        "Invoice canceled successfully",
        200,
        invoice
      )
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Error canceling invoice:", error);

    throw new ApiError(
      "Failed to cancel invoice",
      500,
      error
    );
  } finally {
    await session.endSession();
  }
};

const getInvoice = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      "A valid invoice ID is required",
      400
    );
  }

  try {
    const invoiceData = await Invoice.findById(id).lean();

    if (!invoiceData) {
      throw new ApiError("Invoice not found", 404);
    }

    return res.status(200).json(
      new apiResponse(
        "Invoice fetched successfully",
        200,
        invoiceData
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Failed to fetch the invoice. Try again",
      500,
      error
    );
  }
};

export {
  addInvoice,
  getNextInvoiceNumber,
  getAllInvoice,
  invoiceSearch,
  cancelInvoice,
  addPaymentRecord,
  getInvoice,
};
