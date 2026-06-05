export const tripStartedTemplate = (
  passengerName: string,
  driverName: string,
  origin: string,
  destination: string
) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🚗 Trip Started!</h1>
  </div>

  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${passengerName}!</h2>
    <p>Your driver <strong>${driverName}</strong> has started the trip.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
      <p>📍 <strong>From:</strong> ${origin}</p>
      <p>🏁 <strong>To:</strong> ${destination}</p>
    </div>

    <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;">⚠️ <strong>Please be ready at your pickup point.</strong></p>
      <p style="margin: 8px 0 0;">You will receive an OTP when the driver arrives at your location.</p>
    </div>

    <p style="color: #666;">Have a safe journey! 🙏</p>
  </div>

  <div style="padding: 20px; text-align: center; color: #999;">
    <p>© 2026 CarpoolApp. All rights reserved.</p>
  </div>

</body>
</html>
`;
