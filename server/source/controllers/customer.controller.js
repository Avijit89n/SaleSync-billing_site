import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { Customer } from "../models/customer.models.js"

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
            customerName,
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
    const lastCreatedAt = req.query.lastCreatedAt === "undefined" ? null : req.query.lastCreatedAt;

    const pipeline = [
        ...(lastCreatedAt
            ? [
                {
                    $match: {
                        createdAt: { $lt: new Date(lastCreatedAt) },
                    },
                },
            ]
            : []),
        { $sort: { createdAt: -1 } },
        { $limit: limit + 1 },
        {
            $project: {
                companyName: 1,
                displayName: 1,
                workingPhone: 1,
                email: 1,
                customerType: 1,
                createdAt: 1,
                billingAddress: 1
            }
        }
    ]

    try {
        const customers = await Customer.aggregate(pipeline);
        let isEnd = true;
        let nextCursor = null;

        if (customers.length > limit) {
            isEnd = false;
            customers.pop();
            nextCursor = customers[customers.length - 1].createdAt;
        }

        return res.status(200).json(
            new apiResponse("Customers fetched successfully", 200, {
                customers,
                isEnd,
                nextCursor
            })
        );
    } catch (error) {
        throw new apiError("Failed to fetch customers", 500, error);
    }
}

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



export {
    addCustomer, getAllCustomers, customerSearch
}