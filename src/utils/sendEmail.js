const nodemailer = require("nodemailer");

// Create transporter for Ethereal (fake SMTP for testing)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER || "your-ethereal-user@example.com", // Replace with actual Ethereal user
    pass: process.env.ETHEREAL_PASS || "your-ethereal-pass", // Replace with actual Ethereal pass
  },
});

// Send email
const sendEmail = async (options) => {
  const mailOptions = {
    from: "Smart Traffic App <noreply@smarttraffic.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
