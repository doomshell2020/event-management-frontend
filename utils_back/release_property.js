import { EventHousing, InvitationEvent } from "../database/models";

import { Op } from "sequelize";
export async function ReleaseProperty(res) {
    const EVENT_ID = 111;
    const now = new Date();
    const expiredInvitations = await InvitationEvent.findAll({
        where: {
            EventID: EVENT_ID,
            [Op.or]: [
                { expire_status: "expired" },
                { expiresAt: { [Op.lt]: now } }
            ]
        },
        attributes: ["EligibleHousingIDs"]
    });
    const expiredHousingIdsRaw = expiredInvitations.map(inv => inv.EligibleHousingIDs);
    const expiredHousingIds = expiredHousingIdsRaw.flatMap(ids => ids.split(",")).map(id => id.trim()).filter(Boolean);
    const viewAll = await EventHousing.findAll({
        where: { EventID: 111, isBooked: "P", HousingID: { [Op.in]: expiredHousingIds } },
        attributes: ["EventID", "HousingID", "isBooked"],
    })
    const housingIdArray = viewAll.map((record) => record.HousingID);
    await EventHousing.update({ isBooked: 'N' }, {
        where: {
            EventID: 111, HousingID: { [Op.in]: housingIdArray },
        },
    }
    );
    return {
        statusCode: 200,
        success: true,
        message: "Crone has been schedule release all property!!",
    };
}