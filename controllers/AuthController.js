import envVariables, { USER_ROLES } from "../config/Constants.js";
import HostawayTokenModel from "../models/HostawayTokenModel.js";
import UserModel from "../models/UserModel.js";
import { getHostAwayToken } from "../services/axiosInstance.js";
import { userDTO } from "../services/Dtos.js";
import { storeTokenInDB } from "../services/HostawayService.js";
import {
  generateTokens,
  storeTokens,
  verifyRefreshToken,
} from "../services/JwtService.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import bcrypt from "bcrypt";

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 422));
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    const unlockTime = user.lockUntil.toLocaleString();
    return next(
      new ErrorHandler(`Account is locked. Try again after: ${unlockTime}`, 400)
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.passwordRetries += 1;

    // Lock account if tries reach 5
    if (user.passwordRetries >= envVariables.maxPasswordAttempts) {
      user.lockUntil = new Date(Date.now() + 10 * 60 * 60 * 1000);
    }

    user.save();
    return next(new ErrorHandler("Incorrect email or password", 422));
  }

  user.passwordRetries = 0;
  user.lockUntil = null;
  await user.save();

  const { accessToken, refreshToken } = generateTokens({
    _id: user._id,
    role: user.role,
  });

  await storeTokens(accessToken, refreshToken, user._id);
  const hostAwayConnection = await HostawayTokenModel.findOne({
    userId: user._id,
  });
  const userData = userDTO(user, hostAwayConnection);
  return SuccessMessage(res, "Logged in successfully", {
    userData,
    accessToken,
    refreshToken,
  });
});

export const register = AsyncWrapper(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 409));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in MongoDB
  const user = new UserModel({
    fullName,
    email,
    password: hashedPassword,
  });

  await user.save();

  if (!user) {
    return next(new ErrorHandler("Failed to register user", 500));
  }

  return SuccessMessage(res, "Account created successfully");
});

// export const logout = AsyncWrapper(async (req, res, next) => {
//   const userId = req.user.userId;

//   // Find user by _id
//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   // Clear tokens
//   user.accessToken = "";
//   user.refreshToken = "";
//   await user.save();

//   return SuccessMessage(res, "User logout successfully", null, 200);
// });

export const autoLogin = AsyncWrapper(async (req, res, next) => {
  const { refreshToken: refreshTokenFromBody } = req.body;
  const user = await verifyRefreshToken(refreshTokenFromBody);
  const { accessToken, refreshToken } = generateTokens({
    _id: user._id,
    role: user.role,
  });
  await storeTokens(accessToken, refreshToken, user._id);
  const hostAwayConnection = await HostawayTokenModel.findOne({
    userId: user._id,
  });
  const userData = userDTO(user, hostAwayConnection);
  return SuccessMessage(res, "Session refresh successfully", {
    userData,
    accessToken,
    refreshToken,
  });
});

export const addUpdateHostawayKeys = AsyncWrapper(async (req, res, next) => {
  const { clientId, clientSecret } = req.body;

  // Update the user's Hostaway keys and return the updated document
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    { clientId, clientSecret },
    { new: true } // return the updated document
  );

  // Convert to DTO
  const userData = userDTO(updatedUser);

  return SuccessMessage(res, "Hostaway keys updated successfully", {
    userData,
  });
});

export const connectHostaway = AsyncWrapper(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (!user.clientId || !user.clientSecret) {
    return next(new ErrorHandler("Hostaway credentials are missing", 400));
  }

  const response = await getHostAwayToken(user.clientId, user.clientSecret);
  // save in db
  // await storeTokenInDB(user._id, response);
  return SuccessMessage(res, "Hostaway connected successfully", { response });
});

export const revokeHostawayToken = AsyncWrapper(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Call the API to revoke the token
  const response = await instance.post("/revokeToken", {
    userId: user._id,
  });

  //check and delete the data from mongodb
  // await HostawayTokenModel.deleteOne({ userId: user._id });

  console.log("Token revoked:", response.data);
  return SuccessMessage(res, "Hostaway token revoked successfully");
});
