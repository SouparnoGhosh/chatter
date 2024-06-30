import express from "express";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import mongoose from "mongoose";
import { RequestWithUser } from "../../types/Types";
import Channel from "../../models/Channel.model";

/**
 * GET /channels/:channelId/isadmin
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects a channel ID as a URL parameter.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the channel ID is valid and the user is authenticated, it checks if the user is an administrator of the channel.
 * If there's an error (for example, the channel ID is not valid, the user is not authenticated, the channel does not exist, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "isAdmin": true
 * }
 *
 * If the user is an administrator of the channel, the response will be a JSON object with a property "isAdmin" set to true. If the user is not an administrator of the channel, "isAdmin" will be set to false.
 */

const isAdminRouter = express.Router();

isAdminRouter.get(
  "/channels/:channelId/isadmin",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const channelId = req.params.channelId;
    const requestWithUser = req as RequestWithUser;

    /* Check if channelId is a valid MongoDB ObjectID */
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.error(
        "[/channels/:channelId/isadmin GET] Invalid channelId:",
        channelId
      );
      return res.status(400).json({ error: "Invalid channelId" });
    }

    try {
      /* Fetch the channel document from the database */
      const channel = await Channel.findById(channelId);

      /* Check if the channel exists */
      if (!channel) {
        console.error(
          "[/channels/:channelId/isadmin GET] Channel not found:",
          channelId
        );
        return res.status(404).json({ error: "Channel not found" });
      }

      /* Check if the request sender is an administrator of the channel */
      const isAdmin = channel.administrators.some(
        (admin) => admin.toString() === requestWithUser.user.userId
      );

      console.log(
        "[/channels/:channelId/isadmin GET] Checked admin status:",
        requestWithUser.user.userId,
        channelId,
        isAdmin
      );
      res.status(200).json({ isAdmin });
    } catch (error) {
      console.error(
        "[/channels/:channelId/isadmin GET] An error occurred while processing your request:",
        error
      );
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  }
);

export default isAdminRouter;
