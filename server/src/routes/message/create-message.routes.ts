import express from "express";
import Message from "../../models/Message.model";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestHandlerWithUser, RequestWithUser } from "../../types/Types";
import mongoose from "mongoose";

/**
 * POST /channels/:channelId/messages
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter and message content in the request body.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid, the user is authenticated, and the user is a member of the channel,
 * a new message will be created and added to the channel.
 *
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel does not exist,
 * the user is not a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "Message sent successfully"
 * }
 *
 * If the message is created successfully, the response will be a JSON object with a success message.
 */

const createMessageRouter = express.Router();

const createMessage: RequestHandlerWithUser = async (req, res) => {
  const requestWithUser = req as RequestWithUser;
  try {
    /* Creating new message... */
    console.log("[/create-message POST] Creating new message...");

    /* Check if channelId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.channelId)) {
      /* Invalid channel ID: */
      console.error(
        "[/create-message POST] Invalid channel ID:",
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
        "[/create-message POST] Channel not found:",
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
        "[/create-message POST] User not found or has been deleted:",
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
        "[/create-message POST] User is not a member of the channel:",
        requestWithUser.user.userId
      );
      res.status(403).json({ error: "User is not a member of the channel" });
      return;
    }

    if (!req.body.content && !req.body.fileId) {
      console.error(
        "[/create-message POST] Message must have either content or a file"
      );
      res
        .status(400)
        .json({ error: "Message must have either content or a file" });
      return;
    }

    /* Create the new message */
    const message = new Message({
      content: req.body.content,
      user: requestWithUser.user.userId,
      username: requestWithUser.user.username,
      channel: req.params.channelId,
      file: req.body.fileId,
    });
    await message.save();
    /* Message created successfully: */
    console.log(
      "[/create-message POST] Message created successfully:",
      message
    );

    /* Updating channel... */
    console.log("[/create-message POST] Updating channel...");
    /* Update the lastMessage field of the channel */
    channel.lastMessage = message._id;
    channel.messages.push(message._id);
    await channel.save();
    /* Channel updated successfully: */
    console.log(
      "[/create-message POST] Channel updated successfully:"
      // channel.name
    );
    /* Create the response message object */
    const responseMessage = {
      _id: message._id,
      content: message.content,
      timestamp: message.timestamp,
      user: message.user,
      username: message.username,
      channel: message.channel,
      isNotification: message.isNotification,
      deleted: message.deleted,
    };

    res
      .status(200)
      .json({ message: "Message sent successfully", data: responseMessage });
  } catch (error) {
    /* An error occurred: */
    console.error("[/create-message POST] An error occurred:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

createMessageRouter.post(
  "/channels/:channelId/messages",
  authenticateJWTWithUser,
  /* @ts-ignore */
  createMessage
);

export default createMessageRouter;
