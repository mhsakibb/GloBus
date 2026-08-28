require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Configure the email transporter using environment variables.
 * Gmail is used as the default SMTP service.
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends a welcome email to a newly registered user.
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The recipient's name
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email configuration missing. Skipping welcome email.");
      return;
    }

    const mailOptions = {
      from: `"GloBus Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Welcome to GloBus! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px; background-color: #fafafa;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #6366f1;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">GloBus</h1>
            <p style="color: #6b7280; margin-top: 5px; font-size: 14px;">Your Premium Shopping Destination</p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #ffffff; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Welcome to <strong>GloBus</strong>! We're thrilled to have you join our community. 
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Get ready to explore our wide range of premium products tailored just for you. From fresh groceries to the latest electronics, we've got everything you need.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Start Shopping Now</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              If you have any questions or need help, feel free to reply to this email. Our support team is always here for you.
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} GloBus. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

/**
 * Sends a password reset email with a 6-digit OTP code.
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The recipient's name (optional)
 * @param {string} otpCode - The 6-digit OTP code
 */
const sendPasswordResetEmail = async (toEmail, userName, otpCode) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email configuration missing. Skipping password reset email.");
      return;
    }

    const nameDisplay = userName ? `Hi ${userName},` : "Hello,";

    const mailOptions = {
      from: `"GloBus Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "GloBus - Password Reset Verification Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
            <h1 style="color: #2563eb; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">GloBus</h1>
            <p style="color: #64748b; margin-top: 4px; font-size: 13px;">Security & Account Recovery</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 28px 4px 16px 4px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 600;">${nameDisplay}</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
              We received a request to reset the password for your GloBus account. Use the verification code below to proceed:
            </p>
            
            <!-- OTP Box -->
            <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px;">
              <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your 6-Digit Reset Code</span>
              <span style="font-size: 34px; font-weight: 800; color: #1e293b; letter-spacing: 8px; font-family: monospace;">${otpCode}</span>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #dc2626; font-weight: 500;">
                ⏱ This code expires in 10 minutes.
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #64748b;">
              If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized activity on your account.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} GloBus Inc. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };

