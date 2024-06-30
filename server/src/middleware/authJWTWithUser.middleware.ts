import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../types/Types";
import dotenv from "dotenv";

dotenv.config();

const authenticateJWTWithUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[authenticateJWTWithUser middleware] Starting authentication");
  const authHeader = req.headers.authorization;

  if (authHeader) {
    console.log(
      "[authenticateJWTWithUser middleware] Authorization header found"
    );
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      console.error(
        "[authenticateJWTWithUser middleware] Authorization header is not formatted correctly"
      );
      return res.sendStatus(400);
    }

    const token = parts[1];

    if (!process.env.JWT_SECRET) {
      console.error(
        "[authenticateJWTWithUser middleware] JWT_SECRET is not set"
      );
      return res.sendStatus(500);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error(
          "[authenticateJWTWithUser middleware] Error verifying token:",
          err
        );
        return res.sendStatus(403);
      }

      if (typeof user === "object" && user !== null) {
        console.log(
          "[authenticateJWTWithUser middleware] User verified successfully"
        );
        console.log(
          "[authenticateJWTWithUser middleware] User ID:",
          user.userId
        );
        (req as RequestWithUser).user = user as {
          userId: string;
          username: string;
          isDeleted: boolean;
        };
        next();
      } else {
        console.error(
          "[authenticateJWTWithUser middleware] User verification failed"
        );
        res.sendStatus(403);
      }
    });
  } else {
    console.error(
      "[authenticateJWTWithUser middleware] No authorization header found"
    );
    res.sendStatus(401);
  }
};

export default authenticateJWTWithUser;
