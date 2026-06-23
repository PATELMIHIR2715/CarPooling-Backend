export const registrationOtpTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563EB; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify your email</h1>
  </div>
  <div style="padding: 30px; background: #f8fafc;">
    <h2>Hi ${name}!</h2>
    <p>Use the OTP below to complete your CarpoolApp registration.</p>
    <div style="background: white; border: 2px dashed #2563EB; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <h1 style="color: #2563EB; font-size: 42px; letter-spacing: 8px; margin: 0;">${otp}</h1>
    </div>
    <p style="color: #475569;">This OTP expires in <strong>10 minutes</strong>.</p>
    <p style="color: #475569;">If you did not request this registration, you can ignore this email.</p>
  </div>
</body>
</html>
`;
