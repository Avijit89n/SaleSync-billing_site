import mongoose from "mongoose";
import bcrypt from "bcrypt";
import apiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["superadmin", "admin"],
            default: "admin",
        },
        refreshToken: {
            type: String,
            default: null,
        },
        rateLimit: {
            type: Number,
            default: 0,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationOTP: {
            type: String,
            default: null,
        },
        verificationOTPExpiry: {
            type: Date,
            default: null,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        registrationExpiry: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
            index: {
                expireAfterSeconds: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    try {
        if (!this.isModified("password")) {
            return;
        }

        this.password = await bcrypt.hash(this.password, 10);
        console.log("Successfully hashed your password");
    } catch (error) {
        throw new apiError(
            "Password Hashing failed",
            500,
            error
        );
    }
});

userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(
            password,
            this.password
        );
    } catch (error) {
        throw new apiError(
            "Failed to compare password",
            500,
            error
        );
    }
};

userSchema.methods.compareVerificationOTP = function (otp) {
    try {
        return this.verificationOTP === otp;
    } catch (error) {
        throw new apiError(
            "Failed to compare verification OTP",
            500,
            error
        );
    }
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
            isVerified: this.isVerified,
            approvalStatus: this.approvalStatus,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            rateLimit: this.rateLimit,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
