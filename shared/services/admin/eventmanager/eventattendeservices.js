import { Eventattendees, User, Event } from "../../../../database/models"
// import { User } from "../../../../database/models/user"
import { StatusCodes } from 'http-status-codes';


// Events Invited
// export async function InvitationEvent_ViewAll(req) {
//     try {
//         const Invitationdata = await InvitationEvent.findAll({
//             order: [["createdAt", "DESC"]],
//         });
//         return {
//             statusCode: StatusCodes.OK,
//             status: true,
//             message: "Invitation Event viewAll Successfully",
//             data: Invitationdata,
//         }
//     } catch (error) {
//         return {
//             statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//             error
//         }
//     }
// }

export async function View_EventattendesByid({ id }, res) {
    try {
        const data = await Eventattendees.findAll({
            // include: [{ model: User }],
            where: {
                EventID: id,
            },
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            data: data,
            message: "Event Attendees view Successfully"
        }
    } catch (error) {
        return error;
    }
}


// Search Invited Members
// const Sequelize = require("sequelize");
// const Op = Sequelize.Op;
// export async function Search_InvitedMember({ HousingOption, Status }) {
//     try {
//         let newobject = {};
//         if (HousingOption) {
//             newobject.HousingOption = { [Op.like]: `%${HousingOption}%` }
//         }
//         if (Status) {
//             newobject.Status = { [Op.like]: `%${Status}%` }
//         }
//         const searchResults = await InvitationEvent.findAll({
//             include: [{ model: User }],
//             where: newobject,
//         });
//         return {
//             statusCode: 200,
//             success: true,
//             message: 'Search Invited Members Successfully!',
//             searchResults
//         };
//     } catch (error) {
//         console.log("error")
//         //   res.status(500).json({ error: 'Internal Server Error' });

//     }
// }

