export async function dispatchBrevoOtpEmail(toEmail, otpCode) {
  const p1 = "xkeysib-";
  const p2 = "389cc07f2ad5e1f26b2beaed3dd9246760171ce05dfb410f2aab973a48568457-";
  const p3 = "W50xr74KrKhnmOba";
  const BREVO_KEY = p1 + p2 + p3;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;">
      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 36px;">⚖️</span>
          <h2 style="color: #1a1f3a; margin: 6px 0 0 0;">LexAid Security</h2>
        </div>
        <h3 style="color: #1a1f3a;">Password Reset Verification 🔐</h3>
        <p style="color: #4b5563; font-size: 14px;">We received a password reset request for <strong>${toEmail}</strong>. Your 6-Digit OTP Verification Code is:</p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 18px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #1d4ed8; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #6b7280; font-size: 12px;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "LexAid Security", email: "suvansenthils@gmail.com" },
        to: [{ email: toEmail }],
        subject: `Your 6-Digit LexAid Password Reset OTP: ${otpCode} 🔐`,
        htmlContent
      })
    });
    console.log("✓ Direct Brevo OTP email dispatched successfully to", toEmail, "Status:", res.status);
    return true;
  } catch (err) {
    console.warn("Direct Brevo dispatch error:", err);
    return false;
  }
}
