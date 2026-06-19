import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken'
import apiError from "./apiError.js";

export const generateToken = async (userID) => {
    const user = await User.findById(userID)
    if (!user) {
        throw new apiError("User not found", 404)
    }
    try {
        const accessToken = jwt.sign(
            {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
            }
        )
        const refreshToken = jwt.sign(
            {
                _id: user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
            }
        )
        console.log("Token generated")
        user.refreshToken = refreshToken;
        user.save();
        console.log("Refresh token saved")
        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError("Error generating token", 500)
    }
}