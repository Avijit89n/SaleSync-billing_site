import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { generateToken } from "../utils/generateTokens.js";
import { sendEmail } from "../utils/sendEmail.js";

const cookieOption = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isVerified: user.isVerified,
    approvalStatus: user.approvalStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    rateLimit: user.rateLimit,
    avatar: user.avatar,
  };
};

const userRegister = async (req, res) => {
  const { email, password, fullName } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified && existingUser.approvalStatus === "approved") {
      throw new apiError("Email already exists and is approved", 409);
    }
    if (existingUser.isVerified && existingUser.approvalStatus === "pending") {
      throw new apiError("Email already exists and is pending approval", 409);
    }
    throw new apiError("Email already exists but is not verified. Please verify your email.", 409);
  }

  const otp = generateOTP();

  const user = await User.create({
    email,
    password,
    fullName,
    role: "admin",
    isVerified: false,
    approvalStatus: "pending",
    verificationOTP: otp,
    verificationOTPExpiry: new Date(Date.now() + 10 * 60 * 1000),
  });

  if (!user) {
    throw new apiError("Failed to register user.", 500);
  }

  try {
    await sendEmail(email, otp);
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw new apiError("Failed to send verification email", 500, error);
  }

  return res.status(201).json(
    new apiResponse("Verification code sent to your email", 201, {
      user: sanitizeUser(user),
    })
  );
};

const userVerification = async (req, res) => {
  const { token, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError("User not found. Please register first.", 404);
  }

  if (user.isVerified) {
    return res.status(200).json(
      new apiResponse("User already verified. Waiting for approval.", 200, {
        user: sanitizeUser(user),
      })
    );
  }

  if (!user.verificationOTPExpiry || new Date() > user.verificationOTPExpiry) {
    throw new apiError("Verification code has expired. Please request a new code.", 400);
  }

  const isValidOTP = user.compareVerificationOTP(token);

  if (!isValidOTP) {
    throw new apiError("Invalid verification code", 400);
  }

  user.isVerified = true;
  user.verificationOTP = null;
  user.verificationOTPExpiry = null;
  user.registrationExpiry = null;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new apiResponse("Email verified successfully. Your account is waiting for approval.", 200, {
      user: sanitizeUser(user),
    })
  );
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError("User not found. Please register first", 404);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new apiError("Invalid password. Please try again", 401);
  }

  if (!user.isVerified) {
    throw new apiError("Please verify your email before logging In", 401);
  }

  if (user.approvalStatus === "pending") {
    throw new apiError("Your account is waiting for admin approval", 403);
  }

  if (user.approvalStatus === "rejected") {
    throw new apiError("Your account request was rejected", 403);
  }

  const { accessToken, refreshToken } = await generateToken(user._id);
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption)
    .json(
      new apiResponse("User logged in successfully", 200, {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      })
    );
};

const userLogout = async (req, res) => {
  const userID = req.userInfo._id;

  const user = await User.findByIdAndUpdate(
    userID,
    { refreshToken: null },
    { new: true }
  );

  if (!user) {
    throw new apiError("User not found", 404);
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .json(new apiResponse("User logged out successfully", 200));
};

const checkUser = async (req, res) => {
  return res.status(200).json(
    new apiResponse("User found", 200, {
      user: sanitizeUser(req.userInfo),
    })
  );
};

const getAllPendingReq = async (req, res) => {
  try {
    const allPendingReq = await User.find({ approvalStatus: "pending" }).select("fullName email createdAt role isVerified");
    return res.status(200).json(
      new apiResponse(200, "Pending requests fetched successfully", allPendingReq)
    );
  } catch (error) {
    throw new apiError("Error fetching pending requests", 500, error)
  }
};

const approveReq = async (req, res) => {
  try {
    const { id, action } = req.body;

    if (!id || !action) {
      throw new apiError("User ID and action are required", 400);
    }

    if (!["Approve", "Reject"].includes(action)) {
      throw new apiError("Invalid action. Action must be Approve or Reject", 400);
    }

    const user = await User.findById(id);

    if (!user) {
      throw new apiError("User not found", 404);
    }

    if (user.approvalStatus !== "pending") {
      throw new apiError(`This request has already been ${user.approvalStatus}`, 400);
    }

    if (action === "Approve") {
      user.approvalStatus = "approved";
      user.registrationExpiry = null;
    }

    if (action === "Reject") {
      user.approvalStatus = "rejected";
      user.registrationExpiry = null;
    }

    await user.save();

    return res.status(200).json(
      new apiResponse(
        `Request ${action === "Approve" ? "approved" : "rejected"} successfully`,
        200,
        user
      )
    );
  } catch (error) {
    console.log("Approve/Reject Request Error:", error);

    if (error instanceof apiError) {
      throw new apiError(error.message, error.statusCode, null)
    }
    throw new apiError("Something went wrong while processing the request", 500)
  }
};

const getAllUser = async(req, res) => {
  try {
    const allUser = await User.find({approvalStatus: "approved"}).select("fullName email createdAt role isVerified")
    if(!allUser){
      throw new apiError("Failed to get the user Information", 500)
    }
    return res.status(200).json(
      new apiResponse("Users fetched successfully", 200, allUser)
    )
  } catch (error) {
    throw new apiError("Failed to get User Info", 500)
  }
}


export {
  userLogin,
  userRegister,
  userLogout,
  userVerification,
  checkUser,
  getAllPendingReq,
  approveReq,
  getAllUser
};
