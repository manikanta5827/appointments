import nodemailer from "nodemailer";
import { loadTemplate } from "../utils/templateLoader.js";

if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Email user or password are not defined in env file , please check it");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (to, subject, templateName, variables) => {
  console.log(to, subject, templateName, variables.receiverName);
  try {
    const html = loadTemplate(templateName, variables);

    await transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};
