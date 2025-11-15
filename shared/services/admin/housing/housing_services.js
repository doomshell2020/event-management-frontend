import { Housing, User, Emailtemplet, HousingImage, Event, EventHousing, EventHousingRelations, InvitationEvent, HousingBedrooms, HousingBedType, HousingNeighborhood, HousingTypes, HousingAmenities, AccommodationBooking, MyOrders, BookTicket } from "../../../../database/models"
import { StatusCodes } from 'http-status-codes';
import { sendEmail, sendEmailWithBCC } from "@/utils_back/sendEmail"
import { sendAccommodationTemplate } from "@/utils_back/email-templates";
import { deleteFromS3 } from '@/utils_back/s3Delete';
import { uploadToS3 } from '@/utils_back/s3Uploader';

import moment from "moment";
let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const fs = require('fs');
const path = require('path');


export async function addUpdateHousing(req, res) {
    try {
        // Destructure the necessary fields from the request body
        const {
            NumDiscounts,
            DiscountPercentage,
            numberOfTicketRequired,
            expirationDate,
            Status,
            internalNotes,
            selectedHousingIds,
            eventId,
            userId,
            HomeOwnerHousingId,
            ArrivalDate,
            DepartureDate,
            required_tickets
        } = req.body;
        const housingIdArray = selectedHousingIds.split(',').map(id => parseInt(id.trim()));
        const FindEventInfo = await Event.findOne({ where: { id: eventId }, attributes: ['Name', 'expiry_duration'] })
        const linkExpirationDays = FindEventInfo.expiry_duration
        const linkExpirationDate = new Date(Date.now() + linkExpirationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // ✅ Step 1: Update Arrival and Departure if provided
        if (ArrivalDate !== null && ArrivalDate !== undefined && ArrivalDate !== "null" && ArrivalDate !== "undefined" && ArrivalDate !== "" && DepartureDate !== null && DepartureDate !== undefined && DepartureDate !== "null" && DepartureDate !== "undefined" &&
            DepartureDate !== "") {
            await InvitationEvent.update(
                { ArrivalDate: ArrivalDate, DepartureDate: DepartureDate, is_preference_submitted: "Y" },
                { where: { EventID: eventId, UserID: userId } }
            );
        }

        const existingInvitation = await InvitationEvent.findOne({
            where: { EventID: eventId, UserID: userId }
        });
        // Check if an InvitationEvent already exists for the given eventId and userId
        const userInfo = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'FirstName', 'LastName', 'Email']
        });
        const userName = userInfo.dataValues.FirstName
        const userEmail = userInfo.dataValues.Email
        // use for count property ids
        const HousingIds = selectedHousingIds.split(',').map(Number);
        const count = HousingIds.length
        // Replace these values with the actual data in your context
        const arrivalDate = existingInvitation.dataValues.ArrivalDate;
        const departureDate = existingInvitation.dataValues.DepartureDate;
        // const Url = `${SITE_URL}/accommodations/book-accommodation/?UserID=${userId}&ArrivalDate=${arrivalDate}&DepartureDate=${departureDate}&EventID=${eventId}&housing_id=${selectedHousingIds}`;
        let Url;
        if (ArrivalDate && ArrivalDate !== "null" && ArrivalDate !== "undefined" && ArrivalDate !== "" &&
            DepartureDate && DepartureDate !== "null" && DepartureDate !== "undefined" && DepartureDate !== ""
        ) {
            // Navigate to T&C page first
            // Url = `${SITE_URL}/accommodations/terms-and-conditions/?UserID=${userId}&ArrivalDate=${arrivalDate}&DepartureDate=${departureDate}&EventID=${eventId}&housing_id=${selectedHousingIds}&option=require_acceptance`;
            Url = `${SITE_URL}/accommodations/book-accommodation/?UserID=${userId}&ArrivalDate=${arrivalDate}&DepartureDate=${departureDate}&EventID=${eventId}&housing_id=${selectedHousingIds}&option=require_acceptance&required_tickets=${required_tickets} `;
        } else {
            // Direct booking link if no Arrival/Departure dates
            Url = `${SITE_URL}/accommodations/book-accommodation/?UserID=${userId}&ArrivalDate=${arrivalDate}&DepartureDate=${departureDate}&EventID=${eventId}&housing_id=${selectedHousingIds}&required_tickets=${required_tickets}`;
        }

        if (existingInvitation) {
            // If it exists, update the record with the data from req.body
            await existingInvitation.update({
                NumDiscounts,
                DiscountPercentage,
                NumTicketsRequired: numberOfTicketRequired,
                DateExpired: expirationDate,
                HousingOption: Status,
                InternalNotes: internalNotes,
                EligibleHousingIDs: (Status == 1) ? HomeOwnerHousingId : selectedHousingIds,
                // New Keys added for expire link for property 
                expiresAt: linkExpirationDate,
                expire_status: 'active',
            });
            // Update Event Housing After the Assigned the property Assigned for admin
            await EventHousing.update({ isBooked: 'P' }, {
                where: { EventID: eventId, HousingID: { [Op.in]: housingIdArray } }
            });
            await InvitationEvent.update(
                { accommodation_status: "Property Offered" },
                { where: { EventID: eventId, UserID: userId } }
            );

            // console.log('>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>', required_tickets);
            // console.log('>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<URL>>>>>>>>>>>>>>>>>>>>>', Url);
            // return false

            // console.log('existingInvitation', existingInvitation);
            const findTemplate = await Emailtemplet.findOne({ where: { eventId: 111, templateId: 31 } });
            const sanitizedTemplate = findTemplate.dataValues.description;
            const mailChampTemplateName = findTemplate.dataValues.mandril_template
            const subject = findTemplate.dataValues.subject
            let template = sendAccommodationTemplate({
                UserName: userName,
                URLLINK: Url,
                propertyCount: count,
                html: sanitizedTemplate,
            });
            let extractedTemplate = template.html;
            const templateName = mailChampTemplateName;
            const mergeVars = { ALLDATA: extractedTemplate };
            const email = userEmail
            // await sendEmail(email, mergeVars, templateName, subject); // added hello@ondalinda.com
            // await sendEmailWithBCC(email, ["hello@ondalinda.com"], mergeVars, templateName, subject);
            await sendEmailWithBCC(email, [], mergeVars, templateName, subject);
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Event Invitation updated successfully',
            });
        } else {
            // If it doesn't exist, create a new record with the data from req.body
            await InvitationEvent.create({
                EventID: eventId,
                UserID: userId,
                NumDiscounts,
                DiscountPercentage,
                NumTicketsRequired: numberOfTicketRequired,
                DateExpired: expirationDate,
                HousingOption: Status,
                InternalNotes: internalNotes,
                EligibleHousingIDs: (Status == 1) ? HomeOwnerHousingId : selectedHousingIds
            });

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Event Invitation created successfully',
            });
        }

    } catch (error) {
        console.error('Error on save data:', error.message);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to save and update housing data :' + error.message,
            error: error.message,
        };
    }
}

