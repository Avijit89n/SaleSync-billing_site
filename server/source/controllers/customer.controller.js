import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { Customer } from "../models/customer.models.js"
import { Invoice } from "../models/invoice.models.js";

const addCustomer = async (req, res) => {
    let {
        customerType,
        customerName,
        companyName,
        displayName,
        workingPhone,
        email,
        mobile,
        addressSame,
        billingAddress,
        shippingAddress
    } = req.body;

    if ((!displayName && !customerName) || !workingPhone) {
        throw new apiError("Required fields are missing", 400)
    }
    if (!displayName) {
        displayName = customerName;
    }

    let finalShippingAddress = shippingAddress;
    if (addressSame) {
        finalShippingAddress = billingAddress;
    }

    try {
        const customer = await Customer.create({
            customerType,
            customerName: customerName || displayName || "",
            companyName,
            displayName,
            workingPhone,
            email,
            mobile,
            addressSame,
            billingAddress,
            shippingAddress: finalShippingAddress
        })

        return res.status(201).json(
            new apiResponse("Customer added successfully", 201, customer)
        )
    } catch (error) {
        const errorMessage = error.message || "Customer creation failed";
        throw new apiError(errorMessage, 500, error);
    }
}

const getAllCustomers = async (req, res) => {
    const limit = Number(req.query.limit) || 10;

    const lastCreatedAt =
        req.query.lastCreatedAt === "undefined"
            ? null
            : req.query.lastCreatedAt;

    const pipeline = [
        // Pagination
        ...(lastCreatedAt
            ? [
                {
                    $match: {
                        createdAt: {
                            $lt: new Date(lastCreatedAt),
                        },
                    },
                },
            ]
            : []),

        // Newest customers first
        {
            $sort: {
                createdAt: -1,
            },
        },

        // Fetch one extra document to determine if more data exists
        {
            $limit: limit + 1,
        },

        // Get all invoices belonging to each customer
        {
            $lookup: {
                from: "invoices",
                localField: "_id",
                foreignField: "customerID",
                as: "invoices",
            },
        },

        // Calculate customer billing information
        {
            $addFields: {
                // Total number of bills
                totalBills: {
                    $size: "$invoices",
                },

                // Total value of all bills
                totalSales: {
                    $sum: "$invoices.grandTotal",
                },

                // Total amount customer has paid
                totalPaid: {
                    $sum: "$invoices.paidAmount",
                },

                // Total amount still pending
                pendingAmount: {
                    $sum: "$invoices.balanceAmount",
                },
            },
        },

        // Return only required customer fields
        {
            $project: {
                companyName: 1,
                displayName: 1,
                workingPhone: 1,
                email: 1,
                customerType: 1,
                createdAt: 1,
                billingAddress: 1,

                // Billing information
                totalBills: 1,
                totalSales: 1,
                totalPaid: 1,
                pendingAmount: 1,
            },
        },
    ];

    try {
        const customers = await Customer.aggregate(pipeline);

        let isEnd = true;
        let nextCursor = null;

        // Check if more customers are available
        if (customers.length > limit) {
            isEnd = false;

            // Remove extra customer
            customers.pop();

            // Last customer's createdAt becomes the next cursor
            nextCursor =
                customers[customers.length - 1].createdAt;
        }

        return res.status(200).json(
            new apiResponse(
                "Customers fetched successfully",
                200,
                {
                    customers,
                    isEnd,
                    nextCursor,
                }
            )
        );
    } catch (error) {
        console.error("Get all customers error:", error);

        throw new apiError(
            "Failed to fetch customers",
            500,
            error
        );
    }
};

