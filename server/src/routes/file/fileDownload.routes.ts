import express from "express";
import File from "../../models/File.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestHandlerWithUser, RequestWithUser } from "../../types/Types";
import mongoose from "mongoose";
import path from "path";
import { Document } from "mongoose";

interface IChannel extends Document {
  name: string;
  users: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  administrators: mongoose.Types.ObjectId[];
}

/**
 * GET /files/:fileId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a file ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the file ID is valid, the user is authenticated, and the user is a member of the channel where the file was posted,
 * the file will be streamed from the server to the client.
 *
 * If there's an error (for example, the file ID is not valid, the user is not authenticated, the file does not exist,
 * the message associated with the file does not exist, the user is not a member of the channel, or there's a server error),
 * an error message will be sent in the response.
 *
 * Response:
 * The file will be sent as a download to the client.
 *
 * If the file is downloaded successfully, the file will be sent as a download to the client.
 * If there's an error, the response will be a JSON object with an error message.
 */

const fileDownloadRouter = express.Router();

const downloadFile: RequestHandlerWithUser = async (req, res) => {
  const requestWithUser = req as RequestWithUser;
  try {
    /* Downloading file... */
    console.log("[/download-file GET] Downloading file...");

    /* Check if fileId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      /* Invalid file ID: */
      console.error("[/download-file GET] Invalid file ID:", req.params.fileId);
      res.status(400).json({ error: "Invalid file ID" });
      return;
    }

    /* Find the file */
    const file = await File.findById(req.params.fileId);
    if (!file) {
      /* File not found: */
      console.error("[/download-file GET] File not found:", req.params.fileId);
      res.status(404).json({ error: "File not found" });
      return;
    }

    /* Find the message associated with the file */
    const message = await Message.findOne({ file: req.params.fileId }).populate(
      "channel"
    );
    if (!message || message.deleted) {
      /* Message not found or has been deleted: */
      console.error(
        "[/download-file GET] Message not found or has been deleted:",
        req.params.fileId
      );
      res.status(404).json({ error: "Message not found or has been deleted" });
      return;
    }

    /* Check if the user is a member of the channel */
    /* @ts-ignore */
    const channel = message.channel as IChannel;
    if (
      !channel.users.includes(
        new mongoose.Types.ObjectId(requestWithUser.user.userId)
      )
    ) {
      /* User is not a member of the channel: */
      console.error(
        "[/download-file GET] User is not a member of the channel:",
        requestWithUser.user.userId
      );
      res.status(403).json({ error: "User is not a member of the channel" });
      return;
    }

    /* Stream the file from the file system */
    if (!file.filename) {
      console.error("[/download-file GET] File filename is not defined");
      res.status(500).json({ error: "File filename is not defined" });
      return;
    }
    const filePath = path.join(__dirname, "..", "..", "uploads", file.filename);
    res.download(filePath, file.filename);
  } catch (error) {
    /* An error occurred: */
    console.error("[/download-file GET] An error occurred:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/* @ts-ignore */
fileDownloadRouter.get("/files/:fileId", authenticateJWTWithUser, downloadFile);

export default fileDownloadRouter;
