import HostawayModel from "../models/HostawayModel.js";
import { getCache, setCache } from "../utils/cacheUtil.js";
import { normalizeHostaway, seedReviews } from "../utils/normalizeData.js";
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
  return await HostawayModel.findOneAndUpdate(
    { userId },
    { token },
    { upsert: true, new: true }
  );
};

export const getAllReviews = async (userId) => {
  const response = await instance.get("/reviews", { meta: { userId } });
  console.log("Reviews:", response.data);
  if (response?.data?.count == 0 || response?.data?.result?.length == 0) {
    // fallback to mock data and store in db
    await seedReviews(userId);
    await HostawayModel.updateOne(
      { userId },
      { $set: { dataStatus: "completed" } }
    );
  } else {
    const rawData = response?.data?.result;
    const normalizedData = normalizeHostaway(rawData);
    await ReviewModel.insertMany(normalizedData);
    await HostawayModel.updateOne(
      { userId },
      { $set: { dataStatus: "completed" } }
    );
  }
};
