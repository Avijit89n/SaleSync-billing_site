import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import { 
    additem,
    getAllItem,
    itemSearch,
} from "../controllers/item.controller.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";

const router = Router()

router.route('/additem').post(verifyToken, tokensVerification, upload.single('image'), additem);
router.route('/get-all').get(verifyToken, tokensVerification, getAllItem);
router.route('/item-search').get(itemSearch);

export default router;