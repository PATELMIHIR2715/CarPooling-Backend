export const paymentReceivedTemplate = (
  passengerName: string,
  driverName: string,
  origin: string,
  destination: string,
  departureTime: string
) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0F766E; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Payment Received</h1>
  </div>
  <div style="padding: 30px; background: #f8fafc;">
    <h2>Hi ${passengerName}!</h2>
    <p>Your payment for the trip with <strong>${driverName}</strong> has been received successfully.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Trip:</strong> ${origin} to ${destination}</p>
      <p><strong>Departure:</strong> ${departureTime}</p>
    </div>
    <p>Your booking remains confirmed, and you will receive trip updates closer to departure.</p>
  </div>
</body>
</html>
`;
