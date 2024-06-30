import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../models/User.model";
import sendVerificationEmail from "../../utils/sendVerificationEmail";
import { IUser } from "../../types/Types";

import dotenv from "dotenv";
dotenv.config();

/**
 * POST /signup
 *
 * Headers:
 * Content-Type: application/json
 *
 * Request Body:
 * {
 *   "username": "your_username",
 *   "password": "your_password",
 *   "email": "your_email"
 * }
 *
 * This route expects a JSON object in the request body with a "username" property, a "password" property, and an "email" property.
 * The "username" property should be a string that represents the username of the user who is signing up.
 * The "password" property should be a string that represents the password of the user.
 * The "email" property should be a string that represents the email of the user.
 *
 * If the username and email are unique, a new user will be created in the database, and a verification email will be sent to the provided email address.
 * If there's an error (for example, if the username or email is already in use, if there's a server error, or if the verification email cannot be sent), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "message": "User created. Please verify your email."
 * }
 *
 * If the signup is successful, the response will be a JSON object with a "message" property.
 * The "message" property is a string that indicates the signup was successful and that a verification email has been sent.
 */

const signupRouter = express.Router();

/* POST /signup route */
signupRouter.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  console.log("[/signup POST] Received signup request");

  /* Check if a user with the same username already exists */
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    console.error("[/signup POST] Username already in use");
    return res.status(400).json({ error: "Username already in use" });
  }

  /* Check if a user with the same email already exists */
  const existingEmailUser = await User.findOne({ email });
  if (existingEmailUser) {
    console.error("[/signup POST] Email already in use");
    return res.status(400).json({ error: "Email already in use" });
  }

  /* Hash the password */
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log("[/signup POST] Hashed password");
  } catch (error) {
    console.error("[/signup POST] Error hashing password", error);
    return res.status(500).json({ error: "Error hashing password." });
  }

  /* Generate email verification token */
  const emailVerificationToken = crypto.randomBytes(20).toString("hex");

  /* Create new user */
  const user = new User({
    username,
    password: hashedPassword,
    email,
    emailVerificationToken,
  });
  console.log("[/signup POST] Created user");

  try {
    /* Save the user to the database */
    await user.save();
    console.log("[/signup POST] Saved user");

    /* Send verification email */
    try {
      await sendVerificationEmail(user as IUser);
      console.log("[/signup POST] Sent verification email");
      res.status(201).json({
        message: "User created. Please verify your email.",
      });
    } catch (error) {
      console.error("[/signup POST] Error sending email", error);
      /* If the email sending fails, delete the user */
      await User.deleteOne({ _id: user._id });
      console.log("[/signup POST] Deleted user");
      res.status(500).json({
        error: "User not created as verification email could not be sent.",
      });
    }
  } catch (error) {
    console.error("[/signup POST] Error creating user.", error);
    res.status(500).json({ error: "Error creating user." });
  }
});

export default signupRouter;
