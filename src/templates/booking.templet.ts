export const bookingRequestTemplate = (
  driverName: string,
  passengerName: string,
  origin: string,
  destination: string,
  departureTime: string,
  seats: number
) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">CarpoolApp</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${driverName}!</h2>
    <p><strong>${passengerName}</strong> has requested to join your trip.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p>🚗 <strong>Trip:</strong> ${origin} → ${destination}</p>
      <p>📅 <strong>Departure:</strong> ${departureTime}</p>
      <p>💺 <strong>Seats requested:</strong> ${seats}</p>
    </div>
    <p>Please log in to accept or reject this booking request.</p>
  </div>
</body>
</html>
`;

export const bookingAcceptedTemplate = (
  passengerName: string,
  driverName: string,
  origin: string,
  destination: string,
  departureTime: string
) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #10B981; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${passengerName}!</h2>
    <p>Great news! <strong>${driverName}</strong> has accepted your booking.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p>🚗 <strong>Trip:</strong> ${origin} → ${destination}</p>
      <p>📅 <strong>Departure:</strong> ${departureTime}</p>
    </div>
    <p>You will receive an OTP when the trip is about to start.</p>
  </div>
</body>
</html>
`;

export const bookingRejectedTemplate = (
  passengerName: string,
  origin: string,
  destination: string
) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #EF4444; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Booking Update</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${passengerName}!</h2>
    <p>Unfortunately your booking for <strong>${origin} → ${destination}</strong> was not accepted.</p>
    <p>Please search for another available trip.</p>
  </div>
</body>
</html>
`;
