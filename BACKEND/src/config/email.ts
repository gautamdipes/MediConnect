import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "./constant";

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email delivery is not configured. Add EMAIL_USER and EMAIL_PASS to BACKEND/.env.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `MediConnect <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
