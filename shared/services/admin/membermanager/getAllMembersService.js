import { User, InvitationEvent, Event, Invitation, } from "@/database/models"
import { Op, Sequelize } from 'sequelize';




// Members View with pagination data
export async function View_Members(params, res) {
    const { fname, lname, member_email, mobile, member_id, membership_level, membership_status, careyes_homeowner, past_event_attended, member_interest, member_location, search_recently_approved, artist_type, currentPage, invited } = params;
    // Initialize conditional object
    let conditionalObject = {};
    if (member_email) {
        conditionalObject.Email = { [Op.like]: `%${member_email.trim()}%` };
    } else {
        conditionalObject.Email = { [Op.not]: '' };
    }

    if (member_id) {
        conditionalObject.ID = { [Op.like]: `%${member_id}%` };
    }

    if (fname) {
        conditionalObject.FirstName = { [Op.like]: `%${fname.trim()}%` };
    }

    if (lname) {
        conditionalObject.LastName = { [Op.like]: `%${lname.trim()}%` };
    }
    if (mobile) {
        const cleanedMobile = mobile.replace(/\D/g, ''); // Remove all non-numeric characters
        conditionalObject.PhoneNumber = Sequelize.where(
            Sequelize.fn('REPLACE',
                Sequelize.fn('REPLACE',
                    Sequelize.fn('REPLACE',
                        Sequelize.fn('REPLACE', Sequelize.col('PhoneNumber'), ' ', ''),
                        '(', ''),
                    ')', ''),
                '-', ''),
            'LIKE', `%${cleanedMobile}%`
        );
    }
    if (membership_level) {
        conditionalObject.MembershipLevel = { [Op.like]: `%${membership_level}%` };
    }
    if (membership_status) {
        conditionalObject.Status = membership_status;
    }
    if (careyes_homeowner) {
        conditionalObject.CareyesHomeownerFlag = careyes_homeowner;
    }
    if (artist_type == '1' || artist_type == '0') {
        conditionalObject.ArtistType = {
            [artist_type == '1' ? Op.not : Op.is]: null,
        };
    }
    // new
    if (past_event_attended) {
        if (past_event_attended == "0") {
            // Exact match for "0"
            conditionalObject.attended_festival_before = {
                [Op.eq]: "0", // Use Op.eq for exact match instead of Op.like
            };
        } else if (past_event_attended == 'ANY') {
            // Exclude specific event and "0"
            conditionalObject.attended_festival_before = {
                [Op.and]: [
                    { [Op.ne]: "0" }, // Not equal to "0"
                    { [Op.notLike]: '%108%' }, // Exclude this event
                ],
            };
        } else {
            // Dynamic condition for other event names
            conditionalObject.attended_festival_before = {
                [Op.like]: `%${past_event_attended}%`,
            };
        }
    }

    if (member_location) {
        let countryArray = member_location.split(',').map((e) => e.trim());
        if (Array.isArray(countryArray) && countryArray.length > 0 && countryArray[0] !== '') {
            conditionalObject.country_group = { [Op.in]: countryArray };
        }
    }
    // Most interested festival

    if (member_interest) {
        let interestArray = member_interest.split(',').map(e => e.trim());
        if (Array.isArray(interestArray) && interestArray.length > 0) {
            conditionalObject.most_interested_festival = {
                [Op.or]: interestArray.map(interest => ({
                    [Op.like]: `%${interest.replace(/\*/g, '%')}%` // Replacing * with %
                }))
            };
        }
    }
    conditionalObject.Role = {
        [Op.or]: [
            { [Op.ne]: 3 },
            { [Op.is]: null }
        ]
    };
    const invitedValue = invited || 'defaultEvent,defaultStatus';
    const [eventId, invitationStatus] = invitedValue.split(',');
    // Log the separated variables
    const InvitationData = await Invitation.findAll({
        where: { EventID: eventId },
        attributes: ["id", "EventID", "UserID"]
    })

    // Extracting UserIDs
    const userIds = InvitationData.map(invitation => invitation.dataValues.UserID);
    if (invited) {
        if (invitationStatus == "Invited") {
            conditionalObject['$User.id$'] = { [Op.in]: userIds };
            // For 'invited' equal to 0, use the 'not in' condition
        } else {
            // For other cases, use the 'in' condition
            conditionalObject['$User.id$'] = { [Op.notIn]: userIds };
        }
    }


    // Add filter conditionally
    if (search_recently_approved) {
        conditionalObject['$User.Status$'] = { [Op.eq]: 1 };
    }

    // Merge conditional object with whereClause
    const whereClause = {
        ...conditionalObject,
    };

    // console.log('>>>>>>>>>>>>>', whereClause);



    let orderCriteria;
    if (search_recently_approved == '1') {
        orderCriteria = [['recently_approved', 'DESC']]; // Order by recently_approved DESC
    } else if (search_recently_approved == '0') {
        orderCriteria = [['recently_approved', 'ASC']]; // Order by recently_approved ASC
    } else {
        orderCriteria = [["ID", "DESC"]]; // Order by LastName ASC
    }
    const findOptions = {
        order: orderCriteria,
        where: whereClause,
        include: [{
            model: Invitation, required: false, // Ensures users without invitations are included
            attributes: ['id', 'EventID', 'UserID']
        },
        ],
        attributes: [
            'id',
            'FirstName',
            'LastName',
            'Email',
            'ImageURL',
            'PhoneNumber',
            'Status',
            'country_group',
            'MembershipTypes',
            'DateCreated',
            'admin_notes'
        ],
    };
    const { count, rows } = await User.findAndCountAll(findOptions);

    if (count == 0) {
        const error = new Error("No records found");
        error.StatusCodes = 200;
        throw error;
    }
    return {
        success: true,
        message: "Members view successfully",
        data: rows,
    };
}





// view member for invited
export async function View_InvitedMember({ isInterested }, res) {
    try {
        // new added find active event base on status Y
        const activeEvent = await Event.findOne(
            {
                where: { status: "Y" },
                order: [["createdAt", "DESC"]],
                attributes: ["id", "Name"]
            }
        );
        let Conditions = { EventID: activeEvent.id };
        // let Conditions = { EventID: eventid };
        if (isInterested == true) {
            // Conditions.Status >= 1;
            Conditions.Status = { [Sequelize.Op.gte]: 1 };
        } else {
            Conditions.Status = 0;
        }
        const Invited = await InvitationEvent.findAll(
            {
                where: Conditions,
                attributes: ['UserID']
            }
        );
        // Set on one array
        const UserIDs = Invited.map(invite => invite.UserID);
        if (Invited.length == 0) {
            return {
                success: false,
                message: "ID not found",
            };
        }
        return {
            statusCode: 200,
            success: true,
            message: "View member for invited successfully",
            data: UserIDs,
        }
    } catch (error) {
        return error;
    }
}












