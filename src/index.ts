import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import dotenv from "dotenv";

import routers from "./routers/index";

dotenv.config();

const app = express();
app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(mongoSanitize());

// Create server
const port = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Connect to mongodb
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("error", (error: Error) => {
  console.log("Mongodb failed to connect!!!");
  console.log(error);
});

// Handle routes
app.use("/api/v1", routers());
