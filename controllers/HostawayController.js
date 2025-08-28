import HostawayModel from "../models/HostawayModel.js";
import ReviewModel from "../models/ReviewModel.js";
import UserModel from "../models/UserModel.js";
import instance, {
  deleteToken,
  getHostAwayToken,
} from "../services/axiosInstance.js";
import { userDTO } from "../services/Dtos.js";
import { getAllReviews, storeTokenInDB } from "../services/HostawayService.js";
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

  const response = await getHostAwayToken(req.user._id);

  const result = await storeTokenInDB(user._id, response);
  const userData = userDTO(user, result);
  return SuccessMessage(res, "Hostaway connected successfully", { userData });
});

export const revokeHostawayToken = AsyncWrapper(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  let hostaway = await HostawayModel.findOne({ userId: req.user._id });
  if (!hostaway || !hostaway.token) {
    return next(new ErrorHandler("Hostaway credentials not found", 404));
  }

  try {
    await deleteToken(hostaway.token);
  } catch (error) {
    console.error("Failed to delete from Hostaway API:", error.message);
  } finally {
    // Always update DB to clear the token field
    hostaway = await HostawayModel.findOneAndUpdate(
      { userId: user._id },
      { $set: { token: null } },
      { new: true } // return updated doc
    );
  }

  const userData = userDTO(user, hostaway);
  return SuccessMessage(res, "Hostaway token revoked successfully", {
    userData,
  });
});

export const getAllReviewsFromHostaway = AsyncWrapper(
  async (req, res, next) => {
    const hostaway = await HostawayModel.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { dataStatus: "pending" } }
    );
    if (!hostaway || !hostaway.token) {
      return next(new ErrorHandler("Hostaway not connected", 400));
    }

    await ReviewModel.deleteMany({ userId: req.user._id });
    setImmediate(() => {
      getAllReviews(req.user._id)
        .then(() => {
          console.log("Reviews fetched successfully");
        })
        .catch((err) => {
          console.error(
            "Error fetching reviews:",
            err?.response?.data || err?.message || "Unknown error"
          );
        });
    });
    return SuccessMessage(res, "Data will be synced in the background.");
  }
);

export const getDataSyncStatus = AsyncWrapper(async (req, res, next) => {
  const reviewSyncStatus = await HostawayModel.findOne({
    userId: req.user._id,
  }).select("dataStatus");

  if (!reviewSyncStatus) {
    return next(new ErrorHandler("Hostaway connection not found", 404));
  }

  return SuccessMessage(res, "Status fetched successfully", {
    reviewSyncStatus,
  });
});
