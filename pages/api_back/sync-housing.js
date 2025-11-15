import axios from "axios";
import { Op } from "sequelize";
import { Housing, EventHousing, HousingBedrooms, Event, EventTicketType, Addons, CouponsModel, Payment } from "@/database/models";


export default async function handler(req, res) {
    const { method, body } = req;

    if (method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {

        // Step 1️⃣: Fetch changed data from Server A
        const serverAUrl = "https://staging.ondalinda.com/api/cron"; // 👈 Update if needed
        const response = await axios.post(serverAUrl, body);

        if (!response.data?.status) {
            return res.status(400).json({ message: "Failed to fetch data from Server A" });
        }

        const {
            housingData = [],
            eventHousingData = [],
            housingBedRoomsData = [],
            eventData = [],
            eventTicketTypeData = [],
            addonsData = [],
            getCouponsList = [],
            paymentData = [],
        } = response.data.data;


        let synced = {
            housingInserted: 0,
            housingUpdated: 0,
            eventHousingInserted: 0,
            eventHousingUpdated: 0,
            bedroomInserted: 0,
            bedroomUpdated: 0,
            eventInserted: 0,
            eventUpdated: 0,
            ticketTypeInserted: 0,
            ticketTypeUpdated: 0,
            addonsInserted: 0,
            addonsUpdated: 0,
            couponUpdated: 0,
            couponInserted: 0,
            paymentUpdated: 0,
            paymentInserted: 0,
        };

        // Step 2️⃣: Sync Housing Data
        for (const record of housingData) {
            const existing = await Housing.findOne({ where: { id: record.id } });
            if (existing) {
                // if (new Date(record.updatedAt) > new Date(existing.updatedAt)) {
                await existing.update(record);
                synced.housingUpdated++;
                // }
            } else {
                await Housing.create(record);
                synced.housingInserted++;
            }
        }

        // Step 3️⃣: Sync EventHousing Data
        for (const record of eventHousingData) {
            const existing = await EventHousing.findOne({ where: { id: record.id } });
            if (existing) {
                // console.log('>>>>>>>>>>>', record);
                // if (new Date(record.updatedAt) > new Date(existing.updatedAt)) {
                await existing.update(record);
                synced.eventUpdated++;
                // }
            } else {
                await EventHousing.create(record);
                synced.eventInserted++;
            }
        }

        // Step 4️⃣: Sync HousingBedrooms Data
        for (const record of housingBedRoomsData) {
            const existing = await HousingBedrooms.findOne({ where: { id: record.id } });
            if (existing) {
                // if (new Date(record.updatedAt) > new Date(existing.updatedAt)) {
                await existing.update(record);
                synced.bedroomUpdated++;
                // }
            } else {
                await HousingBedrooms.create(record);
                synced.bedroomInserted++;
            }
        }

        // Step 5️⃣: Sync Event Data
        for (const record of eventData) {
            const existing = await Event.findOne({ where: { id: record.id } });
            if (existing) {
                await existing.update(record);
                synced.eventUpdated++;
            } else {
                await Event.create(record);
                synced.eventInserted++;
            }
        }

        // Step 6️⃣: Sync EventTicketType Data
        for (const record of eventTicketTypeData) {
            const existing = await EventTicketType.findOne({ where: { id: record.id } });
            if (existing) {
                await existing.update(record);
                synced.ticketTypeUpdated++;
            } else {
                await EventTicketType.create(record);
                synced.ticketTypeInserted++;
            }
        }

        // Step 7️⃣: Sync Addons Data
        for (const record of addonsData) {
            const existing = await Addons.findOne({ where: { id: record.id } });
            if (existing) {
                await existing.update(record);
                synced.addonsUpdated++;
            } else {
                await Addons.create(record);
                synced.addonsInserted++;
            }
        }

        // Step 8: Sync getCouponsList Data
        for (const record of getCouponsList) {
            const existing = await CouponsModel.findOne({ where: { id: record.id } });
            if (existing) {
                await existing.update(record);
                synced.couponUpdated++;
            } else {
                await CouponsModel.create(record);
                synced.couponInserted++;
            }
        }

        // Step 9: Sync Payment Data
        for (const record of paymentData) {
            const existing = await Payment.findOne({ where: { id: record.id } });
            if (existing) {
                synced.paymentUpdated++;
                await existing.update(record);
            } else {
                synced.paymentInserted++;
                await Payment.create(record);
            }
        }

        // Step Return sync summary
        return res.status(200).json({
            status: true,
            message: "Data synced successfully from Server A",
            synced,
        });

    } catch (error) {
        console.error("Error syncing data from Server A:", error);
        return res.status(500).json({
            status: false,
            message: "Server error during data sync",
            error: error.message,
        });
    }
}
