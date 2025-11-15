import {
    Addons,
    AddonBook,
    EventTicketType,
    BookTicket,
    Event,
    MyOrders,
    AccommodationBookingInfo,
    BookAccommodationInfo,
    Housing,
    Currency,
    Orders,
    TicketDetail,
    User,
    HousingNeighborhood,
    OrderGuest, // add guest in accommodation
    Emailtemplet,
    Payment,
    AccommodationExtension,
    HousingInfo,
    EventHousing
} from "@/database/models";
import { sendEmail, sendEmailWithBCC } from "@/utils_back/sendEmail"; // send mail via mandril
import { AddGuestInAccommodationTemplate } from "@/utils_back/email-templates";
import { Op } from "sequelize";
let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// View All Orders find by user_id
export async function getOrdersByUser(userId) {
    try {
        const orderInfo = await MyOrders.findAll({
            where: { user_id: userId },
            attributes: [
                "id",
                "OriginalTrxnIdentifier",
                "totalCartAmount",
                "total_amount",
                "createdAt",
                "book_accommodation_id",
                'adminfee',
                'totalAccommodationAmount',
                'totalAccommodationTax',
                'paymentOption',
                'total_due_amount'
            ],
            order: [["id", "DESC"]],
            include: [
                {
                    model: BookTicket,
                    attributes: ["amount", "ticket_buy"],
                    include: [
                        {
                            model: EventTicketType,
                            attributes: ["title"]
                        }
                    ]
                },
                {
                    model: AddonBook,
                    attributes: ["price"],
                    include: [
                        {
                            model: Addons,
                            attributes: ["name"]
                        }
                    ]
                },
                {
                    model: Event,
                    attributes: ["Name", "id"],
                    include: [
                        {
                            model: Currency,
                            attributes: ["Currency_symbol"]
                        }
                    ]
                },
                // {
                //     model: AccommodationExtension,
                //     attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
                //     include: [
                //         {
                //             model: HousingInfo,
                //             attributes: [
                //                 "Name",
                //                 "Neighborhood",
                //                 "MaxOccupancy",
                //                 "NumBedrooms"
                //             ],
                //             include: [
                //                 {
                //                     model: EventHousing,
                //                     attributes: ['id', 'EventID', 'NightlyPrice', 'AvailabilityStartDate', 'AvailabilityEndDate'],
                //                     order: [['id', 'DESC']]
                //                 },
                //                 {
                //                     model: HousingNeighborhood,
                //                     attributes: ["name"]
                //                 }
                //             ]
                //         }
                //     ]
                // }
            ],
            raw: false,
            nest: true
        });


        // Attach accommodation info to orders
        for (const order of orderInfo) {
            if (order.book_accommodation_id && order.Event?.id) {
                const bookAccommodationInfo = await AccommodationBookingInfo.findOne({
                    where: {
                        event_id: order.Event.id,
                        accommodation_id: order.book_accommodation_id
                    },
                    attributes: ["total_amount", "check_in_date", "check_out_date", "total_night_stay"],
                    include: {
                        model: Housing,
                        attributes: ["Name"]
                    }
                });

                if (bookAccommodationInfo) {
                    order.dataValues.accommodation_info = bookAccommodationInfo;
                }
            }
        }

        const transformedOrders = orderInfo.map(order => {
            const adminFeePercent = Number(order.adminfee || 0); // use 0 if undefined
            const itemMap = new Map();
            // Tickets
            order.TicketBooks?.forEach(ticket => {
                const title = ticket.EventTicketType?.title || "Unnamed Ticket";
                const key = `ticket:${title}`;

                const quantity = Number(ticket.ticket_buy);
                const baseAmount = Number(ticket.amount);
                const taxedAmount = baseAmount + (baseAmount * adminFeePercent / 100);

                const prev = itemMap.get(key);
                if (prev) {
                    prev.quantity += quantity;
                    prev.totalPrice += Math.round(taxedAmount)
                } else {
                    itemMap.set(key, {
                        name: title,
                        quantity,
                        totalPrice: Math.round(taxedAmount)
                    });
                }
            });

            // Add-ons
            order.AddonBooks?.forEach(addon => {
                const name = addon.Addon?.name || "Unnamed Addon";
                const key = `addon:${name}`;

                const basePrice = Number(addon.price);
                const taxedPrice = basePrice + (basePrice * adminFeePercent / 100);

                const prev = itemMap.get(key);
                if (prev) {
                    prev.quantity += 1;
                    prev.totalPrice += Math.round(taxedPrice)
                } else {
                    itemMap.set(key, {
                        name,
                        quantity: 1,
                        totalPrice: Math.round(taxedPrice)
                    });
                }
            });

            // Accommodation (NO TAX)
            if (order.dataValues.accommodation_info?.Housing?.Name) {
                const accName = order.dataValues.accommodation_info.Housing.Name;
                const accPrice = Number(order.dataValues.totalAccommodationAmount);
                const check_in_date = order.dataValues.accommodation_info.check_in_date;
                const check_out_date = order.dataValues.accommodation_info.check_out_date;
                const total_night_stay = order.dataValues.accommodation_info.total_night_stay;
                const key = `accommodation:${accName}`;
                itemMap.set(key, {
                    name: accName,
                    quantity: 1,
                    totalPrice: accPrice,
                    checkInDate: check_in_date,
                    checkOutDate: check_out_date,
                    totalNightStay: total_night_stay
                });
            }

            // Convert to array
            // const items = Array.from(itemMap.values()).map(item => ({
            //     name: `${item.quantity}x ${item.name}`,
            //     price: `${item.totalPrice.toFixed(2)}`, // Ensure formatting
            // }));
            const items = Array.from(itemMap.values()).map(item => {
                const baseItem = {
                    name: `${item.quantity}x ${item.name}`,
                    price: `${item.totalPrice.toFixed(2)}`
                };

                // Add accommodation details *only* if it's an accommodation item
                if (item.checkInDate || item.checkOutDate || item.totalNightStay) {
                    baseItem.checkInDate = item.checkInDate;
                    baseItem.checkOutDate = item.checkOutDate;
                    baseItem.totalNightStay = item.totalNightStay;
                }

                return baseItem;
            });

            return {
                id: `${order.OriginalTrxnIdentifier}`,
                date: new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }),
                event: order.Event?.Name || "Unknown Event",
                Currency: order.Event?.Currency.Currency_symbol,
                paymentOption: order.dataValues.paymentOption,
                dueAmount: order.dataValues.total_due_amount,
                // price: order.totalCartAmount || order.total_amount, // original total (unchanged)
                price: order.total_amount, // original total (unchanged)
                items
            };
        });

        return {
            status: 200,
            success: true,
            message: "User orders retrieved successfully.",
            data: transformedOrders
        };
    } catch (error) {
        console.error("Error fetching user orders:", error.message);
        throw new Error("Unable to fetch orders. Please try again later.");
    }
}

