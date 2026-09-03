import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import { 
    additem,
    deleteItem,
    getAllItem,
    getItemById,
    itemSearch,
    updateItem,
} from "../controllers/item.controller.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";

const router = Router()

router.route('/additem').post(verifyToken, tokensVerification, upload.single('image'), additem);
router.route('/get-all').get(verifyToken, tokensVerification, getAllItem);
router.route('/delete-item/:id').get(verifyToken, tokensVerification, deleteItem);
router.route('/item-id/:id').get(verifyToken, tokensVerification, getItemById);
router.route('/update-item/:id').put(verifyToken, tokensVerification, upload.single('image'), updateItem);
router.route('/item-search').get(itemSearch);

export default router;