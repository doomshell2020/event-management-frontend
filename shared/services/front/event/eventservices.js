import { InvitationEvent, Event, MyTicketBook } from "@/database/models"
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import ResponseManagement from "@/utils_back/responsemanagement"


// View Upcomming events
import { Op } from 'sequelize';


export const addEvent = async (req, res) => {
    try {
        const {
            eventName,
            companyId,
            countryId,
            location,
            eventImage,
            eventType,
            timeZone,
            currencyId,
            isFree,
            startDate,
            endDate,
            SaleStartDate,
            SaleEndDate,
            ticketLimit,
            slug,
            shareUrl,
            approvalDays,
            youtubeUrl,
            ticketPlatformFee,
            ticketStripeFee,
            ticketBankFee,
            ticketProcessingFee,
            description
        } = req.body;

        const filename = req.file ? req.file.filename : null;
        const userId = req.authUser.id;

        // ✅ Check if event already exists (by slug or event name)
        const existingEvent = await Event.findOne({
            where: {
                [Op.or]: [
                    { Name: eventName },
                    { slug: slug }  // if slug is unique
                ]
            }
        });

        if (existingEvent) {
            return res.status(400).json({
                status: false,
                message: "Event already exists with this name or slug.",
            });
        }

        // ✅ Create new event
        const event = await Event.create({
            organiser_id: userId,
            Name: eventName,
            EventName: eventName,
            ShortName: eventName,
            event_menu_name: eventName,
            EventTimeZone: timeZone,
            Country: countryId,
            ImageURL: filename,
            EventType: eventType,
            Venue: location,
            payment_currency: currencyId,
            StartDate: startDate,
            EndDate: endDate,
            SaleStartDate: startDate,
            SaleEndDate: endDate,
            videoUrl: youtubeUrl,
            ticket_platform_fee_percentage: ticketPlatformFee,
            ticket_stripe_fee_percentage: ticketStripeFee,
            ticket_bank_fee_percentage: ticketBankFee,
            ticket_processing_fee_percentage: ticketProcessingFee,
            Summary: description,
            slug,
            shareUrl,
            approvalDays,
            isFree,
            ticketLimit
        });

        return res.status(200).json({
            status: true,
            message: "Event Added Successfully",
            data: event
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error Occurred: " + error.message,
            data: error
        });
    }
};



export async function fetchTotalTicket(req, res) {
    try {
        const { eventId, userId } = req.query;

        const ticketCount = await MyTicketBook.count({
            where: {
                event_id: eventId,
                cust_id: userId
            }
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            totalTickets: ticketCount
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error: ' + error.message
        });
    }
}


