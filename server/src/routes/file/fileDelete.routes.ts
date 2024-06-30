import express from "express";
import File from "../../models/File.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestHandlerWithUser, RequestWithUser } from "../../types/Types";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

/**
 * GET /files/:fileId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a file ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the file ID is valid, the user is authenticated, and the user is a member of the channel where the message with the file was posted,
 * the file will be streamed from the server to the client.
 *
 * If there's an error (for example, the file ID is not valid, the user is not authenticated, the file does not exist,
 * the message does not exist, the user is not a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * The file will be sent as a download to the client.
 *
 * If the file is downloaded successfully, the file will be sent as a download to the client.
 * If there's an error, the response will be a JSON object with an error message.
 */

const fileDeleteRouter = express.Router();

const deleteFile: RequestHandlerWithUser = async (req, res) => {
  const requestWithUser = req as RequestWithUser;
  try {
    /* Deleting file... */
    console.log("[/delete-file DELETE] Deleting file...");

    /* Check if fileId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      /* Invalid file ID: */
      console.error(
        "[/delete-file DELETE] Invalid file ID:",
        req.params.fileId
      );
      res.status(400).json({ error: "Invalid file ID" });
      return;
    }

    /* Find the file */
    const file = await File.findById(req.params.fileId);
    if (!file) {
      /* File not found: */
      console.error("[/delete-file DELETE] File not found:", req.params.fileId);
      res.status(404).json({ error: "File not found" });
      return;
    }

    /* Find the message associated with the file */
    const message = await Message.findOne({ file: req.params.fileId });
    if (!message || message.deleted) {
      /* Message not found or has been deleted: */
      console.error(
        "[/delete-file DELETE] Message not found or has been deleted:",
        req.params.fileId
      );
      res.status(404).json({ error: "Message not found or has been deleted" });
      return;
    }

    /* Check if the user is the sender of the message */
    if (!message.user || !message.user.equals(requestWithUser.user.userId)) {
      /* User is not the sender of the message: */
      console.error(
        "[/delete-file DELETE] User is not the sender of the message:",
        requestWithUser.user.userId
      );
      res.status(403).json({ error: "User is not the sender of the message" });
      return;
    }

    /* Delete the file from the file system */
    if (!file.filename) {
      console.error("[/delete-file DELETE] File filename is not defined");
      res.status(500).json({ error: "File filename is not defined" });
      return;
    }
    fs.unlinkSync(path.join(__dirname, "..", "..", "uploads", file.filename));

    /* Delete the file from the database */
    await File.findByIdAndDelete(req.params.fileId);

    /* Mark the message as deleted */
    message.deleted = true;
    await message.save();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    /* An error occurred: */
    console.error("[/delete-file DELETE] An error occurred:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/* @ts-ignore */
fileDeleteRouter.delete("/files/:fileId", authenticateJWTWithUser, deleteFile);

export default fileDeleteRouter;
