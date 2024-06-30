import express from "express";
import Channel from "../../models/Channel.model";
import User from "../../models/User.model";
import Message from "../../models/Message.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

/**
 * POST /channels/create
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "name": "your_channel_name"
 * }
 *
 * This route expects a JSON object in the request body with a "name" property.
 * The "name" property should be a string that represents the name of the channel being created.
 *
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel name is valid and the user is authenticated, a new channel will be created with the authenticated user as the creator and the first member.
 * If there's an error (for example, the channel name is not provided, the user is not authenticated, a channel with the same name already exists, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "_id": "channel_id"
 * }
 *
 * If the channel is created successfully, the response will be a JSON object with the ID of the new channel.
 */

const createChannelRouter = express.Router();

createChannelRouter.post(
  "/channels/create",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const requestWithUser = req as RequestWithUser;

    /* Check if request body is valid */
    if (
      !requestWithUser.body.name ||
      !requestWithUser.user ||
      !requestWithUser.user.username
    ) {
      console.error(
        "[/create-channel POST] Invalid request body",
        requestWithUser.body
      );
      return res.status(400).json({ error: "Invalid request body" });
    }

    try {
      /* Check if user is authenticated */
      const user = await User.findOne({
        username: requestWithUser.user.username,
      });
      if (!user) {
        console.error(
          "[/create-channel POST] User not found",
          requestWithUser.user.username
        );
        return res
          .status(401)
          .json({ error: "Channel not created. User not found" });
      }

      /* Check if channel already exists */
      const existingChannel = await Channel.findOne({
        name: requestWithUser.body.name,
      });
      if (existingChannel) {
        console.error(
          "[/create-channel POST] Channel already exists",
          requestWithUser.body.name
        );
        return res.status(409).json({ error: "Channel already exists" });
      }

      /* Create a new Channel document using the request body and the fetched user */
      const newChannelData = {
        name: requestWithUser.body.name,
        creator: user._id,
        administrators: [user._id],
        users: [user._id],
        messages: [],
        lastMessage: null,
      };
      const newChannel = new Channel(newChannelData);

      /* Save the Channel document to the database */
      const savedChannel = await newChannel.save();

      /* Add the created channel to the user's memberChannels and adminChannels arrays */
      user.administeredChannels.push(savedChannel._id);
      user.memberChannels.push(savedChannel._id);
      console.log("Before Save", user);
      await user.save();
      const updated_user = await User.findById(user._id);
      console.log("After Save", updated_user);

      /* Create a new Message document with the notification content */
      const notificationMessage = new Message({
        content: `${requestWithUser.user.username} created the channel.`,
        user: user._id,
        channel: savedChannel._id,
      });

      /* Save the Message document to the database */
      await notificationMessage.save();

      /* Add the message to the channel's messages array */
      savedChannel.messages.push(notificationMessage._id);

      /* Save the updated Channel document to the database */
      await savedChannel.save();

      console.log(
        "[/create-channel POST] Channel created successfully",
        savedChannel
      );
      res.status(200).json({
        _id: savedChannel._id,
      }); /* Only return the ID of the created channel */
    } catch (error) {
      console.error("[/create-channel POST] Error creating channel", error);

      /* Send a 500 error response if something goes wrong */
      res
        .status(500)
        .json({ error: "An error occurred while creating the channel" });
    }
  }
);

export default createChannelRouter;
