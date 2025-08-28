import express from "express";
import validateBody from "../middlewares/Validator.js";
import {
  loginSchema,
  signupSchema,
  updateUserSchema,
} from "../validations/index.js";
import {
  autoLogin,
  login,
  logout,
  register,
  updateUser,
} from "../controllers/AuthController.js";
import auth from "../middlewares/Auth.js";
import { upload } from "../services/multerService.js";

const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(signupSchema), register);
router.get("/logout", auth, logout);
router.post("/auto_login", autoLogin);
router.patch(
  "/",
  [auth, upload.single("file"), validateBody(updateUserSchema)],
  updateUser
);

export default router;
