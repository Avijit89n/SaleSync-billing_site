import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";
import { generateToken } from "../utils/generateTokens.js";

const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
}

const tokensVerification = async (req, res, next) => {
    try {
        const { validAccessToken, userInfo } = req;
        if (validAccessToken) {
            return next();
        }
        const { accessToken, refreshToken } = await generateToken(userInfo._id);
        userInfo.refreshToken = refreshToken;
        await userInfo.save({ validateBeforeSave: false });
        res
            .cookie("accessToken", accessToken, cookieOption)
            .cookie("refreshToken", refreshToken, cookieOption);
        req.cookies.accessToken = accessToken;
        req.cookies.refreshToken = refreshToken;
        return next();

    } catch (error) {
        return next(new apiError("Something went wrong while refreshing tokens", 500));
    }
}

export default tokensVerification;