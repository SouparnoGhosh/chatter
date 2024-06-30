import express from "express";
import crypto from "crypto";
import User from "../../models/User.model";
import sendPasswordResetEmail from "../../utils/sendPasswordResetEmail";

//! Checked in Postman

/**
 * POST /request-password-reset
 *
 * Headers:
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * This route expects a JSON object in the request body with an "email" property.
 * The "email" property should be a string that represents the email address of the user who is requesting the password reset.
 */

const requestPasswordResetRouter = express.Router();

requestPasswordResetRouter.post("/request-password-reset", async (req, res) => {
  console.log("[/request-password-reset POST] Received password reset request");

  const { email } = req.body;

  if (!email) {
    console.error(
      "[/request-password-reset POST] User Email is required to request a password reset."
    );
    return res
      .status(400)
      .json({ error: "User Email is required to request a password reset." });
  }

  console.log(
    `[/request-password-reset POST] Finding user with email: ${email}`
  );
  const user = await User.findOne({ email });

  if (!user) {
    console.error(
      "[/request-password-reset POST] No account with that email address exists."
    );
    return res
      .status(400)
      .json({ error: "No account with that email address exists." });
  }

  if (!user.isEmailVerified) {
    console.error(
      "[/request-password-reset POST] The user email is not verified."
    );
    return res.status(400).json({ error: "The user email is not verified." });
  }

  if (user.isDeleted) {
    console.error(
      "[/request-password-reset POST] The user account has been deleted."
    );
    return res
      .status(400)
      .json({ error: "The user account has been deleted." });
  }

  console.log(
    "[/request-password-reset POST] User found, generating password reset token"
  );
  user.passwordResetToken = crypto.randomBytes(20).toString("hex");
  user.passwordResetExpires = new Date(
    Date.now() + 3600000
  ); /* 1 hour from now */

  console.log(
    "[/request-password-reset POST] Saving user with new password reset token"
  );
  try {
    await user.save();
  } catch (error) {
    console.error(
      "[/request-password-reset POST] Error saving user with new password reset token:",
      error
    );
    return res.status(500).json({ error: "Error saving user." });
  }

  if (!user.email) {
    console.error("[/request-password-reset POST] User email is not defined.");
    return res.status(500).json({ error: "User email is not defined." });
  }

  console.log("[/request-password-reset POST] Sending password reset email");
  const userForEmail = {
    email: user.email,
    emailVerificationToken: user.emailVerificationToken,
    passwordResetToken: user.passwordResetToken,
  };
  await sendPasswordResetEmail(userForEmail);

  console.log("[/request-password-reset POST] Password reset email sent");
  res.json({ message: "Password reset email sent." });
});

export default requestPasswordResetRouter;