import express from "express";
import bcrypt from "bcrypt";
import User from "../../models/User.model";

//! Checked in Postman

/**
 * POST /password-reset
 *
 * Headers:
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "passwordResetToken": "your_password_reset_token",
 *   "newPassword": "your_new_password"
 * }
 *
 * This route expects a JSON object in the request body with a "passwordResetToken" property and a "newPassword" property.
 * The "passwordResetToken" property should be a string that represents the password reset token of the user who is resetting their password.
 * The "newPassword" property should be a string that represents the new password the user wants to set.
 */

const passwordResetRouter = express.Router();

passwordResetRouter.post("/password-reset", async (req, res) => {
  const { passwordResetToken, newPassword } = req.body;

  if (!passwordResetToken || !newPassword) {
    console.error(
      "[/password-reset POST] Missing password reset token or new password."
    );
    return res
      .status(400)
      .json({ error: "Missing password reset token or new password." });
  }

  console.log("[/password-reset POST] Finding user with password reset token");
  let user;
  try {
    user = await User.findOne({ passwordResetToken });
  } catch (error) {
    console.error("[/password-reset POST] Database error:", error);
    return res.status(500).json({ error: "Database error." });
  }

  if (!user) {
    console.error("[/password-reset POST] Invalid password reset token.");
    return res.status(400).json({ error: "Invalid password reset token." });
  }

  if (
    user.passwordResetExpires &&
    user.passwordResetExpires.getTime() < Date.now()
  ) {
    console.error("[/password-reset POST] Password reset token has expired.");
    return res.status(400).json({ error: "Password reset token has expired." });
  }

  console.log("[/password-reset POST] Hashing new password");
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 10);
  } catch (error) {
    console.error("[/password-reset POST] Bcrypt error:", error);
    return res.status(500).json({ error: "Bcrypt error." });
  }

  console.log(
    "[/password-reset POST] Updating user password and clearing password reset token"
  );
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  console.log("[/password-reset POST] Saving user");
  try {
    await user.save();
  } catch (error) {
    console.error("[/password-reset POST] Database error:", error);
    return res.status(500).json({ error: "Database error." });
  }

  console.log("[/password-reset POST] Password reset successful.");
  res.json({ message: "Password reset successful." });
});

export default passwordResetRouter;
