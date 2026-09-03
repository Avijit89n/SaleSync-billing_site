import { Invoice } from "../models/invoice.models.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

const getActualPaidAmount = (invoice) => {
    if (Array.isArray(invoice.payments) && invoice.payments.length > 0) {
        return invoice.payments.reduce((total, payment) => {
            return total + Number(payment.amount || 0);
        }, 0);
    }

    return Number(invoice.paidAmount || 0);
};

const getActualBalanceAmount = (invoice, paidAmount = null) => {
    const grandTotal = Number(invoice.grandTotal || 0);
    const paid =
        paidAmount !== null
            ? Number(paidAmount)
            : getActualPaidAmount(invoice);

    return Math.max(grandTotal - paid, 0);
};

const getActualPaymentStatus = (invoice, paidAmount = null) => {
    const grandTotal = Number(invoice.grandTotal || 0);
    const paid =
        paidAmount !== null
            ? Number(paidAmount)
            : getActualPaidAmount(invoice);

    if (grandTotal <= 0) {
        return "Unpaid";
    }

    if (paid >= grandTotal) {
        return "Paid";
    }

    if (paid > 0) {
        return "Partially Paid";
    }

    return "Unpaid";
};

const calculatePercentage = (current, previous) => {
    const currentValue = Number(current || 0);
    const previousValue = Number(previous || 0);

    if (previousValue === 0 && currentValue === 0) {
        return 0;
    }

    if (previousValue === 0 && currentValue > 0) {
        return 100;
    }

    return Number(
        (((currentValue - previousValue) / previousValue) * 100).toFixed(2)
    );
};

const cardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );
        const startOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );
        const startOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        const data = await Invoice.aggregate([
            {
                $match: {
                    invoiceDate: {
                        $gte: startOfLastMonth,
                        $lt: startOfNextMonth,
                    },
                    status: {
                        $ne: "Cancel",
                    },
                },
            },
            {
                $set: {
                    calculatedPaidAmount: {
                        $cond: [
                            {
                                $gt: [
                                    {
                                        $size: {
                                            $ifNull: ["$payments", []],
                                        },
                                    },
                                    0,
                                ],
                            },
                            {
                                $sum: {
                                    $map: {
                                        input: {
                                            $ifNull: ["$payments", []],
                                        },
                                        as: "payment",
                                        in: {
                                            $convert: {
                                                input: "$$payment.amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $convert: {
                                    input: "$paidAmount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                            },
                        ],
                    },
                },
            },
            {
                $set: {
                    calculatedBalanceAmount: {
                        $max: [
                            {
                                $subtract: [
                                    {
                                        $convert: {
                                            input: "$grandTotal",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0,
                                        },
                                    },
                                    "$calculatedPaidAmount",
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            {
                                $gte: [
                                    "$invoiceDate",
                                    startOfCurrentMonth,
                                ],
                            },
                            "current",
                            "last",
                        ],
                    },
                    revenue: {
                        $sum: "$calculatedPaidAmount",
                    },
                    paidBills: {
                        $sum: {
                            $cond: [
                                {
                                    $gte: [
                                        "$calculatedPaidAmount",
                                        {
                                            $convert: {
                                                input: "$grandTotal",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    unpaidAmount: {
                        $sum: "$calculatedBalanceAmount",
                    },
                    unpaidBills: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        "$calculatedBalanceAmount",
                                        0,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const currentMonth =
            data.find((item) => item._id === "current") || {
                revenue: 0,
                paidBills: 0,
                unpaidAmount: 0,
                unpaidBills: 0,
            };

        const lastMonth =
            data.find((item) => item._id === "last") || {
                revenue: 0,
                paidBills: 0,
                unpaidAmount: 0,
                unpaidBills: 0,
            };

        const result = {
            revenue: {
                current: Number(currentMonth.revenue || 0),
                previous: Number(lastMonth.revenue || 0),
                percentage: calculatePercentage(
                    currentMonth.revenue,
                    lastMonth.revenue
                ),
                isPositive:
                    Number(currentMonth.revenue || 0) >=
                    Number(lastMonth.revenue || 0),
            },
            paidBills: {
                current: Number(currentMonth.paidBills || 0),
                previous: Number(lastMonth.paidBills || 0),
                percentage: calculatePercentage(
                    currentMonth.paidBills,
                    lastMonth.paidBills
                ),
                isPositive:
                    Number(currentMonth.paidBills || 0) >=
                    Number(lastMonth.paidBills || 0),
            },
            unpaidAmount: {
                current: Number(currentMonth.unpaidAmount || 0),
                previous: Number(lastMonth.unpaidAmount || 0),
                percentage: calculatePercentage(
                    currentMonth.unpaidAmount,
                    lastMonth.unpaidAmount
                ),
                isPositive:
                    Number(currentMonth.unpaidAmount || 0) <=
                    Number(lastMonth.unpaidAmount || 0),
            },
            unpaidBills: {
                current: Number(currentMonth.unpaidBills || 0),
                previous: Number(lastMonth.unpaidBills || 0),
                percentage: calculatePercentage(
                    currentMonth.unpaidBills,
                    lastMonth.unpaidBills
                ),
                isPositive:
                    Number(currentMonth.unpaidBills || 0) <=
                    Number(lastMonth.unpaidBills || 0),
            },
        };

        return res.status(200).json(
            new apiResponse(
                "Card statistics fetched successfully",
                200,
                result
            )
        );
    } catch (error) {
        console.error("Card stats error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch card statistics",
                500,
                null
            )
        );
    }
};

const getRecentInvoices = async (req, res) => {
    try {
        const recentInvoices = await Invoice.find({
            status: {
                $ne: "Cancel",
            },
        })
            .sort({
                createdAt: -1,
            })
            .limit(3)
            .populate(
                "customerID",
                "name email phone"
            )
            .lean();

        const formattedInvoices = recentInvoices.map((invoice) => {
            const paidAmount = getActualPaidAmount(invoice);
            const balanceAmount = getActualBalanceAmount(
                invoice,
                paidAmount
            );
            const status = getActualPaymentStatus(
                invoice,
                paidAmount
            );

            return {
                ...invoice,
                paidAmount,
                balanceAmount,
                status,
            };
        });

        return res.status(200).json(
            new apiResponse(
                "Recent invoices fetched successfully",
                200,
                formattedInvoices
            )
        );
    } catch (error) {
        console.error("Recent invoices error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch recent invoices",
                500,
                null
            )
        );
    }
};

const getTopCustomers = async (req, res) => {
    try {
        const topCustomers = await Invoice.aggregate([
            {
                $match: {
                    status: {
                        $ne: "Cancel",
                    },
                },
            },
            {
                $set: {
                    calculatedPaidAmount: {
                        $cond: [
                            {
                                $gt: [
                                    {
                                        $size: {
                                            $ifNull: ["$payments", []],
                                        },
                                    },
                                    0,
                                ],
                            },
                            {
                                $sum: {
                                    $map: {
                                        input: {
                                            $ifNull: ["$payments", []],
                                        },
                                        as: "payment",
                                        in: {
                                            $convert: {
                                                input: "$$payment.amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $convert: {
                                    input: "$paidAmount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                            },
                        ],
                    },
                },
            },
            {
                $set: {
                    calculatedBalanceAmount: {
                        $max: [
                            {
                                $subtract: [
                                    {
                                        $convert: {
                                            input: "$grandTotal",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0,
                                        },
                                    },
                                    "$calculatedPaidAmount",
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$customerID",
                    customerName: {
                        $first: "$customerName",
                    },
                    totalAmount: {
                        $sum: {
                            $convert: {
                                input: "$grandTotal",
                                to: "double",
                                onError: 0,
                                onNull: 0,
                            },
                        },
                    },
                    totalPaid: {
                        $sum: "$calculatedPaidAmount",
                    },
                    totalBalance: {
                        $sum: "$calculatedBalanceAmount",
                    },
                    totalBills: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    totalAmount: -1,
                },
            },
            {
                $limit: 3,
            },
            {
                $project: {
                    _id: 0,
                    customerID: "$_id",
                    customerName: 1,
                    totalAmount: 1,
                    totalPaid: 1,
                    totalBalance: 1,
                    totalBills: 1,
                },
            },
        ]);

        return res.status(200).json(
            new apiResponse(
                "Top customers fetched successfully",
                200,
                topCustomers
            )
        );
    } catch (error) {
        console.error("Top customers error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch top customers",
                500,
                null
            )
        );
    }
};

const getTopSellingItems = async (req, res) => {
    try {
        const topItems = await Invoice.aggregate([
            {
                $match: {
                    status: {
                        $ne: "Cancel",
                    },
                },
            },
            {
                $unwind: "$invoiceItems",
            },
            {
                $set: {
                    itemQuantity: {
                        $convert: {
                            input: "$invoiceItems.quantity",
                            to: "double",
                            onError: 0,
                            onNull: 0,
                        },
                    },
                    itemSellingPrice: {
                        $convert: {
                            input: "$invoiceItems.itemSellingPrice",
                            to: "double",
                            onError: 0,
                            onNull: 0,
                        },
                    },
                    itemDiscountAmount: {
                        $convert: {
                            input: "$invoiceItems.itemDiscountAmount",
                            to: "double",
                            onError: 0,
                            onNull: 0,
                        },
                    },
                },
            },
            {
                $set: {
                    finalItemPrice: {
                        $max: [
                            {
                                $subtract: [
                                    "$itemSellingPrice",
                                    "$itemDiscountAmount",
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $set: {
                    itemRevenue: {
                        $multiply: [
                            "$itemQuantity",
                            "$finalItemPrice",
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            {
                                $ne: [
                                    "$invoiceItems.itemID",
                                    null,
                                ],
                            },
                            "$invoiceItems.itemID",
                            "$invoiceItems.itemName",
                        ],
                    },
                    itemID: {
                        $first: "$invoiceItems.itemID",
                    },
                    itemName: {
                        $first: "$invoiceItems.itemName",
                    },
                    totalQuantitySold: {
                        $sum: "$itemQuantity",
                    },
                    timesBilled: {
                        $sum: 1,
                    },
                    revenue: {
                        $sum: "$itemRevenue",
                    },
                },
            },
            {
                $sort: {
                    totalQuantitySold: -1,
                },
            },
            {
                $limit: 6,
            },
            {
                $project: {
                    _id: 0,
                    itemID: 1,
                    itemName: 1,
                    totalQuantitySold: 1,
                    timesBilled: 1,
                    revenue: 1,
                },
            },
        ]);

        return res.status(200).json(
            new apiResponse(
                "Top selling items fetched successfully",
                200,
                topItems
            )
        );
    } catch (error) {
        console.error("Top selling items error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch top selling items",
                500,
                null
            )
        );
    }
};

const getSalesChartData = async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfYear = new Date(
            currentYear,
            0,
            1
        );
        const startOfNextMonth = new Date(
            currentYear,
            currentMonth + 1,
            1
        );

        const data = await Invoice.aggregate([
            {
                $match: {
                    invoiceDate: {
                        $gte: startOfYear,
                        $lt: startOfNextMonth,
                    },
                    status: {
                        $ne: "Cancel",
                    },
                },
            },
            {
                $set: {
                    calculatedPaidAmount: {
                        $cond: [
                            {
                                $gt: [
                                    {
                                        $size: {
                                            $ifNull: ["$payments", []],
                                        },
                                    },
                                    0,
                                ],
                            },
                            {
                                $sum: {
                                    $map: {
                                        input: {
                                            $ifNull: ["$payments", []],
                                        },
                                        as: "payment",
                                        in: {
                                            $convert: {
                                                input: "$$payment.amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $convert: {
                                    input: "$paidAmount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $month: "$invoiceDate",
                    },
                    totalRevenue: {
                        $sum: {
                            $convert: {
                                input: "$grandTotal",
                                to: "double",
                                onError: 0,
                                onNull: 0,
                            },
                        },
                    },
                    collectedRevenue: {
                        $sum: "$calculatedPaidAmount",
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const monthlyData = months
            .slice(0, currentMonth + 1)
            .map((month, index) => {
                const foundData = data.find(
                    (item) => item._id === index + 1
                );

                return {
                    month,
                    totalRevenue: Number(
                        foundData?.totalRevenue || 0
                    ),
                    collectedRevenue: Number(
                        foundData?.collectedRevenue || 0
                    ),
                };
            });

        return res.status(200).json(
            new apiResponse(
                "Chart data fetched successfully",
                200,
                monthlyData
            )
        );
    } catch (error) {
        console.error("Chart data error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch chart data",
                500,
                null
            )
        );
    }
};

const getLifetimeInvoiceSummary = async (req, res) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const data = await Invoice.aggregate([
            {
                $match: {
                    status: {
                        $ne: "Cancel",
                    },
                },
            },
            {
                $set: {
                    calculatedPaidAmount: {
                        $cond: [
                            {
                                $gt: [
                                    {
                                        $size: {
                                            $ifNull: [
                                                "$payments",
                                                [],
                                            ],
                                        },
                                    },
                                    0,
                                ],
                            },
                            {
                                $sum: {
                                    $map: {
                                        input: {
                                            $ifNull: [
                                                "$payments",
                                                [],
                                            ],
                                        },
                                        as: "payment",
                                        in: {
                                            $convert: {
                                                input: "$$payment.amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $convert: {
                                    input: "$paidAmount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                            },
                        ],
                    },
                    calculatedGrandTotal: {
                        $convert: {
                            input: "$grandTotal",
                            to: "double",
                            onError: 0,
                            onNull: 0,
                        },
                    },
                },
            },
            {
                $set: {
                    calculatedBalanceAmount: {
                        $max: [
                            {
                                $subtract: [
                                    "$calculatedGrandTotal",
                                    "$calculatedPaidAmount",
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $set: {
                    billCategory: {
                        $cond: [
                            {
                                $gte: [
                                    "$calculatedPaidAmount",
                                    "$calculatedGrandTotal",
                                ],
                            },
                            "Fully Paid",
                            {
                                $cond: [
                                    {
                                        $gt: [
                                            "$calculatedPaidAmount",
                                            0,
                                        ],
                                    },
                                    "Partially Paid",
                                    "Pending",
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: "$calculatedGrandTotal",
                    },
                    totalClearedAmount: {
                        $sum: "$calculatedPaidAmount",
                    },
                    fullyPaidBills: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Fully Paid",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    fullyPaidAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Fully Paid",
                                    ],
                                },
                                "$calculatedGrandTotal",
                                0,
                            ],
                        },
                    },
                    partiallyPaidBills: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Partially Paid",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    partiallyPaidInvoicedAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Partially Paid",
                                    ],
                                },
                                "$calculatedGrandTotal",
                                0,
                            ],
                        },
                    },
                    partiallyPaidClearedAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Partially Paid",
                                    ],
                                },
                                "$calculatedPaidAmount",
                                0,
                            ],
                        },
                    },
                    partiallyPaidRemainingAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Partially Paid",
                                    ],
                                },
                                "$calculatedBalanceAmount",
                                0,
                            ],
                        },
                    },
                    pendingBills: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Pending",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$billCategory",
                                        "Pending",
                                    ],
                                },
                                "$calculatedBalanceAmount",
                                0,
                            ],
                        },
                    },
                    overdueBills: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $gt: [
                                                "$calculatedBalanceAmount",
                                                0,
                                            ],
                                        },
                                        {
                                            $lt: [
                                                "$dueDate",
                                                now,
                                            ],
                                        },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    overdueAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $gt: [
                                                "$calculatedBalanceAmount",
                                                0,
                                            ],
                                        },
                                        {
                                            $lt: [
                                                "$dueDate",
                                                now,
                                            ],
                                        },
                                    ],
                                },
                                "$calculatedBalanceAmount",
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const summary = data[0] || {
            totalAmount: 0,
            totalClearedAmount: 0,
            fullyPaidBills: 0,
            fullyPaidAmount: 0,
            partiallyPaidBills: 0,
            partiallyPaidInvoicedAmount: 0,
            partiallyPaidClearedAmount: 0,
            partiallyPaidRemainingAmount: 0,
            pendingBills: 0,
            pendingAmount: 0,
            overdueBills: 0,
            overdueAmount: 0,
        };

        const calculatePercentage = (value, total) => {
            const valueNumber = Number(value || 0);
            const totalNumber = Number(total || 0);

            if (totalNumber <= 0) {
                return 0;
            }

            return Number(
                (
                    (valueNumber / totalNumber) *
                    100
                ).toFixed(1)
            );
        };

        const result = {
            totalLifetimeAmount: Number(
                summary.totalAmount || 0
            ),
            totalClearedAmount: Number(
                summary.totalClearedAmount || 0
            ),
            totalRemainingAmount: Math.max(
                Number(summary.totalAmount || 0) -
                Number(summary.totalClearedAmount || 0),
                0
            ),
            fullyPaid: {
                bills: Number(
                    summary.fullyPaidBills || 0
                ),
                amount: Number(
                    summary.fullyPaidAmount || 0
                ),
                percentage: calculatePercentage(
                    summary.fullyPaidAmount,
                    summary.totalAmount
                ),
            },
            partiallyPaid: {
                bills: Number(
                    summary.partiallyPaidBills || 0
                ),
                invoicedAmount: Number(
                    summary.partiallyPaidInvoicedAmount || 0
                ),
                clearedAmount: Number(
                    summary.partiallyPaidClearedAmount || 0
                ),
                remainingAmount: Number(
                    summary.partiallyPaidRemainingAmount || 0
                ),
                clearedPercentage: calculatePercentage(
                    summary.partiallyPaidClearedAmount,
                    summary.partiallyPaidInvoicedAmount
                ),
                percentage: calculatePercentage(
                    summary.partiallyPaidInvoicedAmount,
                    summary.totalAmount
                ),
            },
            pending: {
                bills: Number(
                    summary.pendingBills || 0
                ),
                amount: Number(
                    summary.pendingAmount || 0
                ),
                percentage: calculatePercentage(
                    summary.pendingAmount,
                    summary.totalAmount
                ),
            },
            overdue: {
                bills: Number(
                    summary.overdueBills || 0
                ),
                amount: Number(
                    summary.overdueAmount || 0
                ),
                percentage: calculatePercentage(
                    summary.overdueAmount,
                    summary.totalAmount
                ),
            },
        };

        return res.status(200).json(
            new apiResponse(
                "Lifetime invoice summary fetched successfully",
                200,
                result
            )
        );
    } catch (error) {
        console.error("Lifetime summary error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch lifetime invoice summary",
                500,
                null
            )
        );
    }
};

const getRecentActivities = async (req, res) => {
    try {
        const now = new Date();

        const invoices = await Invoice.find({
            status: {
                $ne: "Cancel",
            },
        })
            .select(
                [
                    "invoiceNumber",
                    "customerName",
                    "grandTotal",
                    "paidAmount",
                    "payments",
                    "dueDate",
                    "createdAt",
                    "updatedAt",
                    "status",
                ].join(" ")
            )
            .sort({
                createdAt: -1,
            })
            .limit(50)
            .lean();

        const activities = [];

        const toNumber = (value) => {
            const number = Number(value);
            return Number.isFinite(number) ? number : 0;
        };

        const getRelativeTime = (date) => {
            if (!date) {
                return "";
            }

            const dateValue = new Date(date);
            if (Number.isNaN(dateValue.getTime())) {
                return "";
            }

            const difference = now.getTime() - dateValue.getTime();

            if (difference < 0) {
                return "Just now";
            }

            const seconds = Math.floor(difference / 1000);
            if (seconds < 60) {
                return "Just now";
            }

            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) {
                return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
            }

            const hours = Math.floor(minutes / 60);
            if (hours < 24) {
                return `${hours} hour${hours === 1 ? "" : "s"} ago`;
            }

            const days = Math.floor(hours / 24);
            if (days < 7) {
                return `${days} day${days === 1 ? "" : "s"} ago`;
            }

            return dateValue.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        };

        const formatAmount = (amount) => {
            return toNumber(amount).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
            });
        };

        const formatDueDate = (date) => {
            if (!date) {
                return "";
            }

            return new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            });
        };

        for (const invoice of invoices) {
            const grandTotal = toNumber(invoice.grandTotal);
            let paidAmount = 0;

            if (
                Array.isArray(invoice.payments) &&
                invoice.payments.length > 0
            ) {
                paidAmount = invoice.payments.reduce(
                    (total, payment) => {
                        return (
                            total +
                            toNumber(payment.amount)
                        );
                    },
                    0
                );
            } else {
                paidAmount = toNumber(invoice.paidAmount);
            }

            const balanceAmount = Math.max(
                grandTotal - paidAmount,
                0
            );

            if (invoice.createdAt) {
                activities.push({
                    id: `invoice-created-${invoice._id}`,
                    type: "invoice-created",
                    title: "Invoice created",
                    description: `${invoice.invoiceNumber} · ${invoice.customerName} · ₹${formatAmount(grandTotal)}`,
                    amount: grandTotal,
                    invoiceNumber: invoice.invoiceNumber,
                    customerName: invoice.customerName,
                    timestamp: new Date(invoice.createdAt),
                    time: getRelativeTime(invoice.createdAt),
                });
            }

            if (
                Array.isArray(invoice.payments) &&
                invoice.payments.length > 0
            ) {
                let paidBefore = 0;

                for (
                    let index = 0;
                    index < invoice.payments.length;
                    index++
                ) {
                    const payment = invoice.payments[index];
                    const paymentAmount = toNumber(payment.amount);

                    if (paymentAmount <= 0) {
                        continue;
                    }

                    const paymentDate =
                        payment.paymentDate ||
                        payment.createdAt ||
                        invoice.updatedAt ||
                        invoice.createdAt;

                    const paidAfter = paidBefore + paymentAmount;
                    const completed =
                        grandTotal > 0 &&
                        paidAfter >= grandTotal;

                    activities.push({
                        id: `payment-${invoice._id}-${index}`,
                        type: completed ? "payment-complete" : "payment",
                        title: completed ? "Invoice fully cleared" : "Payment received",
                        description: `${invoice.invoiceNumber} · ₹${formatAmount(paymentAmount)} via ${payment.paymentMethod || "Cash"}`,
                        amount: paymentAmount,
                        invoiceNumber: invoice.invoiceNumber,
                        customerName: invoice.customerName,
                        paymentMethod: payment.paymentMethod || "Cash",
                        timestamp: new Date(paymentDate),
                        time: getRelativeTime(paymentDate),
                    });

                    paidBefore = paidAfter;
                }
            }

            if (
                balanceAmount > 0 &&
                invoice.dueDate &&
                new Date(invoice.dueDate) < now
            ) {
                activities.push({
                    id: `overdue-${invoice._id}`,
                    type: "overdue",
                    title: "Invoice overdue",
                    description: `${invoice.invoiceNumber} · ₹${formatAmount(balanceAmount)} outstanding · Due ${formatDueDate(invoice.dueDate)}`,
                    amount: balanceAmount,
                    remainingAmount: balanceAmount,
                    invoiceNumber: invoice.invoiceNumber,
                    customerName: invoice.customerName,
                    timestamp: new Date(invoice.dueDate),
                    time: getRelativeTime(invoice.dueDate),
                });
            }
        }

        activities.sort((a, b) => {
            return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );
        });

        const uniqueActivities = Array.from(
            new Map(
                activities.map((activity) => [
                    activity.id,
                    activity,
                ])
            ).values()
        );

        const recentActivities = uniqueActivities.slice(0, 5);

        return res.status(200).json(
            new apiResponse(
                "Recent activities fetched successfully",
                200,
                recentActivities
            )
        );
    } catch (error) {
        console.error("Recent activities error:", error);

        return res.status(500).json(
            new apiError(
                "Failed to fetch recent activities",
                500,
                null
            )
        );
    }
};

export {
    cardStats,
    getRecentInvoices,
    getTopCustomers,
    getTopSellingItems,
    getSalesChartData,
    getLifetimeInvoiceSummary,
    getRecentActivities,
};