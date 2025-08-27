import axios from "axios";
import envVariables from "../config/Constants.js";
import { getTokenFromDB, storeTokenInDB } from "./HostawayService.js";
const { hostAwayBaseUrl } = envVariables;
import qs from "qs";

const instance = axios.create({
  baseURL: hostAwayBaseUrl,
  headers: {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
instance.interceptors.request.use(async (config) => {
  const { userId } = config; // pass userId in request config
  if (!userId) throw new Error("userId is required for Hostaway API");

  let token = await getTokenFromDB(userId);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: retry on 403
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { userId } = originalRequest;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Call your function to get a new token
      const newToken = await getHostAwayToken(userId);

      // Save new token in DB
      await storeTokenInDB(userId, newToken);

      // Retry original request with new token
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const getHostAwayToken = async (clientId, clientSecret) => {
  const body = qs.stringify({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "general",
  });
  try {
    const response = await axios.post(`${hostAwayBaseUrl}/accessTokens`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response?.data?.access_token;
  } catch (error) {
    console.error(
      "Error fetching Hostaway token:",
      error.response?.data || error.message
    );
    throw new Error(
      error?.response?.data ||
        error?.message ||
        "Failed to fetch Hostaway token"
    );
  }
};

export default instance;
