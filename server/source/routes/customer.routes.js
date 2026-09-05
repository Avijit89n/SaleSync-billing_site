import { Router } from "express";
import { addCustomer, customerSearch, deleteCustomer, getAllCustomers, getCustomerById, updateCustomer, getCustomerInvoices } from "../controllers/customer.controller.js";
import tokensVerification from "../middlewares/tokens.middlewares.js";
import verifyToken from "../middlewares/verifyToken.middlewares.js";

const router = Router()

router.route("/add-customer").post(verifyToken, tokensVerification, addCustomer)
router.route("/get-all-customers").get(verifyToken, tokensVerification, getAllCustomers)
router.route("/customer-id/:id").get(verifyToken, tokensVerification, getCustomerById)
router.route("/delete-customer/:id").get(verifyToken, tokensVerification, deleteCustomer)
router.route("/update-customer/:id").post(verifyToken, tokensVerification, updateCustomer)
router.route("/get-customer-details/:id").get(verifyToken, tokensVerification, getCustomerInvoices)
router.route("/customer-search").get(customerSearch)


export default router