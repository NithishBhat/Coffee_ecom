const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail(to, subject, html) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[email] Failed to send:', err.message);
  }
}

module.exports = { sendEmail };
