import { Housing, User, HousingImage, EventHousing, InvitationEvent, MyOrders } from "@/database/models"
import { StatusCodes } from 'http-status-codes';
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

export async function view_Property({ OwnerID }, res) {
    try {
        if (!OwnerID) {
            return {
                message: "ID is undefined",
                success: false,
                data: null,
                statusCode: StatusCodes.NOT_FOUND
            };
        }
        const data = await Housing.findAll({
            where: {
                OwnerID: OwnerID,
            },
            // include: { model: User },
            include: [
                { model: User },
                { model: HousingImage },
                { model: EventHousing }
            ],
            // attributes: ['id', 'FirstName', 'LastName']
        });
        if (!data) {
            return {
                message: "ID not found",
                success: false,
                data: null,
                statusCode: StatusCodes.NOT_FOUND
            };
        }
        return {
            message: "Property viewed successfully!",
            success: true,
            statusCode: StatusCodes.OK,
            data: data,
        };
    } catch (error) {
        return {
            message: error.message || "An error occurred",
            success: false,
            data: null,
        };
    }
}

export async function getAssignedHousing({ userId, eventId, checkIn, checkOut }, res) {
    try {

        // console.log('checkIn',checkIn);
        // console.log('checkOut',checkOut);

        const getData = await InvitationEvent.findOne({
            attributes: ['ID', 'UserID', 'EventID', 'EligibleHousingIDs', 'Status', 'HousingOption'],
            order: [["createdAt", "DESC"]],
            where: {
                UserID: userId,
                EventID: eventId
            }
        });


        if (getData) {

            if (getData.HousingOption == 2) {


                const eligibleHousingIDs = getData?.dataValues?.EligibleHousingIDs;

                if (!eligibleHousingIDs) {
                    return {
                        statusCode: 404,
                        success: false,
                        eligible: true,
                        message: 'You have no housing yet assigned.',
                    };
                }

                const eligibleHousingIdsArray = eligibleHousingIDs.split(',')
                    .map(id => parseInt(id.trim(), 10))
                    .filter(id => !isNaN(id)); // Filter out any NaN values

                if (eligibleHousingIdsArray.length === 0) {
                    return {
                        statusCode: 404,
                        success: false,
                        eligible: true,
                        message: 'You have no housing yet assigned.',
                    };
                }

                // const eligibleHousingIdsArray = getData.dataValues.EligibleHousingIDs.split(',').map(id => parseInt(id.trim(), 10));

                // if (!eligibleHousingIdsArray || !Array.isArray(eligibleHousingIdsArray) || eligibleHousingIdsArray.length === 0) {
                //     return res.status(400).json({ error: 'Invalid eligibleHousingIdsArray' });
                // }

                const housingOptions = {
                    attributes: ['ID', 'Name', 'Neighborhood', 'ManagerName', 'MaxOccupancy', 'NumBedrooms', 'ImageURL', 'Type'],
                    order: [["createdAt", "DESC"]],
                    where: {
                        ID: {
                            [Op.in]: eligibleHousingIdsArray
                        }
                    }
                };


                let data = await Housing.findAll({
                    ...housingOptions,
                    include: [{
                        model: EventHousing,
                        limit: 1,
                        order: [['CreatedAt', 'DESC']],
                        subQuery: false,
                        where: {
                            EventID: eventId,
                            AvailabilityStartDate: {
                                [Op.gte]: checkIn // AvailabilityStartDate >= 07-11-2024
                            },
                            AvailabilityEndDate: {
                                [Op.lte]: checkOut // AvailabilityEndDate <= 10-11-2024
                            }
                        }
                    }]
                });

                if (data.length === 0) {
                    return {
                        statusCode: 404,
                        success: false,
                        eligible: true,
                        message: 'No housing details found for the given ids',
                    };
                }

                return {
                    statusCode: 200,
                    success: true,
                    eligible: true,
                    message: 'View Housing detail Successfully!',
                    data: data
                };

            } else {

                return {
                    statusCode: 200,
                    success: true,
                    message: 'No need to required accommodation',
                    eligible: false
                };

            }


        } else {

            return {
                statusCode: 404,
                success: false,
                eligible: true,
                message: 'No housing details found for the given ids',
            };
        }

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

export async function isBooked(eventHousingId, res) {

    console.log('eventHousingId',eventHousingId);

    try {
        const data = await EventHousing.findOne({
            where: { id: eventHousingId },
            attributes: ['isBooked'],
        });

        // console.log('/////////////////////////',data);
        

        if (data) {
            if (data.isBooked == 'Y') {
                return {
                    statusCode: 200,
                    success: false,
                    message: 'This accommodation is no longer available as it has already been reserved by another member. Please select a different accommodation.',
                };
            } else {
                return {
                    statusCode: 200,
                    success: true,
                    message: 'Housing is available'
                };
            }
        } else {
            return {
                statusCode: 404,
                success: false,
                message: 'No housing details found for the given id',
            };
        }
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

export async function isAccommodationBooked({ housingId, eventId }) {
    try {

        const count = await MyOrders.count({
            where: {
                event_id: eventId,
                book_accommodation_id: housingId,
            },
        });

        if (count > 0) {
            return {
                statusCode: 200,
                success: false,
                message: 'This accommodation is no longer available as it has already been reserved by another member. Please select a different accommodation.',
            };
        }

        return {
            statusCode: 200,
            success: true,
            message: 'Housing is available',
        };

    } catch (error) {
        console.error('Error checking accommodation booking:', error);
        return {
            statusCode: 500,
            success: false,
            message: 'Internal server error while checking housing availability.',
            error: error.message,
        };
    }
}
