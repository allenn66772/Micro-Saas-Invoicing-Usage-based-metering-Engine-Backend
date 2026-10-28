// services/mailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends 6-digit OTP to the user's email address
 */
const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Metering SaaS Platform" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Account Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Verify Your Account</h2>
        <p style="color: #475569; font-size: 14px;">
          Thank you for signing up. Enter this 6-digit code in the app to verify your email address:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px;">
          This code will expire in <strong>10 minutes</strong>. If you did not create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };