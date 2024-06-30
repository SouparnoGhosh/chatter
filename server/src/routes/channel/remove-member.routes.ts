import express from "express";
import mongoose from "mongoose";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

const removeMemberRouter = express.Router();

/**
 * POST /channels/:channelId/removeMember/:userId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID and a user ID as URL parameters.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID and user ID are valid, the user is authenticated, not deleted, and is an administrator of the channel, another user who is a member of the channel and not deleted can be removed from the channel. If the member is also an administrator, they will be removed from the administrators as well.
 * If there's an error (for example, the channel ID or user ID is not valid, the user is not authenticated, the channel or user does not exist, the user is deleted, the request sender is not an administrator of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "User removed from channel successfully"
 * }
 *
 * If the user is removed from the channel successfully, the response will be a JSON object with a success message.
 */

removeMemberRouter.post(
  "/channels/:channelId/removeMember/:userId",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const requestWithUser = req as RequestWithUser;

      if (requestWithUser.user.isDeleted) {
        console.error(
          "[/channels/:channelId/removeMember/:userId POST] Requesting user is deleted"
        );
        return res.status(400).json({ error: "Requesting user is deleted" });
      }

      if (
        !mongoose.Types.ObjectId.isValid(req.params.channelId) ||
        !mongoose.Types.ObjectId.isValid(req.params.userId)
      ) {
        console.error(
          "[/channels/:channelId/removeMember/:userId POST] Invalid channelId or userId"
        );
        return res.status(400).json({ error: "Invalid channelId or userId" });
      }

      const channelId = new mongoose.Types.ObjectId(req.params.channelId);
      const userId = new mongoose.Types.ObjectId(req.params.userId);

      const channel = await Channel.findById(channelId);
      const user = await User.findById(userId);

      if (!channel || !user) {
        console.error(
          "[/channels/:channelId/removeMember/:userId POST] Channel or User not found"
        );
        return res.status(404).json({ error: "Channel or User not found" });
      }

      if (user.isDeleted) {
        console.error(
          "[/channels/:channelId/removeMember/:userId POST] User to be removed is deleted"
        );
        return res.status(400).json({ error: "User to be removed is deleted" });
      }

      if (
        !channel.administrators.includes(
          new mongoose.Types.ObjectId(requestWithUser.user.userId)
        )
      ) {
        console.error(
          "[/channels/:channelId/removeMember/:userId POST] You must be an administrator to perform this action"
        );
        return res.status(403).json({
          error: "You must be an administrator to perform this action",
        });
      }

      (channel.users as mongoose.Types.Array<mongoose.Types.ObjectId>).pull(
        userId
      );
      console.log(
        "[/channels/:channelId/removeMember/:userId POST] User removed from channel users"
      );

      (
        user.memberChannels as mongoose.Types.Array<mongoose.Types.ObjectId>
      ).pull(channelId);
      console.log(
        "[/channels/:channelId/removeMember/:userId POST] Channel removed from user memberChannels"
      );

      if (channel.administrators.includes(userId)) {
        (
          channel.administrators as mongoose.Types.Array<mongoose.Types.ObjectId>
        ).pull(userId);
        console.log(
          "[/channels/:channelId/removeMember/:userId POST] User removed from channel administrators"
        );

        (
          user.administeredChannels as mongoose.Types.Array<mongoose.Types.ObjectId>
        ).pull(channelId);
        console.log(
          "[/channels/:channelId/removeMember/:userId POST] Channel removed from user administeredChannels"
        );
      }

      /* Create a new notification message */
      const notificationMessage = new Message({
        content: `${requestWithUser.user.username} removed ${user.username} from the channel.`,
        user: requestWithUser.user.userId,
        username: requestWithUser.user.username,
        channel: channelId,
        isNotification: true,
      });

      /* Save the notification message to the database */
      await notificationMessage.save();
      console.log(
        "[/channels/:channelId/removeMember/:userId POST] Notification message saved"
      );

      /* Add the notification message to the messages array of the channel */
      channel.messages.push(notificationMessage._id);
      console.log(
        "[/channels/:channelId/removeMember/:userId POST] Notification message added to channel messages"
      );

      /* Save the updated channel and user documents to the database */
      await channel.save();
      console.log(
        "[/channels/:channelId/removeMember/:userId POST] Channel saved"
      );

      await user.save();
      console.log(
        "[/channels/:channelId/removeMember/:userId POST] User saved"
      );

      console.log(
        "[/channels/:channelId/removeMember/:userId POST] User removed from channel successfully"
      );

      /* Create the response message object */
      const responseMessage = {
        _id: notificationMessage._id,
        content: notificationMessage.content,
        timestamp: notificationMessage.timestamp,
        user: notificationMessage.user,
        username: notificationMessage.username,
        channel: notificationMessage.channel,
        isNotification: notificationMessage.isNotification,
        deleted: notificationMessage.deleted,
      };

      res.status(200).json({
        message: "User removed from channel successfully",
        data: responseMessage,
      });
    } catch (error) {
      console.error(
        "[/channels/:channelId/removeMember/:userId POST] Error removing user from channel:",
        error
      );
      res.status(500).json({ error: "Error removing user from channel" });
    }
  }
);

export default removeMemberRouter;