// Tickets/Addons/accommodations/Guest
export async function viewTickets(userId) {
    try {
        const finalData = [];
        const accommodationData = [];
        const currentEventIds = new Set();
        let extendAccommodation = {}; // if you plan to use it separately


        // STEP 1: Fetch current orders
        const orderInfo = await MyOrders.findAll({
            where: { user_id: userId },
            attributes: ['id', 'OriginalTrxnIdentifier', 'book_accommodation_id', 'order_context', 'paymentOption', 'total_amount', 'total_due_amount', "accommodation_bookings_info_id", 'RRN'],
            include: [
                {
                    model: BookAccommodationInfo,
                    attributes: ['id', 'check_in_date', 'accommodation_id', 'event_id', 'user_id', 'check_out_date', 'total_night_stay'],
                    include: [
                        {
                            model: Housing,
                            attributes: ['Name', 'Neighborhood', 'ImageURL', 'location'],
                            include: [{ model: HousingNeighborhood, attributes: ['name'] }],
                        }
                    ],
                },
                {
                    model: BookTicket,
                    attributes: ["amount", "id", 'transfer_reply', 'transfer_user_id'],
                    include: [
                        { model: TicketDetail, attributes: ['qrcode', 'fname', 'lname', 'name_update_count', 'transfer_reply', 'transfer_user_id', 'ticket_status', 'ticket_cancel_id', 'cancel_date'] },
                        { model: EventTicketType, attributes: ["title", "ticket_image"] }
                    ]
                },
                {
                    model: AddonBook,
                    attributes: ['id', 'addon_qrcode', 'transfer_reply', 'transfer_user_id', 'fname', 'lname', 'name_update_count', "ticket_status", "price"],
                    include: [
                        {
                            model: Addons,
                            attributes: ['name', 'addon_image', 'addon_day', 'addon_time', 'addon_location', 'addon_type', 'sortName']
                        }
                    ]
                },
                {
                    model: Event,
                    where: { status: 'Y' },
                    attributes: ['id', 'Name', 'StartDate', 'Venue']
                },
                {
                    model: User,
                    attributes: ['FirstName', 'LastName', 'Email', 'ImageURL']
                },// User info
                {
                    model: OrderGuest,
                    include: { model: User, attributes: ['FirstName', 'LastName', 'Email', 'ImageURL'] },
                    // where: { status: 'Y' },
                    attributes: ['guest_user_id', 'order_id']
                },
            ]
        });

        for (const order of orderInfo) {
            const event = order.Event;


            if (event?.id) currentEventIds.add(event.id);

            if (order.BookAccommodationInfo) {
                const TicketCount = await Payment.findOne({
                    where: { payment_intent: order.RRN },
                    attributes: ['id', 'totalticket']
                });

                // ✅ Find matching extension from AccommodationExtension table
                let extendedAccommodation = null;

                const findExtendAcco = await AccommodationExtension.findOne({
                    where: {
                        user_id: userId,
                        accommodation_id: order.BookAccommodationInfo.accommodation_id,
                        event_id: order.BookAccommodationInfo.event_id
                    },
                    attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
                    order: [['id', 'DESC']]
                });

                let checkInDate = order.BookAccommodationInfo.check_in_date;
                let checkOutDate = order.BookAccommodationInfo.check_out_date;
                let totalNights = order.BookAccommodationInfo.total_night_stay;

                if (findExtendAcco) {
                    const extendCheckInDate = findExtendAcco.check_in_date;
                    const extendCheckOutDate = findExtendAcco.check_out_date;

                    // Compare and merge check-in
                    if (new Date(extendCheckInDate) < new Date(checkInDate)) {
                        checkInDate = extendCheckInDate;
                    }

                    // Compare and merge check-out
                    if (new Date(extendCheckOutDate) > new Date(checkOutDate)) {
                        checkOutDate = extendCheckOutDate;
                    }

                    // Merge total nights
                    totalNights += findExtendAcco.total_night_stay;

                    // Prepare extendedAccommodation object
                    extendedAccommodation = {
                        id: findExtendAcco.id,
                        extendCheckInDate,
                        accommodation_id: findExtendAcco.accommodation_id,
                        extendCheckOutDate,
                        extendTotalNights: findExtendAcco.total_night_stay
                    };
                }

                accommodationData.push({
                    transactionId: order.OriginalTrxnIdentifier,
                    orderId: order.id,
                    paymentOption: order.dataValues.paymentOption,
                    totalAmount: order.dataValues.total_amount,
                    totalDueAmount: order.dataValues.total_due_amount,
                    totalTicket: TicketCount?.totalticket || 0,
                    userInfo: order.User,
                    guestUser: order.OrderGuests,
                    accommodation: {
                        id: order.BookAccommodationInfo.id,
                        accommodation_id: order.BookAccommodationInfo.accommodation_id,
                        checkInDate,
                        checkOutDate,
                        totalNights,
                        housing: order.BookAccommodationInfo.Housing
                    },
                    extendedAccommodation // null if no extension found
                });


            }


            for (const ticket of order.TicketBooks || []) {
                let receiverInfo = null;
                if (ticket.transfer_user_id) {
                    receiverInfo = await User.findOne({
                        where: { id: ticket.transfer_user_id },
                        attributes: ["Email", "FirstName", "LastName"]
                    });
                }

                finalData.push({
                    isTicket: true,
                    ticketId: ticket.id,
                    transfer_reply: ticket.transfer_reply,
                    transfer_user_id: ticket.transfer_user_id,
                    transactionId: order.OriginalTrxnIdentifier,
                    orderId: order.id,
                    paymentOption: order.paymentOption,
                    totalAmount: order.total_amount,
                    event: order.Event,
                    amount: ticket.amount,
                    ticketDetail: ticket.TicketDetails,
                    ticketType: ticket.EventTicketType,
                    transferredTo: receiverInfo ? receiverInfo.Email : null,
                    transferredToName: receiverInfo ? `${receiverInfo.FirstName} ${receiverInfo.LastName}` : null
                });
            }

            for (const addon of order.AddonBooks || []) {
                let receiverInfo = null;
                if (addon.transfer_user_id) {
                    receiverInfo = await User.findOne({
                        where: { id: addon.transfer_user_id },
                        attributes: ["Email", "FirstName", "LastName"]
                    });
                }

                finalData.push({
                    isTicket: false,
                    ticketId: addon.id,
                    qrCode: addon.addon_qrcode,
                    transfer_reply: addon.transfer_reply,
                    transfer_user_id: addon.transfer_user_id,
                    fname: addon.fname,
                    lname: addon.lname,
                    name_update_count: addon.name_update_count,
                    ticket_status: addon.ticket_status,
                    transactionId: order.OriginalTrxnIdentifier,
                    orderId: order.id,
                    paymentOption: order.paymentOption,
                    totalAmount: order.total_amount,
                    event: order.Event,
                    price: addon.price,
                    addonDetail: addon.Addon,
                    transferredTo: receiverInfo ? receiverInfo.Email : null,
                    transferredToName: receiverInfo ? `${receiverInfo.FirstName} ${receiverInfo.LastName}` : null
                });
            }
        }

        // STEP 2: Include transferred-to user tickets
        const receivedTransfers = await MyOrders.findAll({
            include: [
                {
                    model: BookTicket,
                    attributes: ["amount", "id", 'transfer_reply', 'transfer_user_id'],
                    where: { transfer_user_id: userId },
                    required: true,
                    include: [
                        { model: TicketDetail, attributes: ['qrcode', 'fname', 'lname', 'name_update_count', 'transfer_reply', 'transfer_user_id', 'ticket_status', 'ticket_cancel_id', 'cancel_date'] },
                        { model: EventTicketType, attributes: ["title", "ticket_image"] }
                    ]
                },
                {
                    model: Event,
                    where: { status: 'Y' },
                    attributes: ['id', 'Name', 'StartDate', 'Venue'],
                    required: true
                }
            ]
        });

        for (const order of receivedTransfers) {
            for (const ticket of order.TicketBooks || []) {
                finalData.push({
                    isTicket: true,
                    ticketId: ticket.id,
                    transfer_reply: ticket.transfer_reply,
                    transfer_user_id: ticket.transfer_user_id,
                    transactionId: order.OriginalTrxnIdentifier,
                    orderId: order.id,
                    paymentOption: order.paymentOption,
                    totalAmount: order.total_amount,
                    event: order.Event,
                    amount: ticket.amount,
                    ticketDetail: ticket.TicketDetails,
                    ticketType: ticket.EventTicketType,
                    transferredFrom: order.user_id
                });
            }
        }

        const receivedAddons = await MyOrders.findAll({
            include: [
                {
                    model: AddonBook,
                    attributes: ['id', 'addon_qrcode', 'transfer_reply', 'transfer_user_id', 'fname', 'lname', 'name_update_count', "ticket_status", "price"],
                    where: { transfer_user_id: userId },
                    required: true,
                    include: [
                        { model: Addons, attributes: ['name', 'addon_image', 'addon_day', 'addon_time', 'addon_location', 'addon_type', 'sortName'] }
                    ]
                },
                {
                    model: Event,
                    where: { status: 'Y' },
                    attributes: ['id', 'Name', 'StartDate', 'Venue'],
                    required: true
                }
            ]
        });

        for (const order of receivedAddons) {
            for (const addon of order.AddonBooks || []) {
                finalData.push({
                    isTicket: false,
                    ticketId: addon.id,
                    qrCode: addon.addon_qrcode,
                    transfer_reply: addon.transfer_reply,
                    transfer_user_id: addon.transfer_user_id,
                    fname: addon.fname,
                    lname: addon.lname,
                    name_update_count: addon.name_update_count,
                    ticket_status: addon.ticket_status,
                    transactionId: order.OriginalTrxnIdentifier,
                    orderId: order.id,
                    paymentOption: order.paymentOption,
                    totalAmount: order.total_amount,
                    event: order.Event,
                    price: addon.price,
                    addonDetail: addon.Addon,
                    transferredFrom: order.user_id
                });
            }
        }

        // STEP 3: Fetch past events attended (distinct events)
        const pastEventsAttended = await MyOrders.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: BookTicket,
                    required: true
                },
                {
                    model: Event,
                    required: true,
                    where: {
                        status: 'N',
                        id: { [Op.notIn]: Array.from(currentEventIds) }
                    },
                    attributes: ['Name', 'Venue', 'ImageURL', 'videoUrl', 'StartDate']
                }
            ],
            attributes: [],
            order: [['id', 'DESC']],
            group: ['Event.id']
        });

        const uniquePastEvents = pastEventsAttended.map(order => {
            const event = order.Event;
            return {
                ...event.toJSON(),
                year: new Date(event.StartDate).getFullYear()
            };
        });

        return {
            success: true,
            message: 'View Tickets successfully!',
            data: finalData,
            pastEvents: uniquePastEvents,
            accommodations: accommodationData
        };

    } catch (error) {
        console.log('Error fetching tickets:', error.message);
        return {
            success: false,
            message: 'An error occurred while fetching tickets :' + error.message
        };
    }
}

