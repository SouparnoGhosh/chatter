import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../types/Types";
import dotenv from "dotenv";

dotenv.config();

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  console.log("[authJWT middleware] Starting authentication");
  const authHeader = req.headers.authorization;

  if (authHeader) {
    console.log("[authJWT middleware] Authorization header found");
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        console.error("[authJWT middleware] Error verifying token:", err);
        return res.sendStatus(403);
      }

      if (typeof user === "object" && user !== null) {
        console.log("[authJWT middleware] User verified successfully");
        (req as RequestWithUser).user = user;
        next();
      } else {
        console.error("[authJWT middleware] User verification failed");
        res.sendStatus(403);
      }
    });
  } else {
    console.error("[authJWT middleware] No authorization header found");
    res.sendStatus(401);
  }
};

export default authenticateJWT;