import express from "express";
import validateBody from "../middlewares/Validator.js";
import {
  addUpdateHostawayApiKeysSchema,
  loginSchema,
  signupSchema,
} from "../validations/index.js";
import {
  addUpdateHostawayKeys,
  autoLogin,
  connectHostaway,
  login,
  logout,
  register,
  revokeHostawayToken,
} from "../controllers/AuthController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(signupSchema), register);
// router.get("/logout", auth, logout);
router.post("/auto_login", autoLogin);
router.post(
  "/add_update_hostaway_keys",
  [auth, validateBody(addUpdateHostawayApiKeysSchema)],
  addUpdateHostawayKeys
);
router.post("/connect_hostaway", [auth], connectHostaway);
router.delete("/disconnect_hostaway", [auth], revokeHostawayToken);

export default router;
