import { Router } from "express";
import { 
    addInvoice, 
    getNextInvoiceNumber, 
    getAllInvoice, 
    invoiceSearch 
} from "../controllers/invoice.controller.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";

const router = Router();


router.route('/add-invoice').post(verifyToken, tokensVerification, addInvoice);
router.route('/get-next-token').get(verifyToken, tokensVerification, getNextInvoiceNumber);
router.route('/get-all').get(verifyToken, tokensVerification, getAllInvoice);
router.route('/invoice-search').get(invoiceSearch);

export default router;