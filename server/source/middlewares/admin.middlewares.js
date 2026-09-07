import apiError from "../utils/apiError.js";

/*
|--------------------------------------------------------------------------
| Require Admin
|--------------------------------------------------------------------------
|
| Allows:
|   - Admin
|   - Superadmin
|
| Blocks:
|   - Unauthenticated users
|   - Any other role
|
*/

const requireAdmin = (req, res, next) => {
    const user = req.userInfo;

    if (!user) {
        throw new apiError("Authentication required", 401);
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
        throw new apiError("You do not have permission to perform this action", 403);
    }
    next();
};

export { requireAdmin };