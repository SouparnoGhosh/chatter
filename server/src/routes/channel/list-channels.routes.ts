/* list-channels.routes.ts */
import express from "express";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

/**
 * GET /channels
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route does not expect any URL parameters or request body.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the user is authenticated, a list of all the channels the user is a member of will be fetched and returned.
 * If there's an error (for example, the user is not authenticated, the user does not exist, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * [
 *   {
 *     "_id": "channel_id",
 *     "name": "channel_name",
 *     "lastMessage": "last_message_id"
 *   },
 *   ...
 * ]
 *
 * If the channels are fetched successfully, the response will be a JSON array with the details of the channels.
 */

const listChannelsRouter = express.Router();

listChannelsRouter.get(
  "/channels",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const requestWithUser = req as RequestWithUser;

    try {
      /* Fetch the authenticated user's document from the database */
      const user = await User.findOne({
        username: requestWithUser.user.username,
      }).populate({
        path: "memberChannels",
        select: "_id name lastMessage",
      });

      if (!user) {
        console.error(
          "[/channels GET] User not found",
          requestWithUser.user.username
        );
        return res
          .status(401)
          .json({ error: "Channels not fetched. User not found" });
      }

      console.log(
        "[/channels GET] Successfully fetched channels for user",
        requestWithUser.user.username
      );

      /* Return the list of channels the user is a member of */
      res.json(user.memberChannels);
    } catch (error) {
      console.error("[/channels GET] Error getting channels", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting the channels" });
    }
  }
);
export default listChannelsRouter;
