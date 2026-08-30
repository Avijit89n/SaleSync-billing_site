import { Router } from "express";
import { 
    addInvoice, 
    getNextInvoiceNumber, 
    getAllInvoice, 
    invoiceSearch, 
    cancelInvoice,
    addPaymentRecord,
    getInvoice
} from "../controllers/invoice.controller.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import { customerValidation } from "../middlewares/customerValdiation.middlewares.js";

const router = Router();


router.route('/add-invoice').post(verifyToken, tokensVerification, customerValidation, addInvoice);
router.route('/get-next-token').get(verifyToken, tokensVerification, getNextInvoiceNumber);
router.route('/get-all').get(verifyToken, tokensVerification, getAllInvoice);
router.route('/cancel/:id').get(verifyToken, tokensVerification, cancelInvoice);
router.route('/get-invoice/:id').get(verifyToken, tokensVerification, getInvoice);
router.route('/:id/payment').post(verifyToken, tokensVerification, addPaymentRecord)
router.route('/invoice-search').get(invoiceSearch); 

export default router; 