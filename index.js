import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import dbConnection from "./config/dbConnect.js";
import envVariables from "./config/Constants.js";
import ErrorMiddleware from "./middlewares/Error.js";

const app = express();

const { appPort } = envVariables;

const allowedUrls = ["http://localhost:5173"];

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
