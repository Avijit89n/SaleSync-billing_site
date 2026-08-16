import { Router } from "express";
import { cardStats, getRecentInvoices, getTopCustomers, getTopSellingItems, getSalesChartData, getLifetimeInvoiceSummary } from "../controllers/homeData.controller.js";

const router = Router();

router.route('/home-data').get(cardStats);
router.route('/get-recent-invoices').get(getRecentInvoices);
router.route('/get-top-customers').get(getTopCustomers);
router.route('/get-top-items').get(getTopSellingItems);
router.route('/get-chart').get(getSalesChartData);
router.route('/get-invoice-summary').get(getLifetimeInvoiceSummary);

export default router;