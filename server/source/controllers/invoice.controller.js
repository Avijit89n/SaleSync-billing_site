import mongoose from "mongoose";
import { Invoice, InvoiceCounter } from "../models/invoice.models.js";
import { Item } from "../models/item.models.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const addInvoice = async (req, res) => {
    console.log("got:")
    console.log(req.body)

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const {
            customerId,
            customerName,
            items,
            invoiceDate,
            dueDate,
            subtotal,
            discount,
            tax,
            grandTotal,
            notes,
            terms,
            paidAmount = 0, // Catching paidAmount from frontend
        } = req.body;

        if (!customerId) {
            throw new ApiError("Customer is required", 400);
        }

        if (!items?.length) {
            throw new ApiError("At least one item is required", 400);
        }

        // Generate Invoice Number
        const year = new Date().getFullYear();

        const counter = await InvoiceCounter.findOneAndUpdate(
            { name: `invoice-${year}` },
            { $inc: { sequence: 1 } },
            { new: true, upsert: true, session }
        );

        const invoiceNumber = `INV-${year}-${String(
            counter.sequence
        ).padStart(6, "0")}`;

        const invoiceItems = [];
        console.log("check1")

        // Loop through items and handle Listed vs. Custom items
        for (const invoiceItem of items) {
            let dbItemId = null;

            if (invoiceItem.itemId) {
                const item = await Item.findById(invoiceItem.itemId).session(session);

                if (!item) {
                    throw new ApiError(`${invoiceItem.name} does not exist in inventory`, 400);
                }

                if (item.status !== "Active") {
                    throw new ApiError(`${item.name} is inactive`, 400);
                }

                // Deduct stock for database items
                item.stock -= invoiceItem.quantity;
                await item.save({ session });

                dbItemId = item._id; 
            }

            // Calculate Discounts 
            let discountAmount = 0;

            if (invoiceItem.discountType === "%" || invoiceItem.discountType === "percentage") {
                discountAmount =
                    ((invoiceItem.sellingPrice * invoiceItem.discount) / 100) * invoiceItem.quantity;
            } else {
                discountAmount = invoiceItem.discount * invoiceItem.quantity;
            }

            invoiceItems.push({
                itemID: dbItemId, 
                quantity: invoiceItem.quantity,
                itemDescription: invoiceItem.description || null,
                itemName: invoiceItem.name,
                itemUnit: invoiceItem.unit || "pcs", 
                itemMRP: invoiceItem.MRP || 0,
                itemSellingPrice: invoiceItem.sellingPrice,
                itemDiscount: invoiceItem.discount || 0,
                itemDiscountType: (invoiceItem.discountType === "%" || invoiceItem.discountType === "percentage") ? "percentage" : "fixed",
                itemImage: invoiceItem.image || null,
                itemDiscountAmount: discountAmount,
            });
        }

        console.log("check2")

        // --- BACKEND-FORCED PAYMENT CALCULATION LOGIC ---
        const safePaidAmount = Number(paidAmount) || 0;
        const calculatedBalance = Math.max(0, grandTotal - safePaidAmount);
        
        // Ensure data integrity by overriding frontend status with math
        let computedStatus = 'Unpaid';
        if (calculatedBalance <= 0) {
            computedStatus = 'Paid';
        } else if (safePaidAmount > 0) {
            computedStatus = 'Partially Paid';
        }

        // Generate the initial payment record if money was received upon creation
        const initialPayments = [];
        if (safePaidAmount > 0) {
            initialPayments.push({
                amount: safePaidAmount,
                paymentDate: invoiceDate || new Date(),
                paymentMethod: req.body.payments?.[0]?.paymentMethod || 'Cash', 
                note: req.body.payments?.[0]?.note || 'Initial payment upon invoice creation'
            });
        }

        const invoice = await Invoice.create(
            [
                {
                    invoiceNumber,
                    invoiceDate,
                    dueDate,
                    customerName,
                    customerID: customerId,
                    invoiceItems,
                    subtotal,
                    discount,
                    tax,
                    grandTotal,
                    notes,
                    terms,
                    status: computedStatus,
                    paidAmount: safePaidAmount,
                    balanceAmount: calculatedBalance,
                    payments: initialPayments
                },
            ],
            { session }
        );

        await session.commitTransaction();
        console.log("saved");
        return res.status(201).json(
            new apiResponse("Invoice created successfully", 200, invoice[0])
        )
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.message, 400, error)
    } finally {
        session.endSession();
    }
};

