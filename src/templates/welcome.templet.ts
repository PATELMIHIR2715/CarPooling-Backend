export const welcomeTemplate = (name: string, role: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to CarpoolApp! 🚗</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${name}!</h2>
    <p>Welcome to CarpoolApp! Your account has been created successfully as a <strong>${role}</strong>.</p>
    ${
      role === "DRIVER"
        ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Next Steps:</h3>
      <p>1. Complete your profile</p>
      <p>2. Add your car details</p>
      <p>3. Upload your documents for verification</p>
      <p>4. Start creating trips!</p>
    </div>
    `
        : `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Next Steps:</h3>
      <p>1. Complete your profile</p>
      <p>2. Search for available trips</p>
      <p>3. Book your first ride!</p>
    </div>
    `
    }
  </div>
</body>
</html>
`;
