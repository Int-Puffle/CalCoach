const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

async function sendVerificationEmail(to, verifyUrl) {
  await getTransporter().sendMail({
    from: `"CalCoach" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your email for CalCoach',
    html: `
      <p>Welcome to CalCoach!</p>
      <p>Please confirm your email address so we know it's really you:</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours. If you didn't create a CalCoach account, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendVerificationEmail };
