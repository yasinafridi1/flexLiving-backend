import HostawayTokenModel from "../models/HostawayTokenModel";
import { getCache, setCache } from "../utils/cacheUtil";
import instance from "./axiosInstance";

export const getTokenFromDB = async (userId) => {
  let token = getCache(`HostawayToken_${userId}`);
  if (!token) {
    const data = await HostawayTokenModel.findOne({ userId });
    if (!data) return null;
    setCache(`HostawayToken_${userId}`, data.token);
    token = data.token;
  }
  return token;
};

export const storeTokenInDB = async (userId, token) => {
  await HostawayTokenModel.findOneAndUpdate(
    { userId },
    { token },
    { upsert: true }
  );
};

export const getAllReviews = async (userId) => {
  const response = await instance.get("/reviews", { userId });
  console.log("Reviews:", response.data);
};
