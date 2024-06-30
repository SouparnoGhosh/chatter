import { Response, Request, NextFunction } from "express";

export interface IUser {
  email?: string | null;
  emailVerificationToken?: string | null;
  passwordResetToken?: string;
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    isDeleted: boolean;
  };
}

export type RequestHandlerWithUser = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type RequestHandlerWithUserRequest = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
