import express from "express";
import multer from "multer";
import File from "../../models/File.model";
import Message from "../../models/Message.model";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestHandlerWithUser, RequestWithUser } from "../../types/Types";
import mongoose from "mongoose";

/**
 * POST /channels/:channelId/files
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter and a file in the request body.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid, the user is authenticated, and the user is a member of the channel,
 * a new file will be uploaded and a new message with a reference to the file will be added to the channel.
 *
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel does not exist,
 * the user is not a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "File uploaded successfully"
 * }
 *
 * If the file is uploaded successfully, the response will be a JSON object with a success message.
 */

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB (in bytes)
  },
});

const fileUploadRouter = express.Router();

const uploadFile: RequestHandlerWithUser = async (req, res) => {
  const requestWithUser = req as RequestWithUser;
  try {
    /* Uploading new file... */
    console.log("[/upload-file POST] Uploading new file...");

    /* Check if channelId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.channelId)) {
      /* Invalid channel ID: */
      console.error(
        "[/upload-file POST] Invalid channel ID:",
        req.params.channelId
      );
      res.status(400).json({ error: "Invalid channel ID" });
      return;
    }

    /* Find the channel */
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      /* Channel not found: */
      console.error(
        "[/upload-file POST] Channel not found:",
        req.params.channelId
      );
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    /* Find the user */
    const user = await User.findById(requestWithUser.user.userId);
    if (!user || user.isDeleted) {
      /* User not found or has been deleted: */
      console.error(
        "[/upload-file POST] User not found or has been deleted:",
        requestWithUser.user.userId
      );
      res.status(404).json({ error: "User not found or has been deleted" });
      return;
    }

    /* Check if the user is a member of the channel */
    if (
      !channel.users.includes(
        new mongoose.Types.ObjectId(requestWithUser.user.userId)
      )
    ) {
      /* User is not a member of the channel: */
      console.error(
        "[/upload-file POST] User is not a member of the channel:",
        requestWithUser.user.userId
      );
      res.status(403).json({ error: "User is not a member of the channel" });
      return;
    }

    /* Create the new file */
    if (!req.file) {
      console.error("[/upload-file POST] No file was uploaded");
      res.status(400).json({ error: "No file was uploaded" });
      return;
    }
    const file = new File({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    });
    await file.save();
    /* File uploaded successfully: */
    console.log("[/upload-file POST] File uploaded successfully:", file);

    /* Create a new message with a reference to the file */
    const message = new Message({
      content: `Uploaded a file: ${file.filename}`,
      user: requestWithUser.user.userId,
      channel: req.params.channelId,
      file: file._id,
    });
    await message.save();
    /* Message created successfully: */
    console.log("[/upload-file POST] Message created successfully:", message);

    /* Updating channel... */
    console.log("[/upload-file POST] Updating channel...");
    /* Update the lastMessage field of the channel */
    channel.lastMessage = message._id;
    channel.messages.push(message._id);
    await channel.save();
    /* Channel updated successfully: */
    console.log("[/upload-file POST] Channel updated successfully:", channel);
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    /* An error occurred: */
    console.error("[/upload-file POST] An error occurred:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

fileUploadRouter.post(
  "/channels/:channelId/files",
  authenticateJWTWithUser,
  upload.single("file"), // Use multer to handle the file upload
  /* @ts-ignore */
  uploadFile
);

export default fileUploadRouter;
