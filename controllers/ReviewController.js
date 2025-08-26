import UserModel from "../models/UserModel.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";

export const getAllReviewsFromHostaway = AsyncWrapper(
  async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    return SuccessMessage(res, "Reviews fetched successfully", { reviews });
  }
);
