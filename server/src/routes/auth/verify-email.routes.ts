import express from "express";
import User from "../../models/User.model";

/**
 * GET /verify-email
 *
 * Headers:
 * Content-Type: application/json
 *
 * Query Parameters:
 * {
 *   "token": "your_email_verification_token"
 * }
 *
 * This route expects a "token" query parameter in the request URL.
 * The "token" parameter should be a string that represents the email verification token of the user who is verifying their email.
 *
 * If the token matches a user in the database, the user's email is marked as verified and the email verification token is cleared from the user's document.
 * If there's an error (for example, if no token is provided, if the token doesn't match a user, or if there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "Email verified successfully"
 * }
 *
 * If the email verification is successful, the response will be a JSON object with a "message" property.
 * The "message" property is a string that indicates the email verification was successful.
 */

const verifyEmailRouter = express.Router();

verifyEmailRouter.get("/verify-email", async (req, res) => {
  console.log("[/verify-email GET] Received request to verify email");

  const token = req.query.token;

  if (!token) {
    console.error("[/verify-email GET] No email verification token provided");
    return res
      .status(400)
      .json({ error: "No email verification token provided" });
  }

  /* Find the user with the matching token */
  let user;
  try {
    user = await User.findOne({ emailVerificationToken: token });
  } catch (error) {
    console.error("[/verify-email GET] Database error:", error);
    return res.status(500).json({ error: "Database error." });
  }

  if (!user) {
    console.error("[/verify-email GET] Invalid or expired verification token");
    return res
      .status(400)
      .json({ error: "Invalid or expired verification token" });
  }

  /* Set the user's isEmailVerified field to true */
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined; /* Clear the verification token */
  try {
    await user.save();
  } catch (error) {
    console.error("[/verify-email GET] Database error:", error);
    return res.status(500).json({ error: "Database error." });
  }

  console.log("[/verify-email GET] Email verified successfully");
  res.json({ message: "Email verified successfully" });
});

export default verifyEmailRouter;
