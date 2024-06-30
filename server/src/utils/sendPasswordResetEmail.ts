import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { IUser } from "../types/Types";

dotenv.config();

//! Checked

async function sendPasswordResetEmail(user: IUser) {
  console.log("[send-password-reset-email] Setting up email transport");

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log("[send-password-reset-email] Creating password reset URL");
  // let resetUrl = `http://localhost:5173/reset-password?token=${user.passwordResetToken}`;
  let resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${user.passwordResetToken}`;

  if (!user.email) {
    console.error("[send-password-reset-email] User email is not defined.");
    return;
  }

  console.log(`[] resetUrl: ${resetUrl}`);

  console.log("[send-password-reset-email] Setting up email options");
  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: "Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  console.log("[send-password-reset-email] Sending email");
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`Info ${info}`);
    console.log("[send-password-reset-email] Email sent: " + info.response);
    console.log("[send-password-reset-email] resetUrl:", resetUrl);
  } catch (error) {
    console.error("[send-password-reset-email] Error sending email:", error);
  }
}

export default sendPasswordResetEmail;
