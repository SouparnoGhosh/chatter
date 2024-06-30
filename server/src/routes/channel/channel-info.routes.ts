/* get-channel.routes.ts */
import express from "express";
import mongoose from "mongoose";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

/**
 * GET /channels/:channelId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid and the user is authenticated, the details of the channel will be fetched and returned.
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel does not exist, the user is not a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "_id": "channel_id",
 *   "name": "channel_name",
 *   "users": ["user_id1", "user_id2", ...],
 *   "creator": "creator_id",
 *   "administrators": ["admin_id1", "admin_id2", ...]
 * }
 *
 * If the channel is fetched successfully, the response will be a JSON object with the details of the channel.
 */

const getChannelRouter = express.Router();

getChannelRouter.get(
  "/channels/:channelId",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const channelId = req.params.channelId;
    const requestWithUser = req as RequestWithUser;

    /* Check if channelId is a valid MongoDB ObjectID */
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.error("[/channels/:channelId GET] Invalid channel ID", channelId);
      return res.status(400).json({ error: "Invalid channel ID" });
    }

    try {
      /* Fetch the authenticated user's document from the database */
      const user = await User.findOne({
        username: requestWithUser.user.username,
      });

      if (!user) {
        console.error(
          "[/channels/:channelId GET] User not found",
          requestWithUser.user.username
        );
        return res
          .status(401)
          .json({ error: "Channel not fetched. User not found" });
      }

      /* Fetch the channel's document from the database */
      const channel = await Channel.findById(channelId);

      if (!channel) {
        console.error(
          "[/channels/:channelId GET] Channel not found",
          channelId
        );
        return res.status(404).json({ error: "Channel not found" });
      }

      /* Check if user is a member of the channel */
      if (!channel.users.includes(user._id)) {
        console.error(
          "[/channels/:channelId GET] User not a member",
          requestWithUser.user.username
        );
        return res
          .status(403)
          .json({ error: "User not authorized to access this channel" });
      }

      /* Return only the channel ID, name, users, creator, and administrators */
      res.json({
        _id: channel._id,
        name: channel.name,
        users: channel.users,
        creator: channel.creator,
        administrators: channel.administrators,
      });
    } catch (error) {
      console.error("[/channels/:channelId GET] Error getting channel", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting the channel" });
    }
  }
);

export default getChannelRouter;
