import { Invoice } from "../models/invoice.models.js";

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
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, "$grandTotal", 0],
                        },
                    },
                    paidBills: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, 1, 0],
                        },
                    },
                    unpaidAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Unpaid"] }, "$grandTotal", 0],
                        },
                    },
                    unpaidBills: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Unpaid"] }, 1, 0],
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
                isPositive: currentMonth.unpaidAmount >= lastMonth.unpaidAmount ? true : false
            },
            unpaidBills: {
                current: currentMonth.unpaidBills,
                previous: lastMonth.unpaidBills,
                percentage: calculatePercentage(currentMonth.unpaidBills, lastMonth.unpaidBills),
                isPositive: currentMonth.unpaidBills >= lastMonth.unpaidBills ? true : false
            },
        };

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Card stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch card statistics",
        });
    }
};

// Add this below your cardStats method

const getRecentInvoices = async (req, res) => {
    try {
        // Fetch the last 3 invoices, sorted by creation date (newest first)
        const recentInvoices = await Invoice.find()
            .sort({ createdAt: -1 }) // -1 means descending order (latest first)
            .limit(3)
            .populate('customerID', 'name email phone') // Optional: Fetch related customer details if needed
            .lean(); // .lean() converts Mongoose documents to plain JS objects for better performance

        res.status(200).json({
            success: true,
            data: recentInvoices,
        });
    } catch (error) {
        console.error("Recent invoices error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent invoices",
        });
    }
};

// Add this below your existing methods

const getTopCustomers = async (req, res) => {
    try {
        const topCustomers = await Invoice.aggregate([
            // 1. (Optional but recommended) Exclude 'Cancel' invoices so they don't count towards the total
            {
                $match: {
                    status: { $ne: "Cancel" }
                }
            },

            // 2. Group the invoices by customerID
            {
                $group: {
                    _id: "$customerID",
                    // Grab the customer name directly from the invoice record
                    customerName: { $first: "$customerName" },
                    // Sum up the grandTotal of all their invoices
                    totalAmount: { $sum: "$grandTotal" },
                    // Count the number of invoices they have
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
                    _id: 0, // hide the default MongoDB _id
                    customerID: "$_id", // map the grouped _id back to customerID
                    customerName: 1,
                    totalAmount: 1,
                    totalBills: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: topCustomers,
        });
    } catch (error) {
        console.error("Top customers error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch top customers",
        });
    }
};

// Add this below your existing methods

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
                    revenue: 1 // <--- Added to the final output
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: topItems,
        });
    } catch (error) {
        console.error("Top selling items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch top selling items",
        });
    }
};

// Add this below your existing methods

const getSalesChartData = async (req, res) => {
    try {
        const now = new Date();

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 7 = Aug

        // Start of current year
        const startOfYear = new Date(currentYear, 0, 1);

        // Start of next month
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

                    // Actually collected amount
                    collectedRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Paid"] },
                                "$grandTotal",
                                0,
                            ],
                        },
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
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        // Only generate months up to the current month
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

        // Quarterly data
        const quarterlyData = [
            {
                quarter: "Q1",
                revenue: monthlyData
                    .slice(0, 3)
                    .reduce(
                        (acc, curr) => acc + curr.collectedRevenue,
                        0
                    ),
            },
            {
                quarter: "Q2",
                revenue: monthlyData
                    .slice(3, 6)
                    .reduce(
                        (acc, curr) => acc + curr.collectedRevenue,
                        0
                    ),
            },
            {
                quarter: "Q3",
                revenue: monthlyData
                    .slice(6, 9)
                    .reduce(
                        (acc, curr) => acc + curr.collectedRevenue,
                        0
                    ),
            },
            {
                quarter: "Q4",
                revenue: monthlyData
                    .slice(9, 12)
                    .reduce(
                        (acc, curr) => acc + curr.collectedRevenue,
                        0
                    ),
            },
        ];

        // Maximum monthly revenue
        const maxMonthlyRevenue = Math.max(
            ...monthlyData.map((item) => item.totalRevenue),
            0
        );

        // Clean chart maximum
        const chartMax =
            maxMonthlyRevenue === 0
                ? 100000
                : Math.ceil(maxMonthlyRevenue / 100000) * 100000;

        res.status(200).json({
            success: true,
            data: {
                monthly: monthlyData,
                quarterly: quarterlyData,
                maxCap: chartMax,
            },
        });
    } catch (error) {
        console.error("Chart data error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch chart data",
        });
    }
};


// Add this below your existing methods

const getLifetimeInvoiceSummary = async (req, res) => {
    try {
        const now = new Date();
        // FIX: Set the exact time to midnight (00:00:00) 
        // This stops today's invoices from being instantly flagged as "Overdue"
        now.setHours(0, 0, 0, 0);

        const data = await Invoice.aggregate([
            {
                $match: { status: { $ne: "Cancel" } },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$grandTotal" },
                    paidAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$grandTotal", 0] },
                    },
                    overdueAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "Unpaid"] },
                                        { $lt: ["$dueDate", now] },
                                    ],
                                },
                                "$grandTotal",
                                0,
                            ],
                        },
                    },
                    unpaidAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "Unpaid"] },
                                        { $gte: ["$dueDate", now] },
                                    ],
                                },
                                "$grandTotal",
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

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Lifetime summary error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch lifetime invoice summary" });
    }
};

// Don't forget to export it
export {
    cardStats,
    getRecentInvoices,
    getTopCustomers,
    getTopSellingItems,
    getSalesChartData,
    getLifetimeInvoiceSummary // <--- new export
};