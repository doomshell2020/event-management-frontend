// utils/cronBackup.js
const cron = require("node-cron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "rupam@doomshell.com",
    pass: "Rupamsingh@123",
  },
});

const sendBackupEmail = (filePath) => {
  const mailOptions = {
    from: "rupam@doomshell.com",
    to: "tech@ashwalabs.com",
    subject: "Database Backup",
    text: "Please find the attached database backup file.",
    attachments: [{ path: filePath }],
  };

  return transporter.sendMail(mailOptions);
};

const backupDatabase = () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.LIVE_DB_NAME;
  const backupPath = path.join(process.cwd(), "public/database_backup");

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  const fileName = `${backupPath}/${dbName}-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.sql`;
  const command = `mysqldump -u ${dbUser} -p${dbPassword} ${dbName} > ${fileName}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error.message}`);
      return;
    }
    console.log("Backup successful:", stdout);

    // sendBackupEmail(fileName)
    //   .then(() => fs.unlinkSync(fileName))
    //   .catch(console.error);
  });
};
// console.log(">>>>>>>>>>crone has been schedule 0 18 * * *");

const startCronBackup = () => {
  // cron.schedule("0 18 * * *", () => {
    console.log("Running daily database backup at 6:00 PM...");
    backupDatabase();
  // });
};
module.exports = startCronBackup;

// export default startCronBackup; // For ES Modules