const addPaymentRecord = async (req, res) => {
    const { id } = req.params;
    const { amount, paymentMethod = 'Cash', paymentDate = new Date(), note = '' } = req.body;

    if (!amount || Number(amount) <= 0) {
        throw new ApiError("A valid payment amount is required", 400);
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const invoice = await Invoice.findById(id).session(session);

        if (!invoice) {
            throw new ApiError("Invoice not found", 404);
        }

        if (invoice.status === 'Cancel') {
            throw new ApiError("Cannot add a payment to a canceled invoice", 400);
        }

        if (invoice.balanceAmount <= 0) {
            throw new ApiError("This invoice is already fully paid", 400);
        }

        const paymentAmount = Number(amount);
        if (paymentAmount > invoice.balanceAmount) {
            throw new ApiError(`Payment amount (₹${paymentAmount}) cannot exceed the remaining balance (₹${invoice.balanceAmount})`, 400);
        }

        // 1. Push new payment to history array
        invoice.payments.push({
            amount: paymentAmount,
            paymentMethod,
            paymentDate,
            note
        });

        // 2. Update Aggregated Totals
        invoice.paidAmount += paymentAmount;
        invoice.balanceAmount = Number((invoice.grandTotal - invoice.paidAmount).toFixed(2));

        // 3. Update Document Status
        if (invoice.balanceAmount <= 0) {
            invoice.status = 'Paid';
            invoice.balanceAmount = 0; // Fix floating point issues
        } else {
            invoice.status = 'Partially Paid';
        }

        await invoice.save({ session });
        await session.commitTransaction();

        return res.status(200).json(
            new apiResponse("Payment record added successfully", 200, invoice)
        );
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.message, 400, error);
    } finally {
        session.endSession();
    }
};

const getNextInvoiceNumber = async (req, res) => {
    try {
        const year = new Date().getFullYear();

        const counter = await InvoiceCounter.findOne({
            name: `invoice-${year}`,
        });

        const nextSequence = (counter?.sequence || 0) + 1;

        const invoiceNumber = `INV-${year}-${String(
            nextSequence
        ).padStart(6, "0")}`;

        return res.status(200).json(
            new apiResponse("Invoice number generated successfully", { invoiceNumber }, true)
        )
    } catch (error) {
        return res.status(500).json(
            new ApiError(error.message, 500, error)
        );
    }
};

const getAllInvoice = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const lastCreatedAt = req.query.lastCreatedAt;
    const filterStatus = req.query.status; 

    let query = {};

    if (lastCreatedAt) {
        query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    // Explicitly ignore "All" so it doesn't fall into the Cancel block
    if (filterStatus && filterStatus !== "All") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filterStatus === "Paid") {
            query.status = "Paid";
        } else if (filterStatus === "Partially Paid") {
            query.status = "Partially Paid";
            query.$or = [
                { dueDate: { $gte: today } },
                { dueDate: null },
                { dueDate: { $exists: false } } 
            ];
        } else if (filterStatus === "Unpaid") {
            query.status = "Unpaid";
            query.$or = [
                { dueDate: { $gte: today } },
                { dueDate: null },
                { dueDate: { $exists: false } } 
            ];
        } else if (filterStatus === "Overdue") {
            query.status = { $in: ["Unpaid", "Partially Paid"] };
            query.dueDate = { $lt: today };
        } else if (filterStatus === "Cancel") {
            query.status = "Cancel"; 
        }
    }

    try {
        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1);

        let isEnd = true;
        let nextCursor = null;

        if (invoices.length > limit) {
            isEnd = false;
            invoices.pop();
            nextCursor = invoices[invoices.length - 1].createdAt;
        }

        const formattedInvoices = invoices.map(inv => ({
            _id: inv._id,
            id: inv._id,
            date: inv.invoiceDate,
            invoiceNo: inv.invoiceNumber,
            customer: inv.customerName,
            status: inv.status,
            amount: inv.grandTotal,
            paidAmount: inv.paidAmount,
            balanceAmount: inv.balanceAmount,
            dueDate: inv.dueDate,
            invoiceItems: inv.invoiceItems || []
        }));

        return res.status(200).json(
            new apiResponse("Invoices fetched successfully", 200, {
                invoices: formattedInvoices,
                isEnd,
                nextCursor
            })
        );
    } catch (error) {
        throw new ApiError("Failed to fetch invoices", 500, error);
    }
};

