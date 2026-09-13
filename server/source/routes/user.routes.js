import { Router } from "express";
import {
    userLogin,
    userRegister,
    userLogout,
    userVerification,
    checkUser,
    getAllPendingReq,
    approveReq
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";



const router = Router();

router.route("/login").post(upload.none(), userLogin);
router.route("/register").post(upload.none(), userRegister);
router.route("/verify").post(upload.none(), userVerification);
router.route("/logout").get(verifyToken, tokensVerification, userLogout);
router.route("/check-user-auth").get(verifyToken, tokensVerification, checkUser);
router.route("/get-all-request").get(verifyToken, tokensVerification, getAllPendingReq);
router.route("/approve-reject-req").post(verifyToken, tokensVerification, approveReq);

export default router;