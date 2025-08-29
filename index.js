import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import envVariables from "./config/Constants.js";
import ErrorMiddleware from "./middlewares/Error.js";
import mongoose from "mongoose";
import { makeRequiredDirectories } from "./utils/fileHandler.js";

const app = express();

const { appPort, dbUrl } = envVariables;

makeRequiredDirectories();

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

const allowedUrls = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://flexliving-frontend-pndw.vercel.app",
  "https://flexliving-landing.vercel.app",
  "https://flexliving-frontend-mu.vercel.app",
];

const corsOption = {
  origin: allowedUrls,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOption));
app.use(express.json());

app.use("/v1", router);
app.use(ErrorMiddleware);
app.listen(appPort, async () => {
  console.log(`Listening to port ${appPort}`);
});
