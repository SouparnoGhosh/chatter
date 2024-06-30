/* add-user.routes.ts */
import express from "express";
import mongoose from "mongoose";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { ObjectId } from "mongodb";
import { RequestWithUser } from "../../types/Types";

/**
 * POST /channels/:channelId/addMember/:userId
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID and a user ID as URL parameters.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID and user ID are valid and the user is authenticated, the user will be added to the channel.
 * If there's an error (for example, the channel ID or user ID is not valid, the user is not authenticated, the channel or user does not exist, the user is deleted, the request sender is not the creator or an administrator of the channel, the user is already a member of the channel, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "User added to channel successfully"
 * }
 *
 * If the user is added to the channel successfully, the response will be a JSON object with a success message.
 */

const addUserRouter = express.Router();

addUserRouter.post(
  "/channels/:channelId/addMember/:userId",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const channelId = req.params.channelId as string;
    const userId = req.params.userId as string;
    const requestWithUser = req as RequestWithUser;

    console.log(
      "[/channels/:channelId/adduser/:userId POST] Channel ID:",
      channelId
    );
    console.log("[/channels/:channelId/adduser/:userId POST] User ID:", userId);

    /* Check if channelId and userId are valid MongoDB ObjectIDs */
    if (
      !mongoose.Types.ObjectId.isValid(channelId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      console.error(
        "[/channels/:channelId/adduser/:userId POST] Invalid channelId or userId"
      );
      return res.status(400).json({ error: "Invalid channelId or userId" });
    }

    try {
      /* Fetch the channel and user documents from the database */
      const channel = await Channel.findById(channelId);
      const user = await User.findById(userId);

      console.log(
        "[/channels/:channelId/adduser/:userId POST] Channel:",
        channel
      );
      console.log("[/channels/:channelId/adduser/:userId POST] User:", user);

      /* Check if the channel and user exist */
      if (!channel || !user) {
        console.error(
          "[/channels/:channelId/adduser/:userId POST] Channel or User not found"
        );
        return res.status(404).json({ error: "Channel or User not found" });
      }

      /* Check if the user is deleted */
      if (user.isDeleted) {
        console.error(
          "[/channels/:channelId/adduser/:userId POST] User is deleted"
        );
        return res.status(400).json({ error: "User is deleted" });
      }

      console.log("Requesting user ID:", requestWithUser.user.userId);

      /* Check if the request sender is an administrator of the channel */
      if (
        !channel.administrators
          .map((admin) => admin.toString())
          .includes(requestWithUser.user.userId)
      ) {
        console.error(
          "[/channels/:channelId/adduser/:userId POST] Request sender is not an administrator"
        );
        return res.status(403).json({
          error: "You must be an administrator to perform this action",
        });
      }

      /* Check if the user is already a member of the channel */
      if (channel.users.map((user) => user.toString()).includes(userId)) {
        console.error(
          "[/channels/:channelId/adduser/:userId POST] User is already a member of the channel"
        );
        return res.status(400).json({
          error: "User is already a member of the channel",
        });
      }

      /* Add the user to the users array of the channel and the channel to the memberChannels array of the user */
      channel.users.push(new mongoose.Types.ObjectId(userId));
      user.memberChannels.push(new mongoose.Types.ObjectId(channelId));

      console.log(
        "[/channels/:channelId/adduser/:userId POST] User added to channel"
      );

      /* Create a new notification message */
      const notificationMessage = new Message({
        content: `${requestWithUser.user.username} added ${user.username} to the channel.`,
        user: requestWithUser.user.userId,
        username: requestWithUser.user.username,
        channel: channelId,
        isNotification: true,
      });

      /* Save the notification message to the database */
      await notificationMessage.save();

      console.log(
        "[/channels/:channelId/adduser/:userId POST] Notification message saved"
      );

      /* Add the notification message to the messages array of the channel */
      channel.messages.push(notificationMessage._id);

      /* Save the updated documents to the database */
      await channel.save();
      await user.save();

      console.log(
        "[/channels/:channelId/adduser/:userId POST] Channel and user saved"
      );

      /* Create the response message object */
      const responseMessage = {
        _id: notificationMessage._id,
        content: notificationMessage.content,
        timestamp: notificationMessage.timestamp,
        user: notificationMessage.user,
        username: notificationMessage.username,
        newMember: userId,
        channel: notificationMessage.channel,
        isNotification: notificationMessage.isNotification,
        deleted: notificationMessage.deleted,
      };

      res.status(200).json({
        message: "User added to channel successfully",
        data: responseMessage,
      });
    } catch (error) {
      console.error(
        "[/channels/:channelId/adduser/:userId POST] An error occurred:",
        error
      );
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  }
);

export default addUserRouter;
