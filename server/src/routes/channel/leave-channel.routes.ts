/* leave-channel.routes.ts */
import express from "express";
import mongoose from "mongoose";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

/**
 * POST /channels/:channelId/leave
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid and the user is authenticated, the user will be removed from the channel.
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel or user does not exist, the user is not a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "User left channel successfully"
 * }
 *
 * If the user is removed from the channel successfully, the response will be a JSON object with a success message.
 */

const leaveChannelRouter = express.Router();

leaveChannelRouter.post(
  "/channels/:channelId/leave",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const channelId = req.params.channelId;
    const requestWithUser = req as RequestWithUser;

    /* Check if channelId is a valid MongoDB ObjectID */
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.error(
        "[/channels/:channelId/leave POST] Invalid channelId:",
        channelId
      );
      return res.status(400).json({ error: "Invalid channelId" });
    }

    try {
      /* Fetch the channel and user documents from the database */
      const channel = await Channel.findById(channelId);
      const user = await User.findById(requestWithUser.user.userId);

      /* Check if the channel exists */
      if (!channel) {
        console.error(
          "[/channels/:channelId/leave POST] Channel not found:",
          channelId
        );
        return res.status(404).json({ error: "Channel not found" });
      }

      /* Check if the user exists */
      if (!user) {
        console.error(
          "[/channels/:channelId/leave POST] User not found:",
          requestWithUser.user.userId
        );
        return res.status(404).json({ error: "User not found" });
      }

      /* Check if the user is a member of the channel */
      if (
        !channel.users
          .map((user) => user.toString())
          .includes(requestWithUser.user.userId)
      ) {
        console.error(
          "[/channels/:channelId/leave POST] User is not a member of the channel:",
          requestWithUser.user.userId,
          channelId
        );
        return res.status(400).json({
          error: "User is not a member of the channel",
        });
      }

      /* Remove the user from the users array of the channel */
      channel.users = channel.users.filter(
        (user) => user.toString() !== requestWithUser.user.userId
      );
      console.log(
        "[/channels/:channelId/leave POST] User removed from channel users:",
        requestWithUser.user.userId,
        channelId
      );

      /* If the user is an administrator, remove them from the administrators array of the channel */
      if (
        channel.administrators
          .map((admin) => admin.toString())
          .includes(requestWithUser.user.userId)
      ) {
        channel.administrators = channel.administrators.filter(
          (admin) => admin.toString() !== requestWithUser.user.userId
        );
        console.log(
          "[/channels/:channelId/leave POST] User removed from channel administrators:",
          requestWithUser.user.userId,
          channelId
        );

        /* Also remove the channel from the administeredChannels array of the user */
        user.administeredChannels = user.administeredChannels.filter(
          (adminChannel) => adminChannel.toString() !== channelId
        );
        console.log(
          "[/channels/:channelId/leave POST] Channel removed from user administeredChannels:",
          channelId,
          requestWithUser.user.userId
        );
      }

      /* Remove the channel from the memberChannels array of the user */
      user.memberChannels = user.memberChannels.filter(
        (memberChannel) => memberChannel.toString() !== channelId
      );
      console.log(
        "[/channels/:channelId/leave POST] Channel removed from user memberChannels:",
        channelId,
        requestWithUser.user.userId
      );

      /* Create a new notification message */
      const notificationMessage = new Message({
        content: `${requestWithUser.user.username} left the channel.`,
        user: requestWithUser.user.userId,
        channel: channelId,
        isNotification: true,
      });

      /* Save the notification message to the database */
      await notificationMessage.save();
      console.log(
        "[/channels/:channelId/leave POST] Notification message saved:",
        notificationMessage._id
      );

      /* Add the notification message to the messages array of the channel */
      channel.messages.push(notificationMessage._id);
      console.log(
        "[/channels/:channelId/leave POST] Notification message added to channel messages:",
        channelId,
        notificationMessage._id
      );

      /* Save the updated documents to the database */
      await channel.save();
      console.log(
        "[/channels/:channelId/leave POST] Channel saved:",
        channelId
      );
      await user.save();
      console.log(
        "[/channels/:channelId/leave POST] User saved:",
        requestWithUser.user.userId
      );

      console.log(
        "[/channels/:channelId/leave POST] User left channel successfully:",
        requestWithUser.user.userId,
        channelId
      );
      res.status(200).json({ message: "User left channel successfully" });
    } catch (error) {
      console.error(
        "[/channels/:channelId/leave POST] An error occurred while processing your request:",
        error
      );
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  }
);

export default leaveChannelRouter;
