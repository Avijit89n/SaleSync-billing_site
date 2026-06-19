import { Router } from 'express';
import { createOrUpdateInvoiceCustomizer, getInvoiceCustomizer } from '../controllers/invoiceCustomizer.controller.js';
import verifyToken from '../middlewares/verifyToken.middlewares.js';
import tokensVerification from '../middlewares/tokens.middlewares.js';
import upload from '../middlewares/multer.middlewares.js';

const router = Router();

router.route('/create-update').post(
    verifyToken, 
    tokensVerification, 
    // Replaced upload.single with upload.fields to accept both files
    upload.fields([
        { name: 'companyLogo', maxCount: 1 },
        { name: 'companySignature', maxCount: 1 }
    ]), 
    createOrUpdateInvoiceCustomizer
);

router.route('/get-invoice-settings').get(
    verifyToken, 
    tokensVerification, 
    getInvoiceCustomizer
);

export default router;