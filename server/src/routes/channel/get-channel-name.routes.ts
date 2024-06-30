/* get-channel-name.routes.ts */
import express from "express";
import mongoose from "mongoose";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

/**
 * GET /channels/:channelId/name
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid and the user is authenticated, the name of the channel will be fetched and returned.
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel does not exist, the user is not a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "name": "channel_name"
 * }
 *
 * If the channel name is fetched successfully, the response will be a JSON object with the name of the channel.
 *
 */

const getChannelNameRouter = express.Router();

getChannelNameRouter.get(
  "/channels/:channelId/name",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const channelId = req.params.channelId;
    const requestWithUser = req as RequestWithUser;

    /* Check if channelId is a valid MongoDB ObjectID */
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.error(
        "[/channels/:channelId/name GET] Invalid channel ID",
        channelId
      );
      return res.status(400).json({ error: "Invalid channel ID" });
    }

    try {
      /* Fetch the authenticated user's document from the database */
      const user = await User.findOne({
        username: requestWithUser.user.username,
      });

      if (!user) {
        console.error(
          "[/channels/:channelId/name GET] User not found",
          requestWithUser.user.username
        );
        return res
          .status(401)
          .json({ error: "Channel name not fetched. User not found" });
      }

      /* Fetch the channel's document from the database */
      const channel = await Channel.findById(channelId);

      if (!channel) {
        console.error(
          "[/channels/:channelId/name GET] Channel not found",
          channelId
        );
        return res.status(404).json({ error: "Channel not found" });
      }

      /* Check if user is a member of the channel */
      if (!channel.users.includes(user._id)) {
        console.error(
          "[/channels/:channelId/name GET] User not a member",
          requestWithUser.user.username
        );
        return res
          .status(403)
          .json({ error: "User not authorized to access this channel" });
      }

      /* Return only the channel name */
      res.json({
        name: channel.name,
      });
    } catch (error) {
      console.error(
        "[/channels/:channelId/name GET] Error getting channel name",
        error
      );
      res
        .status(500)
        .json({ error: "An error occurred while getting the channel name" });
    }
  }
);

export default getChannelNameRouter;
