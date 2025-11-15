import { InvitationEvent, MyOrders, EventHousingRental, User, Event, HousingNeighborhood, UserInterest, Emailtemplet, AccommodationBookingInfo, BookAccommodationInfo, Housing, AddonBook, BookTicket,AccommodationExtension } from "../../../../database/models"
import { StatusCodes } from 'http-status-codes';
import ResponseManagement from "../../../../utils_back/responsemanagement"
import { sendEmails } from "../../../../utils_back/email"
import { sendEmail } from "../../../../utils_back/sendEmail"
let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
import { invitationTemplate, NewInvitationsTemplate } from "../../../../utils_back/email-templates"


const Sequelize = require("sequelize");
const Op = Sequelize.Op;


export async function isInvitedIntoEvent(req, res) {
    try {
        const { userId, eventId } = req.query;

        let finalEventId = eventId;

        // If eventId is not provided, find the latest active event
        if (!finalEventId) {
            const event = await Event.findOne({
                where: { Status: 'Y' },
                attributes: ['id'],
                order: [['id', 'DESC']]
            });

            if (!event) {
                return res.json({
                    success: false,
                    message: "No active event currently."
                });
            }

            finalEventId = event.id;
        }

        // Check for invitation for this user and the resolved eventId
        const invitation = await InvitationEvent.findOne({
            where: {
                userId,
                eventId: finalEventId
            }
        });

        return res.json({
            success: !!invitation,
            message: invitation
                ? "You are eligible."
                : "You are not eligible to buy ticket."
        });

    } catch (error) {
        return res.json({
            success: false,
            message: "Error: " + error.message
        });
    }
}

export async function Add_InvitationEvents({
    Invited,
    Registered,
    EventID,
    UserID,
    DiscountPercentage,
    EligibleHousingIDs,
    NumDiscounts,
    AssignedHousingRentalID,
    HousingOption,
    AssignedHousingID,
    InternalNotes,
    NumTicketsRequired,
}, res) {

    const createOrUpdateEventAndSendEmail = async (curUserId) => {

        // console.log(curUserId);

        const CheckEventsUser = await InvitationEvent.findOne({
            where: {
                EventID,
                UserID: curUserId
            }
        });

        const FindUser = await User.findOne({
            where: {
                ID: curUserId
            }
        });

        const EmailName = FindUser.dataValues.Email;
        const FirstName = FindUser.dataValues.FirstName;

        if (!CheckEventsUser) {
            await InvitationEvent.create({
                EventID,
                UserID: curUserId,
                DiscountPercentage,
                EligibleHousingIDs,
                NumDiscounts,
                AssignedHousingRentalID,
                HousingOption,
                AssignedHousingID,
                InternalNotes,
                NumTicketsRequired,
                Invited,
                Registered,
            });
            if (EventID == 108) {
                const templatename = 'Montenegro 2024 Event invitations';
                const mergeVars = { WSFNAME: FirstName, OTHER_PARAM: 'Other Value' };
                sendEmail(EmailName, mergeVars, templatename);
            } else if (EventID == 109) {
                // const templatename = 'O x Careyes Event Invitations 2024';
                const templatename = 'O x Careyes Event Invitation Information 2024 3nd';
                const mergeVars = { WSFNAME: FirstName, OTHER_PARAM: 'Other Value' };
                sendEmail(EmailName, mergeVars, templatename);
            } else if (EventID == 110) {
                // content our database and email send mail-champ--
                const invitation = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 25 } });
                const sanitizedTemplate = invitation.dataValues.description;
                const subject = invitation.dataValues.subject
                // mail champ template name
                const mailChampTemplateName = invitation.dataValues.mandril_template
                let template = invitationTemplate({
                    // UserName: FirstName,
                    SiteUrl: `${SITE_URL}/monten/oxmontenegro/`,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                const templateName = mailChampTemplateName;
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(EmailName, mergeVars, templateName, subject);
            }
            else if (EventID == 111) {
                // content our database and email send mail-champ--
                const invitation = await Emailtemplet.findOne({ where: { eventId: 111, templateId: 29 } });
                const sanitizedTemplate = invitation.dataValues.description;
                const subject = invitation.dataValues.subject
                // mail champ template name
                const mailChampTemplateName = invitation.dataValues.mandril_template
                let template = invitationTemplate({
                    // UserName: FirstName,
                    SiteUrl: `${SITE_URL}/accommodations/`,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                const templateName = mailChampTemplateName;
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(EmailName, mergeVars, templateName, subject);
            }
            // await sendInvitationEmail(EmailName, FirstName);
        } else {
            if (EventID == 108) {
                await InvitationEvent.update({ Status: 1 }, { where: { id: CheckEventsUser.id } });
                // const recipientEmail = EmailName;
                const templatename = 'Montenegro 2024 Event invitations';
                const mergeVars = { WSFNAME: FirstName, OTHER_PARAM: 'Other Value' };
                sendEmail(EmailName, mergeVars, templatename);
                // await sendInvitationEmail(EmailName, FirstName);
                ResponseManagement.sendResponse(res, StatusCodes.OK, "Invitation has been sent to the user.");
            } else if (EventID == 109) {
                await InvitationEvent.update({ Status: 1 }, { where: { id: CheckEventsUser.id } });
                // const recipientEmail = EmailName;
                // const templatename = 'O x Careyes Event Invitations 2024';
                const templatename = 'O x Careyes Event Invitation Information 2024 3nd';
                const mergeVars = { WSFNAME: FirstName, OTHER_PARAM: 'Other Value' };
                sendEmail(EmailName, mergeVars, templatename);
                // await sendInvitationEmail(EmailName, FirstName);
                ResponseManagement.sendResponse(res, StatusCodes.OK, "Invitation has been sent to the user.");
            } else if (EventID == 110) {
                await InvitationEvent.update({ Status: 1 }, { where: { id: CheckEventsUser.id } });

                // content our database and email send mail-champ--
                // const Invitation = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 7 } });
                // const Invitation = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 24 } });
                const Invitation = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 25 } });
                const sanitizedTemplate = Invitation.dataValues.description;
                const subject = Invitation.dataValues.subject;
                // mail champ template name
                const mailChampTemplateName = Invitation.dataValues.mandril_template
                let template = invitationTemplate({
                    // UserName: FirstName,
                    SiteUrl: `${SITE_URL}/monten/oxmontenegro/`,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                const templateName = mailChampTemplateName;
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(EmailName, mergeVars, templateName, subject);

                // const templatename = 'montenegro2025 invitationmail';
                // const mergeVars = { WSFNAME: FirstName, OTHER_PARAM: 'Other Value' };
                // sendEmail(EmailName, mergeVars, templatename);
                ResponseManagement.sendResponse(res, StatusCodes.OK, "Invitation has been sent to the user.");
            }
            else if (EventID == 111) {
                await InvitationEvent.update({ Status: 1 }, { where: { id: CheckEventsUser.id } });
                const Invitation = await Emailtemplet.findOne({ where: { eventId: 111, templateId: 29 } });
                const sanitizedTemplate = Invitation.dataValues.description;
                const subject = Invitation.dataValues.subject;
                // mail champ template name
                const mailChampTemplateName = Invitation.dataValues.mandril_template
                let template = invitationTemplate({
                    // UserName: FirstName,
                    SiteUrl: `${SITE_URL}/accommodations/`,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                const templateName = mailChampTemplateName;
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(EmailName, mergeVars, templateName, subject);
                ResponseManagement.sendResponse(res, StatusCodes.OK, "Invitation has been sent to the user.");
            }
        }
    };

    // for (const curUserId of UserID) {
    //     console.log('=>>>>>>>>>',UserID);
    //     // await createOrUpdateEventAndSendEmail(curUserId);
    // }

    await Promise.all(UserID.map(curUserId => createOrUpdateEventAndSendEmail(curUserId)));

    return {
        statusCode: StatusCodes.OK,
        status: true,
        message: "Users have been successfully invited.",
    };
}

async function sendInvitationEmail(email, firstName) {
    const emailTemplate = await Emailtemplet.findOne({
        where: {
            id: 8
        },
    });
    let template = NewInvitationsTemplate({
        fromUser: "Ondalinda",
        fromEmail: "hello@ondalinda.com",
        toEmail: email,
        html: emailTemplate.dataValues.description,
        subject: emailTemplate.dataValues.subject,
        ccEmail: ['tech@ashwalabs.com']
    });
    await sendEmails(template);
    // const template = EventInvitationMail({
    //     fromUser: "Ondalinda",
    //     fromEmail: "hello@ondalinda.com",
    //     toEmail: email,
    //     subject: 'You are invited! Ondalinda x Montenegro 4-7th of July 2024 💫',
    //     userName: firstName,
    //     eventName: 'Ondalinda x Montenegro 2024',
    //     ccEmail: ['tech@ashwalabs.com']
    // });
    // await sendEmails(template);
}

// Events Invited
export async function InvitationEvent_ViewAll(req) {
    try {
        const Invitationdata = await InvitationEvent.findAll({
            order: [["createdAt", "DESC"]],
            where: { status: 1 }
        });
        return {
            statusCode: StatusCodes.OK,
            status: true,
            message: "Invitation Event view All Successfully!",
            data: Invitationdata,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}

export async function View_InvitationEventByid({ id, page, pageSize }, res) {

    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

    try {
        const { count, rows } = await InvitationEvent.findAndCountAll({
            order: [["createdAt", "DESC"]],
            include: [{ model: User }],
            where: {
                EventID: id,
            },
            offset: offset,
            limit: parseInt(pageSize, 10),
        });
        // console.log("🚀 ~ View_InvitationEventByid ~ rows:", rows)

        // Check if count is zero and handle accordingly
        if (count === 0) {
            return {
                data: [],
                pagination: {
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: parseInt(page, 10),
                    pageSize: parseInt(pageSize, 10),
                },
                message: "No records found",
            };
        }

        const totalPages = Math.ceil(count / parseInt(pageSize, 10));

        return {
            data: rows,
            pagination: {
                totalRecords: count,
                totalPages: totalPages,
                currentPage: parseInt(page, 10),
                pageSize: parseInt(pageSize, 10),
            },
            message: "Invitation Event view successfully",
        };
    } catch (error) {
        return error;
    }
}



// Search Invited Members
export async function Search_InvitedMember({ HousingOption, Status, FirstName, LastName, Email, MembershipLevel, Interest, ArtistType, UserID, EventID, CareyesHomeownerFlag, attended_festival_before, accommodation_status }) {
    try {
        let newObject = {};
        let newObjectInterest = {};

        if (HousingOption) {
            // newObject.HousingOption = { [Op.like]: `%${HousingOption}%` }
            const housingString = HousingOption;
            const housingArray = housingString.split(',');
            newObject.HousingOption = { [Op.in]: housingArray };
        }

        if (Status) {
            const statusString = Status;
            const statusArray = statusString.split(',');
            newObject.Status = { [Op.in]: statusArray };
        }
        // new search keys added
        if (accommodation_status) {
            newObject.accommodation_status = { [Sequelize.Op.like]: `%${accommodation_status.trim()}%` }
        }
        if (UserID) {
            newObject.UserID = { [Op.like]: `%${UserID}%` }
        }
        if (EventID) {
            newObject.EventID = { [Op.like]: `%${EventID}%` }
        }
        if (FirstName) {
            newObject['$User.FirstName$'] = { [Sequelize.Op.like]: `%${FirstName.trim()}%` };
        } if (LastName) {
            newObject['$User.LastName$'] = { [Sequelize.Op.like]: `%${LastName.trim()}%` };
        } if (Email) {
            newObject['$User.Email$'] = { [Sequelize.Op.like]: `%${Email.trim()}%` };
        } if (MembershipLevel) {
            // Search for the MembershipLevel in the Users table
            newObject['$User.MembershipLevel$'] = { [Sequelize.Op.like]: `%${MembershipLevel}%` };
        } if (ArtistType) {
            // Search for the ArtistType in the Users table
            newObject['$User.ArtistType$'] = { [Sequelize.Op.like]: `%${ArtistType}%` };
        } if (CareyesHomeownerFlag) {
            // Search for the CareyesHomeownerFlag in the Users table
            newObject['$User.CareyesHomeownerFlag$'] = { [Sequelize.Op.like]: `%${CareyesHomeownerFlag}%` };
        }
        if (attended_festival_before) {
            if (attended_festival_before === 'I HAVE NEVER ATTENDED AN ONDALINDA EVENT') {
                newObject['$User.attended_festival_before$'] = {
                    [Op.like]: '%I HAVE NEVER ATTENDED AN ONDALINDA EVENT%'
                };
            } else if (attended_festival_before === 'ANY') {
                newObject['$User.attended_festival_before$'] = {
                    [Op.ne]: 'I HAVE NEVER ATTENDED AN ONDALINDA EVENT',
                    [Op.notLike]: '%ONDALINDA x MONTENEGRO 2024%' // Exclude this event
                };
            } else if (attended_festival_before === 'ONDALINDA x MONTENEGRO 2024') {
                newObject['$User.attended_festival_before$'] = {
                    [Op.like]: '%ONDALINDA x MONTENEGRO 2024%'
                };
            }
        }
        if (Interest) {
            const valuesString = Interest;
            const valuesArray = valuesString.split(',');

            newObjectInterest.Interest = { [Op.in]: valuesArray };
            const searchResultuserinterest = await UserInterest.findAll({
                where: newObjectInterest,
            });
            const usersinterestid = searchResultuserinterest.map((e) => {
                return e.UserID;
            })
            if (usersinterestid) {
                newObject.UserID = { [Op.in]: usersinterestid };
            }
        }
        const searchResults = await InvitationEvent.findAll({
            include: [{
                model: User,
                attributes: ['id', 'FirstName', 'LastName', 'Email', 'PhoneNumber', 'ImageURL', 'Status', 'country_group', 'MembershipTypes', 'DateCreated', 'admin_notes'],
                include: [{
                    model: MyOrders,
                    attributes: ['id', 'user_id', 'event_id', 'OriginalTrxnIdentifier'],
                    where: { event_id: EventID },
                    required: false, // ✅ allow users without orders
                    include: [{
                        model: BookTicket,
                        attributes: ["id", 'event_id'], // No need to select attributes from BookTicket
                        where: { event_id: EventID },
                        required: false // ✅ allow orders without tickets
                    },
                    {
                        model: AddonBook,
                        attributes: ["id", 'event_id'], // No need to select attributes from AddonBook
                        where: { event_id: EventID },
                        required: false // ✅ allow orders without addons
                    }, {
                        model: BookAccommodationInfo,
                        attributes: ['id', 'check_in_date', 'check_out_date', 'event_id', 'accommodation_id'],
                        where: { event_id: EventID },
                        required: false,
                        include: { model: Housing, attributes: ['Name'], include: { model: HousingNeighborhood, attributes: ['name'] } }
                    },
                    {
                        model: AccommodationExtension, attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
                        include: [{
                            model: Housing,
                            attributes: ['Name', 'Neighborhood'],
                            include: { model: HousingNeighborhood, attributes: ['name'] }
                        }]
                    }
                    ]
                },
                {
                    model: UserInterest,
                    attributes: [],
                    required: false // ✅ optional
                }],
                required: true // we do want a User 
            }
            ],
            where: newObject,
            order: [["createdAt", "DESC"]]
        });
        return {
            statusCode: 200,
            success: true,
            message: 'Search Invited Members Successfully!!',
            searchResults
        };
    } catch (error) {
        console.log("error", error.message)
        res.status(500).json({ success: false, message: 'Internal Server Error :' + error.message });

    }
}











// view users for buy tickets 
export async function User_ticketPurchased({ Eventid }, res) {

    try {
        const data = await InvitationEvent.findAll({
            order: [["createdAt", "DESC"]],
            include: [{ model: User }],
            where: {
                EventID: Eventid,
                // Status: "1",

            },

        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            message: "View Users Successfully For Purchased Tickets",
            data: data,
        }
    } catch (error) {
        return error;
    }
}

// Search ticket purchased users
const moment = require('moment');
export async function Search_TicketPurchaseduser({ FirstName, Email, EventID, startedate, EndDate }) {
    try {
        let newobject = {};
        if (FirstName) {
            // Search for the FirstName in the Users table
            newobject['$User.FirstName$'] = { [Sequelize.Op.like]: `%${FirstName}%` };
        } if (Email) {
            // Search for the Email in the Users table
            newobject['$User.Email$'] = { [Sequelize.Op.like]: `%${Email}%` };
        } if (EventID) {
            newobject.EventID = { [Op.like]: `%${EventID}%` }
        }

        if (startedate) {
            const startDate = moment(startedate).startOf('day').toDate();
            newobject.createdAt = {
                [Op.gte]: startDate,
            };
        }
        if (EndDate) {
            // Create a start date for the selected date
            const endDate = moment(EndDate).endOf('day').toDate();
            // Use the start date in the Sequelize query
            newobject.createdAt = {
                [Op.lte]: endDate,
            };
        }



        const searchResults = await InvitationEvent.findAll({
            include: [{
                model: User,
            }],
            where: newobject,
        });

        return {
            statusCode: 200,
            success: true,
            message: 'Search Ticket purchased Members Successfully!',
            searchResults
        };
    } catch (error) {
        console.log("error")
        //   res.status(500).json({ error: 'Internal Server Error' });

    }
}

// Update Invitation status
export async function updateInvitationStatus({ EventID, UserID }) {
    try {
        const findInvitation = await InvitationEvent.findAll({
            order: [["id", "DESC"]],
            where: {
                status: 1,
                EventID: EventID,
                UserID: UserID,
            },
            attributes: ['id', 'Status'],
        });

        if (findInvitation.length > 0) {
            await InvitationEvent.update({ Status: 2 }, {
                where: {
                    status: 1,
                    EventID: EventID,
                    UserID: UserID,
                },
            });
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: 'Data status updated successfully',
            };
        } else {
            return {
                statusCode: 400,
                success: false,
                message: 'No data found',
            };
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || error,
        };
    }
}

// Invitation Added Successfully
export async function Add_Invitations({
    Invited,
    Registered,
    EventID,
    UserID,
    DiscountPercentage,
    EligibleHousingIDs,
    NumDiscounts,
    AssignedHousingRentalID,
    HousingOption,
    AssignedHousingID,
    InternalNotes,
    NumTicketsRequired,
}, res) {
    try {
        // Check if an existing record exists
        const CheckEventsUser = await InvitationEvent.findOne({
            where: {
                EventID,
                UserID: UserID
            }
        });
        if (CheckEventsUser) {
            // Update the status if the record exists
            await InvitationEvent.update({ Status: 2 }, {
                where: {
                    status: 1,
                    // EventID: EventID,
                    UserID: UserID,
                },
            });
            return {
                statusCode: StatusCodes.OK,
                status: true,
                message: "User's status updated successfully.",
            };
        } else {
            // If no record found, create a new one
            const Eventdata = await InvitationEvent.create({
                Invited,
                Registered,
                EventID,
                UserID,
                DiscountPercentage,
                EligibleHousingIDs,
                NumDiscounts,
                AssignedHousingRentalID,
                HousingOption,
                AssignedHousingID,
                InternalNotes,
                NumTicketsRequired,
                Status: 2
            });
            return {
                statusCode: StatusCodes.OK,
                status: true,
                message: "User invited successfully.",
            };
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error,
        };
    }
}

export async function getInvitationInfo(req, res) {

    const { invitationId } = req;

    const fetchCount = await EventHousingRental.findOne({
        where: { InvitationID: invitationId },
        include: [
            {
                model: InvitationEvent, // eventinvitation table
                include: [{ model: User }, { model: Event }, { model: Housing }]
            }
        ]
    });

    if (fetchCount) {
        return {
            statusCode: 200,
            success: true,
            message: 'Fetch data Successfully!',
            data: fetchCount
        };

    } else {
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch data.',
        };
    }
}

export async function getInvitationInfoForInvitedMember(req, res) {
    const { invitationId } = req;
    const invitationData = await InvitationEvent.findOne({
        where: { ID: invitationId },
        include: [{ model: User, attributes: ['id', 'FirstName', 'LastName', 'Email', 'ImageURL', 'MembershipTypes', 'createdAt', 'updatedAt'] },
        { model: Event, attributes: ['id', 'Name', 'ShortName', 'EventTimeZone'] }],
        attributes: ['UserID', 'EventID', 'accommodation_status', 'accommodation_status', 'ArrivalDate', 'DepartureDate', 'EligibleHousingIDs', 'InternalNotes', 'id', 'Status']

    });

    // const getPropertyInfo = await AccommodationBookingInfo.findOne({
    const getPropertyInfo = await AccommodationBookingInfo.findAll({
        where: { event_id: invitationData.EventID, user_id: invitationData.UserID },
        include: [{ model: MyOrders, attributes: ['user_id', 'event_id', 'book_accommodation_id', 'createdAt'] }, { model: Housing, attributes: ['Name', 'NumBedrooms', 'MaxOccupancy'] }],
        attributes: ['user_id', 'event_id', 'accommodation_id', 'order_id']
    })

    const allData = { invitationData, getPropertyInfo };

    if (invitationData) {
        return {
            statusCode: 200,
            success: true,
            message: 'Fetch data Successfully!',
            data: allData
        };

    } else {
        return {
            statusCode: 500,
            success: false,
            data: [],
            message: 'Failed to fetch data.',
        };
    }
}

// New Api get invited members with pagination
export async function getInvitedMember(queryParams) {
    try {
        // Destructure from queryParams (instead of body)
        const {
            HousingOption,
            Status,
            FirstName,
            LastName,
            Email,
            MembershipLevel,
            Interest,
            ArtistType,
            UserID,
            EventID,
            CareyesHomeownerFlag,
            attended_festival_before,
            accommodation_status,
            keyword,
            page = 1,
            limit = 50
        } = queryParams; // ✅ data comes from req.query now
        const whereMain = {};
        // 👉 Build main filters
        if (HousingOption) whereMain.HousingOption = { [Op.in]: HousingOption.split(',') };
        if (Status) whereMain.Status = { [Op.in]: Status.split(',') };
        if (accommodation_status)
            whereMain.accommodation_status = { [Op.like]: `%${accommodation_status.trim()}%` };
        if (UserID) whereMain.UserID = { [Op.like]: `%${UserID}%` };
        if (EventID) whereMain.EventID = EventID;
        // 👉 Build User filters
        const whereUser = {};
        if (FirstName) whereUser.FirstName = { [Op.like]: `%${FirstName.trim()}%` };
        if (LastName) whereUser.LastName = { [Op.like]: `%${LastName.trim()}%` };
        if (Email) whereUser.Email = { [Op.like]: `%${Email.trim()}%` };
        if (MembershipLevel) whereUser.MembershipLevel = { [Op.like]: `%${MembershipLevel}%` };
        if (ArtistType) whereUser.ArtistType = { [Op.like]: `%${ArtistType}%` };

        // ✅ Keyword search across multiple fields
        if (keyword && keyword.trim() !== "") {
            const kw = `%${keyword.trim()}%`;
            // merge with OR condition
            whereUser[Op.or] = [
                { FirstName: { [Op.like]: kw } },
                { LastName: { [Op.like]: kw } },
                { Email: { [Op.like]: kw } },
                { Email: { [Op.like]: kw } },
                { PhoneNumber: { [Op.like]: kw } } // <-- make sure 'PhoneNumber' is in your User model
            ];
        }

        if (CareyesHomeownerFlag)
            whereUser.CareyesHomeownerFlag = { [Op.like]: `%${CareyesHomeownerFlag}%` };

        if (attended_festival_before) {
            if (attended_festival_before === 'I HAVE NEVER ATTENDED AN ONDALINDA EVENT') {
                whereUser.attended_festival_before = {
                    [Op.like]: '%I HAVE NEVER ATTENDED AN ONDALINDA EVENT%'
                };
            } else if (attended_festival_before === 'ANY') {
                whereUser.attended_festival_before = {
                    [Op.ne]: 'I HAVE NEVER ATTENDED AN ONDALINDA EVENT',
                    [Op.notLike]: '%ONDALINDA x MONTENEGRO 2024%'
                };
            } else if (attended_festival_before === 'ONDALINDA x MONTENEGRO 2024') {
                whereUser.attended_festival_before = {
                    [Op.like]: '%ONDALINDA x MONTENEGRO 2024%'
                };
            }
        }

        // 👉 Handle Interest filter separately
        if (Interest) {
            const interestIds = await UserInterest.findAll({
                attributes: ['UserID'],
                where: { Interest: { [Op.in]: Interest.split(',') } },
                raw: true
            });
            const userIds = interestIds.map((i) => i.UserID);

            if (userIds.length === 0) {
                return {
                    statusCode: 200,
                    success: true,
                    message: 'Search Invited Members Successfully!!',
                    data: [],
                    pagination: {
                        totalRecords: 0,
                        currentPage: parseInt(page) || 1,
                        totalPages: 0,
                        pageSize: parseInt(limit) || 50
                    }
                };
            }
            whereMain.UserID = { [Op.in]: userIds };
        }

        // 👉 Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const offset = (pageNum - 1) * limitNum;

        // 👉 Main query
        const { rows, count } = await InvitationEvent.findAndCountAll({
            where: whereMain,
            subQuery: false,
            distinct: true,
            attributes: [
                'id',
                'EventID',
                'UserID',
                'Status',
                'is_preference_submitted',
                'accommodation_status',
                'is_booking_status',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: User,
                    where: whereUser,
                    required: true,
                    attributes: [
                        'id',
                        'FirstName',
                        'LastName',
                        'Email',
                        'PhoneNumber',
                        'ImageURL',
                        'Status',
                        'country_group',
                        'MembershipTypes',
                        'DateCreated',
                        'admin_notes'
                    ]
                }
            ],
            order: [['id', 'DESC']],
            limit: limitNum,
            offset,
            logging: false
        });

        // ✅ Load heavy relations separately
        const resultsWithOrders = await Promise.all(
            rows.map(async (invitation, index) => {
                const orders = await MyOrders.findAll({
                    where: { user_id: invitation.UserID, event_id: EventID },
                    attributes: ['id', 'user_id', 'event_id', 'OriginalTrxnIdentifier'],
                    include: [
                        {
                            model: BookTicket,
                            attributes: ['id', 'event_id'],
                            where: { event_id: EventID },
                            required: false
                        },
                        {
                            model: AddonBook,
                            attributes: ['id', 'event_id'],
                            where: { event_id: EventID },
                            required: false
                        },
                        {
                            model: BookAccommodationInfo,
                            attributes: ['id', 'check_in_date', 'check_out_date', 'event_id', 'accommodation_id'],
                            where: { event_id: EventID },
                            required: false,
                            include: {
                                model: Housing,
                                attributes: ['Name'],
                                include: { model: HousingNeighborhood, attributes: ['name'] }
                            }
                        }
                    ]
                });

                const serialNo = (pageNum - 1) * limitNum + (index + 1);
                return {
                    serialNo,
                    ...invitation.toJSON(),
                    Orders: orders
                };
            })
        );

        return {
            statusCode: 200,
            success: true,
            message: 'Search Invited Members Successfully!!',
            data: resultsWithOrders,
            pagination: {
                totalRecords: count,
                currentPage: pageNum,
                totalPages: Math.ceil(count / limitNum),
                pageSize: limitNum
            }
        };
    } catch (error) {
        console.error('error', error.message);
        return { success: false, data: [], message: 'Internal Server Error :' + error.message };
    }
}


// send invitation email invite to all based on filter --(kamal-28-07-2025)

export async function sendInvitationEmailsToFilteredUsers(body, res) {
    try {
        const {
            HousingOption,
            Status,
            FirstName,
            LastName,
            Email,
            Interest,
            UserID,
            EventID,
            accommodation_status,
            keyword,
        } = body;

        const whereMain = {};
        if (HousingOption) whereMain.HousingOption = { [Op.in]: HousingOption.split(',') };
        if (accommodation_status)
            whereMain.accommodation_status = { [Op.like]: `%${accommodation_status.trim()}%` };
        if (UserID) whereMain.UserID = { [Op.like]: `%${UserID}%` };
        if (EventID) whereMain.EventID = EventID;

        // ✅ Always exclude Status = 2
        if (Status) {
            whereMain.Status = {
                [Op.and]: [
                    { [Op.in]: Status.split(',') },
                    { [Op.ne]: 2 }
                ]
            };
        } else {
            whereMain.Status = { [Op.ne]: 2 };
        }

        const whereUser = {};
        if (FirstName) whereUser.FirstName = { [Op.like]: `%${FirstName.trim()}%` };
        if (LastName) whereUser.LastName = { [Op.like]: `%${LastName.trim()}%` };
        if (Email) whereUser.Email = { [Op.like]: `%${Email.trim()}%` };
        if (keyword && keyword.trim() !== "") {
            const kw = `%${keyword.trim()}%`;
            whereUser[Op.or] = [
                { FirstName: { [Op.like]: kw } },
                { LastName: { [Op.like]: kw } },
                { Email: { [Op.like]: kw } },
                { PhoneNumber: { [Op.like]: kw } },
            ];
        }

        // ✅ Handle Interest filtering
        if (Interest) {
            const interestIds = await UserInterest.findAll({
                attributes: ['UserID'],
                where: { Interest: { [Op.in]: Interest.split(',') } },
                raw: true
            });
            const userIds = interestIds.map(i => i.UserID);
            if (userIds.length === 0) {
                return res.status(200).json({ success: true, message: "No users found for given filters", data: [] });
            }
            whereMain.UserID = { [Op.in]: userIds };
        }

        const BATCH_SIZE = 500;
        let offset = 0;
        let totalSent = 0;

        const invitationTemplateData = await Emailtemplet.findOne({
            where: { eventId: EventID, templateId: 29 }
        });

        if (!invitationTemplateData) {
            return res.status(200).json({ success: false, message: "No invitation template found" });
        }

        const sanitizedTemplate = invitationTemplateData.description;
        const subject = invitationTemplateData.subject;
        const templateName = invitationTemplateData.mandril_template;

        while (true) {
            const invitedUsers = await InvitationEvent.findAll({
                where: whereMain,
                include: [
                    {
                        model: User,
                        where: whereUser,
                        required: true,
                        attributes: ['id', 'FirstName', 'Email']
                    }
                ],
                attributes: ['EventID', 'UserID', 'Status'],
                offset,
                limit: BATCH_SIZE
            });

            if (invitedUsers.length === 0) break;

            const emailBatchPromises = invitedUsers.map(async (invite) => {
                const { Email } = invite.User;
                const template = invitationTemplate({
                    SiteUrl: `${SITE_URL}/accommodations/`,
                    html: sanitizedTemplate,
                });
                const mergeVars = { ALLDATA: template.html };
                return sendEmail(Email, mergeVars, templateName, subject);
            });
            // Await all emails in this batch
            await Promise.allSettled(emailBatchPromises);

            totalSent += invitedUsers.length;
            offset += BATCH_SIZE;
        }

        return res.status(200).json({
            success: true,
            message: `Invitation emails sent successfully.`,
            count: totalSent,
        });

    } catch (err) {
        console.error("Error sending invitations:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error: " + err.message });
    }
}


























