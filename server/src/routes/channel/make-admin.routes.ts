import express from "express";
import mongoose from "mongoose";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";
import { Server } from "socket.io";

const makeAdminRouter = express.Router();

/**
 * POST channels/:channelId/makeAdmin/:userId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID and a user ID as URL parameters.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID and user ID are valid, the user is authenticated, not deleted, and is an administrator of the channel, another user who is a member of the channel, not deleted, and not an administrator, can be made an administrator of the channel.
 * If there's an error (for example, the channel ID or user ID is not valid, the user is not authenticated, the channel or user does not exist, the user is deleted, the request sender is not an administrator of the channel, the user is not a member of the channel, the user is already an administrator of the channel, the channel is deleted, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "User made administrator successfully"
 * }
 *
 * If the user is made an administrator of the channel successfully, the response will be a JSON object with a success message.
 */

makeAdminRouter.post(
  "/channels/:channelId/makeAdmin/:userId",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const channelId = req.params.channelId;
    const userIdToMakeAdmin = req.params.userId;
    const requestWithUser = req as RequestWithUser;

    /* Check if channelId and userIdToMakeAdmin are valid MongoDB ObjectIDs */
    if (
      !mongoose.Types.ObjectId.isValid(channelId) ||
      !mongoose.Types.ObjectId.isValid(userIdToMakeAdmin)
    ) {
      console.error(
        "[/channels/:channelId/makeadmin/:userId POST] Invalid channelId or userId",
        channelId,
        userIdToMakeAdmin
      );
      return res.status(400).json({ error: "Invalid channelId or userId" });
    }

    try {
      /* Fetch the channel and user documents from the database */
      const channel = await Channel.findById(channelId);
      const userMakingRequest = await User.findById(
        requestWithUser.user.userId
      );
      const userToMakeAdmin = await User.findById(userIdToMakeAdmin);

      /* Check if the channel and users exist */
      if (!channel || !userMakingRequest || !userToMakeAdmin) {
        console.error(
          "[/channels/:channelId/makeadmin/:userId POST] Channel or User not found",
          channelId,
          requestWithUser.user.userId,
          userIdToMakeAdmin
        );
        return res.status(404).json({ error: "Channel or User not found" });
      }

      /* Check if the users are not deleted */
      if (userMakingRequest.isDeleted || userToMakeAdmin.isDeleted) {
        console.error(
          "[/channels/:channelId/makeadmin/:userId POST] User is deleted",
          userMakingRequest.isDeleted
            ? requestWithUser.user.userId
            : userIdToMakeAdmin
        );
        return res.status(400).json({ error: "User is deleted" });
      }

      /* Check if the request sender is an administrator of the channel */
      if (
        !channel.administrators.some(
          (admin) => admin.toString() === requestWithUser.user.userId
        )
      ) {
        console.error(
          "[/channels/:channelId/makeadmin/:userId POST] You must be an administrator to perform this action",
          requestWithUser.user.userId
        );
        return res.status(403).json({
          error: "You must be an administrator to perform this action",
        });
      }

      /* Check if the user to be made admin is a member of the channel and not already an admin */
      if (
        !channel.users.some((user) => user.toString() === userIdToMakeAdmin) ||
        channel.administrators.some(
          (admin) => admin.toString() === userIdToMakeAdmin
        )
      ) {
        console.error(
          "[/channels/:channelId/makeadmin/:userId POST] User is not a member of the channel or is already an administrator",
          userIdToMakeAdmin
        );
        return res.status(400).json({
          error:
            "User is not a member of the channel or is already an administrator",
        });
      }

      /* Add the user to the administrators array of the channel and the channel to the administeredChannels array of the user */
      channel.administrators.push(
        new mongoose.Types.ObjectId(userIdToMakeAdmin)
      );
      userToMakeAdmin.administeredChannels.push(
        new mongoose.Types.ObjectId(channelId)
      );

      /* Create a new notification message */
      const notificationMessage = new Message({
        content: `${requestWithUser.user.username} made ${userToMakeAdmin.username} an admin.`,
        user: requestWithUser.user.userId,
        username: requestWithUser.user.username,
        channel: channelId,
        isNotification: true,
      });

      /* Save the notification message to the database */
      await notificationMessage.save();

      /* Add the notification message to the messages array of the channel */
      channel.messages.push(notificationMessage._id);

      /* Save the updated documents to the database */
      await channel.save();
      await userToMakeAdmin.save();

      console.log(
        "[/channels/:channelId/makeadmin/:userId POST] User made administrator successfully",
        userIdToMakeAdmin
      );

      /* Create the response message object */
      const responseMessage = {
        _id: notificationMessage._id,
        content: notificationMessage.content,
        timestamp: notificationMessage.timestamp,
        user: notificationMessage.user,
        username: notificationMessage.username,
        newAdmin: userIdToMakeAdmin,
        channel: notificationMessage.channel,
        isNotification: notificationMessage.isNotification,
        deleted: notificationMessage.deleted,
      };

      res.status(200).json({
        message: "User made administrator successfully",
        data: responseMessage,
      });
    } catch (error) {
      console.error(
        "[/channels/:channelId/makeadmin/:userId POST] An error occurred while processing your request",
        error
      );
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  }
);

export default makeAdminRouter;
