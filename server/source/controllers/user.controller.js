import { User } from "../models/user.models.js"
import apiError from "../utils/apiError.js";
import apiResponse from '../utils/apiResponse.js'
import { generateToken } from "../utils/generateTokens.js";
import { sendEmail } from "../utils/sendEmail.js";

const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const userRegister = async (req, res) => {
    const { email, password, fullName } = req.body;
    const existingUser = await User.findOne({ email }).select('-password')
    if (existingUser) {
        throw new apiError("Email already exists", 409)
    }
    const user = await User.create({
        email,
        password,
        fullName,
        verificationTokenExpiry: new Date(Date.now() + 60 * 1000)
    })
    if (!user) {
        throw new apiError("Failed to register user.", 500)
    }
    try {
        const { token, hashedToken } = await user.generateVerificationToken();
        await sendEmail(email, token);
        user.verificationToken = hashedToken;
        await user.save({ validateBeforeSave: false });
    } catch (error) {
        await User.deleteOne({ _id: user._id })
        throw new apiError("Failed to send verification email", 500, error)
    }
    return res.status(201).json(
        new apiResponse("Varification code sent to your email", 201, {
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                varifyChecker: user.varifyChecker,
                rateLimit: user.rateLimit
            }
        })
    )
}

const userVerification = async (req, res) => {
    const { token, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new apiError("User not found. Please register first.", 404);
    }
    if (user.isVerified) {
        user.varifyChecker = true;
        await user.save({ validateBeforeSave: false });
        return res.status(200).json(
            new apiResponse("User already verified", 200, {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    varifyChecker: user.varifyChecker,
                    rateLimit: user.rateLimit
                }
            })
        )
    }
    const isVerified = await user.compareVerificationToken(token);
    if (!isVerified) {
        throw new apiError("Invalid verification token", 400);
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new apiResponse("User verified successfully", 200, {
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                varifyChecker: user.varifyChecker,
                rateLimit: user.rateLimit
            }
        })
    )
}

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
        throw new apiError("User not found. Please register first", 404)
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new apiError("Invalid password. Please try again", 401)
    }
    const { accessToken, refreshToken } = await generateToken(user._id)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new apiResponse("User logged in successfully", 200, {
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                varifyChecker: user.varifyChecker,
                rateLimit: user.rateLimit
            },
            accessToken,
            refreshToken
        })
        )
}

const userLogout = async (req, res) => {
    const userID = req.userInfo._id;
    const user = await User.findByIdAndUpdate(userID, { refreshToken: null }, { new: true });
    if (!user) {
        throw new apiError("User not found", 404);
    }
    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new apiResponse("User logged out successfully", 200));
}

const checkUser = async (req, res) => {
    const user = req.userInfo;
    return res.status(200).json(
        new apiResponse("User found", 200, {
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                varifyChecker: user.varifyChecker,
                rateLimit: user.rateLimit
            }
        })
    )
}

const directLogin = async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    if (!user) {
        throw new apiError("User not found. Please register first", 404);
    }
    if (!user.isVerified) {
        throw new apiError("User not verified", 401);
    }
    const { accessToken, refreshToken } = await generateToken(user._id)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new apiResponse("User logged in successfully", 200, {
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                varifyChecker: user.varifyChecker,
                rateLimit: user.rateLimit
            },
            accessToken,
            refreshToken
        })
        )

}

export {
    userLogin,
    userRegister,
    userLogout,
    userVerification,
    checkUser,
    directLogin
}