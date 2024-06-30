/* routes/auth.routes.ts */
import express from "express";
import signupRouter from "./signup.routes";
import verifyEmailRouter from "./verify-email.routes";
import loginRouter from "./login.routes";
import requestPasswordResetRouter from "./request-password-reset.routes";
import passwordResetRouter from "./password-reset.routes";

const authRouter = express.Router();

authRouter.use("/", signupRouter);
authRouter.use("/", verifyEmailRouter);
authRouter.use("/", loginRouter);
authRouter.use("/", requestPasswordResetRouter);
authRouter.use("/", passwordResetRouter);

export default authRouter;
