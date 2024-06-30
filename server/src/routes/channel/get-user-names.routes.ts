/* user-names.routes.ts */
import express from "express";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";

/**
 * POST /users/names
 *
 * Headers:
 * Authorization Bearer your_jwt_token
 *
 * This route expects an array of user IDs in the request body.
 * The user making the request should be authenticated, and their JWT should be included in the Authorization header.
 *
 * If the user IDs are valid and the user is authenticated, the names of the users will be fetched and returned.
 * If there's an error (for example, a user ID is not valid, the user is not authenticated, a user does not exist, or there's a server error), an error message will be sent in the response.
 *
 * Request:
 * {
 *   "userIds": ["user_id1", "user_id2", ...]
 * }
 *
 * Response:
 * [
 *   {
 *     "userId": "user_id1",
 *     "username": "user_name1"
 *   },
 *   {
 *     "userId": "user_id2",
 *     "username": "user_name2"
 *   },
 *   ...
 * ]
 *
 * If the user names are fetched successfully, the response will be a JSON array with objects containing the user IDs and names.
 */

const userRouter = express.Router();

userRouter.post(
  "/users/names",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const userIds = req.body.userIds;

    try {
      /* Fetch the users' documents from the database */
      const users = await User.find({
        _id: { $in: userIds },
      });

      /* Extract the IDs and names of the users */
      const userInfo = users.map((user) => ({
        userId: user._id,
        username: user.username,
      }));

      /* Return the user IDs and names */
      res.json(userInfo);
    } catch (error) {
      console.error("[/users/names POST] Error getting user names", error);
      res
        .status(500)
        .json({ error: "An error occurred while getting the user names" });
    }
  }
);

export default userRouter;
