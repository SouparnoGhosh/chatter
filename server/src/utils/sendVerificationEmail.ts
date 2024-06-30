import nodemailer from "nodemailer";
import { IUser } from "../types/Types";
import dotenv from "dotenv";
dotenv.config();

async function sendVerificationEmail(user: IUser) {
  /* Create a transporter using Gmail's service and the provided email username and password */
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME /* Your email username */,
      pass: process.env.EMAIL_PASSWORD /* Your email app password */,
    },
  });
  console.log("[sendVerificationEmail] Created transporter");

  /* Create a URL for the email verification link using the user's email verification token */
  // let verificationUrl = `http://localhost:5173/verify-email?token=${user.emailVerificationToken}`;
  let verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`
  console.log("[sendVerificationEmail] Created verification URL");

  console.log(`[sendVerificationEmail] verificationUrl: ${verificationUrl}`)

  /* If the user's email is not defined, log an error and return */
  if (!user.email) {
    console.error("[sendVerificationEmail] User email is not defined.");
    return;
  }

  /* Set up email data with the sender address, receiver address, subject line, and body */
  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: "Email Verification",
    text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    html: `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  };
  console.log("[sendVerificationEmail] Set up email data");

  /* Send the email and log the message ID */
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("[sendVerificationEmail] Message sent: %s", info.messageId);
  } catch (error) {
    /* If there's an error sending the email, log the error and throw it so it can be caught and handled in the route handler */
    console.error("[sendVerificationEmail] Error sending email", error);
    throw error;
  }
}

export default sendVerificationEmail;
