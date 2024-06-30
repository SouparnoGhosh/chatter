import express from "express";
import mongoose from "mongoose";
import Message from "../../models/Message.model";
import Channel from "../../models/Channel.model";
import { RequestHandlerWithUser } from "../../types/Types";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";

/**
 * DELETE /channels/:channelId/messages/:messageId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID and a message ID as URL parameters.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID and message ID are valid, the user is authenticated, and the user is the sender of the message or an administrator of the channel,
 * the message will be soft deleted and a success message will be returned.
 *
 * If there's an error (for example, the channel ID or message ID is not valid, the user is not authenticated, the message does not exist,
 * the user is not the sender of the message or an administrator of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "Message deleted successfully"
 * }
 *
 * If the message is deleted successfully, the response will be a JSON object with a success message.
 */

const deleteMessageRouter = express.Router();

const deleteMessage: RequestHandlerWithUser = async (req, res, next) => {
  try {
    /* Deleting message... */
    console.log("[/delete-message DELETE] Deleting message...");

    /* Check if messageId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
      /* Invalid message ID: */
      console.error(
        "[/delete-message DELETE] Invalid message ID:",
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
        "[/delete-message DELETE] Message not found:",
        req.params.messageId
      );
      res.status(404).json({ error: "Message not found" });
      return;
    }

    /* Check if the message has already been deleted */
    if (message.deleted) {
      /* Message has already been deleted: */
      console.error(
        "[/delete-message DELETE] Message has already been deleted:",
        req.params.messageId
      );
      res.status(400).json({ error: "Message has already been deleted" });
      return;
    }

    /* Find the channel */
    const channel = await Channel.findById(message.channel);
    if (!channel || !channel.lastMessage) {
      /* Channel not found: */
      console.error(
        "[/delete-message DELETE] Channel not found:",
        message.channel
      );
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    /* Check if the user is the sender of the message or an administrator of the channel */
    if (
      req.user.userId !== message.user.toString() &&
      !channel.administrators.map((id) => id.toString()).includes(req.user.userId)
    ) {
      /* User not authorized to delete this message: */
      console.error(
        "[/delete-message DELETE] User not authorized to delete this message:",
        req.user.userId
      );
      res
        .status(403)
        .json({ error: "User not authorized to delete this message" });
      return;
    }

    /* Soft delete the message */
    message.content = "This message was deleted";
    message.deleted = true;
    try {
      await message.save();
    } catch (error) {
      /* Database error when saving the message: */
      console.error(
        "[/delete-message DELETE] Database error when saving the message:",
        error
      );
      res.status(500).json({ error: "Database error when saving the message" });
      return;
    }

    /* Message deleted successfully: */
    console.log(
      "[/delete-message DELETE] Message deleted successfully:",
      message
    );

    /* If the message being deleted is the last message in the channel, find the previous message and set it as the last message */
    if (channel.lastMessage.toString() === message._id.toString()) {
      const previousMessage = await Message.find({
        channel: channel._id,
        deleted: false,
      })
        .sort({ timestamp: -1 })
        .limit(1);
      channel.lastMessage = previousMessage[0]?._id || null;
      try {
        await channel.save();
      } catch (error) {
        /* Database error when saving the channel: */
        console.error(
          "[/delete-message DELETE] Database error when saving the channel:",
          error
        );
        res
          .status(500)
          .json({ error: "Database error when saving the channel" });
        return;
      }
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    /* An error occurred: */
    console.error("[/delete-message DELETE] An error occurred:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/* Add the deleteMessage function to your deleteMessageRouter */
deleteMessageRouter.delete(
  "/channels/:channelId/messages/:messageId",
  authenticateJWTWithUser,
  /* @ts-ignore */
  deleteMessage
);

export default deleteMessageRouter;
