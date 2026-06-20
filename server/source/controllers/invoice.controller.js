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
            status,
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
            {
                name: `invoice-${year}`,
            },
            {
                $inc: {
                    sequence: 1,
                },
            },
            {
                new: true,
                upsert: true,
                session,
            }
        );

        const invoiceNumber = `INV-${year}-${String(
            counter.sequence
        ).padStart(6, "0")}`;

        const invoiceItems = [];
        console.log("check1")

        // Loop through items and handle Listed vs. Custom items
        for (const invoiceItem of items) {
            let dbItemId = null;

            // 1. Check if it is a LISTED item (has an itemId from the database)
            if (invoiceItem.itemId) {
                const item = await Item.findById(invoiceItem.itemId).session(session);

                if (!item) {
                    throw new ApiError(`${invoiceItem.name} does not exist in inventory`, 400);
                }

                if (item.status !== "Active") {
                    throw new ApiError(`${item.name} is inactive`, 400);
                }

                if (item.stock < invoiceItem.quantity) {
                    throw new ApiError(`${item.name} has only ${item.stock} ${item.unit} left in stock`, 400);
                }

                // Deduct stock for database items
                item.stock -= invoiceItem.quantity;
                await item.save({ session });

                dbItemId = item._id; // Store the DB ID to link to the invoice
            }
            // If it's a CUSTOM item, it simply skips the DB lookup and stock deduction

            // 2. Calculate Discounts (Applies to BOTH Listed and Custom items)
            let discountAmount = 0;

            if (invoiceItem.discountType === "%") {
                discountAmount =
                    ((invoiceItem.sellingPrice * invoiceItem.discount) / 100) * invoiceItem.quantity;
            } else {
                discountAmount = invoiceItem.discount * invoiceItem.quantity;
            }

            // 3. Push to invoice items array
            invoiceItems.push({
                itemID: dbItemId, // Will be null for custom items, which is perfectly fine
                quantity: invoiceItem.quantity,
                itemName: invoiceItem.name,
                itemUnit: invoiceItem.unit || "pcs", // Ensure custom units are saved!
                itemMRP: invoiceItem.MRP || 0,
                itemSellingPrice: invoiceItem.sellingPrice,
                itemDiscount: invoiceItem.discount || 0,
                itemDiscountType: invoiceItem.discountType === "%" ? "percentage" : "fixed",
                itemImage: invoiceItem.image || null,
                itemDiscountAmount: discountAmount,
            });
        }

        console.log("check2")

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
                    status,
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
    const filterStatus = req.query.status; // <--- Catch the filter flag

    let query = {};

    if (lastCreatedAt) {
        query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    // --- APPLY STATUS FILTER LOGIC ---
    if (filterStatus) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filterStatus === "Paid") {
            query.status = "Paid";
        } else if (filterStatus === "Overdue") {
            // Overdue means it's unpaid AND the due date is in the past
            query.status = "Unpaid";
            query.dueDate = { $lt: today };
        } else if (filterStatus === "Unpaid") {
            // Strictly Unpaid means it's unpaid AND the due date is today or in the future (or null)
            query.status = "Unpaid";
            query.$or = [
                { dueDate: { $gte: today } },
                { dueDate: null },
                { dueDate: { $exists: false } }
            ];
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
    const filterStatus = req.query.status; // <--- Catch the filter flag

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
                                boost: {
                                    value: 5
                                }
                            }
                        }
                    },
                    {
                        autocomplete: {
                            query: search,
                            path: "customerName",
                            fuzzy: {
                                maxEdits: 1
                            }
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
            {
                $search: searchStage
            },
            {
                $project: {
                    _id: 1,
                    invoiceNumber: 1,
                    invoiceDate: 1,
                    customerName: 1,
                    status: 1,
                    grandTotal: 1,
                    dueDate: 1,
                    createdAt: 1,
                    invoiceItems: 1,
                    paginationToken: {
                        $meta: "searchSequenceToken"
                    }
                }
            }
        ];

        // --- APPLY STATUS FILTER LOGIC TO SEARCH PIPELINE ---
        if (filterStatus) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let matchStage = {};
            if (filterStatus === "Paid") {
                matchStage.status = "Paid";
            } else if (filterStatus === "Overdue") {
                matchStage.status = "Unpaid";
                matchStage.dueDate = { $lt: today };
            } else if (filterStatus === "Unpaid") {
                matchStage.status = "Unpaid";
                matchStage.$or = [
                    { dueDate: { $gte: today } },
                    { dueDate: null },
                    { dueDate: { $exists: false } }
                ];
            }

            // Add the $match stage right after $search and $project
            pipeline.push({ $match: matchStage });
        }

        // Apply limits after filtering
        pipeline.push({
            $limit: limit + 1
        });

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
            dueDate: inv.dueDate,
            invoiceItems: inv.invoiceItems || []
        }));

        return res.status(200).json(
            new apiResponse(
                "Invoices fetched successfully",
                200,
                {
                    invoices: formattedInvoices,
                    nextCursor,
                    isEnd
                }
            )
        );
    } catch (error) {
        console.error("Invoice Search Error:", error);
        throw new ApiError(
            error.message || "Failed to search invoices",
            500
        );
    }
};



export { addInvoice, getNextInvoiceNumber, getAllInvoice, invoiceSearch };