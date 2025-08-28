import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    clientId: {
      type: Number,
      required: false,
    },
    clientSecret: {
      type: String,
      required: false,
    },
    dataStatus: {
      type: String,
      enum: ["not_started", "pending", "completed"],
      default: "not_started",
    },
  },
  { timestamps: true }
);

const HostawayModel = mongoose.model("Hostaway", tokenSchema);

export default HostawayModel;
