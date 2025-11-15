import cron from "node-cron";
import { ReleaseProperty } from "./release_property"; // same as before

export const startCronReleaseProperty = async () => {
    try {
        await ReleaseProperty();
        console.log('ReleaseProperty started done');
    } catch (err) {
        console.error("❌ Error in ReleaseProperty cron job:", err.message);
    }
};

