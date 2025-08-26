import HostawayModel from "../models/HostawayModel.js";
import { getCache, setCache } from "../utils/cacheUtil.js";
import instance from "./axiosInstance.js";

export const getTokenFromDB = async (userId) => {
  let token = getCache(`HostawayToken_${userId}`);
  if (!token) {
    const data = await HostawayModel.findOne({ userId });
    if (!data) return null;
    setCache(`HostawayToken_${userId}`, data.token);
    token = data.token;
  }
  return token;
};

export const storeTokenInDB = async (userId, token) => {
  await HostawayModel.findOneAndUpdate({ userId }, { token }, { upsert: true });
};

export const getAllReviews = async (userId) => {
  const response = await instance.get("/reviews", { userId });
  console.log("Reviews:", response.data);
};
