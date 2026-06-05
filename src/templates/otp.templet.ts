export const otpTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">CarpoolApp</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${name}!</h2>
    <p>Your trip is about to start. Share this OTP with your driver to confirm boarding:</p>
    <div style="background: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <h1 style="color: #4F46E5; font-size: 48px; letter-spacing: 10px; margin: 0;">${otp}</h1>
    </div>
    <p style="color: #666;">This OTP expires in <strong>10 minutes</strong>.</p>
    <p style="color: #666;">Do not share this OTP with anyone other than your driver.</p>
  </div>
  <div style="padding: 20px; text-align: center; color: #999;">
    <p>© 2026 CarpoolApp. All rights reserved.</p>
  </div>
</body>
</html>
`;
