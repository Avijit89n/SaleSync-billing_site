import { Invoice } from "../models/invoice.models.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

const cardStats = async (req, res) => {
    try {
        const now = new Date();

        // 1. Define Date Boundaries
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // 2. Aggregate Data from MongoDB
        const data = await Invoice.aggregate([
            {
                // Match invoices strictly from the start of last month to the end of the current month
                $match: {
                    invoiceDate: {
                        $gte: startOfLastMonth,
                        $lt: startOfNextMonth,
                    },
                    status: { $ne: "Cancel" } // Ignore canceled invoices in stats
                },
            },
            {
                // Group them into "current" and "last" month buckets
                $group: {
                    _id: {
                        $cond: [
                            { $gte: ["$invoiceDate", startOfCurrentMonth] },
                            "current",
                            "last",
                        ],
                    },
                    // Revenue is now accurately based on the new `paidAmount` field (includes partials)
                    revenue: {
                        $sum: "$paidAmount",
                    },
                    // Fully paid bills count
                    paidBills: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, 1, 0],
                        },
                    },
                    // Unpaid amount is now accurately based on `balanceAmount`
                    unpaidAmount: {
                        $sum: "$balanceAmount",
                    },
                    // Unpaid bills count now includes both Unpaid and Partially Paid
                    unpaidBills: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["Unpaid", "Partially Paid"]] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        // 3. Extract mapped data with fallback defaults if no invoices exist for that month
        const currentMonth = data.find((item) => item._id === "current") || {
            revenue: 0,
            paidBills: 0,
            unpaidAmount: 0,
            unpaidBills: 0,
        };

        const lastMonth = data.find((item) => item._id === "last") || {
            revenue: 0,
            paidBills: 0,
            unpaidAmount: 0,
            unpaidBills: 0,
        };

        // 4. Robust Percentage Calculation
        const calculatePercentage = (current, previous) => {
            if (previous === 0 && current === 0) return 0; // No change
            if (previous === 0 && current > 0) return 100; // 100% increase if previous was 0

            return Number((((current - previous) / previous) * 100).toFixed(2));
        };

        // 5. Structure the Final Result
        const result = {
            revenue: {
                current: currentMonth.revenue,
                previous: lastMonth.revenue,
                percentage: calculatePercentage(currentMonth.revenue, lastMonth.revenue),
                isPositive: currentMonth.revenue >= lastMonth.revenue ? true : false
            },
            paidBills: {
                current: currentMonth.paidBills,
                previous: lastMonth.paidBills,
                percentage: calculatePercentage(currentMonth.paidBills, lastMonth.paidBills),
                isPositive: currentMonth.paidBills >= lastMonth.paidBills ? true : false
            },
            unpaidAmount: {
                current: currentMonth.unpaidAmount,
                previous: lastMonth.unpaidAmount,
                percentage: calculatePercentage(currentMonth.unpaidAmount, lastMonth.unpaidAmount),
                isPositive: currentMonth.unpaidAmount <= lastMonth.unpaidAmount ? true : false // Lower unpaid is positive!
            },
            unpaidBills: {
                current: currentMonth.unpaidBills,
                previous: lastMonth.unpaidBills,
                percentage: calculatePercentage(currentMonth.unpaidBills, lastMonth.unpaidBills),
                isPositive: currentMonth.unpaidBills <= lastMonth.unpaidBills ? true : false // Lower unpaid is positive!
            },
        };

        return res.status(200).json(
            new apiResponse("Card statistics fetched successfully", 200, result)
        );
    } catch (error) {
        console.error("Card stats error:", error);

        return res.status(500).json(
            new apiError("Failed to fetch card statistics", 500, null)
        );
    }
};

const getRecentInvoices = async (req, res) => {
    try {
        // Fetch the last 3 invoices, sorted by creation date (newest first)
        const recentInvoices = await Invoice.find()
            .sort({ createdAt: -1 }) // -1 means descending order (latest first)
            .limit(3)
            .populate('customerID', 'name email phone') // Optional: Fetch related customer details if needed
            .lean(); // .lean() converts Mongoose documents to plain JS objects for better performance

        res.status(200).json(
            new apiResponse("Recent invoices fetched successfully", 200, recentInvoices)
        );
    } catch (error) {
        console.error("Recent invoices error:", error);

        res.status(500).json(
            new apiError("Failed to fetch recent invoices", 500, null)
        );
    }
};

const getTopCustomers = async (req, res) => {
    try {
        const topCustomers = await Invoice.aggregate([
            // 1. Exclude 'Cancel' invoices
            {
                $match: {
                    status: { $ne: "Cancel" }
                }
            },
            // 2. Group the invoices by customerID
            {
                $group: {
                    _id: "$customerID",
                    customerName: { $first: "$customerName" },
                    totalAmount: { $sum: "$grandTotal" },
                    totalPaid: { $sum: "$paidAmount" }, // Added to show actual collected value
                    totalBalance: { $sum: "$balanceAmount" }, // Added to show what they owe
                    totalBills: { $sum: 1 }
                }
            },
            // 3. Sort by total amount in descending order (highest revenue first)
            {
                $sort: { totalAmount: -1 }
            },
            // 4. Keep only the top 3 results
            {
                $limit: 3
            },
            // 5. Clean up the output structure for the frontend
            {
                $project: {
                    _id: 0, 
                    customerID: "$_id",
                    customerName: 1,
                    totalAmount: 1,
                    totalPaid: 1,
                    totalBalance: 1,
                    totalBills: 1
                }
            }
        ]);

        return res.status(200).json(
            new apiResponse("Top customers fetched successfully", 200, topCustomers)
        );
    } catch (error) {
        console.error("Top customers error:", error);

        return res.status(500).json(
            new apiError("Failed to fetch top customers", 500, null)
        );
    }
};

