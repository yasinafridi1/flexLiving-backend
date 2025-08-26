import jwt from "jsonwebtoken";
import envVariables from "../config/Constants.js";
import UserModel from "../models/UserModel.js";

const { accessTokenSecret, refreshTokenSecret } = envVariables;

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "1d",
  });

  return { accessToken, refreshToken };
};

export const storeTokens = async (accessToken, refreshToken, userId) => {
  return await UserModel.updateOne(
    { _id: userId },
    { accessToken, refreshToken }
  );
};

export const verifyAccessToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, accessTokenSecret);
    const userData = await UserModel.findOne({
      _id: decodedToken._id,
      accessToken: token,
    });
    if (!userData) {
      const error = new Error("user_not_found");
      error.statusCode = 401; // Set custom status code for invalid token
      throw error;
    }

    return userData;
  } catch (error) {
    if (error?.message === "user_not_found") {
      error.message = "Invalide token";
    } else {
      error.message = "Token expired";
    }
    throw error;
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, refreshTokenSecret);
    const userData = await UserModel.findOne({
      _id: decodedToken._id,
      refreshToken: token,
    });
    if (!userData) {
      const error = new Error("user_not_found");
      error.statusCode = 401; // Set custom status code for invalid token
      throw error;
    }

    return userData;
  } catch (error) {
    if (error?.message === "user_not_found") {
      error.message = "Invalide token";
    } else {
      error.message = "Token expired";
    }
    throw error;
  }
};
