import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://lexaid-mu.vercel.app")

async def send_verification_email(to_email: str, token: str):
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 42px;">⚖️</span>
                <h1 style="color: #1a1f3a; margin: 8px 0 0 0; font-size: 24px;">LexAid</h1>
                <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">AI-Powered Legal Super App</p>
            </div>
            
            <h2 style="color: #1a1f3a; font-size: 18px; margin-bottom: 12px;">Verify Your Email Address</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                Thank you for joining LexAid. Please confirm your email address (<strong>{to_email}</strong>) to activate full access to document generation, AI legal tools, and lawyer consultations.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{verify_url}" style="background-color: #e63946; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(230,57,70,0.3);">
                    ✓ Verify Email Address
                </a>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 12px; margin-top: 24px; border: 1px border-gray-200;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0; word-break: break-all; text-align: center;">
                    If the button above does not work, copy and paste this link into your browser:<br>
                    <a href="{verify_url}" style="color: #1a1f3a;">{verify_url}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    if SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Verify Your LexAid Email Address"
            msg["From"] = f"LexAid Legal <{SMTP_USER}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"✓ Real email verification sent to {to_email}")
            return True
        except Exception as e:
            print(f"x Failed to send SMTP email: {e}")
            return False
    else:
        print(f"\n================ MOCK EMAIL INBOX ==================")
        print(f"To: {to_email}")
        print(f"Subject: Verify Your LexAid Email Address")
        print(f"Verification URL: {verify_url}")
        print(f"====================================================\n")
        return True
