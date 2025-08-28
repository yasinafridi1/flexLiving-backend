import express from "express";
import validateBody from "../middlewares/Validator.js";
import { addUpdateHostawayApiKeysSchema } from "../validations/index.js";
import {
  addUpdateHostawayKeys,
  connectHostaway,
  getAllReviewsFromHostaway,
  getDataSyncStatus,
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

router
  .route("/sync_status")
  .get(auth, getDataSyncStatus)
  .patch(auth, getAllReviewsFromHostaway);

export default router;
