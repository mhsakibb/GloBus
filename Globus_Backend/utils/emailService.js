const nodemailer = require("nodemailer");

/**
 * Configure the email transporter using environment variables.
 * Gmail is used as the default SMTP service.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

module.exports = { sendWelcomeEmail };