// releaseHousing api rupam singh  14-05-2025 
export async function releaseHousing(req, res) {
    try {
        const { invitationId, propertyId } = req.query;

        if (!invitationId || !propertyId) {
            return res.status(400).json({
                success: false,
                message: "Missing invitationId or propertyId.",
            });
        }

        const invitationData = await InvitationEvent.findOne({
            where: { ID: invitationId },
        });

        if (!invitationData) {
            return res.status(404).json({
                success: false,
                message: "Invitation not found.",
            });
        }

        let housingIds = invitationData.EligibleHousingIDs
            ? invitationData.EligibleHousingIDs.split(",").map(id => id.trim())
            : [];

        if (!housingIds.includes(propertyId)) {
            return res.status(404).json({
                success: false,
                message: "Property ID not found in EligibleHousingIDs.",
            });
        }

        // Remove the specific propertyId
        housingIds = housingIds.filter(id => id !== propertyId);
        const updatedEligibleHousingIDs = housingIds.length ? housingIds.join(",") : null;   // added new 23-05-2025


        // Update the InvitationEvent record
        await InvitationEvent.update(
            // { EligibleHousingIDs: housingIds.join(",") }, // comment 23-05-2025
            {
                EligibleHousingIDs: updatedEligibleHousingIDs,
                ...(updatedEligibleHousingIDs === null && { accommodation_status: "Preference Submitted" })
            },    //added new
            { where: { ID: invitationId } }
        );

        // Update EventHousing to set isBooked = "N"
        await EventHousing.update(
            { isBooked: "N" },
            {
                where: {
                    EventID: invitationData.EventID,
                    HousingID: propertyId,
                    isBooked: "P",
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Housing released successfully.",
        });

    } catch (error) {
        console.error("Error on release housing:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to release housing.",
            error: error.message,
        });
    }
}

