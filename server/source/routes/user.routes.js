import { Router } from "express";
import {
    userLogin,
    userRegister,
    userLogout,
    userVerification,
    checkUser,
    directLogin
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";

const router = Router()

router.route('/login').post(upload.none(), userLogin)
router.route('/direct-login').post(upload.none(), directLogin)
router.route('/register').post(upload.none(), userRegister)
router.route('/verify').post(upload.none(), userVerification)
router.route('/logout').get(verifyToken, tokensVerification, userLogout)
router.route('/check-user-auth').get(verifyToken, tokensVerification, checkUser)


export default router;