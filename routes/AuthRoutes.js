import express from "express";
import validateBody from "../middlewares/Validator.js";
import { loginSchema, signupSchema } from "../validations/index.js";
import {
  autoLogin,
  login,
  logout,
  register,
} from "../controllers/AuthController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(signupSchema), register);
router.get("/logout", auth, logout);
router.post("/auto_login", autoLogin);

export default router;
