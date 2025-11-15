import {
    Orders,
    User,
    MyOrders,
    MyTicketBook,
    BookTicket,
    Event,
    EventTicketType,
    Currency,
    Addons,
    AddonBook,
    Housing,
    HousingInfo,
    BookAccommodationInfo
} from "@/database/models";
const { Op } = require("sequelize");


export const getAccommodationReports = async (req, res) => {
    try {
        const { eventid, firstName = "", email = "", phone = "", order = "", dateFrom = "", dateTo = "", housingID = "" } = req.query;

        if (!eventid) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: eventid",
            });
        }

        // Construct dynamic WHERE conditions
        const whereConditions = {
            event_id: eventid,
        };

        // Filter by order ID
        if (order.trim()) {
            whereConditions.OriginalTrxnIdentifier = {
                [Op.like]: `%${order.trim()}%`
            };
        }

        if (housingID) {
            whereConditions.book_accommodation_id = housingID;
        }

        // Filter by createdAt date range
        if (dateFrom && dateTo) {
            const startDate = new Date(dateFrom);
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999); // Set end of the day
            whereConditions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        } else if (dateFrom) {
            const startDate = new Date(dateFrom);
            whereConditions.createdAt = {
                [Op.gte]: startDate
            };
        } else if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999); // Set end of the day
            whereConditions.createdAt = {
                [Op.lte]: endDate
            };
        }


        // User model filtering
        const userWhere = {};
        if (firstName.trim()) {
            userWhere.FirstName = { [Op.like]: `%${firstName.trim()}%` };
        }
        if (email.trim()) {
            userWhere.Email = { [Op.like]: `%${email.trim()}%` };
        }
        if (phone.trim()) {
            userWhere.PhoneNumber = { [Op.like]: `%${phone.trim()}%` };
        }

        const data = await MyOrders.findAll({
            where: whereConditions,
            attributes: [
                "id",
                "OriginalTrxnIdentifier",
                "createdAt",
                "book_accommodation_id",
                "paymentOption"
            ],
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: BookAccommodationInfo,
                    attributes: ["total_amount", "total_night_stay", "check_in_date", "check_out_date", "guests_count", "no_of_bedrooms", "qr_code_image"],
                    include: {
                        model: HousingInfo,
                        attributes: ["Name", "ID", "ManagerName", "ManagerMobile"]
                    }
                },
                {
                    model: User,
                    attributes: ["Email", "FirstName", "PhoneNumber"],
                    ...(Object.keys(userWhere).length ? { where: userWhere } : {}),
                },
                {
                    model: BookTicket,
                    attributes: ["amount"],
                    include: [
                        {
                            model: EventTicketType,
                            attributes: ["title"]
                        }
                    ]
                },
                // {
                //     model: AddonBook,
                //     attributes: ["price"],
                //     include: [
                //         {
                //             model: Addons,
                //             attributes: ["name"]
                //         }
                //     ]
                // },
                {
                    model: Event,
                    attributes: ["Name", "id"],
                    include: [
                        {
                            model: Currency,
                            attributes: ["Currency_symbol"]
                        }
                    ]
                }
            ],
            raw: false,
            // nest: true
        });

        const housingMap = new Map();

        data.forEach(item => {
            const housing = item?.BookAccommodationInfo?.Housing.dataValues;
            if (housing?.ID && housing?.Name) {
                if (!housingMap.has(housing.ID)) {
                    housingMap.set(housing.ID, housing.Name);
                }
            }
        });

        const uniqueHousingList = Array.from(housingMap, ([ID, name]) => ({ ID, name }));

        return res.status(200).json({
            success: true,
            message: 'Data Retrieved',
            data,
            uniqueHousingList
        });

    } catch (error) {
        console.error("Accommodation Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve accommodation reports.",
            error: error.message
        });
    }
};

