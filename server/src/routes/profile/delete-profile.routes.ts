import express from "express";
import bcrypt from "bcrypt";
import User from "../../models/User.model";
import authenticateJWTWithUser from "../../middleware/authJWTWithUser.middleware";
import { RequestWithUser } from "../../types/Types";

/**
 * DELETE /delete-profile
 *
 * Headers:
 * Authorization: Bearer your_jwt_token
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "password": "your_password"
 * }
 *
 * This route expects a JWT in the Authorization header and a JSON object in the request body with a "password" property.
 * The "password" property should be a string that represents the password of the user who is deleting their profile.
 *
 * If the JWT is valid and the provided password matches the user's password, the user's profile will be deleted and a success message will be sent in the response.
 * If there's an error (for example, the JWT is invalid, the provided password does not match the user's password, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "Profile deleted successfully"
 * }
 *
 * If the profile deletion is successful, the response will be a JSON object with a "message" property.
 * The "message" property is a string that represents a success message.
 */

const profileDeleteRouter = express.Router();

profileDeleteRouter.delete(
  "/delete-profile",
  authenticateJWTWithUser,
  async (req: express.Request, res: express.Response) => {
    const requestWithUser = req as RequestWithUser;
    const { password } = req.body;

    if (!password) {
      console.error("[/delete-profile DELETE] Password not provided");
      return res.status(400).json({ error: "Password not provided" });
    }

    let user;
    try {
      /* Find the user with the matching username */
      user = await User.findOne({
        username: requestWithUser.user.username,
      });
    } catch (error) {
      console.error("[/delete-profile DELETE] Error finding user", error);
      return res.status(500).json({ error: "Error finding user" });
    }

    if (!user) {
      console.error(
        "[/delete-profile DELETE] User not found",
        requestWithUser.user.username
      );
      return res.status(404).json({ error: "User not found" });
    }

    /* Compare the provided password with the user's password */
    let passwordMatches;
    try {
      passwordMatches = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error(
        "[/delete-profile DELETE] Error comparing passwords",
        error
      );
      return res.status(500).json({ error: "Error comparing passwords" });
    }

    if (!passwordMatches) {
      console.error(
        "[/delete-profile DELETE] Incorrect password",
        requestWithUser.user.username
      );
      return res.status(401).json({ error: "Incorrect password" });
    }

    /* Set the user's isDeleted property to true and save the user */
    try {
      user.isDeleted = true;
      await user.save();
    } catch (error) {
      console.error("[/delete-profile DELETE] Error deleting profile", error);
      return res.status(500).json({ error: "Error deleting profile" });
    }

    console.log("[/delete-profile DELETE] Profile deleted successfully");
    return res.status(200).json({ message: "Profile deleted successfully" });
  }
);

export default profileDeleteRouter;
