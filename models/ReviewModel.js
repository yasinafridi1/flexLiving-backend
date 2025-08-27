import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // e.g., cleanliness, communication
    rating: { type: Number, default: null }, // normalized rating (0–5 scale)
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    hostawayId: { type: Number, required: true, unique: true }, // Hostaway review id
    type: {
      type: String,
    },
    status: { type: String, default: "awaiting" },
    rating: { type: Number, default: null }, // normalized rating (0–5)
    comment: { type: String, default: "" },
    categories: [categorySchema],

    listingId: { type: Number, required: false },
    listingName: { type: String, default: "Unknown Listing" },
    channel: { type: String, default: "unknown" },

    guestName: { type: String, default: "Anonymous" },
    submittedAt: { type: Date, default: Date.now },
    arrivalDate: { type: Date },
    departureDate: { type: Date },

    approved: { type: Boolean, default: false }, // manager approval flag
    source: { type: String, default: "hostaway" },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("Review", reviewSchema);
export default ReviewModel;
