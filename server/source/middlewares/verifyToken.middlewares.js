import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";

const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", cookieOption);
    res.clearCookie("refreshToken", cookieOption);
};

const verifyToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log("call verify token");

    /*
     * 1. Check access token
     */
    if (accessToken) {
        try {
            const decoded = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );

            /*
             * IMPORTANT:
             * Do not trust the JWT alone.
             * Check that the user still exists in MongoDB.
             */
            const user = await User.findById(decoded._id).select("-password");

            if (!user) {
                clearAuthCookies(res);

                return next(
                    new apiError(
                        "User account no longer exists",
                        401,
                        null,
                        "USER_NOT_FOUND"
                    )
                );
            }

            /*
             * Keep the actual database user in req.userInfo.
             */
            req.userInfo = user;
            req.validAccessToken = true;

            return next();
        } catch (error) {
            if (error.name !== "TokenExpiredError") {
                console.error(
                    "Invalid Access Token:",
                    error.message
                );
            }
        }
    }

    /*
     * 2. Access token missing/expired.
     * Try refresh token.
     */
    if (!refreshToken) {
        clearAuthCookies(res);

        return next(
            new apiError(
                "Unauthenticated user",
                401,
                null,
                "UNAUTHENTICATED"
            )
        );
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        /*
         * Check database user.
         */
        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            clearAuthCookies(res);

            return next(
                new apiError(
                    "User account no longer exists",
                    401,
                    null,
                    "USER_NOT_FOUND"
                )
            );
        }

        /*
         * Make sure this refresh token is still the
         * currently stored refresh token.
         */
        if (user.refreshToken !== refreshToken) {
            clearAuthCookies(res);

            return next(
                new apiError(
                    "Invalid Refresh Token",
                    401,
                    null,
                    "INVALID_TOKEN"
                )
            );
        }

        req.userInfo = user;
        req.validAccessToken = false;

        return next();
    } catch (error) {
        await User.updateOne(
            { refreshToken },
            { $set: { refreshToken: null } }
        );

        clearAuthCookies(res);

        const code =
            error.name === "TokenExpiredError"
                ? "TOKEN_EXPIRED"
                : "INVALID_TOKEN";

        return next(
            new apiError(
                "Session expired, please login again",
                401,
                error,
                code
            )
        );
    }
};

export default verifyToken;