// added guest in accommodation
export async function AddGuestInAccommodation({ orderId, email }, req, res) {
    try {
        // 1. Validate input
        if (!orderId || !email) {
            return { success: false, message: "Order ID and Email are required." };
        }

        // 2. Find user by email
        const guestUser = await User.findOne({
            where: { email },
            attributes: ['id', 'FirstName', 'LastName', 'Email']
        });
        if (!guestUser) {
            return { success: false, message: "Guest not found in system." };
        }
        // 3. Check if already added
        const exists = await OrderGuest.findOne({
            where: {
                order_id: orderId,
                guest_user_id: guestUser.id,
            },
        });
        if (exists) {
            return { success: false, message: "Guest already added for this order." };
        }

        // find booking accommodation info
        const BookingInfo = await AccommodationBookingInfo.findOne({
            where: { order_id: orderId },
            include: { model: Housing, attributes: ['Name'], include: { model: HousingNeighborhood, attributes: ['name'] } },
            attributes: ['first_name', 'last_name', 'accommodation_id', 'check_in_date', 'check_out_date']
        })

        // console.log("<<<<<<<<<<<object>>>>>>>>>>>",BookingInfo.Housing?.HousingNeighborhood?.name)
        // return false
        // Format it:-
        const checkInDate = new Date(BookingInfo.check_in_date);
        const checkOutDate = new Date(BookingInfo.check_out_date);

        const monthName = checkInDate.toLocaleString('en-US', { month: 'long' });
        const year = checkInDate.getFullYear();
        const startDay = checkInDate.getDate();
        const endDay = checkOutDate.getDate();
        const formattedDate = `${monthName} ${startDay} to ${endDay} ${year}.`;

        // 4. Create guest record
        await OrderGuest.create({
            order_id: orderId,
            guest_user_id: guestUser.id,
        });
        const emailTemplate = await Emailtemplet.findOne({
            where: {
                eventId: 111,
                templateId: 39,
            },
        });

        const MyEventsLink = `${SITE_URL}/user/my-event`;

        const { mandril_template: templateName, subject, description: htmlTemplate } = emailTemplate;
        // const processedTemplate = processTemplate({
        const processedTemplate = AddGuestInAccommodationTemplate({
            UserName: `${BookingInfo.first_name} ${BookingInfo.last_name}`,
            PropertyName: `${BookingInfo.Housing.Name} ${BookingInfo.Housing?.HousingNeighborhood?.name}`,
            StayDate: formattedDate,
            MyEventsLink: MyEventsLink,
            html: htmlTemplate,
        });
        const mergeVars = { ALLDATA: processedTemplate.html };
        const toEmail = guestUser.Email;
        // await sendEmail(toEmail, mergeVars, templateName, subject);
        // await sendEmailWithBCC(toEmail, ["hello@ondalinda.com"], mergeVars, templateName, subject);
        await sendEmailWithBCC(toEmail, [], mergeVars, templateName, subject);
        return { success: true, message: "Guest added successfully." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error." };
    }
}

export async function getTotalOrders({ userId }, res) {
    try {
        if (!userId) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "Missing required parameter: userId",
            });
        }

        const orders = await MyOrders.findAll({
            where: {
                user_id: userId,
                [Op.or]: [
                    { is_free: { [Op.is]: null } },
                    { couponCode: { [Op.not]: null } },
                ],
                ticket_status: { [Op.is]: null },
            },
            attributes: ['id', 'OriginalTrxnIdentifier', 'total_amount', 'totalAccommodationAmount', 'total_due_amount', 'total_tax_amount', 'order_context', 'couponCode', 'discountAmount', 'paymentOption', 'createdAt', 'totalTicketAmount', 'totalTicketTax', 'totalAddonAmount', 'totalAddonTax', 'adminfee'],
            include: [
                {
                    model: User,
                    required: true,
                    attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"]
                },
                {
                    model: Event,
                    attributes: ["Name"],
                    include: [
                        {
                            model: Currency,
                            attributes: ["Currency_symbol", "Currency"],
                        }
                    ]
                },
                {
                    model: BookTicket,
                    attributes: ["id"],
                    include: [
                        {
                            model: EventTicketType,
                            attributes: ["id", "title", "price"]
                        }
                    ]
                },
                {
                    model: AddonBook,
                    attributes: ["id"],
                    include: [
                        {
                            model: Addons,
                            attributes: ["id", "name", "price"]
                        }
                    ]
                },
                {
                    model: BookAccommodationInfo,
                    attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
                    include: [
                        {
                            model: HousingInfo,
                            attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms"],
                            include: [
                                {
                                    model: EventHousing,
                                    attributes: ["id", "EventID", "NightlyPrice", "AvailabilityStartDate", "AvailabilityEndDate", "isDateExtensionRequestedSent"],
                                    order: [["id", "DESC"]],
                                },
                                {
                                    model: HousingNeighborhood,
                                    attributes: ["name"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: AccommodationExtension,
                    attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
                    include: [
                        {
                            model: HousingInfo,
                            attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms"],
                            include: [
                                {
                                    model: EventHousing,
                                    attributes: ["id", "EventID", "NightlyPrice", "AvailabilityStartDate", "AvailabilityEndDate"],
                                    order: [["id", "DESC"]],
                                },
                                {
                                    model: HousingNeighborhood,
                                    attributes: ["name"]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [["id", "DESC"]],
        });

        return res.json({
            statusCode: 200,
            success: true,
            message: "Orders fetched successfully",
            data: orders,
        });

    } catch (error) {
        console.error("Error in getTotalOrders:", error);
        return res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error in getting total orders: " + error.message,
        });
    }
}
