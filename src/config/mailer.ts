import dns from "node:dns";
import nodemailer from "nodemailer";
import env from "./env.js";

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default transporter;