const getTopSellingItems = async (req, res) => {
    try {
        const topItems = await Invoice.aggregate([
            // 1. Exclude 'Cancel' invoices
            {
                $match: {
                    status: { $ne: "Cancel" }
                }
            },
            // 2. Break down the 'invoiceItems' array into separate documents
            {
                $unwind: "$invoiceItems"
            },
            // 3. Group by item name and sum up quantities, times billed, AND total amount
            {
                $group: {
                    _id: "$invoiceItems.itemName",
                    itemID: { $first: "$invoiceItems.itemID" },
                    totalQuantitySold: { $sum: "$invoiceItems.quantity" },
                    timesBilled: { $sum: 1 },
                    // Calculate the total revenue generated by this item
                    revenue: {
                        $sum: {
                            $multiply: ["$invoiceItems.quantity", "$invoiceItems.itemSellingPrice"]
                        }
                    }
                }
            },
            // 4. Sort by the highest quantity sold in descending order
            {
                $sort: { totalQuantitySold: -1 }
            },
            // 5. Keep only the top 3 items
            {
                $limit: 3
            },
            // 6. Clean up the final output for the frontend
            {
                $project: {
                    _id: 0,
                    itemName: "$_id",
                    itemID: 1,
                    totalQuantitySold: 1,
                    timesBilled: 1,
                    revenue: 1 
                }
            }
        ]);

        return res.status(200).json(
            new apiResponse("Top selling items fetched successfully", 200, topItems)
        );
    } catch (error) {
        console.error("Top selling items error:", error);

        return res.status(500).json(
            new apiError("Failed to fetch top selling items", 500, null)
        );
    }
};

const getSalesChartData = async (req, res) => {
    try {
        const now = new Date();

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); 

        const startOfYear = new Date(currentYear, 0, 1);

        const startOfNextMonth = new Date(
            currentYear,
            currentMonth + 1,
            1
        );

        const data = await Invoice.aggregate([
            // Current year up to the current month only
            {
                $match: {
                    invoiceDate: {
                        $gte: startOfYear,
                        $lt: startOfNextMonth,
                    },
                    status: { $ne: "Cancel" },
                },
            },
            // Group revenue by month
            {
                $group: {
                    _id: {
                        $month: "$invoiceDate",
                    },
                    // Total invoiced amount
                    totalRevenue: {
                        $sum: "$grandTotal",
                    },
                    // Actually collected amount (now elegantly using $paidAmount)
                    collectedRevenue: {
                        $sum: "$paidAmount",
                    },
                },
            },
            // Sort by month
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
                    totalRevenue: foundData?.totalRevenue || 0,
                    collectedRevenue: foundData?.collectedRevenue || 0,
                };
            });

        return res.status(200).json(
            new apiResponse("Chart data fetched successfully", 200, monthlyData)
        );
    } catch (error) {
        console.error("Chart data error:", error);

        res.status(500).json(
            new apiError("Failed to fetch chart data", 500, null)
        );
    }
};

const getLifetimeInvoiceSummary = async (req, res) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const data = await Invoice.aggregate([
            {
                $match: { status: { $ne: "Cancel" } },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$grandTotal" },
                    // Paid amount sums up all payments received
                    paidAmount: { $sum: "$paidAmount" },
                    // Overdue sums balanceAmount for anything unpaid/partially paid with a past due date
                    overdueAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ["$status", ["Unpaid", "Partially Paid"]] },
                                        { $lt: ["$dueDate", now] },
                                    ],
                                },
                                "$balanceAmount",
                                0,
                            ],
                        },
                    },
                    // Unpaid sums balanceAmount for anything unpaid/partially paid that is not yet due
                    unpaidAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ["$status", ["Unpaid", "Partially Paid"]] },
                                        { $gte: ["$dueDate", now] },
                                    ],
                                },
                                "$balanceAmount",
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const summary = data[0] || {
            totalAmount: 0,
            paidAmount: 0,
            unpaidAmount: 0,
            overdueAmount: 0,
        };

        const calculatePercentage = (part, total) => {
            if (total === 0) return 0;
            return Number(((part / total) * 100).toFixed(1));
        };

        const result = {
            totalLifetimeAmount: summary.totalAmount,
            paid: {
                amount: summary.paidAmount,
                percentage: calculatePercentage(summary.paidAmount, summary.totalAmount),
            },
            unpaid: {
                amount: summary.unpaidAmount,
                percentage: calculatePercentage(summary.unpaidAmount, summary.totalAmount),
            },
            overdue: {
                amount: summary.overdueAmount,
                percentage: calculatePercentage(summary.overdueAmount, summary.totalAmount),
            },
        };

        res.status(200).json(
            new apiResponse("Lifetime invoice summary fetched successfully", 200, result)
        );
    } catch (error) {
        console.error("Lifetime summary error:", error);
        res.status(500).json(
            new apiError("Failed to fetch lifetime invoice summary", 500, null)
        );
    }
};

export {
    cardStats,
    getRecentInvoices,
    getTopCustomers,
    getTopSellingItems,
    getSalesChartData,
    getLifetimeInvoiceSummary
};