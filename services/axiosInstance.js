import axios from "axios";
import envVariables from "../config/Constants.js";
import { getTokenFromDB, storeTokenInDB } from "./HostawayService.js";
const { hostAwayBaseUrl } = envVariables;
import qs from "qs";
import HostawayModel from "../models/HostawayModel.js";

const instance = axios.create({
  baseURL: hostAwayBaseUrl,
  headers: {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach bearer token
instance.interceptors.request.use(async (config) => {
  if (config._retryWithNewToken) return config; // skip for retried requests

  const { userId } = config.meta || {};
  if (!userId) throw new Error("userId is required for Hostaway API");

  let token = await getTokenFromDB(userId);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { userId } = originalRequest.meta || {};

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await getHostAwayToken(userId);
      await storeTokenInDB(userId, newToken);

      return instance({
        ...originalRequest,
        headers: {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        },
        _retryWithNewToken: true,
      });
    }

    return Promise.reject(error);
  }
);

export const getHostAwayToken = async (userId) => {
  const hostAway = await HostawayModel.findOne({ userId });
  const body = qs.stringify({
    grant_type: "client_credentials",
    client_id: hostAway.clientId,
    client_secret: hostAway.clientSecret,
    scope: "general",
  });

  console.log(
    "Calling Hostaway API to get access token",
    hostAway.clientSecret
  );

  try {
    const response = await axios.post(`${hostAwayBaseUrl}/accessTokens`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response?.data?.access_token;
  } catch (error) {
    const err = {
      message:
        error?.response?.data?.message ||
        "Something went wrong while connecting hostaway",
      statusCode: error?.response?.status || 404,
    };
    throw err;
  }
};

export const deleteToken = async (token) => {
  try {
    const response = await axios.delete(
      `${hostAwayBaseUrl}/accessTokens?token=${token}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Error deleting Hostaway token:",
      error.response?.data || error.message
    );
    throw new Error(
      error?.response?.data ||
        error?.message ||
        "Failed to delete Hostaway token"
    );
  }
};

export default instance;