const invoiceSearch = async (req, res) => {
    const limit = Math.min(
        Math.max(Number(req.query.limit) || 10, 1),
        50
    );

    const search = req.query.search?.trim();
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
                            score: { boost: { value: 5 } }
                        }
                    },
                    {
                        autocomplete: {
                            query: search,
                            path: "customerName",
                            fuzzy: { maxEdits: 1 }
                        }
                    }
                ],
                minimumShouldMatch: 1
            }
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
                    paginationToken: { $meta: "searchSequenceToken" }
                }
            }
        ];

        // Explicitly ignore "All" here as well
        if (filterStatus && filterStatus !== "All") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let matchStage = {};
            
            if (filterStatus === "Paid") {
                matchStage.status = "Paid";
            } else if (filterStatus === "Partially Paid") {
                matchStage.status = "Partially Paid";
                matchStage.$or = [
                    { dueDate: { $gte: today } },
                    { dueDate: null },
                    { dueDate: { $exists: false } }
                ];
            } else if (filterStatus === "Unpaid") {
                matchStage.status = "Unpaid";
                matchStage.$or = [
                    { dueDate: { $gte: today } },
                    { dueDate: null },
                    { dueDate: { $exists: false } }
                ];
            } else if (filterStatus === "Overdue") {
                matchStage.status = { $in: ["Unpaid", "Partially Paid"] };
                matchStage.dueDate = { $lt: today };
            } else if (filterStatus === "Cancel") {
                matchStage.status = "Cancel";
            }

            // Only push the match stage if a valid filter was applied
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
        }

        pipeline.push({ $limit: limit + 1 });

        const results = await Invoice.aggregate(pipeline);

        let isEnd = true;
        let nextCursor = null;

        if (results.length > limit) {
            isEnd = false;
            results.pop();
            nextCursor = results[results.length - 1]?.paginationToken || null;
        }

        const formattedInvoices = results.map((inv) => ({
            _id: inv._id,
            id: inv._id,
            date: inv.invoiceDate,
            invoiceNo: inv.invoiceNumber,
            customer: inv.customerName,
            status: inv.status,
            amount: inv.grandTotal,
            paidAmount: inv.paidAmount,
            balanceAmount: inv.balanceAmount,
            dueDate: inv.dueDate,
            invoiceItems: inv.invoiceItems || []
        }));

        return res.status(200).json(
            new apiResponse(
                "Invoices fetched successfully",
                200,
                { invoices: formattedInvoices, nextCursor, isEnd }
            )
        );
    } catch (error) {
        console.error("Invoice Search Error:", error);
        throw new ApiError(error.message || "Failed to search invoices", 500);
    }
};

const cancelInvoice = async (req, res) => {
    const { id } = req.params;
    console.log(id)
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

        if (invoice.invoiceItems && invoice.invoiceItems.length > 0) {
            for (const invoiceItem of invoice.invoiceItems) {
                if (invoiceItem.itemID) {
                    const dbItem = await Item.findById(invoiceItem.itemID).session(session);
                    if (dbItem) {
                        dbItem.stock += invoiceItem.quantity;
                        await dbItem.save({ session });
                    }
                }
            }
        }

        invoice.status = "Cancel";
        await invoice.save({ session });

        await session.commitTransaction();

        return res.status(200).json(
            new apiResponse("Invoice canceled successfully", 200, invoice)
        );
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.message || "Failed to cancel invoice", error.statusCode || 500);
    } finally {
        session.endSession();
    }
};

const getInvoice = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError("ID is needed for invoice fetch", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid invoice ID", 400);
    }

    try {
        const invoice = await Invoice.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerID",
                    foreignField: "_id",
                    as: "customer",
                },
            }
        ]);
        if (!invoice.length) {
            throw new ApiError("Invoice not found", 404);
        }
        const invoiceData = invoice[0];

        return res.status(200).json(
            new apiResponse("Invoice fetched successfully", 200, invoiceData)
        );

    } catch (error) {
        throw new ApiError("Failed to fetch the invoice. Try again", 500, error);
    }
};

export { 
    addInvoice, 
    getNextInvoiceNumber, 
    getAllInvoice, 
    invoiceSearch, 
    cancelInvoice, 
    addPaymentRecord,
    getInvoice
};