const customerSearch = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor;
    const userSearchInput = req.query.search?.trim();

    if (!userSearchInput) {
        throw new apiError("Search query is required", 400);
    }

    try {
        const searchStage = {
            index: "customer_auto",
            compound: {
                should: [
                    {
                        autocomplete: {
                            query: userSearchInput,
                            path: "displayName",
                            fuzzy: {
                                maxEdits: 1,
                                prefixLength: 0,
                                maxExpansions: 20
                            }
                        }
                    },
                    {
                        autocomplete: {
                            query: userSearchInput,
                            path: "workingPhone"
                        }
                    }
                ],
                minimumShouldMatch: 1
            }
        };

        if (cursor) {
            searchStage.searchAfter = cursor;
        }

        const searchPipeline = [
            {
                $search: searchStage
            },
            {
                $project: {
                    companyName: 1,
                    displayName: 1,
                    workingPhone: 1,
                    email: 1,
                    customerType: 1,
                    createdAt: 1,
                    billingAddress: 1,

                    score: {
                        $meta: "searchScore"
                    },

                    paginationToken: {
                        $meta: "searchSequenceToken"
                    }
                }
            },
            {
                $limit: limit + 1
            }
        ];

        const searchedCustomer =
            await Customer.aggregate(searchPipeline);

        let isEnd = true;
        let nextCursor = null;

        if (searchedCustomer.length > limit) {
            isEnd = false;

            nextCursor =
                searchedCustomer[limit - 1].paginationToken;

            searchedCustomer.pop();
        }

        return res.status(200).json(
            new apiResponse(
                "Customers fetched successfully",
                200,
                {
                    items: searchedCustomer,
                    isEnd,
                    nextCursor
                }
            )
        );
    } catch (error) {
        console.error(error);

        throw new apiError(
            error.message || "Failed to fetch customers",
            500
        );
    }
};

const getCustomerById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new apiError("Customer ID is required", 400);
    }
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            throw new apiError("Customer not found", 404);
        }
        return res.status(200).json(
            new apiResponse("Customer fetched successfully", 200, customer)
        );
    } catch (error) {
        throw new apiError("Failed to fetch customer", 500, error);
    }
}

const updateCustomer = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new apiError("Customer ID is required", 400);
    }

    const {
        customerType,
        customerName,
        companyName,
        displayName,
        workingPhone,
        email,
        mobile,
        addressSame,
        billingAddress,
        shippingAddress
    } = req.body;

    if ((!displayName && !customerName) || !workingPhone) {
        throw new apiError("Required fields are missing", 400);
    }

    const finalDisplayName = displayName || customerName;

    const finalShippingAddress = addressSame
        ? billingAddress
        : shippingAddress;

    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            {
                customerType,
                customerName,
                companyName,
                displayName: finalDisplayName,
                workingPhone,
                email,
                mobile,
                addressSame,
                billingAddress,
                shippingAddress: finalShippingAddress
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCustomer) {
            throw new apiError("Customer not found", 404);
        }

        return res.status(200).json(
            new apiResponse(
                "Customer updated successfully",
                200,
                updatedCustomer
            )
        );

    } catch (error) {
        if (error instanceof apiError) {
            throw error;
        }

        throw new apiError(
            error.message || "Failed to update customer",
            500,
            error
        );
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new apiError("Customer ID is required", 404)
        }

        const customer = await Customer.findById(id);
        if (!customer) {
            throw new apiError("Customer not found", 500)
        }

        await Customer.findByIdAndDelete(id);

        return res.status(200).json(
            new apiResponse("Customer Deleted successfylly", 200, customer)
        );
    } catch (error) {
        console.error("Delete customer error:", error);
        throw new apiError("Failed to delete customer", 500, error)
    }
};


const getCustomerInvoices = async (req, res) => {

    const { id } = req.params;
    if (!id) {
        throw new apiError("Customer ID is required", 400);
    }
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            throw new apiError("Customer not found", 404);
        }

        const invoices = await Invoice.find({ customerID: id }).sort({ invoiceDate: -1, createdAt: -1 });

        let totalBills = 0;
        let totalSales = 0;
        let totalPaid = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;

        const currentDate = new Date();

        invoices.forEach((invoice) => {
            totalBills += 1;
            totalSales += Number(invoice.grandTotal || 0);
            totalPaid += Number(invoice.paidAmount || 0);
            pendingAmount += Number(invoice.balanceAmount || 0);
            if (invoice.status !== "Cancel" && Number(invoice.balanceAmount || 0) > 0 && invoice.dueDate && new Date(invoice.dueDate) < currentDate) {
                overdueAmount += Number(invoice.balanceAmount || 0);
            }
        });

        return res.status(200).json(
            new apiResponse("Customer invoices fetched successfully", 200, {
                customer,
                invoices,
                summary: {
                    totalBills,
                    totalSales,
                    totalPaid,
                    pendingAmount,
                    overdueAmount
                }
            }
            )
        );

    } catch (error) {
        if (error instanceof apiError) {
            throw error;
        }

        console.error("Get customer invoices error:", error);
        throw new apiError("Failed to fetch customer invoices", 500, error);
    }
};


export {
    addCustomer,
    getAllCustomers,
    customerSearch,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomerInvoices
}