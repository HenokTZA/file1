const nodemailer = require("nodemailer");
require('dotenv').config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT, 
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
  
});
exports.sendConfirmationEmail = async (email, confirmationCode, username) => {
  const confirmationLink = `http://app.tasknitter.com/confirm-email/${confirmationCode}`;  // Construct the confirmation URL with the confirmationCode

  const mailOptions = {
    from: `Management Team <${process.env.GMAIL_USERNAME}>`,
    to: email,
    subject: "Account Confirmation",
    text: `Hey ${username},\n\nWe received a request to sign in to your account, but we didn't recognize the device. To complete the sign-in, click the link below to confirm your email address and finish the process.\n\nConfirmation link: ${confirmationLink}\n\nThanks,\nManagement Team`,
    html: `Hey ${username},<br><br>We received a request to sign in to your account, but we didn't recognize the device. To complete the sign-in, click the link below to confirm your email address and finish the process.<br><br>
           <a href="${confirmationLink}" style="font-size: 18px; color: #007bff; text-decoration: none;">Confirm Your Email</a><br><br>Thanks,<br>Management Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Failed to send confirmation email");
  }
};


exports.sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: `Management Team <${process.env.GMAIL_USERNAME}>`,
    to: email,
    subject: "Welcome to Management Platform",
    text: `Welcome ${username},<br><br>You’ve just opened an account and are set to begin as a user.<br><br>Thanks,<br>Management Team`,
    html: `Welcome to our website ${username},<br><br>You have just opened an account and are set to sign in to your account.
        <br><br>Thanks,<br>Management Team`,
  };

  await transporter.sendMail(mailOptions);
};

// emailService.js

// Corrected function name and signature
exports.sendResetPasswordLink = async (email, token) => {
  // The link your user will click. It should point to YOUR FRONTEND APP.
  const resetLink = `http://app.tasknitter.com/reset-password/${token}`; // Use your production URL here later

  const mailOptions = {
    from: `"Tasknitter Support" <${process.env.SMTP_USER}>`, // Use a professional "from" name
    to: email,
    subject: 'Your Password Reset Request',
    text: `You requested a password reset. Please click the following link to set a new password: ${resetLink}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p>Please click the link below to set a new password:</p>
      <a href="${resetLink}" style="font-size: 16px; color: #ffffff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // It's important to throw the error so the controller can catch it
    throw new Error("Failed to send password reset email.");
  }
};
