import { Interestedevent, InvitationEvent, Event } from "../../../../database/models"
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import responseManagement from "../../../../utils_back/responsemanagement"
const { NotFoundError, BadRequestError } = require('../../../../utils_back/api-errors');


// Add submit your interest in joining
export async function Add_Count({
    UserID,
    EventID
}, res) {
    try {
        const interested_event = await Interestedevent.create({
            UserID,
            EventID
        });
        return {
            statusCode: StatusCodes.OK,
            status: true,
            message: "Submit Your Interest Successfully",
            id: interested_event.id,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        };
    }
}


// fetch data for event interested
export async function View_Count(UserID) {
    const fetchCount = await Interestedevent.findOne({
        where: { UserID: UserID },
        order: [["createdAt", "DESC"]],
    });
    return {
        statusCode: 200,
        success: true,
        message: 'Fetch Event Interested Successfully!',
        data: fetchCount
    };
}

// check the user is invited and not invited
import { Op } from 'sequelize';
export async function Fetch_Invitation(req) {
    const tokan = req.headers.authorization.replace('Bearer ', '');
    const decodedToken = jwt.verify(tokan, 'your-secret-key'); // Decode and verify token
    const userIds = req.userId = decodedToken.userId
    const current_date = new Date();
    const fetchInvitationE = await InvitationEvent.findOne({
        where: {
            UserID: userIds,
            '$Event.EndDate$': {
                [Op.gte]: current_date,
            },

        },
        include: { model: Event }
    });
    return {
        statusCode: 200,
        success: true,
        message: 'This User Is Invitation At This Event!',
        data: fetchInvitationE
    };
}