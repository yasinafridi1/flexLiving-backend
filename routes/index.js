import express from "express";
import AuthRoutes from "./AuthRoutes.js";
import HostawayRoutes from "./HostawayRoutes.js";

const router = express.Router();

// Health check endpoint to check server status
router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Server is up and running" });
});

router.use("/auth", AuthRoutes);
router.use("/hostaway", HostawayRoutes);

export default router;
