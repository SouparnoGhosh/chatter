import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.model";

/**
 * POST /login
 *
 * Headers:
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "username": "your_username",
 *   "password": "your_password"
 * }
 *
 * This route expects a JSON object in the request body with a "username" property and a "password" property.
 * The "username" property should be a string that represents the username of the user who is logging in.
 * The "password" property should be a string that represents the password of the user.
 *
 * If the username and password match a user in the database, and the user's email is verified, a JWT will be generated and sent in the response.
 * If there's an error (for example, the username and password don't match a user, the user's email is not verified, or there's a server error), an error message will be sent in the response.
 *
 * Response:
 * {
 *   "token": "your_jwt_token"
 * }
 *
 * If the login is successful, the response will be a JSON object with a "token" property.
 * The "token" property is a string that represents the JWT for the logged-in user.
 * This token should be stored on the client side and included in the Authorization header in subsequent requests for authentication.
 */

const loginRouter = express.Router();

/* Define POST route for login */
loginRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("[/login POST] Received login request");

  let user;
  try {
    /* Find the user with the matching username */
    user = await User.findOne({ username });
  } catch (error) {
    console.error("[/login POST] Database error:", error);
    return res.status(500).json({ error: "Database error." });
  }

  if (!user) {
    console.error("[/login POST] Invalid username or password");
    return res.status(400).json({ error: "Invalid username or password" });
  }
  console.log("[/login POST] User found");

  if (!password || !user.password) {
    console.error("[/login POST] Password not provided");
    return res.status(400).json({ error: "Password not provided" });
  }

  let passwordMatch;
  try {
    /* Compare the provided password with the hashed password in the database */
    passwordMatch = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.error("[/login POST] Bcrypt error:", error);
    return res.status(500).json({ error: "Bcrypt error." });
  }

  //! Only for testing
  /*  if (password !== user.password) { */
  //! Use in development
  if (!passwordMatch) {
    console.error("[/login POST] Invalid username or password");
    return res.status(400).json({ error: "Invalid username or password" });
  }
  console.log("[/login POST] Password matched to database");

  /* Check that the user's email is verified */
  if (!user.isEmailVerified) {
    console.error("[/login POST] Email not verified");
    return res.status(400).json({ error: "Email not verified" });
  }
  console.log("[/login POST] Email is verified");

  /* If everything checks out, generate a JWT and send it in the response */
  if (process.env.JWT_SECRET) {
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
    } catch (error) {
      console.error("[/login POST] JWT error:", error);
      return res.status(500).json({ error: "JWT error." });
    }

    res.json({ token });
    console.log("[/login POST] JWT generated and sent");
  } else {
    console.error("[/login POST] JWT_SECRET environment variable not set");
    return res
      .status(500)
      .json({ error: "JWT_SECRET environment variable not set" });
  }
});

export default loginRouter;