export async function View_Upcommingevents({ UserID }, res) {

    try {
        const current_date = new Date();

        const data = await InvitationEvent.findOne({

            // order: [["createdAt", "ASC"]],
            where: {
                UserID: UserID,
                Status: "1",
                '$Event.EndDate$': {
                    [Op.gte]: current_date,
                },
            },

            include: { model: Event }
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            data: data,
            message: "View Upcoming Events Successfully"
        }
    } catch (error) {
        return error;
    }
}

// past Event 
export async function View_Pastevents({ Userid }, res) {
    try {
        const current_date = new Date();

        // Fetch data with filters and ordering
        const data = await InvitationEvent.findAll({
            attributes: ['id', 'UserID', 'createdAt'], // Specify attributes for InvitationEvent table
            where: {
                UserID: Userid,
                '$Event.EndDate$': {
                    [Op.lte]: current_date, // Filter events with EndDate <= current date
                },
            },
            include: {
                model: Event,
                attributes: ['id', 'ShortName', 'EndDate', 'ImageURL', 'Name'], // Specify attributes for Event table
                order: [['id', 'DESC']], // Order Event table data by id in descending order
            },
            order: [['createdAt', 'DESC']], // Optionally, order InvitationEvent by createdAt in descending order
        });

        if (!data || data.length === 0) {
            const error = new Error("ID not found");
            error.StatusCodes = 404;
            throw error;
        }

        return {
            success: true,
            data: data,
            message: "View Past Events Successfully",
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || "An error occurred while fetching past events.",
        };
    }
}


// Add submit your interest in joining
// export async function Add_Interest({
//     UserID,
//     EventID
// }, res) {
//     try {
//         const interested_event = await InvitationEvent.create({
//             UserID,
//             EventID,
//             Status: "0"

//         });
//         return {
//             statusCode: StatusCodes.OK,
//             status: true,
//             message: "Submit Your Interest Successfully",
//             id: interested_event.id,
//         }
//     } catch (error) {
//         return {
//             statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//             error
//         };
//     }
// }

export async function Add_Interest({
    UserID,
    EventID
}, res) {
    const CheckEventsUser = await InvitationEvent.findOne({
        where: {
            EventID,
            UserID
        }
    })
    if (!CheckEventsUser) {
        // console.log("This User Invited Successfully")
        const interested_event = await InvitationEvent.create({
            UserID,
            EventID,
            Status: "0"

        });
    }
    else {
        // console.log("The User Is Already Interested At This Event.")
        ResponseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "The User Is Already Interested At This Event.");
        return
    }
    return {
        statusCode: StatusCodes.OK,
        status: true,
        message: "Thank you for your interest in our event! We've received your request and will keep you updated with all the latest information. Stay tuned!",
        // id: interested_event.id,
    }

}

// check the user is interested and not interested
// new
export async function Fetch_Invitation(req) {
    const tokan = req.headers.authorization.replace('Bearer ', '');
    const decodedToken = jwt.verify(tokan, 'your-secret-key'); // Decode and verify token
    const userIds = req.userId = decodedToken.userId
    const current_date = new Date();
    const eventId = req.query.eventId;
    console.log("eventId", eventId)
    const fetchInvitation = await InvitationEvent.findOne({
        where: {
            UserID: userIds,
            EventID: eventId,
            // Status: '0',
            // '$Event.EndDate$': {
            //     [Op.gte]: current_date,
            // },

        },
        include: { model: Event }
    });
    if (fetchInvitation) {
        return {
            statusCode: 200,
            success: true,
            message: 'This User Is Interested In This Event!',
            data: fetchInvitation
        };
    } else {
        return {
            statusCode: 400,
            success: false,
            message: 'No invitation found for this user and event.',
            data: null
        };
    }
}

// old
// export async function Fetch_Invitation(req) {
//     const tokan = req.headers.authorization.replace('Bearer ', '');
//     const decodedToken = jwt.verify(tokan, 'your-secret-key'); // Decode and verify token
//     const userIds = req.userId = decodedToken.userId
//     const current_date = new Date();
//     const fetchInvitation = await InvitationEvent.findOne({
//         where: {
//             UserID: userIds,
//             // Status: '0',
//             '$Event.EndDate$': {
//                 [Op.gte]: current_date,
//             },

//         },
//         include: { model: Event }
//     });

//     return {
//         statusCode: 200,
//         success: true,
//         message: 'This User Is Interested At This Event!',
//         data: fetchInvitation
//     };
// }

export async function userExistInEvent(userId) {
    const fetchInvitation = await InvitationEvent.findOne({
        where: {
            UserID: userId
        }
    });
    if (fetchInvitation) {
        return {
            statusCode: 200,
            success: true,
            message: 'This User Is Interested At This Event!',
            data: fetchInvitation
        };
    } else {

        return {
            statusCode: 400,
            success: false,
            message: 'Data Not found !'
        };
    }

}

