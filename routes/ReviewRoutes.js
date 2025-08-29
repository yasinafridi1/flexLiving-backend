import express from "express";
import auth from "../middlewares/Auth.js";
import {
  getAllReviews,
  getApprovedReview,
  getReviewDetail,
  updateReview,
} from "../controllers/ReviewController.js";

const router = express.Router();

router.route("/").get(auth, getAllReviews);
router.route("/approved").get(getApprovedReview);
router.route("/:id").get(auth, getReviewDetail).patch(auth, updateReview);

export default router;
