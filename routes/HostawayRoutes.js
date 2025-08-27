import express from "express";
import validateBody from "../middlewares/Validator.js";
import { addUpdateHostawayApiKeysSchema } from "../validations/index.js";
import {
  addUpdateHostawayKeys,
  connectHostaway,
  revokeHostawayToken,
} from "../controllers/HostawayController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

router
  .route("/")
  .post(
    [auth, validateBody(addUpdateHostawayApiKeysSchema)],
    addUpdateHostawayKeys
  )
  .patch(auth, connectHostaway)
  .delete(auth, revokeHostawayToken);

export default router;
