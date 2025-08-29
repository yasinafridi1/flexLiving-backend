import ReviewModel from "../models/ReviewModel.js";
import { reviewDto } from "../services/Dtos.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";

export const getAllReviews = AsyncWrapper(async (req, res, next) => {
  let {
    page = 1,
    limit = 10,
    search,
    channel,
    approved,
    minRating,
    maxRating,
  } = req.query;
  const userId = req.user._id;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const skip = (page - 1) * limit;

  const query = { userId };
  if (search) {
    query.$or = [
      { guestName: { $regex: search, $options: "i" } },
      { listingName: { $regex: search, $options: "i" } },
    ];
  }

  if (channel) {
    if (!Array.isArray(channel)) {
      // if it's a single value, convert to array
      channel = [channel];
    }
    query.channel = { $in: channel };
  }

  if (minRating !== undefined || maxRating !== undefined) {
    const ratingFilter = {};

    if (minRating !== undefined) {
      ratingFilter.$gte = parseFloat(minRating);
    }

    if (maxRating !== undefined) {
      ratingFilter.$lte = parseFloat(maxRating);
    }

    query.rating = ratingFilter;
  }

  if (approved !== undefined) {
    query.approved = approved === "true"; // query params are strings
  }

  const totalRecords = await ReviewModel.countDocuments(query);

  const reviews = await ReviewModel.find(query)
    .sort({ submittedAt: -1 }) // newest first
    .skip(skip)
    .limit(limit);

  const reviewData = reviews?.map((item) => reviewDto(item));

  return SuccessMessage(res, "Reviews fetched successfully", {
    reviewData,
    pagination: {
      totalRecords,
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
    },
  });
});

export const updateReview = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params; // review id from URL

  const review = await ReviewModel.findOne({ _id: id, userId: req.user._id });
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  const updatedReview = await ReviewModel.findByIdAndUpdate(
    review._id,
    { $set: { approved: !review.approved } },
    { new: true } // return the updated document
  );
  const reviewData = reviewDto(updatedReview);
  return SuccessMessage(res, "Review updated successfully", { reviewData });
});

export const getApprovedReview = AsyncWrapper(async (req, res, next) => {
  const reviews = await ReviewModel.find({ approved: true })
    .sort({ submittedAt: -1 }) // newest first
    .select("comment guestName submittedAt approved rating channel");

  return SuccessMessage(res, "Approved reviews fetched successfully", {
    reviews,
  });
});

export const getReviewDetail = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const review = await ReviewModel.findOne({ _id: id, userId: req.user._id });
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  return SuccessMessage(res, "Review detail fetched successfully", { review });
});
