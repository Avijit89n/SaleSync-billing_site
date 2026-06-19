import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import apiError from '../utils/apiError.js'
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    avatar: {
        type: String
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
    refreshToken: {
        type: String,
    },
    rateLimit: {
        type: Number,
        default: 0
    },
    varifyChecker: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        expires: 0
    }
}, { timestamps: true })

userSchema.pre("save", async function () {
    try {
        if (!this.isModified("password")) return next();

        this.password = await bcrypt.hash(this.password, 10);
        console.log('Successfully hashed your password');
    } catch (error) {
        new apiError("Password Hashing failed", 500, error);
    }
});

userSchema.methods.generateVerificationToken = () => {
  try {
    const token = crypto.randomBytes(32).toString("hex") // plain token
  
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")
  
    return { token, hashedToken }       
  } catch (error) {
    throw new apiError("Failed to generate email verification token", 500, error);
  }
}

userSchema.methods.compareVerificationToken = async function (token) {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")
        return this.verificationToken === hashedToken;
    } catch (error) {
        throw new apiError("Failed to compare verification token", 500, error);
    }
}

userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new apiError("Failed to compare password", 500, error);
    }
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            isVerified: this.isVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            varifyChecker: this.varifyChecker,
            rateLimit: this.rateLimit
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);