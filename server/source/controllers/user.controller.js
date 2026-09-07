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

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/

const userRegister = async (req, res) => {
  const { email, password, fullName } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new apiError("Email already exists", 409);
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

/*
|--------------------------------------------------------------------------
| Verify Email OTP
|--------------------------------------------------------------------------
*/

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
  user.approvalStatus = "pending";

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new apiResponse("Email verified successfully. Your account is waiting for approval.", 200, {
      user: sanitizeUser(user),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Normal Login
|--------------------------------------------------------------------------
*/

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
    throw new apiError("Please verify your email before logging in", 401);
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

/*
|--------------------------------------------------------------------------
| Direct Login
|--------------------------------------------------------------------------
*/

const directLogin = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError("User not found. Please register first", 404);
  }

  if (!user.isVerified) {
    throw new apiError("Please verify your email before logging in", 401);
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

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Check Authenticated User
|--------------------------------------------------------------------------
*/

const checkUser = async (req, res) => {
  return res.status(200).json(
    new apiResponse("User found", 200, {
      user: sanitizeUser(req.userInfo),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Get Current Account
|--------------------------------------------------------------------------
*/

const getCurrentAccount = async (req, res) => {
  const userID = req.userInfo._id;
  const user = await User.findById(userID);

  if (!user) {
    throw new apiError("User not found", 404);
  }

  return res.status(200).json(
    new apiResponse("Account details fetched successfully", 200, {
      user: sanitizeUser(user),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Get Account Users
|--------------------------------------------------------------------------
*/

const getAccountUsers = async (req, res) => {
  const currentUser = req.userInfo;
  let users;

  if (currentUser.role === "superadmin") {
    users = await User.find({
      $or: [
        { role: "superadmin" },
        { role: "admin", approvalStatus: "approved" },
      ],
    }).sort({ createdAt: 1 });
  } else {
    users = await User.find({
      role: "admin",
      approvalStatus: "approved",
    }).sort({ createdAt: 1 });
  }

  return res.status(200).json(
    new apiResponse("Account users fetched successfully", 200, {
      users: users.map(sanitizeUser),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Get Pending Approval Requests
|--------------------------------------------------------------------------
*/

const getPendingRequests = async (req, res) => {
  const pendingUsers = await User.find({
    role: "admin",
    isVerified: true,
    approvalStatus: "pending",
  }).sort({ createdAt: 1 });

  return res.status(200).json(
    new apiResponse("Pending approval requests fetched successfully", 200, {
      users: pendingUsers.map(sanitizeUser),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Approve Admin Request
|--------------------------------------------------------------------------
*/

const approveAdminRequest = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new apiError("User not found", 404);
  }

  if (user.role === "superadmin") {
    throw new apiError("The Superadmin account cannot be modified", 403);
  }

  if (user.role !== "admin") {
    throw new apiError("Only admin accounts can be approved", 400);
  }

  if (!user.isVerified) {
    throw new apiError("User must verify their email before approval", 400);
  }

  if (user.approvalStatus === "approved") {
    throw new apiError("This account is already approved", 400);
  }

  if (user.approvalStatus === "rejected") {
    throw new apiError("This account request has already been rejected", 400);
  }

  user.approvalStatus = "approved";
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new apiResponse("Admin account approved successfully", 200, {
      user: sanitizeUser(user),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Reject Admin Request
|--------------------------------------------------------------------------
*/

const rejectAdminRequest = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new apiError("User not found", 404);
  }

  if (user.role === "superadmin") {
    throw new apiError("The Superadmin account cannot be modified", 403);
  }

  if (user.role !== "admin") {
    throw new apiError("Only admin accounts can be rejected", 400);
  }

  if (!user.isVerified) {
    throw new apiError("This user has not verified their email yet", 400);
  }

  if (user.approvalStatus === "rejected") {
    throw new apiError("This account request is already rejected", 400);
  }

  if (user.approvalStatus === "approved") {
    throw new apiError("An approved admin cannot be rejected from the approval queue", 400);
  }

  user.approvalStatus = "rejected";
  user.refreshToken = null;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new apiResponse("Admin account request rejected successfully", 200, {
      user: sanitizeUser(user),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Delete Admin
|--------------------------------------------------------------------------
*/

const deleteAdmin = async (req, res) => {
  const currentUserID = String(req.userInfo._id);
  const { id } = req.params;

  if (currentUserID === String(id)) {
    throw new apiError("You cannot delete your own account", 403);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new apiError("User not found", 404);
  }

  if (user.role === "superadmin") {
    throw new apiError("The Superadmin account cannot be deleted", 403);
  }

  if (user.role !== "admin") {
    throw new apiError("Only admin accounts can be deleted", 400);
  }

  await User.deleteOne({ _id: user._id });

  return res.status(200).json(
    new apiResponse("Admin account deleted successfully", 200, {
      user: sanitizeUser(user),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Account Statistics
|--------------------------------------------------------------------------
*/

const getAccountStats = async (req, res) => {
  const currentUser = req.userInfo;

  const approvedAdmins = await User.countDocuments({
    role: "admin",
    approvalStatus: "approved",
  });

  const pendingAdmins = await User.countDocuments({
    role: "admin",
    isVerified: true,
    approvalStatus: "pending",
  });

  const rejectedAdmins = await User.countDocuments({
    role: "admin",
    approvalStatus: "rejected",
  });

  let totalUsers = approvedAdmins;

  if (currentUser.role === "superadmin") {
    const superadminCount = await User.countDocuments({ role: "superadmin" });
    totalUsers += superadminCount;
  }

  return res.status(200).json(
    new apiResponse("Account statistics fetched successfully", 200, {
      stats: {
        totalUsers,
        totalAdmins: approvedAdmins,
        pendingRequests: pendingAdmins,
        rejectedAdmins,
      },
    })
  );
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
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
};