// get Housing Based on the 
export async function getHousingByStatus({ HousingByStatus, eventId, userId }, res) {
    try {

        // find 5+ housing based on Arrival date and Departure date
        const EventInvitationInfo = await InvitationEvent.findOne({
            where: { EventID: eventId, UserID: userId },
            attributes: ['ArrivalDate', 'DepartureDate', 'id']
        })
        const arrivalDate = EventInvitationInfo?.dataValues?.ArrivalDate;
        const departureDate = EventInvitationInfo?.dataValues?.DepartureDate;

        // Where clause for Housing model
        const housingWhereClause = HousingByStatus == 1
            ? { OwnerId: userId }
            : {};

        // Where clause for EventHousing model
        const eventHousingWhereClause = HousingByStatus == 2
            ? { Status: HousingByStatus, EventID: eventId }
            : {};
        // AvailabilityStartDate
        // AvailabilityEndDate
        let data;
        const housingOptions = {
            attributes: ['ID', 'Name', 'Neighborhood', 'ManagerName', 'MaxOccupancy', 'NumBedrooms', 'bookingStatus'],
            order: [["NumBedrooms", "ASC"]],
        };

        if (HousingByStatus == 1) {
            data = await Housing.findAll({
                ...housingOptions,
                where: housingWhereClause, // Apply this only if status is 1
                include: [{
                    model: EventHousing,
                    attributes: ['NightlyPrice']
                }, { model: HousingNeighborhood, attributes: ["name"] }]
            });
        } else if (HousingByStatus == 2) {
            data = await Housing.findAll({
                ...housingOptions,
                where: {
                    ...housingOptions.where,
                    NumBedrooms: {
                        [Op.gte]: 4, // Only include properties with 4 or more bedrooms
                    },
                    bookingStatus: {
                        [Op.ne]: 'Y'             // exclude bookingStatus 'Y'
                    }
                },
                include: [{
                    model: EventHousing,
                    where: {
                        [Op.and]: [
                            { Status: HousingByStatus },
                            { EventID: eventId },
                            // { isBooked: "N" },
                            { isBooked: { [Op.in]: ['N', 'P'] } }, // Allow 'N' or 'P', exclude 'Y'
                            // { AvailabilityStartDate: { [Op.gte]: arrivalDate } },
                            // { AvailabilityEndDate: { [Op.lte]: departureDate } }
                            { AvailabilityStartDate: { [Op.lte]: arrivalDate } },
                            { AvailabilityEndDate: { [Op.gte]: departureDate } }
                            // { AvailabilityStartDate: arrivalDate },
                            // { AvailabilityEndDate: departureDate },
                        ]
                    },
                    attributes: ['NightlyPrice', 'AvailabilityStartDate', 'AvailabilityEndDate', 'OwnerAmount']
                }, {
                    model: HousingNeighborhood,
                    attributes: ["name"]
                }]

                // include: [{
                //     model: EventHousing,
                //     // where: eventHousingWhereClause, // Apply this only if status is 2
                //     // attributes: ['NightlyPrice']
                //     where: {
                //         ...eventHousingWhereClause, // Apply this only if status is 2
                //         AvailabilityStartDate: { [Op.lte]: arrivalDate },
                //         AvailabilityEndDate: { [Op.gte]: departureDate },
                //     },
                //     attributes: ['NightlyPrice', 'AvailabilityStartDate', 'AvailabilityEndDate']
                // }, { model: HousingNeighborhood, attributes: ["name"] }]
            });
        } else {
            // Handle other statuses if needed
            data = [];
        }

        if (data.length === 0) {
            return {
                statusCode: 404,
                success: false,
                message: 'No housing details found for the given status',
            };
        }


        // Initialize an array to store the IDs
        const completedIds = [];

        // Loop through the data and extract the IDs
        data.forEach(housing => {
            if (housing) {
                completedIds.push(housing.dataValues.ID);
            }
        });

        const searchPatterns = completedIds.map(id => ({
            EligibleHousingIDs: {
                [Op.like]: `%${id}%`
            }
        }));

        // Find the records in the InvitationEvent table and include only the FirstName and LastName from the User model
        const getOfferUsers = await InvitationEvent.findAll({
            include: [{
                model: User,
                attributes: ['FirstName', 'LastName'] // Specify the fields you want to include from the User model
            }],
            where: {
                EventID: eventId,
                [Op.or]: searchPatterns
            },
            order: [["createdAt", "DESC"]],
        });

        // console.log(getOfferUsers);

        return {
            statusCode: 200,
            success: true,
            message: 'View Housing detail Successfully!',
            data: data,
            getOfferUsers: getOfferUsers
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}


export async function getAvailableHousingDateRange(req, res) {
    try {
        const {
            queryArrival,
            queryDeparture,
            HousingByStatus,
            eventId,
            userId
        } = req.query;

        if (!eventId || !userId || !HousingByStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameters: eventId, userId, or HousingByStatus",
            });
        }

        const arrivalDate = queryArrival;
        const departureDate = queryDeparture;

        if (!arrivalDate || !departureDate) {
            return res.status(400).json({
                success: false,
                message: "Arrival and Departure dates are required either in DB or via query parameters",
            });
        }

        let data;
        const housingOptions = {
            attributes: ['ID', 'Name', 'Neighborhood', 'ManagerName', 'MaxOccupancy', 'NumBedrooms', "bookingStatus"],
            order: [["NumBedrooms", "ASC"]],
        };

        if (HousingByStatus == 1) {
            data = await Housing.findAll({
                ...housingOptions,
                where: { OwnerId: userId },
                include: [{
                    model: EventHousing,
                    attributes: ['NightlyPrice']
                }, {
                    model: HousingNeighborhood,
                    attributes: ["name"]
                }]
            });
        } else if (HousingByStatus == 2) {
            // 👇 First, check AccommodationType from InvitationEvent
            const invitation = await InvitationEvent.findOne({
                where: {
                    EventID: eventId,
                    UserID: userId
                }
            });

            // 👇 Prepare where clause for EventHousing
            const eventHousingWhere = {
                [Op.and]: [
                    { Status: HousingByStatus },
                    { EventID: eventId },
                    { isBooked: { [Op.in]: ['N', 'P'] } },
                    { AvailabilityStartDate: { [Op.lte]: arrivalDate } },
                    { AvailabilityEndDate: { [Op.gte]: departureDate } }
                ]
            };

            // 👇 Prepare where clause for Housing
            let housingWhereClause = {
                bookingStatus: "N"
            };

            // if (invitation && invitation.AccommodationType !== null) {
            //     housingWhereClause.NumBedrooms = { [Op.gte]: 4 };
            // }

            data = await Housing.findAll({
                ...housingOptions,
                where: housingWhereClause,
                include: [{
                    model: EventHousing,
                    where: eventHousingWhere,
                    attributes: ['NightlyPrice', 'AvailabilityStartDate', 'AvailabilityEndDate', 'OwnerAmount']
                }, {
                    model: HousingNeighborhood,
                    attributes: ["name"]
                }]
            });
        } else {
            data = [];
        }

        if (data.length === 0) {
            return {
                statusCode: 404,
                success: false,
                message: 'No housing details found for the given status',
            };
        }


        // Initialize an array to store the IDs
        const completedIds = [];

        // Loop through the data and extract the IDs
        data.forEach(housing => {
            if (housing) {
                completedIds.push(housing.dataValues.ID);
            }
        });

        const searchPatterns = completedIds.map(id => ({
            EligibleHousingIDs: {
                [Op.like]: `%${id}%`
            }
        }));

        // Find the records in the InvitationEvent table and include only the FirstName and LastName from the User model
        const getOfferUsers = await InvitationEvent.findAll({
            include: [{
                model: User,
                attributes: ['FirstName', 'LastName'] // Specify the fields you want to include from the User model
            }],
            where: {
                EventID: eventId,
                [Op.or]: searchPatterns
            },
            order: [["createdAt", "DESC"]],
        });

        return {
            statusCode: 200,
            success: true,
            message: 'View Housing detail Successfully!',
            data: data,
            getOfferUsers: getOfferUsers
        };

    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}


// find All property & event housing 

export async function View_Housing(req) {
    try {
        const data = await Housing.findAll({
            // include: [{ model: EventHousing, required: true, where: { EventID: 111 } },
            include: [{ model: EventHousing },
            // { model: User },
            {
                model: HousingBedrooms, separate: true, order: [['id', 'ASC']], include: [{ model: HousingBedType }] // Nested include
            }, { model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] },
            {
                model: AccommodationBooking, attributes: ['user_id', 'event_id', 'first_name', 'last_name', 'email', 'payment_status', 'check_in_date', 'check_out_date'],
                include: [{ model: MyOrders, attributes: ['total_amount', 'user_id', 'event_id'], include: [{ model: BookTicket, attributes: ['order_id', 'event_id', 'ticket_buy'] }] }, { model: User, attributes: ['PhoneNumber', 'id'] }]
            }
            ],
            attributes: ['Name', 'Neighborhood', 'Type', 'MaxOccupancy', 'NumBedrooms', 'Pool', 'Distance', 'ManagerName', 'ManagerEmail', 'ManagerMobile', 'location', 'OwnerName', 'OwnerEmail', 'OwnerMobile', 'amenities'],
            order: [["createdAt", "DESC"]],
        });
        // Adding Serial Number (SNO) starting from 1
        const modifiedData = data.map((item, index) => ({
            SNO: index + 1,
            ...item.toJSON()
        }));

        return {
            statusCode: 200,
            success: true,
            message: 'Manage properties data retrieved successfully.',
            data: modifiedData,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}


// add housing - old
export async function add_Hosuing({
    Name,
    Neighborhood,
    Type,
    MaxOccupancy,
    NumBedrooms,
    Pool,
    Distance,
    WebsiteURL,
    ManagerName,
    ManagerEmail,
    NumCaliforniaKingBeds,
    NumKingBeds,
    NumQueenBeds,
    NumFullBeds,
    NumTwinBeds,
    NumSofaBeds,
    NumBunkBeds,
    NumDayBeds,
    NumCots,
    Description,
    OwnerID,
    location,
    ManagerMobile,
    OwnerName,
    OwnerEmail,
    OwnerMobile,
    bookingStatus
}, filename, res) {
    try {
        const housingData = await Housing.create({
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            Distance,
            ImageURL: filename,
            WebsiteURL,
            ManagerName,
            ManagerEmail,
            NumCaliforniaKingBeds,
            NumKingBeds,
            NumQueenBeds,
            NumFullBeds,
            NumTwinBeds,
            NumSofaBeds,
            NumBunkBeds,
            NumDayBeds,
            NumCots,
            Description,
            OwnerID,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            bookingStatus
        });

        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Add Housing Successfully!",
            id: housingData.id,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            error
        };
    }
}

export async function addOrUpdateHousing(data) {
    try {
        const { EventID, HousingID, Status } = data;

        // return 

        const isValidDate = (date) => {
            return date && !isNaN(new Date(date).getTime());
        };

        const parseOrNull = (value) => {
            return value !== undefined && value !== null && value !== '' && !isNaN(value)
                ? parseFloat(value)
                : null;
        };

        const updateData = {
            EventID,
            HousingID,
            Status,
            InternalNotes: typeof data.InternalNotes === 'string' ? data.InternalNotes.trim() : '',
            NightlyPrice: parseOrNull(data.totalGuestPayout),
            NightlyPayoutAmount: parseOrNull(data.totalPayoutHomeOwner),
            OwnerAmount: parseOrNull(data.totalPayoutHomeOwner),
            AvailabilityStartDate: isValidDate(data.AvailabilityStartDate) ? data.AvailabilityStartDate : null,
            AvailabilityEndDate: isValidDate(data.AvailabilityEndDate) ? data.AvailabilityEndDate : null,
            BaseNightlyPrice: parseOrNull(data.basePrice),
            totalAfterTaxes: parseOrNull(data.totalAfterTaxes),
            ServiceFee: parseOrNull(data.serviceFeePercentage),
            MexicanVAT: parseOrNull(data.MexicanVatPercentage),
            AccommodationTax: parseOrNull(data.accommodationTaxPercentage),
            ticket_stripe_fee_percentage: parseOrNull(data.StripeFeePercentage),

            stripe_fee: parseOrNull(data.StripeFeePercentage),
            TotalStripeFeeAmount: parseOrNull(data.stripeFeeAmount),
            stripe_fee_amount: parseOrNull(data.stripeFeeAmount),
            ticket_stripe_fee_amount: parseOrNull(data.stripeFeeAmount),

            ServiceFeeAmount: parseOrNull(data.ServiceFeeAmount),
            MexicanVATAmount: parseOrNull(data.MexicanVatAmount),
            AccommodationTaxAmount: parseOrNull(data.accommodationTaxAmount),

            OndalindaFee: parseOrNull(data.OndalindaFeePercentage),
            OndalindaFeeAmount: parseOrNull(data.ondalindaFeeAmount),
            TotalOndalindaFeeAmount: parseOrNull(data.ondalindaFeeAmount),

            ticket_bank_fee_amount: parseOrNull(data.bankFeeAmount),
            ticket_processing_fee_amount: parseOrNull(data.processingFeeAmount),

            ticket_bank_fee_percentage: parseOrNull(data.BankFeePercentage),
            ticket_processing_fee_percentage: parseOrNull(data.ProcessingFeePercentage)
        };

        // console.log('>>>>>>>>>>>>>>>>>',data);
        // console.log('>>>>>>>>>>>>>>>>>',updateData);
        // return true       

        const housing = await EventHousing.findOne({
            where: { EventID, HousingID }
        });

        if (housing) {
            await housing.update(updateData);
            return {
                statusCode: 200,
                success: true,
                message: 'Housing updated successfully'
            };
        } else {
            await EventHousing.create(updateData);
            return {
                statusCode: 200,
                success: true,
                message: 'Housing added successfully'
            };
        }
    } catch (error) {
        console.error('Error adding/updating housing:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'An error occurred while adding/updating housing.',
            error: error.message
        };
    }
}


// housing deleted
export async function deleteHousing({ id }, res) {
    try {
        const assignedOwner = await Housing.findOne({ where: { id } });

        if (assignedOwner?.dataValues?.OwnerID) {
            return {
                statusCode: StatusCodes.FORBIDDEN,
                success: false,
                message: "This property cannot be deleted because it is assigned to an owner.",
            };
        }

        const images = await HousingImage.findAll({ where: { HousingID: id } });
        const folder = "housing";
        for (const image of images) {
            try {
                await deleteFromS3(folder, image.URL);
            } catch (delErr) {
                console.warn(`Failed to delete image from S3: ${image.URL}`, delErr.message);
            }
        }

        if (assignedOwner.dataValues?.ImageURL) {
            // console.log('>>>>>>>>>>>',assignedOwner.dataValues);            
            await deleteFromS3(folder, assignedOwner.dataValues?.ImageURL);
        }

        await HousingImage.destroy({ where: { HousingID: id } });
        await Housing.destroy({ where: { id } });
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "The Housing and its images have been successfully deleted!",
        };

    } catch (error) {
        console.error("Error deleting housing:", error);
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "An error occurred while deleting the housing. " + error.message,
        };
    }
}

