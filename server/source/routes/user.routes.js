import { Router } from "express";

import {
    // Authentication
    userLogin,
    userRegister,
    userLogout,
    userVerification,
    checkUser,
    directLogin,

    // Account management
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

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

/*
| Login
*/
router
    .route("/login")
    .post(
        upload.none(),
        userLogin
    );

/*
| Direct Login
*/
router
    .route("/direct-login")
    .post(
        upload.none(),
        directLogin
    );

/*
| Register
*/
router
    .route("/register")
    .post(
        upload.none(),
        userRegister
    );

/*
| Verify Email OTP
*/
router
    .route("/verify")
    .post(
        upload.none(),
        userVerification
    );

/*
| Logout
*/
router
    .route("/logout")
    .get(
        verifyToken,
        tokensVerification,
        userLogout
    );

/*
| Check Authenticated User
*/
router
    .route("/check-user-auth")
    .get(
        verifyToken,
        tokensVerification,
        checkUser
    );

/*
|--------------------------------------------------------------------------
| Account / Admin Management Routes
|--------------------------------------------------------------------------
|
| Both Admin and Superadmin are allowed.
|
| Middleware:
|   verifyToken
|       ↓
|   tokensVerification
|       ↓
|   requireAdmin
|       ↓
|   controller
|
|--------------------------------------------------------------------------
*/

/*
| Current Account
|
| GET /api/v1/account/me
*/
router
    .route("/account/me")
    .get(
        verifyToken,
        tokensVerification,
        requireAdmin,
        upload.none(),
        getCurrentAccount
    );

/*
| Current Administrators
|
| GET /api/v1/account/users
|
| Admin:
|   - sees approved admins
|   - does NOT see Superadmin
|
| Superadmin:
|   - sees Superadmin
|   - sees approved admins
*/
router
    .route("/account/users")
    .get(
        verifyToken,
        tokensVerification,
        requireAdmin,
        upload.none(),
        getAccountUsers
    );

/*
| Account Statistics
|
| GET /api/v1/account/stats
*/
router
    .route("/account/stats")
    .get(
        verifyToken,
        tokensVerification,
        requireAdmin,
        upload.none(),
        getAccountStats
    );

/*
| Pending Approval Requests
|
| GET /api/v1/account/approval/pending
|
| Both Admin and Superadmin can see requests.
*/
router
    .route("/account/approval/pending")
    .get(
        verifyToken,
        tokensVerification,
        requireAdmin,
        upload.none(),
        getPendingRequests
    );

/*
| Approve Admin
|
| PATCH /api/v1/account/approval/:id/approve
|
| Both Admin and Superadmin can approve.
*/
router
    .route("/account/approval/:id/approve")
    .patch(
        verifyToken,
        tokensVerification,
        requireAdmin,
        upload.none(),
        approveAdminRequest
    );

/*
| Reject Admin
|
| PATCH /api/v1/account/approval/:id/reject
|
| Both Admin and Superadmin can reject.
*/
router
    .route("/account/approval/:id/reject")
    .patch(
        verifyToken,
        tokensVerification,
        requireAdmin,
        upload.none(),
        rejectAdminRequest
    );

/*
| Delete Admin
|
| DELETE /api/v1/account/users/:id
|
| Both Admin and Superadmin can delete Admins.
|
| Superadmin cannot be deleted.
| Current user cannot delete themselves.
*/
router.route("/account/users/:id").delete(verifyToken,tokensVerification,requireAdmin,upload.none(),deleteAdmin);

export default router;