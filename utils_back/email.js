import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
const sendEmails = async function sendEmailToUser(template) {
  try {
    const sentMail = await transporter.sendMail(template);
    console.log("🚀 ~ sendEmails ~ sentMail:", sentMail);
    return true;
  } catch (err) {
    console.log("🚀 ~ sendEmail ~ err:", err.message)
    return false;
  }
};

module.exports = {
  sendEmails,
};
