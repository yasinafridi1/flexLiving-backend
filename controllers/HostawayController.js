import HostawayModel from "../models/HostawayModel.js";
import UserModel from "../models/UserModel.js";
import instance, { getHostAwayToken } from "../services/axiosInstance.js";
import { userDTO } from "../services/Dtos.js";
import { storeTokenInDB } from "../services/HostawayService.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";

export const addUpdateHostawayKeys = AsyncWrapper(async (req, res, next) => {
  const { clientId, clientSecret } = req.body;

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  // Update the user's Hostaway keys and return the updated document
  const hostAway = await HostawayModel.findOneAndUpdate(
    { userId: req.user._id },
    { clientId, clientSecret, token: null },
    { upsert: true, new: true }
  );

  // Convert to DTO
  const userData = userDTO(user, hostAway);

  return SuccessMessage(res, "Hostaway keys updated successfully", {
    userData,
  });
});

export const connectHostaway = AsyncWrapper(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const hostAway = await HostawayModel.findOne({ userId: req.user._id });
  if (!hostAway) {
    return next(new ErrorHandler("Hostaway credentials not found", 404));
  }

  const response = await getHostAwayToken(
    hostAway?.clientId,
    hostAway?.clientSecret
  );

  const result = await storeTokenInDB(user._id, response);
  const userData = userDTO(user, result);
  return SuccessMessage(res, "Hostaway connected successfully", { userData });
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
