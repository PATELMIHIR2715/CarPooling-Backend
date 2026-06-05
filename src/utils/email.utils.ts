import transporter from "../config/mailer.js";
import env from "../config/env.js";

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
};