// view events for active
export async function viewActiveEvents({ eventId }, req, res) {
    try {
        const current_date = new Date();
        const data = await Event.findAll({
            where: {
                id: eventId,
                EndDate: {
                    [Op.gte]: current_date,
                },
            },
            order: [["EndDate", "ASC"]], // Order by EndDate in ascending order
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            message: "View Past Events Successfully",
            data: data,
        }
    } catch (error) {
        return error;
    }
}


// View All Events
// export async function viewAllEvents(req, res) {
//     try {
//         // Fetch all events from the database
//         const currentDate = new Date();
//         const data = await Event.findAll({
//             where: {
//                 EndDate: {
//                     [Op.lt]: currentDate, // Filter where EndDate is less than current date
//                 },
//             },
//             order: [["DateCreated", "DESC"]],
//             attributes: ['id', 'Name', 'status', 'DateCreated']
//         });

//         if (!data || data.length === 0) {
//             return {
//                 success: false,
//                 message: 'No Data Found !',
//             };
//         }

//         // Transform database events into the desired format
//         const transformedData = data.map(event => ({
//             name: event.Name,
//             key: event.Name.replace(/,/g, '*') // Replace commas with asterisks in the key
//         }));

//         // Combine with the existing AttendedFestivalBefore array if needed
//         const attendedFestivalBefore = [
//             ...transformedData,
//             {
//                 name: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT",
//                 key: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT"
//             }
//         ];

//         return {
//             success: true,
//             message: "View All Events Successfully",
//             data: attendedFestivalBefore
//         };
//     } catch (err) {
//         return {
//             success: false,
//             message: 'Internal Server Error !',
//         };
//     }
// }


export async function viewAllEvents(req, res) {
    try {
        // Fetch all events from the database
        const currentDate = new Date();
        const data = await Event.findAll({
            where: {
                EndDate: {
                    [Op.lt]: currentDate, // Filter where EndDate is less than current date
                },
            },
            order: [["DateCreated", "DESC"]],
            attributes: ['id', 'Name', 'status', 'DateCreated']
        });

        if (!data || data.length === 0) {
            return {
                success: false,
                message: 'No Data Found !',
            };
        }

        // Transform database events into the desired format
        const transformedData = data.map(event => ({
            id: event.id, // Include the ID
            name: event.Name,
            key: event.Name.replace(/,/g, '*') // Replace commas with asterisks in the key
        }));

        // Combine with the existing AttendedFestivalBefore array with static ID
        const attendedFestivalBefore = [
            ...transformedData,
            {
                id: 0, // Static ID for "I HAVE NEVER ATTENDED AN ONDALINDA EVENT"
                name: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT",
                key: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT"
            }
        ];

        return {
            success: true,
            message: "View All Events Successfully",
            data: attendedFestivalBefore
        };
    } catch (err) {
        return {
            success: false,
            message: 'Internal Server Error !',
        };
    }
}

// view latest new events
export async function viewLatestNewEvents(req, res) {
    try {
        const currentDate = new Date();
        const eventData = await Event.findAll({
            order: [["id", "DESC"]],
            where: {
                DateCreated: {
                    [Op.gte]: new Date('2023-11-28') // Filter for dates >= 2024
                },
                EndDate: {
                    [Op.lt]: currentDate // Add new condition for EndDate < current date
                }
            },
            attributes: ['id', 'Name', 'status', 'DateCreated'],
        })
        return {
            success: true,
            message: "View Latest New Events Successfully",
            data: eventData

        }
    } catch (err) {
        // console.log("err", err.message)
        return {
            success: false,
            message: 'Internal Server Error !',
        }
    }
}

export async function getActiveEventList(req, res) {
    try {
        const current_date = new Date();

        const data = await Event.findAll({
            where: {
                EndDate: {
                    [Op.gte]: current_date,
                },
            },
            order: [["EndDate", "ASC"]],
        });

        if (data && data.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Active events fetched successfully.",
                data,
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "No active events found.",
                data: [],
            });
        }
    } catch (error) {
        console.error("Error fetching active events:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching active events.",
            error: error.message,
        });
    }
}