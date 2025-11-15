import { BookAccommodation, EventHousingRelations, AccommodationBookingInfo, Housing, User, HousingEnquiry, Currency, Event, Emailtemplet, HousingImage, InvitationEvent, EventHousing, HousingBedrooms, HousingBedType, HousingTypes, HousingNeighborhood, MyOrders, AccommodationExtension } from "@/database/models"
import { StatusCodes } from 'http-status-codes';
import { Op } from 'sequelize';
import { sendEmail, sendEmailWithBCC,sendEmailWithBCCNew } from "@/utils_back/sendEmail"; // send mail via mandril
import { guestReceivedVillaTemplate, bookAccommodationTemplate } from "@/utils_back/email-templates";


// Book Accommodation 
export async function Book_Accommodation({
    HousingID,
    UserID,
    EventID,
    Email,
    bedrooms,
    ArrivalDate,
    DepartureDate,
}, res) {
    try {
        // Check if user already booked this property for the same event
        const alreadyBooked = await BookAccommodation.findOne({
            where: {
                userId: UserID,
                eventId: EventID,
                HousingID
            }
        });
        if (alreadyBooked) {
            return {
                statusCode: StatusCodes.CONFLICT,
                success: false,
                message: "You have already sent a booking request for this property for this event.",
            };
        }
        // User Info FirstName and LastName
        const UserInfo = await User.findOne({
            where: { id: UserID },
            attributes: ["id", "FirstName", "LastName", "Email"]
        })
        const UserName = UserInfo.FirstName + " " + UserInfo.LastName;
        const toUserEmail = UserInfo.Email;
        // Find Event Info
        const EventInfo = await Event.findOne({
            where: {
                id: EventID
            },
            attributes: ["id", "Name", "StartDate", "EndDate"]
        })
        let formattedDate = '';
        const startDate = new Date(EventInfo.StartDate);
        const endDate = new Date(EventInfo.EndDate);
        const options = { month: 'long' }; // only month name
        const startMonth = startDate.toLocaleString('en-US', options);
        // const endMonth = endDate.toLocaleString('en-US', options);
        formattedDate = `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;

        // Find Housing Info
        const HouseInfo = await Housing.findOne({
            where: {
                id: HousingID
            },
            attributes: ["id", "Name", "ManagerName", "ManagerEmail"]
        })
        const ManagerEmail = HouseInfo.ManagerEmail
        const ManagerName = HouseInfo.ManagerName
        const propertyName = HouseInfo.Name
        const interested_event = await BookAccommodation.create({
            userId: UserID,
            eventId: EventID,
            Email,
            bedrooms,
            ArrivalDate,
            DepartureDate,
            HousingID
        });
        const findInvitation = await InvitationEvent.findOne({ where: { EventID, UserID } })
        if (findInvitation) {// update 
            await InvitationEvent.update(
                { accommodation_status: propertyName },
                { where: { EventID, UserID } }
            );
        } else {
            await InvitationEvent.create({
                EventID: EventID,
                UserID: UserID,
                accommodation_status: propertyName,
                Status: 1
            });
        }

        // --- Choose template & BCC conditionally ---
        let templateId = 0;
        let eventIdForTemplate = 0;
        let bccEmails = [];
        let toEmail = [];
        if (HousingID == 271) {
            templateId = 30;
            eventIdForTemplate = 111;
            bccEmails = ["lucrecia@ondalinda.com"];
            toEmail = ["Sales2@alamandas.com",toUserEmail];
        } else if (HousingID == 270) {
            templateId = 40;
            eventIdForTemplate = 111;
            bccEmails = ["lucrecia@ondalinda.com"];
            toEmail = ["raguilar@cuixmala.com", toUserEmail];
        } else if (HousingID == 129) {
            templateId = 41;
            eventIdForTemplate = 111;
            bccEmails = ["lucrecia@ondalinda.com"];
            toEmail = ["maria@lasrosadas.com", toUserEmail];
        } else {
            // fallback, if needed
            templateId = 30;
            eventIdForTemplate = 111;
            bccEmails = ["lucrecia@ondalinda.com"];
            toEmail = ["Sales2@alamandas.com",toUserEmail];
        }
        // ✅ ADD manager email in BCC also:
        bccEmails.push(ManagerEmail);
        // --- Fetch correct template ---
        const findTemplate = await Emailtemplet.findOne({
            where: { eventId: eventIdForTemplate, templateId: templateId }
        });

        const sanitizedTemplate = findTemplate.description;
        const mailChampTemplateName = findTemplate.mandril_template;
        const subject = findTemplate.subject;
        // --- Compose template ---
        let template = bookAccommodationTemplate({
            ManagerName: ManagerName,
            UserName: UserName,
            UserEmail: toUserEmail,
            PropertyName: propertyName,
            EventDate: formattedDate,
            html: sanitizedTemplate,
        });
        let extractedTemplate = template.html;
        const templateName = mailChampTemplateName;
        const mergeVars = { ALLDATA: extractedTemplate };

        if ([10315,11492, 10272].includes(Number(UserID))) {
            console.log('>>>>>>>>>>>>>>>>>>>Testing');
            await sendEmailWithBCCNew(['rupam+1@doomshell.com',toUserEmail], ['rupam@doomshell.com'], mergeVars, templateName, subject);
        } else {
            console.log('>>>>>>>>>>>>>>>>>>>Live');
            await sendEmailWithBCCNew(toEmail, bccEmails, mergeVars, templateName, subject);
        }

        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Your request has been sent to the property manager.",
            data: interested_event,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message,
        }
    }
}












export async function Find_Event_Housing({
    AvailabilityStartDate,
    AvailabilityEndDate,
    EventID,
    NumBedrooms
}) {
    try {
        // Validate required input
        if (!AvailabilityStartDate || !AvailabilityEndDate || !EventID || !NumBedrooms) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Missing required keys!"
            };
        }

        // Step 1: Get already booked accommodation IDs
        const testData = await MyOrders.findAll({
            where: {
                event_id: EventID,
                book_accommodation_id: {
                    [Op.not]: null
                }
            },
            attributes: ["book_accommodation_id"],
            raw: true
        });

        const accommodationIds = testData.map(row => row.book_accommodation_id);

        // Step 2: Fetch available (unbooked) housing
        const eventFind = await EventHousingRelations.findAll({
            where: {
                EventID,
                Status: 2,
                isBooked: { [Op.in]: ['N', 'P'] }, // Available
                NightlyPrice: { [Op.gt]: 0 },
                [Op.and]: [
                    { AvailabilityStartDate: { [Op.lte]: AvailabilityStartDate } },
                    { AvailabilityEndDate: { [Op.gte]: AvailabilityEndDate } }
                ],
                HousingID: {
                    [Op.notIn]: accommodationIds.length > 0 ? accommodationIds : [0]
                }
            },
            include: [
                {
                    model: Housing,
                    attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "bookingStatus", "booking_notes"],
                    where: { NumBedrooms, bookingStatus: "N" },
                    required: true,
                    include: [
                        { model: HousingNeighborhood, attributes: ["name"] },
                        { model: HousingTypes, attributes: ["name"] }
                    ]
                }
            ],
            order: [['NightlyPrice', 'ASC']]
        });
        // Step 3: Fetch pre-booked properties (e.g. Cuixmala, Las Alamandas)
        const event270Properties = await EventHousingRelations.findAll({
            where: {
                EventID,
                Status: 2,
                [Op.and]: [
                    { AvailabilityEndDate: { [Op.lte]: AvailabilityEndDate } },
                    { AvailabilityStartDate: { [Op.gte]: AvailabilityStartDate } }
                ]
            },
            include: [
                {
                    model: Housing,
                    attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "bookingStatus", "booking_notes"],
                    where: { bookingStatus: "Y" },
                    required: true,
                    include: [
                        { model: HousingNeighborhood, attributes: ["name"] },
                        { model: HousingTypes, attributes: ["name"] }
                    ]
                }
            ],
            order: [[Housing, "ID", "DESC"]]
        });

        // Step 4: Neighborhood priority list (from your provided list)
        const neighborhoodOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,14];

        // Step 5: Group available housing by Neighborhood ID
        const groupedByNeighborhood = {};
        const fallbackList = [];

        for (const property of eventFind) {
            const neighborhoodKey = property?.Housing?.Neighborhood;
            if (!groupedByNeighborhood[neighborhoodKey]) {
                groupedByNeighborhood[neighborhoodKey] = [];
            }
            groupedByNeighborhood[neighborhoodKey].push(property);
        }

        // Sort each neighborhood group by NightlyPrice
        Object.values(groupedByNeighborhood).forEach(group => {
            group.sort((a, b) => a.NightlyPrice - b.NightlyPrice);
        });

        // Step 6: Pick up to 2 per neighborhood in order
        let availableLimited = [];

        for (const id of neighborhoodOrder) {
            const group = groupedByNeighborhood[id];
            if (group && group.length > 0) {
                const top2 = group.slice(0, 2);
                availableLimited.push(...top2);

                if (group.length > 2) {
                    fallbackList.push(...group.slice(2));
                }
            }
            if (availableLimited.length >= 6) break;
        }

        // Step 7: Fill remaining slots (if < 6) from fallback
        if (availableLimited.length < 6 && fallbackList.length > 0) {
            fallbackList.sort((a, b) => a.NightlyPrice - b.NightlyPrice);
            const remaining = 6 - availableLimited.length;
            availableLimited.push(...fallbackList.slice(0, remaining));
        }

        // Final trim (just in case)
        availableLimited = availableLimited.slice(0, 6);

        // Step 8: Combine booked and available results
        const finalProperties = [...event270Properties, ...availableLimited];

        // ✅ Final return
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Event Housing Successfully Fetched",
            data: finalProperties
        };

    } catch (error) {
        // Error handling
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}






// Event Housing Find date base , event_id , MaxOccupancy (03-03-2025)
// export async function Find_Event_Housing({
//     AvailabilityStartDate,
//     AvailabilityEndDate,
//     EventID,
//     MaxOccupancy
// }) {
//     try {
//         // Validation for required keys
//         if (!AvailabilityStartDate || !AvailabilityEndDate || !EventID || !MaxOccupancy) {
//             return {
//                 statusCode: StatusCodes.BAD_REQUEST,
//                 success: false,
//                 message: "Missing required keys!"
//             };
//         }

//         // Fetch data with filters and relations
//         const eventFind = await EventHousingRelations.findAll({
//             where: {
//                 // AvailabilityStartDate,
//                 // AvailabilityEndDate,
//                 EventID,
//                 Status: 2,
//                 [Op.or]: [
//                     { AvailabilityStartDate: { [Op.between]: [AvailabilityStartDate, AvailabilityEndDate] } },
//                     { AvailabilityEndDate: { [Op.between]: [AvailabilityStartDate, AvailabilityEndDate] } },
//                     {
//                         // To check if the given range falls within the event's range
//                         AvailabilityStartDate: { [Op.lte]: AvailabilityStartDate },
//                         AvailabilityEndDate: { [Op.gte]: AvailabilityEndDate }
//                     }
//                 ]
//             },
//             include: [
//                 {
//                     model: Housing,
//                     attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL"],
//                     where: { MaxOccupancy },
//                     required: true,
//                     include: [{ model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }]
//                 }
//             ]
//         });

//         return {
//             statusCode: StatusCodes.OK,
//             success: true,
//             message: "Event Housing Successfully Fetched",
//             data: eventFind
//         };
//     } catch (error) {
//         return {
//             statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//             success: false,
//             message: error.message
//         };
//     }
// }

// export async function Find_Event_Housing({
//     AvailabilityStartDate,
//     AvailabilityEndDate,
//     EventID,
//     NumBedrooms
// }) {
//     try {

//         if (!AvailabilityStartDate || !AvailabilityEndDate || !EventID || !NumBedrooms) {
//             return {
//                 statusCode: StatusCodes.BAD_REQUEST,
//                 success: false,
//                 message: "Missing required keys!"
//             };
//         }

//         // get ids those booked from my orders book_accommodation_id
//         const testData = await MyOrders.findAll({
//             where: {
//                 event_id: EventID,
//                 book_accommodation_id: {
//                     [Op.not]: null
//                 }
//             },
//             attributes: ["book_accommodation_id"],
//             raw: true
//         });
//         const accommodationIds = testData.map(row => row.book_accommodation_id);
//         // console.log('Booked accommodation IDs:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', accommodationIds);

//         const eventFind = await EventHousingRelations.findAll({
//             where: {
//                 EventID,
//                 Status: 2,
//                 // isBooked: "N",
//                 isBooked: { [Op.in]: ['N', 'P'] }, // Allow 'N' or 'P', exclude 'Y'
//                 NightlyPrice: { [Op.gt]: 0 }, // Fetch only where OwnerAmount > 0
//                 [Op.and]: [
//                     { AvailabilityStartDate: { [Op.lte]: AvailabilityStartDate } },
//                     { AvailabilityEndDate: { [Op.gte]: AvailabilityEndDate } }
//                 ],
//                 HousingID: {
//                     [Op.notIn]: accommodationIds.length > 0 ? accommodationIds : [0] // if empty, avoid excluding all
//                 }

//             },
//             include: [
//                 {
//                     model: Housing,
//                     attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "bookingStatus", "booking_notes"],
//                     where: { NumBedrooms, bookingStatus: "N" },
//                     required: true,
//                     include: [
//                         { model: HousingNeighborhood, attributes: ["name"] },
//                         { model: HousingTypes, attributes: ["name"] }
//                     ]
//                 }
//             ],
//             order: [['NightlyPrice', 'ASC']],
//             // limit: 4
//             limit: 6
//         });

//         // Book Now Button show property find no required bedrooms  Cuixmal and Lasalmadis
//         const event270Properties = await EventHousingRelations.findAll({
//             where: {
//                 EventID,
//                 // HousingID: 270,
//                 Status: 2,
//                 [Op.and]: [
//                     { AvailabilityEndDate: { [Op.lte]: AvailabilityEndDate } },
//                     { AvailabilityStartDate: { [Op.gte]: AvailabilityStartDate } }
//                 ]
//             },
//             include: [
//                 {
//                     model: Housing,
//                     attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "bookingStatus", "booking_notes"],
//                     where: { bookingStatus: "Y" },
//                     required: true,
//                     include: [
//                         { model: HousingNeighborhood, attributes: ["name"] },
//                         { model: HousingTypes, attributes: ["name"] }
//                     ],
//                     // order: [["ID", "DESC"]],
//                 }
//             ],
//             order: [[Housing, "ID", "DESC"]]
//         });
//         // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>',event270Properties);

//         // // ....
//         const allProperties = [...event270Properties, ...eventFind];


//         return {
//             statusCode: StatusCodes.OK,
//             success: true,
//             message: "Event Housing Successfully Fetched",
//             // data: eventFind
//             data: allProperties
//         };
//     } catch (error) {
//         return {
//             statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//             success: false,
//             message: error.message
//         };
//     }
// }

// find Housing For Assigned the users  new (14-05-2025)
export async function findHousingAssignedUsersForEvent({
    EventID,
    UserID,
}) {
    try {
        // Validate input parameters
        if (!EventID || !UserID) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Missing or invalid required keys!"
            };
        }

        // get ids those booked from my orders book_accommodation_id
        const testData = await MyOrders.findAll({
            where: {
                event_id: EventID,
                book_accommodation_id: {
                    [Op.not]: null
                }
            },
            attributes: ["book_accommodation_id"],
            raw: true
        });
        const accommodationIds = testData.map(row => row.book_accommodation_id);
        // console.log('Booked accommodation IDs:', accommodationIds);

        const invitationInfo = await InvitationEvent.findOne({
            where: { EventID: EventID, UserID: UserID },
            attributes: ['EventID', 'UserID', 'EligibleHousingIDs', 'ArrivalDate', 'DepartureDate', 'expiresAt', 'expire_status']
        });

        let propertyIds = [];

        if (invitationInfo?.EligibleHousingIDs) {
            propertyIds = invitationInfo.EligibleHousingIDs
                .replace(/"/g, '') // clean quotes
                .split(',') // split into array
                .map(id => Number(id)) // convert to numbers
                .filter(id => !isNaN(id)); // remove NaNs

            // Remove already booked accommodation IDs
            propertyIds = propertyIds.filter(id => !accommodationIds.includes(id));
        }

        // console.log('Available property IDs after filtering:', propertyIds);

        const now = new Date();
        const expiresAt = new Date(invitationInfo?.expiresAt);
        if (invitationInfo?.expire_status == "expired" || now > expiresAt) {
            if (invitationInfo?.expire_status !== "expired" && now > expiresAt) {
                await InvitationEvent.update(
                    { expire_status: "expired" },
                    { where: { EventID, UserID } }
                );
            }
            return {
                success: false,
                message: "This invitation link has expired.",
            };
        }
        if (invitationInfo?.expire_status === "purchased") {
            return {
                success: false,
                message: "This invitation has already been used.",
            };
        }
        // Query for event housing relations
        const eventFind = await EventHousingRelations.findAll({
            where: {
                EventID,
                Status: 2,
                // isBooked: "N",
                isBooked: { [Op.in]: ['N', 'P'] }, // Allow 'N' or 'P', exclude 'Y'
                HousingID: { [Op.in]: propertyIds }, // Handle multiple property IDs
                // AvailabilityStartDate: { [Op.gte]: AvailabilityStartDate },
                // AvailabilityEndDate: { [Op.lte]: AvailabilityEndDate }
            },
            include: [
                {
                    model: Housing,
                    attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "bookingStatus", "booking_notes"],
                    // where: { NumBedrooms, bookingStatus: "N" },
                    required: true,
                    include: [
                        { model: HousingNeighborhood, attributes: ["name"] },
                        { model: HousingTypes, attributes: ["name"] }
                    ]
                }
            ]
        });

        // Return successful response
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Event Housing Successfully Fetched",
            data: eventFind
        };
    } catch (error) {
        // Return error response in case of failure
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}

// findAll details for property 
export async function findPropertyDetails({ property_id }) {
    try {
        // Validation for required keys
        if (!property_id) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Missing required keys!"
            };
        }
        const eventFind = await Housing.findOne({
            where: {
                id: property_id,
            },
            include: [
                {
                    model: EventHousing,
                    attributes: ["id", "NightlyPrice", "totalAfterTaxes", "BaseNightlyPrice", 'AvailabilityEndDate', 'AvailabilityStartDate', 'EventID', 'OwnerAmount', 'TotalStripeFeeAmount', 'TotalOndalindaFeeAmount', 'ServiceFeeAmount', 'MexicanVATAmount', 'AccommodationTaxAmount', 'OndalindaFeeAmount'],
                    order: [['id', 'DESC']], // Optional: you can sort them too 
                },
                {
                    model: HousingImage, separate: true, // Required to apply limit
                    limit: 4,       // Only get up to 4 images
                    order: [['id', 'DESC']], // Optional: you can sort them too 
                    attributes: ["HousingID", "URL"]
                },
                // { model: User },
                {
                    model: HousingBedrooms, separate: true, order: [['id', 'ASC']], include: [{ model: HousingBedType }] // Nested include
                }, { model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }
            ],
            order: [["createdAt", "DESC"]],
            attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "Description", "amenities", 'bookingStatus', "booking_notes", 'terms_and_conditions', 'Pool', 'google_map'],
        });

        // const EventID = eventFind.EventHousings[0].EventID;
        const latestEvent = eventFind.EventHousings
            .sort((a, b) => b.EventID - a.EventID)[0];

        const EventID = latestEvent?.EventID;

        const event = await Event.findOne({
            include: [{ model: Currency }],
            where: { id: EventID },
            attributes: ["id", "Name", 'EventName', 'StartDate', 'EndDate', "status"],
        });
        const Currency_symbol = event.Currency.dataValues.Currency_symbol
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Housing Details Find Successfully!!",
            data: eventFind,
            event,
            Currency_symbol: Currency_symbol
        };
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}

export async function findPropertyDetailsForCart({ property_id, EventID }) {
    try {
        // Validation for required keys
        if (!property_id || !EventID) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Property ID and Event ID are required",
            };
        }
        const eventFind = await Housing.findOne({
            where: {
                id: property_id,
            },
            include: [
                {
                    model: EventHousing,
                    where: {
                        EventID
                    },
                    attributes: ['id', 'BaseNightlyPrice', 'ServiceFeeAmount', 'MexicanVATAmount', 'AccommodationTaxAmount', 'OndalindaFeeAmount', 'TotalStripeFeeAmount', 'ticket_bank_fee_amount', 'ticket_processing_fee_amount', 'totalAfterTaxes', 'OwnerAmount', 'NightlyPrice']
                },
                {
                    model: HousingNeighborhood,
                    attributes: ["name"]
                },
                { model: HousingTypes, attributes: ["name"] }
            ],
            order: [["createdAt", "DESC"]],
            attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL"]
        });

        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Housing Details Find Successfully!!",
            data: eventFind,
        };
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}

// find All images for property
export async function findPropertyImages({ propertyId }) {
    try {
        // Validation for required keys
        if (!propertyId) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Missing required keys!"
            };
        }
        const eventFind = await HousingImage.findAll({
            where: {
                HousingID: propertyId,
            },
            order: [["createdAt", "DESC"]],
        });

        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "ViewAll Housing Images Successfully!!!",
            data: eventFind
        };
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}

// Find user for add ticket time check user in exists in database and not (03-03-2025)
export async function Find_User({ UserEmail }) {
    try {
        // Fetch data with filters and relations
        const eventFind = await User.findOne({
            where: { Email: UserEmail },
            attributes: ["id", "FirstName", "LastName", "Email", "Gender"]
        });
        if (eventFind) {
            return {
                success: true,
                message: "User found Successfully!!!",
                data: eventFind
            }
        } else {
            return {
                success: false,
                message: "User not found",
            }
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}

// find user details
export async function userDetails({
    UserID
}) {
    try {
        // Fetch data with filters and relations
        const userInfo = await User.findOne({
            where: { id: UserID },
            attributes: ["id", "FirstName", "LastName", "Email", "Gender"]
        });
        if (userInfo) {
            return {
                success: true,
                message: "User found Successfully!!!",
                data: userInfo
            }
        } else {
            return {
                success: true,
                message: "User not found",
            }
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}

// Find Event details
export async function eventDetails({
    EventID
}) {
    try {
        // Fetch data with filters and relations
        const userInfo = await Event.findOne({
            where: { id: EventID },
            attributes: ["id", "Name", "ShortName", "StartDate", "EndDate", "payment_currency", 'EventName']
        });
        if (userInfo) {
            return {
                success: true,
                message: "Event found Successfully!!!",
                data: userInfo
            }
        } else {
            return {
                success: true,
                message: "Event not found",
            }
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}


// Create Housing Enquiry
// export async function createHousingEnquiry({
//     user_id,
//     event_id,
//     ArrivalDate,
//     DepartureDate,
//     AccommodationType,
// }, res) {
//     try {

//         // Find User base on user_id for user Information
//         const userInfo = await User.findOne({
//             where: { id: user_id },
//             attributes: ["id", "FirstName", "LastName", "Email"]
//         });

//         // const enquiry = await HousingEnquiry.create({
//         const enquiry = await InvitationEvent.create({
//             user_id,
//             event_id,
//             ArrivalDate,
//             DepartureDate,
//             AccommodationType,
//         });
//         const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 28 } });
//         const sanitizedTemplate = findTemplate.dataValues.description;
//         const mailChampTemplateName = findTemplate.dataValues.mandril_template
//         const subject = findTemplate.dataValues.subject

//         let template = guestReceivedVillaTemplate({
//             MemberName: userInfo.dataValues.FirstName,
//             html: sanitizedTemplate,
//         });
//         let extractedTemplate = template.html;
//         const templateName = mailChampTemplateName;
//         const mergeVars = { ALLDATA: extractedTemplate };
//         const email = "kamalrajora123@gmail.com"
//         await sendEmail(email, mergeVars, templateName, subject);
//         return {
//             statusCode: StatusCodes.CREATED,
//             success: true,
//             message: "Your housing enquiry has been submitted successfully.",
//             data: enquiry, // optional: include saved data
//         };
//     } catch (error) {
//         console.error("Housing Enquiry Error:", error);
//         return {
//             statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//             status: false,
//             message: "Failed to submit housing enquiry.",
//             error: error.message || error,
//         };
//     }
// }

// new function create event invitation table entry create



export async function createHousingEnquiry({
    EventID,
    UserID,
    ArrivalDate,
    DepartureDate,
    AccommodationType,
}, res) {
    try {
        // Check if user already submit 5+ bedrooms 
        const alreadyBooked = await InvitationEvent.findOne({
            where: {
                UserID,
                EventID,
                // Status: 5,
                // accommodation_status: "Preference Submitted"
                accommodation_status: {
                    [Op.or]: ["Preference Submitted", "Property Offered"]
                    // [Op.or]: ["Property Requested", "Property Offered"]
                }
            }
        });

        if (alreadyBooked) {
            return {
                statusCode: StatusCodes.CONFLICT,
                success: false,
                message: "You have already sent a  request for 4+ bedrooms.",
            };
        }

        const userInfo = await User.findOne({
            where: { id: UserID },
            attributes: ["id", "FirstName", "LastName", "Email"]
        });

        // Step 1: Check if entry exists
        const existingEnquiry = await InvitationEvent.findOne({
            where: {
                EventID,
                UserID,
            },
        });
        let enquiry;
        if (existingEnquiry) {
            // ✅ Update existing record
            enquiry = await existingEnquiry.update({
                ArrivalDate,
                DepartureDate,
                AccommodationType,
                // Status: 1,
                // accommodation_status: "Property Requested"
                accommodation_status: "Preference Submitted"
            });
        } else {
            //Create new record
            enquiry = await InvitationEvent.create({
                EventID,
                UserID,
                ArrivalDate,
                DepartureDate,
                AccommodationType,
                Status: 1,
                accommodation_status: "Preference Submitted"
                // accommodation_status: "Property Requested"
            });
        }

        const findTemplate = await Emailtemplet.findOne({ where: { eventId: 111, templateId: 28 } });
        const sanitizedTemplate = findTemplate.dataValues.description;
        const mailChampTemplateName = findTemplate.dataValues.mandril_template
        const subject = findTemplate.dataValues.subject

        let template = guestReceivedVillaTemplate({
            MemberName: `${userInfo.dataValues.FirstName} ${userInfo.dataValues.LastName} , ${userInfo.dataValues.Email}`,
            html: sanitizedTemplate,
        });

        let extractedTemplate = template.html;
        const templateName = mailChampTemplateName;
        const mergeVars = { ALLDATA: extractedTemplate };
        // const email = "kamalrajora123@gmail.com"
        const email = "hello@ondalinda.com"
        await sendEmail(email, mergeVars, templateName, subject);
        return {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: existingEnquiry
                ? "Housing enquiry updated successfully."
                : "Your housing enquiry has been submitted successfully.",
            data: enquiry,
        };
    } catch (error) {
        console.error("Housing Enquiry Error:", error);
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Failed to submit housing enquiry.",
            error: error.message || error,
        };
    }
}

// View All Housing Enquiry
export async function viewHousingEnquiry({ id }) {
    try {
        const enquiry = await HousingEnquiry.findAll({
            where: { event_id: id },
            include: { model: User, attributes: ["id", "FirstName", "LastName", "Email"] },
            attributes: ["id", "user_id", "event_id", "ArrivalDate", "DepartureDate", "AccommodationType", "createdAt"],
            order: [["id", "DESC"]], // latest first
            // raw: true,               // plain JSON objects (faster)
        });
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Housing enquiries fetched successfully.",
            data: enquiry,
        };
    } catch (error) {
        console.error("Housing Enquiry Fetch Error:", error);
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Failed to fetch housing enquiries.",
            error: error.message || error,
        };
    }
}



// search Enquiry

export async function searchHousingEnquiry({ Name, Email, ArrivalDate, DepartureDate }) {
    try {
        // Create the condition object dynamically
        let newObject = {};

        // If Name is provided, search in the User table for Name
        if (Name) {
            newObject['$User.FirstName$'] = { [Op.like]: `% ${Name}% ` };
        }
        if (Email) {
            newObject['$User.Email$'] = { [Op.like]: `% ${Email}% ` };
        }
        if (ArrivalDate) {
            newObject.ArrivalDate = { [Op.gte]: new Date(ArrivalDate) }; // Greater than or equal to ArrivalDate
        }
        if (DepartureDate) {
            newObject.DepartureDate = { [Op.lte]: new Date(DepartureDate) }; // Less than or equal to DepartureDate
        }
        const searchResults = await HousingEnquiry.findAll({
            where: newObject,
            include: {
                model: User,
                attributes: ["id", "FirstName", "LastName", "Email"], // Include fields from the User table
            },
            order: [["createdAt", "DESC"]], // Order results by creation date
        });

        return {
            statusCode: 200,
            success: true,
            message: 'Search Housing Enquiry Successfully!',
            searchResults,
        };
    } catch (error) {
        console.error("Error while searching Housing Enquiry:", error);
        return {
            statusCode: 500,
            success: false,
            message: 'Internal Server Error',
        };
    }
}




// view booked property 
export async function viewBookedProperty({ accommodation_id }) {
    try {
        if (!accommodation_id) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Missing required keys!"
            };
        }

        // 1) Fetch the main accommodation booking info
        const AccommodationInfo = await AccommodationBookingInfo.findOne({
            where: { id: accommodation_id },
            include: [
                {
                    model: Housing,
                    include: [
                        {
                            model: HousingImage,
                            separate: true,
                            limit: 4,
                            order: [["id", "DESC"]],
                            attributes: ["HousingID", "URL"]
                        },
                        {
                            model: EventHousing,
                            attributes: [
                                "NightlyPrice",
                                "totalAfterTaxes",
                                "BaseNightlyPrice",
                                "AvailabilityEndDate",
                                "AvailabilityStartDate",
                                "EventID",
                                "OwnerAmount",
                                "TotalStripeFeeAmount",
                                "TotalOndalindaFeeAmount"
                            ]
                        },
                        {
                            model: HousingBedrooms,
                            separate: true,
                            order: [["id", "ASC"]],
                            include: [{ model: HousingBedType }]
                        },
                        { model: HousingNeighborhood, attributes: ["name"] },
                        { model: HousingTypes, attributes: ["name"] }
                    ],
                    attributes: [
                        "id",
                        "ImageURL",
                        "MaxOccupancy",
                        "Name",
                        "NumBedrooms",
                        "amenities",
                        "bookingStatus",
                        "booking_notes",
                        "Description",
                        "Distance",
                        "google_map",
                        "terms_and_conditions"
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        // If not found
        if (!AccommodationInfo) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                success: false,
                message: "Accommodation not found!"
            };
        }

        // Initialize dates
        let checkInDate = AccommodationInfo.check_in_date;
        let checkOutDate = AccommodationInfo.check_out_date;

        // 2) Find extension if any
        const AccommodationExtensionInfo = await AccommodationExtension.findOne({
            where: {
                accommodation_id: AccommodationInfo.accommodation_id,
                user_id: AccommodationInfo.user_id,
                event_id: AccommodationInfo.event_id
            },
            attributes: ["check_in_date", "check_out_date", "user_id"]
        });

        if (AccommodationExtensionInfo) {
            const extendCheckInDate = AccommodationExtensionInfo.check_in_date;
            const extendCheckOutDate = AccommodationExtensionInfo.check_out_date;

            // Compare and merge check-in
            if (new Date(extendCheckInDate) < new Date(checkInDate)) {
                checkInDate = extendCheckInDate;
            }

            // Compare and merge check-out
            if (new Date(extendCheckOutDate) > new Date(checkOutDate)) {
                checkOutDate = extendCheckOutDate;
            }

            console.log("------ AccommodationExtensionInfo ------", AccommodationExtensionInfo);
        }

        // 3) Get Currency symbol
        const EventID = AccommodationInfo?.event_id;
        let Currency_symbol = null;

        if (EventID) {
            const event = await Event.findOne({
                where: { id: EventID },
                include: [{ model: Currency }],
                attributes: ["id", "Name", "status"]
            });

            Currency_symbol = event?.Currency?.Currency_symbol || null;
        }

        // 4) Return final response
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Housing details fetched successfully!",
            data: {
                ...AccommodationInfo.toJSON(),
                check_in_date: checkInDate,
                check_out_date: checkOutDate
            },
            Currency_symbol: Currency_symbol
        };
    } catch (error) {
        console.error("Error in viewBookedProperty:", error);
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message
        };
    }
}









// export async function viewBookedProperty({ accommodation_id }) {
//     try {
//         if (!accommodation_id) {
//             return {
//                 statusCode: StatusCodes.BAD_REQUEST,
//                 success: false,
//                 message: "Missing required keys!"
//             };
//         }

//         // ✅ 1) Get Accommodation Info with all needed associations
//         const AccommodationInfo = await AccommodationBookingInfo.findOne({
//             where: {
//                 id: accommodation_id
//             },
//             include: [{
//                 model: Housing, include: [{
//                     model: HousingImage,
//                     separate: true,
//                     limit: 4,
//                     order: [['id', 'DESC']],
//                     attributes: ["HousingID", "URL"]
//                 },
//                 {
//                     model: EventHousing,
//                     attributes: [
//                         "NightlyPrice",
//                         "totalAfterTaxes",
//                         "BaseNightlyPrice",
//                         "AvailabilityEndDate",
//                         "AvailabilityStartDate",
//                         "EventID",
//                         "OwnerAmount",
//                         "TotalStripeFeeAmount",
//                         "TotalOndalindaFeeAmount"
//                     ]
//                 },
//                 {
//                     model: HousingBedrooms,
//                     separate: true,
//                     order: [['id', 'ASC']],
//                     include: [{ model: HousingBedType }]
//                 },
//                 { model: HousingNeighborhood, attributes: ["name"] },
//                 { model: HousingTypes, attributes: ["name"] }
//                 ],
//                 attributes: ['id', 'ImageURL', 'MaxOccupancy', 'Name', 'NumBedrooms', 'amenities', 'bookingStatus', 'booking_notes', 'Description', 'Distance', 'google_map', 'terms_and_conditions']
//             },
//             ],
//             order: [["createdAt", "DESC"]],
//         });

//         if (!AccommodationInfo) {
//             return {
//                 statusCode: StatusCodes.NOT_FOUND,
//                 success: false,
//                 message: "Accommodation not found!"
//             };
//         }

//         const EventID = AccommodationInfo?.event_id;

//         let Currency_symbol = null;

//         if (EventID) {
//             const event = await Event.findOne({
//                 where: { id: EventID },
//                 include: [{ model: Currency }],
//                 attributes: ["id", "Name", "status"]
//             });

//             Currency_symbol = event?.Currency?.Currency_symbol || null;
//         }

//         return {
//             statusCode: StatusCodes.OK,
//             success: true,
//             message: "Housing details fetched successfully!",
//             data: AccommodationInfo,
//             Currency_symbol: Currency_symbol
//         };

//     } catch (error) {
//         console.error("Error in viewBookedProperty:", error);
//         return {
//             statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//             success: false,
//             message: error.message
//         };
//     }
// }










