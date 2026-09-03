import { Router } from "express";
import { cardStats, getRecentInvoices, getTopCustomers, getTopSellingItems, getSalesChartData, getLifetimeInvoiceSummary, getRecentActivities } from "../controllers/homeData.controller.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";

const router = Router();

router.route('/home-data').get(verifyToken, tokensVerification, cardStats);
router.route('/get-recent-invoices').get(verifyToken, tokensVerification, getRecentInvoices);
router.route('/get-top-customers').get(verifyToken, tokensVerification, getTopCustomers);
router.route('/get-top-items').get(verifyToken, tokensVerification, getTopSellingItems);
router.route('/get-chart').get(verifyToken, tokensVerification, getSalesChartData);
router.route('/get-invoice-summary').get(verifyToken, tokensVerification, getLifetimeInvoiceSummary);
router.route('/get-recent-activities').get(verifyToken, tokensVerification, getRecentActivities);

export default router;