// View housing for id
export async function view_HousingByid({ housingId }, res) {
    try {
        const data = await Housing.findOne({
            include: { model: HousingImage },
            where: {
                id: housingId,
            },
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            message: "View Housing Successfully",
            status: true,
            data: data,
        }
    } catch (error) {
        return error;
    }
}

// edit housing
export async function updateHousing({ id, filename }, req) {
    const {
        Name,
        Neighborhood,
        Type,
        MaxOccupancy,
        NumBedrooms,
        Pool,
        Distance,
        WebsiteURL,
        ManagerName,
        ManagerEmail,
        NumCaliforniaKingBeds,
        NumKingBeds,
        NumQueenBeds,
        NumFullBeds,
        NumTwinBeds,
        NumSofaBeds,
        NumBunkBeds,
        NumDayBeds,
        NumCots,
        Description,
        OwnerID,
        location,
        ManagerMobile,
        OwnerName,
        OwnerEmail,
        OwnerMobile,
        bookingStatus
    } = req.body
    const updateData = {
        Name,
        Neighborhood,
        Type,
        MaxOccupancy,
        NumBedrooms,
        Pool,
        Distance,
        ImageURL: filename,
        WebsiteURL,
        ManagerName,
        ManagerEmail,
        NumCaliforniaKingBeds,
        NumKingBeds,
        NumQueenBeds,
        NumFullBeds,
        NumTwinBeds,
        NumSofaBeds,
        NumBunkBeds,
        NumDayBeds,
        NumCots,
        Description,
        OwnerID,
        location,
        ManagerMobile,
        OwnerName,
        OwnerEmail,
        OwnerMobile,
        bookingStatus
    };
    // console.log("updateData", updateData)
    const updateHousing = await Housing.update(
        updateData,
        {
            where: { id: id },
        }
    );
    return {
        statusCode: 200,
        success: true,
        message: 'Housing Update Successfully!',
    };
}

// Search Housing
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
export async function search_Housing({ Name, Neighborhood, Type, NumBedrooms, ManagerName, ManagerEmail, Location }) {
    // const { Name } = req.body; // Assuming the search query parameter is "Name"
    try {
        let newObject = {};
        if (Name) {
            newObject.Name = { [Op.like]: `%${Name}%` }
        } if (Neighborhood) {
            newObject.Neighborhood = { [Op.like]: `%${Neighborhood}%` }
        } if (Type) {
            newObject.Type = { [Op.like]: `%${Type}%` }
        } if (NumBedrooms) {
            newObject.NumBedrooms = { [Op.like]: `%${NumBedrooms}%` }
        } if (ManagerName) {
            newObject.ManagerName = { [Op.like]: `%${ManagerName}%` }
        } if (ManagerEmail) {
            newObject.ManagerEmail = { [Op.like]: `%${ManagerEmail}%` }
        } if (Location) {
            newObject.Location = { [Op.like]: `%${Location}%` }
        }
        const searchResults = await Housing.findAll({
            where: newObject,
            include: [{
                model: HousingBedrooms, separate: true, order: [['id', 'ASC']], include: [{ model: HousingBedType }] // Nested include
            }, { model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }],
            order: [["createdAt", "DESC"]],
        });
        return {
            statusCode: 200,
            success: true,
            message: 'Search Housing Successfully!',
            searchResults
        };
    } catch (error) {
        console.log("error")
        //   res.status(500).json({ error: 'Internal Server Error' });

    }
}


// Add housing images
export async function add_HosuingImage({
    HousingID,
}, filename, res) {
    // console.log("filename", filename)
    try {
        const housingData = await HousingImage.create({
            HousingID,
            URL: filename
        });
        return {
            statusCode: StatusCodes.OK,
            status: true,
            message: "Add Housing Image Successfully!",
            id: housingData.id,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        };
    }
}


// view housing image
export async function view_HousingImage({ HousingID }, res) {
    try {
        const data = await Housing.findOne({
            include: [{ model: HousingImage }, { model: HousingNeighborhood, attributes: ["name"] }],
            where: {
                id: HousingID,
            },
            attributes: ['Name', 'Neighborhood']
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            message: "View Housing Images Successfully",
            status: true,
            statusCode: StatusCodes.OK,
            data: data,
        }
    } catch (error) {
        return error;
    }
}


// Added Housing Images in completed
export async function add_HousingImage({ HousingID }, filenames, req) {
    const folder = req.body.folder || 'housing';

    if (!Array.isArray(filenames) || filenames.length === 0) {
        return {
            statusCode: StatusCodes.BAD_REQUEST,
            success: false,
            message: "No image files provided.",
        };
    }

    const createdImages = [];

    try {
        for (const filename of filenames) {
            const housingData = await HousingImage.create({
                HousingID,
                URL: filename,
            });
            createdImages.push(housingData);
        }

        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Housing images added successfully!",
            images: createdImages.map((img) => img.id),
        };

    } catch (error) {
        console.error("Error in add_HousingImage:", error);

        // ❌ Rollback: delete uploaded images from S3
        for (const filename of filenames) {
            try {
                await deleteFromS3(folder, filename);
            } catch (delErr) {
                console.warn("Failed to delete from S3:", filename, delErr.message);
            }
        }

        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || "Error adding housing images.",
        };
    }
}

