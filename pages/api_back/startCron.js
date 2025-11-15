import startCronBackup from "../../utils_back/cronBackup";
import { startCronReleaseProperty } from "../../utils_back/propertyReleaseCron";
import { sendRemainingAmountEmail } from "../../utils_back/sendRemainingAmountCron";


export default async function handler(req, res) {
  try {

    const { platform } = req.query;
    if (platform) {
      console.log('>>>>>>> development call function!!');
      await startCronBackup();
      await startCronReleaseProperty();
      await sendRemainingAmountEmail();  // Send remaining amount email reminder 15 and 3 days before the event start date
    } else if (process.env.NODE_ENV == 'production') {
      // Call startCronBackup and wait for it to complete
      console.log('>>>>>>> production call function');

      await startCronBackup();
      await startCronReleaseProperty();
      await sendRemainingAmountEmail();  // Send remaining amount email reminder 15 and 3 days before the event start date
    }
    res.status(200)
      .json({
        message: "Backup completed and cron job executed successfully!",
      });
  } catch (error) {
    console.error("Error during backup:", error);
    res.status(500).json({ message: "Backup failed", error: error.message });
  }
}