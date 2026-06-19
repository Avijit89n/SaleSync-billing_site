import { Router } from "express";
import { addCustomer, customerSearch, getAllCustomers } from "../controllers/customer.controller.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";

const router = Router()

router.route("/add-customer").post(verifyToken, tokensVerification, addCustomer)
router.route("/get-all-customers").get(verifyToken, tokensVerification, getAllCustomers)
router.route("/customer-search").get(customerSearch)


export default router