import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";

const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const verifyToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    console.log("call verify token")
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            req.userInfo = decoded;
            req.validAccessToken = true;
            return next();
        } catch (error) {
            if (error.name !== "TokenExpiredError") {
                console.error("Invalid Access Token:", error.message);
            }
        }
    }
    if (!refreshToken) {
        return next(new apiError("Unauthenticated user", 401, null, "UNAUTHENTICATED"));
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            return next(new apiError("User not found", 404));
        }
        if (user.refreshToken !== refreshToken) {
            return next(new apiError("Invalid Refresh Token", 401));
        }

        req.userInfo = user;
        req.validAccessToken = false;
        return next();
    } catch (error) {
        await User.updateOne(
            { refreshToken },
            { $set: { refreshToken: null } }
        );
        res.clearCookie("accessToken", cookieOption);
        res.clearCookie("refreshToken", cookieOption);
        const code = error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
        return next(new apiError("Session expired, please login again",401, error, code));
    }
}; 

export default verifyToken; 