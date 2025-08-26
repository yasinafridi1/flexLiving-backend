import mongoose from "mongoose";
import { USER_ROLES } from "../config/Constants";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
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
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.manager,
    },
    passwordRetries: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    accesstoken: {
      type: String,
      required: false,
    },
    refreshtoken: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
