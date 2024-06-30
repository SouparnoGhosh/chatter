import express from "express";
import User from "../../models/User.model";
import Channel from "../../models/Channel.model";
import authenticateJWT from "../../middleware/authJWT.middleware";
import mongoose from "mongoose";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";

/**
 * GET /search-users
 *
 * This route is used for searching users and optionally filtering out users who are already members of a specific channel.
 * It expects a "q" query parameter which should be a string that represents the search term.
 * It also accepts an optional "channelId" query parameter which should be a string that represents the ID of a channel.
 *
 * The route first checks if the search term is a string. If it's not, it sends a 400 status code with an error message.
 * It then searches for users whose username matches the search term (case-insensitive) in the database.
 *
 * If a channelId is provided and it's a valid MongoDB ObjectId, it finds the channel with the provided ID in the database.
 * If the channel doesn't exist, it sends a 404 status code with an error message.
 * If the channel exists, it filters out the users who are already members of the channel from the search results.
 *
 * If no channelId is provided, it returns all users whose username matches the search term.
 *
 * If there's a server error at any point (for example, a database error), it sends a 500 status code with an error message.
 *
 * Response:
 * [
 *   {
 *     "_id": "user_id",
 *     "username": "username",
 *     ...
 *   },
 *   ...
 * ]
 *
 * If the search is successful, the response will be a JSON array of user objects.
 * Each user object will have an "_id" property that represents the user's ID, a "username" property that represents the user's username, and other properties depending on your User model.
 */

const SearchUserstoAddRouter = express.Router();

SearchUserstoAddRouter.get(
  "/search-users",
  authenticateJWTWithUser,
  async (req, res) => {
    const { q: searchTerm, channelId } = req.query;

    console.log("[/search-users GET] Search term:", searchTerm);
    console.log("[/search-users GET] Channel ID:", channelId);

    if (typeof searchTerm !== "string") {
      console.error("[/search-users GET] Search term must be a string");
      return res.status(400).json({ error: "Search term must be a string" });
    }

    try {
      /* Search for users */
      const users = await User.find({
        username: new RegExp(searchTerm, "i"),
      });

      console.log("[/search-users GET] Found users:", users);

      /* If channelId is provided, filter out existing members */
      if (channelId && typeof channelId === "string") {
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
          console.error("[/search-users GET] Invalid channel ID:", channelId);
          return res.status(400).json({ error: "Invalid channel ID" });
        }

        const filteredUsers = users.filter(
          (user) =>
            !user.memberChannels.includes(
              new mongoose.Types.ObjectId(channelId)
            )
        );

        console.log("[/search-users GET] Filtered users:", filteredUsers);

        res.json(filteredUsers);
        return;
      }

      /* If no channelId is provided, return all matching users */
      console.log("[/search-users GET] Returning all matching users:", users);
      return res.json(users);
    } catch (error) {
      console.error("[/search-users GET] Database error:", error);
      res
        .status(500)
        .json({ error: "Database error: " + (error as Error).toString() });
      return;
    }
  }
);

export default SearchUserstoAddRouter;
