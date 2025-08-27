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

  if (minRating || maxRating) {
    query.rating = {};
    if (minRating) query.rating.$gte = parseFloat(minRating);
    if (maxRating) query.rating.$lte = parseFloat(maxRating);
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

  // Toggle approved field
  review.approved = !review.approved;

  await review.save();

  const reviewData = reviewDto(review);
  return SuccessMessage(res, "Review updated successfully", { reviewData });
});

export const getApprovedReview = AsyncWrapper(async (req, res, next) => {
  let { page = 1, limit = 5 } = req.query;
  const userId = req.user._id;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const skip = (page - 1) * limit;

  const query = { userId, approved: true };

  const reviews = await ReviewModel.find(query)
    .sort({ submittedAt: -1 }) // newest first
    .skip(skip)
    .limit(limit)
    .select("comment categories guestName submittedAt source approved rating");

  const reviewData = reviews?.map((item) => reviewDto(item));

  return SuccessMessage(res, "Approved reviews fetched successfully", {
    reviewData,
    currentPage: page,
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