// Housing Image Deleted
export async function deleteHousingImage({ imageId }, res) {
    try {
        if (!imageId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Id not provided",
            });
        }

        const housingImage = await HousingImage.findOne({
            where: { id: imageId },
        });

        if (!housingImage) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Housing image not found.",
            });
        }

        const filename = housingImage.URL;
        const folder = 'housing';
        try {
            await deleteFromS3(folder, filename);
        } catch (s3Err) {
            console.warn("Failed to delete image from S3:", s3Err.message);
        }
        await HousingImage.destroy({ where: { id: imageId } });
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "The housing image has been successfully deleted!",
        });

    } catch (error) {
        console.error('Error deleting housing image:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while deleting the housing image.",
        });
    }
}

// View Housing by housename
export async function view_HouseDetail({ housename }, req) {
    try {
        if (!housename) {
            return {
                statusCode: 400,
                success: false,
                message: 'Housename is required',
            };
        }
        const data = await Housing.findOne({
            where: {
                Name: housename,
            },
            include: [{ model: EventHousing, attributes: ["NightlyPrice", "BaseNightlyPrice", 'AvailabilityEndDate', 'AvailabilityStartDate', 'EventID', 'OwnerAmount', 'TotalStripeFeeAmount', 'TotalOndalindaFeeAmount'] }, {
                model: HousingImage, separate: true, // Required to apply limit
                limit: 4,       // Only get up to 4 images
                order: [['id', 'DESC']], // Optional: you can sort them too 
                attributes: ["HousingID", "URL"]
            },
            {
                model: HousingBedrooms, separate: true, order: [['id', 'ASC']], include: [{ model: HousingBedType }] // Nested include
            }, { model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }
            ],
            // order: [["createdAt", "DESC"]],
            attributes: ["id", "Name", "Neighborhood", "Type", "MaxOccupancy", "NumBedrooms", "location", "ImageURL", "Description", "amenities", 'bookingStatus', "booking_notes", 'terms_and_conditions', 'Pool', 'google_map'],
        });






        // Check if housing data was found
        if (!data) {
            return {
                statusCode: 404,
                success: false,
                message: 'No housing details found for the given house name',
            };
        }
        return {
            statusCode: 200,
            success: true,
            message: 'View Housing detail successfully!',
            data: data,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}



// ownerId base find housing
export async function viewHousingId({ HousingID }, res) {
    try {
        // console.log("HousingID", HousingID)
        // Check if HousingID is provided
        if (!HousingID) {
            console.log("NOT_FOUNDNOT_FOUNDNOT_FOUNDNOT_FOUNDNOT_FOUNDNOT_FOUND")
            return {
                message: "HousingID is required!",
                status: false,
                statusCode: StatusCodes.NOT_FOUND,
            };

        }
        const data = await Housing.findOne({
            where: {
                id: HousingID,
            },
        });

        // Check if data exists for the given HousingID
        if (!data) {
            const error = new Error("ID not found or data not available");
            error.statusCode = StatusCodes.NOT_FOUND; // Set status code to 404 (Not Found)
            throw error;
        }

        return {
            message: "View Housing Successfully!",
            status: true,
            statusCode: StatusCodes.OK,
            data: data,
        };
    } catch (error) {
        return {
            message: error.message || "An error occurred",
            status: false,
            statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, // Default to 500 if no status code is set
        };
    }
}

export async function getAssignedHousing(req, res) {
    try {

        const housingIds = JSON.parse(req.body.housingIds); // Parse the housingIds from FormData

        if (!housingIds || !Array.isArray(housingIds) || housingIds.length === 0) {
            return res.status(400).json({ error: 'Invalid housingIds' });
        }

        const housingOptions = {
            attributes: ['ID', 'Name', 'Neighborhood', 'ManagerName', 'MaxOccupancy', 'NumBedrooms'],
            order: [["createdAt", "DESC"]],
            where: {
                ID: {
                    [Op.in]: housingIds
                }
            }
        };


        let data = await Housing.findAll({
            ...housingOptions,
            include: [{ model: HousingNeighborhood, attributes: ["name"] }]

            // include: [{
            //     model: EventHousing,
            //     attributes: ['NightlyPrice']
            // }]
        });

        // console.log('>>>>>>>>>', data);   

        if (data.length === 0) {
            return {
                statusCode: 404,
                success: false,
                message: 'No housing details found for the given ids',
            };
        }

        return {
            statusCode: 200,
            success: true,
            message: 'View Housing detail Successfully!',
            data: data
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}


export async function add_new_housing(data, filename = '', res, folder = 'housing') {
    try {
        const {
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            ManagerName,
            ManagerEmail,
            Description,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            amenities,
            google_map,
            bedrooms,
            admin_notes,
            bookingStatus,
            booking_notes,
            terms_and_conditions
        } = data;

        const amenitiesString = Array.isArray(amenities) ? amenities.join(', ') : amenities;

        const housingData = await Housing.create({
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            ImageURL: filename,
            ManagerName,
            ManagerEmail,
            Description,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            amenities: amenitiesString,
            google_map,
            admin_notes,
            bookingStatus,
            booking_notes,
            terms_and_conditions
        });

        const housingId = housingData.id;

        let parsedBedrooms = [];
        if (bedrooms) {
            try {
                parsedBedrooms = typeof bedrooms == 'string' ? JSON.parse(bedrooms) : bedrooms;
            } catch (err) {
                console.warn('Invalid JSON in bedrooms field:', err.message);
            }
        }

        for (const bedroom of parsedBedrooms) {
            const { bedroom_number, beds } = bedroom;
            for (const bed of beds) {
                const { bed_number, bed_type } = bed;
                await HousingBedrooms.create({
                    HousingID: housingId,
                    bedroom_number,
                    bed_number,
                    bed_type,
                });
            }
        }

        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Housing added successfully!",
        };

    } catch (error) {
        console.error("Error in add_new_housing:", error);

        // 🔥 Delete the file from S3 if it was uploaded
        if (filename) {
            try {
                await deleteFromS3(folder, filename);
            } catch (delErr) {
                console.warn("Failed to delete image from S3:", delErr.message);
            }
        }

        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Failed to add housing",
            error: error.message,
        };
    }
}


export async function add_new_housingV3(data, filename = '', res) {
    try {
        const {
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            ManagerName,
            ManagerEmail,
            Description,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            amenities,
            google_map,
            bedrooms,
            admin_notes,
            bookingStatus,
            booking_notes,
            terms_and_conditions
        } = data;

        const amenitiesString = Array.isArray(amenities) ? amenities.join(', ') : amenities;

        const housingData = await Housing.create({
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            ImageURL: filename,
            ManagerName,
            ManagerEmail,
            Description,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            amenities: amenitiesString,
            google_map,
            admin_notes,
            bookingStatus,
            booking_notes,
            terms_and_conditions
        });

        const housingId = housingData.id;

        let parsedBedrooms = [];
        if (bedrooms) {
            try {
                parsedBedrooms = typeof bedrooms == 'string' ? JSON.parse(bedrooms) : bedrooms;
            } catch (err) {
                console.warn('Invalid JSON in bedrooms field:', err.message);
            }
        }

        for (const bedroom of parsedBedrooms) {
            const { bedroom_number, beds } = bedroom;
            for (const bed of beds) {
                const { bed_number, bed_type } = bed;
                await HousingBedrooms.create({
                    HousingID: housingId,
                    bedroom_number,
                    bed_number,
                    bed_type,
                });
            }
        }

        // return {
        //     statusCode: StatusCodes.OK,
        //     success: true,
        //     message: "Housing added successfully!",
        // };

        res.status(200)
            .json({
                success: true,
                message: "Housing added successfully!",
            });
        return

    } catch (error) {
        console.error("Error in add_new_housing:", error);

        res.status(200)
            .json({
                success: false,
                message: "Failed to add housing",
            });
        return

        // return {
        //     statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        //     success: false,
        //     message: "Failed to add housing",
        //     error: error.message,
        // };
    }
}

export async function updateHousingNewV3(id, req, res) {
    try {
        // Take data directly from body
        const updateData = { ...req.body };
        // Update housing details
        await Housing.update(updateData, { where: { id } });
        // Handle bedrooms if provided
        if (req.body.bedrooms) {
            let parsedBedrooms = [];
            try {
                parsedBedrooms =
                    typeof req.body.bedrooms == "string"
                        ? JSON.parse(req.body.bedrooms)
                        : req.body.bedrooms;
            } catch (err) {
                console.warn("Invalid JSON in bedrooms field:", err.message);
            }

            await HousingBedrooms.destroy({ where: { HousingID: id } });

            for (const bedroom of parsedBedrooms) {
                const { bedroom_number, beds } = bedroom;

                for (const bed of beds) {
                    const { id: bedId, bed_number, bed_type } = bed;

                    if (bedId) {
                        // Update existing bed
                        await HousingBedrooms.update(
                            { bedroom_number, bed_number, bed_type },
                            { where: { id: bedId, HousingID: id } }
                        );
                    } else {
                        // Insert new bed
                        await HousingBedrooms.create({
                            HousingID: id,
                            bedroom_number,
                            bed_number,
                            bed_type
                        });
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Housing updated successfully!",
        });
    } catch (error) {
        console.error("Error in updateHousingNewV3:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update housing",
            error: error.message,
        });
    }
}



export async function syncAllProperty(req, res) {
    const allData = req.body.data;
    const transaction = await sequelize.transaction();
    try {
        let results = [];

        for (const propertyData of allData) {
            // ✅ Upsert main Housing
            const [property, created] = await Housing.upsert(
                {
                    id: propertyData.id,
                    Name: propertyData.Name,
                    Neighborhood: propertyData.Neighborhood,
                    Type: propertyData.Type,
                    MaxOccupancy: propertyData.MaxOccupancy,
                    NumBedrooms: propertyData.NumBedrooms,
                    Pool: propertyData.Pool,
                    Distance: propertyData.Distance,
                    ImageURL: propertyData.ImageURL,
                    WebsiteURL: propertyData.WebsiteURL,
                    ManagerName: propertyData.ManagerName,
                    ManagerEmail: propertyData.ManagerEmail,
                    ManagerMobile: propertyData.ManagerMobile,
                    Description: propertyData.Description,
                    OwnerID: propertyData.OwnerID,
                    location: propertyData.location,
                    OwnerName: propertyData.OwnerName,
                    OwnerEmail: propertyData.OwnerEmail,
                    OwnerMobile: propertyData.OwnerMobile,
                    amenities: propertyData.amenities,
                    admin_notes: propertyData.admin_notes,
                    google_map: propertyData.google_map,
                    booking_notes: propertyData.booking_notes,
                    terms_and_conditions: propertyData.terms_and_conditions,
                    Status: propertyData.Status,
                    bookingStatus: propertyData.bookingStatus,
                    createdAt: propertyData.createdAt,
                    updatedAt: propertyData.updatedAt
                },
                { returning: true, transaction }
            );

            // // ✅ Upsert EventHousings
            if (propertyData.EventHousings && propertyData.EventHousings.length) {
                for (const eh of propertyData.EventHousings) {
                    await EventHousing.upsert(
                        {
                            id: eh.id,
                            EventID: eh.EventID,
                            HousingID: eh.HousingID,
                            Status: eh.Status,
                            InternalNotes: eh.InternalNotes,
                            NightlyPrice: eh.NightlyPrice,
                            BaseNightlyPrice: eh.BaseNightlyPrice,
                            totalAfterTaxes: eh.totalAfterTaxes,
                            NightlyPayoutAmount: eh.NightlyPayoutAmount,
                            AvailabilityStartDate: eh.AvailabilityStartDate,
                            AvailabilityEndDate: eh.AvailabilityEndDate,
                            ServiceFee: eh.ServiceFee,
                            MexicanVAT: eh.MexicanVAT,
                            AccommodationTax: eh.AccommodationTax,
                            OndalindaFee: eh.OndalindaFee,
                            TotalOndalindaFeeAmount: eh.TotalOndalindaFeeAmount,
                            TotalStripeFeeAmount: eh.TotalStripeFeeAmount,
                            stripe_fee: eh.stripe_fee,
                            OwnerAmount: eh.OwnerAmount,
                            ticket_stripe_fee_percentage: eh.ticket_stripe_fee_percentage,
                            ticket_bank_fee_percentage: eh.ticket_bank_fee_percentage,
                            ticket_processing_fee_percentage: eh.ticket_processing_fee_percentage,
                            ServiceFeeAmount: eh.ServiceFeeAmount,
                            MexicanVATAmount: eh.MexicanVATAmount,
                            AccommodationTaxAmount: eh.AccommodationTaxAmount,
                            OndalindaFeeAmount: eh.OndalindaFeeAmount,
                            stripe_fee_amount: eh.stripe_fee_amount,
                            ticket_bank_fee_amount: eh.ticket_bank_fee_amount,
                            ticket_processing_fee_amount: eh.ticket_processing_fee_amount,
                            ticket_stripe_fee_amount: eh.ticket_stripe_fee_amount,
                            isBooked: eh.isBooked,
                            isDateExtensionRequestedSent: eh.isDateExtensionRequestedSent,
                            extensionCheckInDate: eh.extensionCheckInDate,
                            extensionCheckOutDate: eh.extensionCheckOutDate,
                            extensionRequestedBy: eh.extensionRequestedBy,
                            extensionRequestedAt: eh.extensionRequestedAt,
                            createdAt: eh.createdAt,
                            updatedAt: eh.updatedAt
                        },
                        { transaction }
                    );
                }
            }

            // // ✅ Upsert Housing Beds
            if (propertyData.Housings && propertyData.Housings.length) {
                for (const h of propertyData.Housings) {
                    await HousingBedrooms.upsert(
                        {
                            id: h.id,
                            HousingID: h.HousingID,
                            bedroom_number: h.bedroom_number,
                            bed_number: h.bed_number,
                            bed_type: h.bed_type,
                            status: h.status,
                            createdAt: h.createdAt,
                            updatedAt: h.updatedAt
                        },
                        { transaction }
                    );
                }
            }

            results.push({
                id: propertyData.id,
                message: created ? "Inserted new property" : "Updated property"
            });
        }

        await transaction.commit();

        return res.send({
            success: true,
            message: "Properties synced successfully",
            results
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Sync error:", error);
        return res.send({
            success: false,
            message: error.message
        });
    }
}

// view all housing - new (07-03-2025 kamal) 
export async function View_HousingNew(req) {
    try {
        const data = await Housing.findAll({
            include: [{ model: EventHousing }, { model: User },
            {
                model: HousingBedrooms, separate: true, order: [['id', 'ASC']], include: [{ model: HousingBedType }] // Nested include
            }, { model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }],
            order: [["createdAt", "DESC"]],
        });

        // Adding Serial Number (SNO) starting from 1
        const modifiedData = data.map((item, index) => ({
            SNO: index + 1,
            ...item.toJSON()
        }));

        return {
            statusCode: 200,
            success: true,
            message: 'View Housing detail Successfully!',
            data: modifiedData,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}

// View housing for id
export async function view_HousingByIdNew({ housing_id }, res) {
    try {
        const data = await Housing.findOne({
            // include: [{ model: HousingImage }, { model: HousingBedrooms }],
            include: [{ model: HousingImage }, {
                model: HousingBedrooms,
                separate: true,
                order: [['id', 'ASC']],
                include: [{ model: HousingBedType }]
            }, { model: HousingNeighborhood, attributes: ["name"] },
            { model: HousingTypes, attributes: ["name"] }],
            where: { id: housing_id },
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            message: "View Housing Successfully",
            status: true,
            data: data,
        }
    } catch (error) {
        return error;
    }
}



export async function updateHousingNew({ id, filename }, req) {
    const folder = req.body.folder || 'housing';
    let newImageUploaded = !!filename;
    let oldImageToDelete = '';

    try {
        const {
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            ManagerName,
            ManagerEmail,
            Description,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            amenities,
            google_map,
            bedrooms,
            admin_notes,
            bookingStatus,
            booking_notes,
            terms_and_conditions
        } = req.body;

        const amenitiesString = Array.isArray(amenities) ? amenities.join(", ") : amenities;

        const existingHousing = await Housing.findOne({ where: { id } });
        if (!existingHousing) {
            return {
                statusCode: 404,
                success: false,
                message: "Housing not found"
            };
        }

        if (newImageUploaded && existingHousing.ImageURL) {
            oldImageToDelete = existingHousing.ImageURL;
        }

        const updateData = {
            Name,
            Neighborhood,
            Type,
            MaxOccupancy,
            NumBedrooms,
            Pool,
            ManagerName,
            ManagerEmail,
            Description,
            location,
            ManagerMobile,
            OwnerName,
            OwnerEmail,
            OwnerMobile,
            amenities: amenitiesString,
            google_map,
            admin_notes,
            bookingStatus,
            booking_notes,
            terms_and_conditions,
        };

        if (newImageUploaded) {
            updateData.ImageURL = filename;
        }

        await Housing.update(updateData, { where: { id } });
        await HousingBedrooms.destroy({ where: { HousingID: id } });
        const parsedBedrooms = typeof bedrooms == "string" ? JSON.parse(bedrooms) : bedrooms;

        for (const bedroom of parsedBedrooms) {
            const { bedroom_number, beds } = bedroom;
            for (const bed of beds) {
                const { bed_number, bed_type } = bed;
                await HousingBedrooms.create({
                    HousingID: id,
                    bedroom_number,
                    bed_number,
                    bed_type,
                });
            }
        }
        if (newImageUploaded && oldImageToDelete) {
            try {
                const testing = await deleteFromS3(folder, oldImageToDelete);
            } catch (delErr) {
                console.warn("Failed to delete old image from S3:", delErr.message);
            }
        }

        return {
            statusCode: 200,
            success: true,
            message: 'Housing and Bedrooms updated successfully!',
        };

    } catch (error) {
        console.error("Error in updateHousingNew:", error);
        if (newImageUploaded && filename) {
            try {
                await deleteFromS3(folder, filename);
            } catch (delErr) {
                console.warn("Failed to delete new image from S3:", delErr.message);
            }
        }

        return {
            statusCode: 500,
            success: false,
            message: 'Failed to update housing',
            error: error.message,
        };
    }
}




// VIEW HOUSING BED TYPES(11-03-2025)
export async function View_HousingBedTypes(req) {
    try {
        const data = await HousingBedType.findAll({
            order: [["createdAt", "DESC"]],
            attributes: ["id", "name", "status"]
        });
        return {
            statusCode: 200,
            success: true,
            message: 'View Housing bed types Successfully!',
            data: data,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}

// VIEW HOUSING Neighborhood(11-03-2025)
export async function View_HousingNeighborhood(req) {
    try {
        const data = await HousingNeighborhood.findAll({
            order: [["id", "ASC"]],
            attributes: ["id", "name", "status", "location"]
        });
        return {
            statusCode: 200,
            success: true,
            message: 'View Housing Neighborhood Successfully!',
            data: data,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}

// view housing types
export async function View_HousingTypes(req) {
    try {
        const data = await HousingTypes.findAll({
            order: [["id", "ASC"]],
            attributes: ["id", "name", "status"]
        });
        return {
            statusCode: 200,
            success: true,
            message: 'View Housing Types Successfully!',
            data: data,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch housing data',
            error: error.message,
        };
    }
}

// VIEW HOUSING HousingAmenities(17-03-2025)
export async function View_HousingAmenities(req) {
    try {
        // Fetch all amenities from the database
        const data = await HousingAmenities.findAll({
            attributes: ["id", "name", "category"]
        });

        // Group the data by category
        const groupedData = data.reduce((acc, amenity) => {
            const { category, id, name } = amenity;

            // Initialize the category array if it doesn't exist
            if (!acc[category]) {
                acc[category] = [];
            }

            // Push the amenity into the appropriate category
            acc[category].push({ id, name });

            return acc;
        }, {});

        return {
            statusCode: 200,
            success: true,
            message: 'View Housing Amenities Successfully!',
            data: groupedData,
        };
    } catch (error) {
        console.error('Error fetching housing data:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch Housing Amenities data',
            error: error.message,
        };
    }
}


const createTemplate = (html, replacements) => {
    if (!html || typeof html !== "string") {
        throw new Error("Invalid HTML content provided.");
    }

    if (!replacements || typeof replacements !== "object") {
        throw new Error("Replacements must be provided as an object.");
    }
    let processedHtml = html;
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = new RegExp(`{${key}}`, "g"); // Dynamic placeholder matching
        processedHtml = processedHtml.replace(placeholder, value || "");
    }

    return processedHtml;
};

export async function isBookingRequest(req, res) {
    try {

        const {
            check_in_date,
            check_out_date,
            event_id,
            housing_id,
            user_id,
            evenHousingId,
            totalAmount,
            toEmail,
            totalNight,
            fullPropertyName,
            firstName
        } = req.body;

        // console.log('>>>>>>>>>>>>>>>>>>>>>', req.body);
        // return true
        const existingEventHousing = await EventHousing.findOne({
            where: {
                EventID: event_id,
                HousingID: housing_id,
                id: evenHousingId
            }
        });

        if (!existingEventHousing) {
            return {
                statusCode: 404,
                success: false,
                message: 'Event housing record not found.',
            };
        }

        // Update fields for extension request
        existingEventHousing.isDateExtensionRequestedSent = 'Y';
        existingEventHousing.extensionCheckInDate = check_in_date;
        existingEventHousing.extensionCheckOutDate = check_out_date;
        existingEventHousing.extensionRequestedBy = user_id;
        existingEventHousing.extensionRequestedAt = moment().format("YYYY-MM-DD HH:mm:ss");

        await existingEventHousing.save();
        // Construct a relevant URL
        const extensionUrl = `${SITE_URL}accommodations/extend-housing-availability?data_id=${evenHousingId}`;
        // Fetch template
        const getTemplateHtml = await Emailtemplet.findOne({
            where: { eventId: event_id, templateId: 43 }, // use correct templateId
        });

        if (!getTemplateHtml) {
            throw new Error("Email template not found.");
        }

        const sanitizedTemplate = getTemplateHtml.description;
        const subject = getTemplateHtml.subject;
        const templateName = getTemplateHtml.mandril_template;

        // Replace placeholders with actual values
        const replacements = {
            FirstName: firstName,
            PropertyName: fullPropertyName,
            CheckOutDate: moment(check_out_date).format("Do [of] MMMM YYYY"), // "10th of November 2025"
            ExtensionLink: extensionUrl,
        };

        const processedTemplate = createTemplate(sanitizedTemplate, replacements);
        const mergeVars = { ALLDATA: processedTemplate };

        // Send the email
        // await sendEmail(toEmail, mergeVars, templateName, subject);
        await sendEmailWithBCC(toEmail, ['lucrecia@ondalinda.com'], mergeVars, templateName, subject);

        return {
            statusCode: 200,
            success: true,
            message: 'Booking extension request submitted successfully.',
            data: {
                EventID: event_id,
                HousingID: housing_id,
                CheckIn: check_in_date,
                CheckOut: check_out_date,
                UserID: user_id,
                evenHousingId,
                ExtensionURL: extensionUrl
            }
        };

    } catch (error) {
        console.error('Error processing booking request:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to submit booking extension request.',
            error: error.message,
        };
    }
}

export async function getEventHousingDetails(eventHousingId) {
    try {

        const result = await EventHousing.findOne({
            where: { id: eventHousingId },
            attributes: [
                "isDateExtensionRequestedSent",
                "extensionCheckInDate",
                "extensionCheckOutDate",
                "extensionRequestedBy",
                "extensionRequestedAt",
                "HousingID",
                "NightlyPrice"
            ]
        });

        if (!result) {
            return {
                statusCode: 404,
                success: false,
                message: "Event housing not found",
            };
        }

        return {
            statusCode: 200,
            success: true,
            message: "Event housing details fetched successfully",
            data: result,
        };
    } catch (error) {
        console.error("Error fetching event housing details:", error);
        return {
            statusCode: 500,
            success: false,
            message: "Error fetching event housing details",
            error: error.message,
        };
    }
}

// Approved housing requested for cuixmala and las alamandas
export async function approvedHousingRequest(req, res) {
    try {
        const { eventId, userId } = req.body;
        // Validate input
        if (!eventId || !userId) {
            return {
                success: false,
                message: "eventId and userId are required.",
            };
        }
        // Update accommodation status
        const updatedRows = await InvitationEvent.update(
            // { accommodation_status: "Booked" },
            { is_booking_status: "Y" },
            { where: { EventID: eventId, UserID: userId } }
        );
        if (updatedRows === 0) {
            return {
                success: false,
                message: "No matching record found to update.",
            };
        }
        return {
            success: true,
            message: "Housing request approved successfully.",
        };
    } catch (error) {
        console.error("Error updating housing data:", error);
        return {
            success: false,
            message: "Failed to approve housing request: " + error.message,
            error: error.message,
        };
    }
}



// Search Api for manage property manager searching....(19-05-2025-kamal)
export async function searchEventHousing({ Name, Neighborhood, Type, NumBedrooms, Status, location, paymentStatus }) {
    try {
        // Build dynamic search filters
        const filters = {};
        if (Name) filters.Name = { [Op.like]: `%${Name}%` };
        if (Neighborhood) filters.Neighborhood = Neighborhood;
        if (Type) filters.Type = Type;
        if (NumBedrooms) filters.NumBedrooms = NumBedrooms;
        if (location) filters.location = location;

        // Build EventHousing where clause
        let eventHousingWhere = { EventID: 111 }; // Always filter by EventID 111

        // 1. If Status == 2 => search by Status = 2 AND isBooked != 'Y'
        if (Status == 2) {
            eventHousingWhere.Status = 2;
            eventHousingWhere.isBooked = { [Op.ne]: 'Y' }; // Exclude isBooked = 'Y'
        }
        // 2. Else if Status is one of 'Y', 'N', 'P', use isBooked directly
        else if (['Y', 'N', 'P'].includes(Status)) {
            eventHousingWhere.isBooked = Status;
        }
        // 3. Otherwise use Status directly
        else if (Status) {
            eventHousingWhere.Status = Status;
        }
        // return false
        const bookingWhere = {};
        if (paymentStatus) {
            bookingWhere.payment_status = paymentStatus;
        }
        // Query with filters and includes
        const searchResults = await Housing.findAll({
            where: filters,
            include: [
                {
                    model: EventHousing,
                    where: eventHousingWhere // ✅ Proper EventID + Status filter applied here
                },
                {
                    model: HousingBedrooms,
                    separate: true,
                    order: [['id', 'ASC']],
                    include: [{ model: HousingBedType }]
                },
                { model: HousingNeighborhood, attributes: ['name'] },
                { model: HousingTypes, attributes: ['name'] },
                {
                    model: AccommodationBooking,
                    where: Object.keys(bookingWhere).length > 0 ? bookingWhere : undefined,
                    attributes: ['user_id', 'event_id', 'first_name', 'last_name', 'email', 'payment_status', 'check_in_date', 'check_out_date', 'total_night_stay'],
                    include: [
                        {
                            model: MyOrders,
                            attributes: ['total_amount', 'user_id', 'event_id'],
                            include: [
                                {
                                    model: BookTicket,
                                    attributes: ['order_id', 'event_id', 'ticket_buy']
                                }
                            ]
                        }
                    ]
                }
            ],
            attributes: [
                'Name', 'Neighborhood', 'Type', 'MaxOccupancy', 'NumBedrooms', 'Pool',
                'Distance', 'ManagerName', 'ManagerEmail', 'ManagerMobile', 'location',
                'OwnerName', 'OwnerEmail', 'OwnerMobile', 'amenities'
            ],
            order: [['createdAt', 'DESC']],
        });

        // Add Serial Number (SNO)
        const modifiedData = searchResults.map((item, index) => ({
            SNO: index + 1,
            ...item.toJSON()
        }));

        return {
            statusCode: 200,
            success: true,
            message: 'Accommodation data retrieved successfully based on search filters.',
            data: modifiedData
        };
    } catch (error) {
        console.error('Search API Error:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'An error occurred while retrieving accommodation data.',
            error: error.message
        };
    }
}






