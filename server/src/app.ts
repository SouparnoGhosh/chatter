import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import cors from "cors";
import http from "http";
import channelRouter from "./routes/channel";
import searchRouter from "./routes/search";
import socketServer from "./socketServer";
import messageRouter from "./routes/message";
import fileRouter from "./routes/file";

const app = express();

/* Enable CORS for Websockets */
const httpServer = http.createServer(app);

/* Enable CORS for API */
app.use(cors({ origin: "http://localhost:5173" }));

/* Connect to MongoDB */
mongoose
  .connect("mongodb://localhost:27017/mydatabase")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

/* Middleware to parse JSON bodies */
app.use(express.json());

/* Initialize WebSocket server */
socketServer(app, httpServer);

/* Auth Routes */
app.use("/", authRouter);

/* Channel Routes */
app.use("/", channelRouter);

/* Search Routes */
app.use("/", searchRouter);

/* Message Routes */
app.use("/", messageRouter);

/* File Routes */
app.use("/", fileRouter);

/* Start the server */
const port = process.env.PORT || 3200;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Websocket server is running on port ${port}`);
});
