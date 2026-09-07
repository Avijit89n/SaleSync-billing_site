import { Router } from "express";
import {
    userLogin,
    userRegister,
    userLogout,
    userVerification,
    checkUser,
    directLogin,
    getCurrentAccount,
    getAccountUsers,
    getPendingRequests,
    approveAdminRequest,
    rejectAdminRequest,
    deleteAdmin,
    getAccountStats,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import { requireAdmin } from "../middlewares/admin.middlewares.js";



const router = Router();

router.route("/login").post(upload.none(),userLogin);
router.route("/direct-login").post(upload.none(),directLogin);
router.route("/register").post(upload.none(),userRegister);
router.route("/verify").post(upload.none(),userVerification);
router.route("/logout").get(verifyToken,tokensVerification,userLogout);
router.route("/check-user-auth").get(verifyToken,tokensVerification,checkUser);
router.route("/account/me").get(verifyToken,tokensVerification,requireAdmin,upload.none(),getCurrentAccount);
router.route("/account/users").get(verifyToken,tokensVerification,requireAdmin,upload.none(),getAccountUsers);
router.route("/account/stats").get(verifyToken,tokensVerification,requireAdmin,upload.none(),getAccountStats);
router.route("/account/approval/pending").get(verifyToken,tokensVerification,requireAdmin,upload.none(),getPendingRequests);
router.route("/account/approval/:id/approve").get(verifyToken,tokensVerification,requireAdmin,upload.none(),approveAdminRequest);
router.route("/account/approval/:id/reject").get(verifyToken,tokensVerification,requireAdmin,upload.none(),rejectAdminRequest);
router.route("/account/users/:id").delete(verifyToken,tokensVerification,requireAdmin,upload.none(),deleteAdmin);

export default router;