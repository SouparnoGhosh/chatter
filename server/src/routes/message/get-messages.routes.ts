import express, { Request, Response, NextFunction } from "express";
import Message from "../../models/Message.model";
import Channel from "../../models/Channel.model";
import mongoose from "mongoose";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestHandlerWithUser, RequestWithUser } from "../../types/Types";

/**
 * GET /channels/:channelId/messages
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid, the user is authenticated, and the user is an administrator of the channel,
 * all messages for the channel will be fetched and returned. Each message will include the details of the associated file (if any).
 *
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel does not exist,
 * the user is not an administrator of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "messages": [
 *     {
 *       "_id": "message_id",
 *       "content": "message_content",
 *       "timestamp": "message_timestamp",
 *       "user": "user_id",
 *       "channel": "channel_id",
 *       "file": {
 *         "_id": "file_id",
 *         "filename": "file_name",
 *         "mimetype": "file_mimetype",
 *         "size": file_size,
 *         "url": "file_url"
 *       },
 *       "deleted": false
 *     },
 *     ...
 *   ]
 * }
 *
 * If the messages are fetched successfully, the response will be a JSON object with an array of the messages.
 * Each message will be a JSON object with the details of the message and the associated file (if any).
 */

const getAllMessagesRouter = express.Router();

const getAllMessages: RequestHandlerWithUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    /* [/messages GET] Getting all messages... */

    /* Check if user ID and channel ID are provided */
    if (!req.user.userId || !req.params.channelId) {
      /* [/messages GET] User ID or channel ID not provided: */
      res.status(400).json({ error: "User ID or channel ID not provided" });
      return;
    }

    /* Check if channelId is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(req.params.channelId)) {
      /* [/messages GET] Invalid channel ID: */
      res.status(400).json({ error: "Invalid channel ID" });
      return;
    }

    /* Check if the channel exists */
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      /* [/messages GET] Channel not found: */
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    // /* Check if the user is an admin of the channel */
    // if (
    //   !channel.administrators.includes(
    //     new mongoose.Types.ObjectId(req.user.userId)
    //   )
    // ) {
    //   /* [/messages GET] User not authorized to view this channel's messages: */
    //   res
    //     .status(403)
    //     .json({ error: "User not authorized to view this channel's messages" });
    //   return;
    // }

    const messages = await Message.find({ channel: req.params.channelId })
      .populate("file") // Populate the 'file' field
      .sort({
        timestamp: 1,
      }); /* Get all messages for the channel, sorted by timestamp */
    /* [/messages GET] Successfully retrieved all messages */
    res.status(200).json({ messages });
  } catch (error) {
    /* [/messages GET] An error occurred: */
    if (error instanceof mongoose.Error) {
      res.status(500).json({ error: "Database error: " + error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/* Add the getAllMessages function to your getAllMessagesRouter */
getAllMessagesRouter.get(
  "/channels/:channelId/messages",
  authenticateJWTWithUser,
  /* @ts-ignore */
  getAllMessages
);

export default getAllMessagesRouter;
