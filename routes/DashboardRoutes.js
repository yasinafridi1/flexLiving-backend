import express from "express";
import auth from "../middlewares/Auth.js";
import { dashboardAnalytics } from "../controllers/DashboardController.js";

const router = express.Router();

router.route("/").get(auth, dashboardAnalytics);

export default router;
