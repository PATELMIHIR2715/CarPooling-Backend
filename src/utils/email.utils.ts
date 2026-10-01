import transporter from "../config/mailer.js";
import env from "../config/env.js";

export const sendEmail = async (to: string, subject: string, html: string) => {
  // 1. Try sending via Resend API (Direct HTTPS REST - Deliveries in ~1 second)
  if (env.RESEND_API_KEY) {
    try {
      const from = env.RESEND_FROM || "Carpooling <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });

      const result = (await response.json()) as { id?: string; message?: string };
      if (response.ok && result?.id) {
        console.log(`[Resend] Email sent in <1s (ID: ${result.id}) to: ${to}`);
        return;
      }

      console.warn(
        `[Resend] Failed (${result?.message || response.statusText}), falling back to SMTP...`
      );
    } catch (resendError) {
      console.warn("[Resend] Network error, falling back to SMTP...", resendError);
    }
  }

  // 2. Fallback to Nodemailer SMTP (with connection pool)
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
  console.log(`[SMTP] Email sent via SMTP to: ${to}`);
};
