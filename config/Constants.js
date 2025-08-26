import dotenv from "dotenv";
dotenv.config();
const envVariables = {
  appPort: process.env.PORT || 8000,
  dbUrl: process.env.DB_URL,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  maxPasswordAttempts: process.env.MAX_PASSWORD_ATTEMPTS || 5,
  hostAwayBaseUrl: process.env.HOSTAWAY_BASE_URL,
};

export const USER_ROLES = {
  manager: "MANAGER",
};

export const HOSTAWAY_CHANNEL_MAP = {
  2005: "airbnb",
  2006: "booking",
  2007: "vrbo",
  2008: "direct",
};

export default envVariables;
