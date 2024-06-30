import { RequestHandlerWithUser } from "../../types/Types";
import Message from "../../models/Message.model";
import User from "../../models/User.model";
import express from "express";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import mongoose from "mongoose";

/**
 * PATCH /channels/:channelId/messages/:messageId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID and a message ID as URL parameters.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID and message ID are valid, the user is authenticated, and the user is the sender of the message,
 * the message will be edited and the updated message will be returned.
 *
 * If there's an error (for example, the channel ID or message ID is not valid, the user is not authenticated, the message does not exist,
 * the user is not the sender of the message, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "Message edited successfully"
 * }
 *
 * If the message is edited successfully, the response will be a JSON object with a success message.
 */

const editMessageRouter = express.Router();

const editMessage: RequestHandlerWithUser = async (req, res, next) => {
  try {
    /* Editing message... */
    console.log("[/edit-message PATCH] Editing message...");

    /* Check if messageId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
      /* Invalid message ID: */
      console.error(
        "[/edit-message PATCH] Invalid message ID:",
        req.params.messageId
      );
      res.status(400).json({ error: "Invalid message ID" });
      return;
    }

    /* Find the message */
    const message = await Message.findById(req.params.messageId);
    if (!message || !message.user) {
      /* Message not found: */
      console.error(
        "[/edit-message PATCH] Message not found:",
        req.params.messageId
      );
      res.status(404).json({ error: "Message not found" });
      return;
    }

    /* Check if the message is a text message */
    if (message.file) {
      /* Cannot edit a file message: */
      console.error(
        "[/edit-message PATCH] Cannot edit a file message:",
        req.params.messageId
      );
      res.status(400).json({ error: "Cannot edit a file message" });
      return;
    }

    /* Check if the message has been deleted */
    if (message.deleted) {
      /* Message has been deleted: */
      console.error(
        "[/edit-message PATCH] Message has been deleted:",
        req.params.messageId
      );
      res.status(400).json({ error: "Cannot edit a deleted message" });
      return;
    }

    /* Find the user */
    const user = await User.findById(req.user.userId);
    if (!user || user.isDeleted) {
      /* User not found or has been deleted: */
      console.error(
        "[/edit-message PATCH] User not found or has been deleted:",
        req.user.userId
      );
      res.status(404).json({ error: "User not found or has been deleted" });
      return;
    }

    /* Check if the user is still a member of the channel */
    if (message.channel && !user.memberChannels.includes(message.channel)) {
      /* User not a member of the channel: */
      console.error(
        "[/edit-message PATCH] User not a member of the channel:",
        req.user.userId
      );
      res.status(403).json({ error: "User not a member of the channel" });
      return;
    }

    /* Check if the user is the sender of the message */
    if (req.user.userId !== message.user.toString()) {
      /* User not authorized to edit this message: */
      console.error(
        "[/edit-message PATCH] User not authorized to edit this message:",
        req.user.userId
      );
      res
        .status(403)
        .json({ error: "User not authorized to edit this message" });
      return;
    }

    /* Check if new content is provided */
    if (!req.body.content || typeof req.body.content !== "string") {
      /* Invalid or missing new content */
      console.error("[/edit-message PATCH] Invalid or missing new content");
      res.status(400).json({ error: "Invalid or missing new content" });
      return;
    }

    /* Edit the message */
    message.content = req.body.content;
    try {
      await message.save();
    } catch (error) {
      /* Database error when saving the message: */
      console.error(
        "[/edit-message PATCH] Database error when saving the message:",
        error
      );
      res.status(500).json({ error: "Database error when saving the message" });
      return;
    }

    /* Message edited successfully: */
    console.log("[/edit-message PATCH] Message edited successfully:", message);
    res.status(200).json({ message: "Message edited successfully" });
    return;
  } catch (error) {
    /* An error occurred: */
    console.error("[/edit-message PATCH] An error occurred:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
      return;
    }
  }
};

/* Add the editMessage function to your editMessageRouter */
editMessageRouter.patch(
  "/channels/:channelId/messages/:messageId",
  authenticateJWTWithUser,
  /* @ts-ignore */
  editMessage
);

export default editMessageRouter;
