import express from "express";
import AuthRoutes from "./AuthRoutes.js";
import HostawayRoutes from "./HostawayRoutes.js";
import ReviewRoutes from "./ReviewRoutes.js";
import DashboardRoutes from "./DashboardRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Health check endpoint to check server status
router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Server is up and running" });
});

router.use("/auth", AuthRoutes);
router.use("/hostaway", HostawayRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/dashboard", DashboardRoutes);

router.get(
  "/file/:fileName",
  AsyncWrapper(async (req, res, next) => {
    const { fileName } = req.params;
    if (!fileName) {
      return next(new ErrorHandler("File name is required", 400));
    }
    const filePath = path.join(__dirname, `../uploads/${fileName}`);
    console.log(filePath);
    if (!existsSync(filePath)) {
      console.log("File not found");
      return;
    }
    res.sendFile(filePath);
  })
);

export default router;
