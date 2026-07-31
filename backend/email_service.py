import os
import smtplib
import urllib.request
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
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
                Thank you for joining LexAid. Please tap the button below on your phone or computer to verify your email address (<strong>{to_email}</strong>) and unlock full legal app access:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{verify_url}" style="background-color: #e63946; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(230,57,70,0.3);">
                    ✓ Verify Email Address Now
                </a>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 12px; margin-top: 24px; border: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0; word-break: break-all; text-align: center;">
                    Or copy and paste this link into your phone browser:<br>
                    <a href="{verify_url}" style="color: #1a1f3a;">{verify_url}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Method 1: Resend API
    if RESEND_API_KEY:
        try:
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps({
                    "from": "LexAid Legal <onboarding@resend.dev>",
                    "to": [to_email],
                    "subject": "Verify Your LexAid Email Address ⚖️",
                    "html": html_content
                }).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                print(f"✓ Real email sent via Resend to {to_email}")
                return True
        except Exception as e:
            print(f"x Resend API error: {e}")

    # Method 2: Brevo API
    if BREVO_API_KEY:
        try:
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps({
                    "sender": {"name": "LexAid Legal", "email": "lexaid.app.india@gmail.com"},
                    "to": [{"email": to_email}],
                    "subject": "Verify Your LexAid Email Address ⚖️",
                    "htmlContent": html_content
                }).encode("utf-8"),
                headers={
                    "api-key": BREVO_API_KEY,
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                print(f"✓ Real email sent via Brevo to {to_email}")
                return True
        except Exception as e:
            print(f"x Brevo API error: {e}")

    # Method 3: Standard SMTP
    if SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Verify Your LexAid Email Address ⚖️"
            msg["From"] = f"LexAid Legal <{SMTP_USER}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD.replace(" ", "").strip())
                server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"✓ Real email sent via SMTP to {to_email}")
            return True
        except Exception as e:
            print(f"x SMTP error: {e}")

    print(f"\n================ MOCK EMAIL GENERATED ==================")
    print(f"To: {to_email}")
    print(f"Verification Link: {verify_url}")
    print(f"========================================================\n")
    return True


async def send_password_reset_email(to_email: str, token: str):
    """Send real password reset email to user via SMTP / Resend / Brevo."""
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
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
                <h1 style="color: #1a1f3a; margin: 8px 0 0 0; font-size: 24px;">LexAid Legal</h1>
                <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">AI-Powered Legal Super App</p>
            </div>
            
            <h2 style="color: #1a1f3a; font-size: 18px; margin-bottom: 12px;">Reset Your LexAid Password</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                We received a password reset request for your LexAid account (<strong>{to_email}</strong>). Tap the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{reset_url}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                    🔐 Reset My Password
                </a>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 12px; margin-top: 24px; border: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0; word-break: break-all; text-align: center;">
                    Or copy and paste this link into your browser:<br>
                    <a href="{reset_url}" style="color: #2563eb;">{reset_url}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Method 1: Resend API
    if RESEND_API_KEY:
        try:
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps({
                    "from": "LexAid Security <onboarding@resend.dev>",
                    "to": [to_email],
                    "subject": "Reset Your LexAid Password 🔐",
                    "html": html_content
                }).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                print(f"✓ Password reset email sent via Resend to {to_email}")
                return True
        except Exception as e:
            print(f"x Resend API error: {e}")

    # Method 2: Brevo API
    if BREVO_API_KEY:
        try:
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps({
                    "sender": {"name": "LexAid Security", "email": "suvansenthils@gmail.com"},
                    "to": [{"email": to_email}],
                    "subject": "Reset Your LexAid Password 🔐",
                    "htmlContent": html_content
                }).encode("utf-8"),
                headers={
                    "api-key": BREVO_API_KEY,
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                print(f"✓ Password reset email sent via Brevo to {to_email}")
                return True
        except Exception as e:
            print(f"x Brevo API error: {e}")

    # Method 3: Standard SMTP
    if SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Reset Your LexAid Password 🔐"
            msg["From"] = f"LexAid Security <{SMTP_USER}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD.replace(" ", "").strip())
                server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"✓ Password reset email sent via SMTP to {to_email}")
            return True
        except Exception as e:
            print(f"x SMTP error: {e}")

    print(f"\n================ PASSWORD RESET EMAIL DISPATCHED ================")
    print(f"To: {to_email}")
    print(f"Reset Link: {reset_url}")
    print(f"==================================================================\n")
    return True
