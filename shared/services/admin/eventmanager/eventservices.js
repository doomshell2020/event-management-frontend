
import {
  Event,
  InvitationEvent,
  MyTicketBook,
  MyOrders,
  AddonBook,
  BookTicket,
  Orders,
  Order,
  User,
  EventStaffMember,
  EventTicketType,
  Addons,
  Currency,
  TicketDetail,
  Housing,
  HousingNeighborhood,
  AccommodationBookingInfo,
  AccommodationBooking,
  BookAccommodationInfo,
  AccommodationExtension,
  EventHousing,
  HousingInfo,
  EventOrganiser
} from "@/database/models";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";


// Events View
const Sequelize = require("sequelize");
const { Op, fn, col } = Sequelize;

// Events View
export async function View_Events(req) {
  const viewCms = await Event.findAll({
    order: [["id", "DESC"]],
  });

  return {
    statusCode: 200,
    success: true,
    message: "View Events Successfully!",
    viewCms,
  };
}

export async function getEventListByOrganizer(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: [],
      });
    }

    const events = await Event.findAll({
      where: { organiser_id: userId },
      include: [
        {
          model: EventTicketType,
          // required: true,
        }, {
          model: Addons,
          // required: true,
        },
        {
          model: Currency,
          // required: true,
        }
      ],
      order: [["id", "DESC"]],
    });

    if (!events || events.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events found for this organizer",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events by organizer:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching events",
      error: error.message,
      data: [],
    });
  }
}

export async function ticket_sales_count(event_id) {
  try {
    // Ticket-wise count using relation to EventTicketType
    const ticketCounts = await MyTicketBook.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("MyTicketBook.id")), "count"]
      ],
      where: { event_id, ticket_status: null },
      include: [
        {
          model: EventTicketType,
          attributes: ["id", "title"],
          as: "EventTicketType", // make sure your association uses this alias
        }
      ],
      group: ["EventTicketType.id", "EventTicketType.title"],
      raw: true,
      nest: true,
    });

    // Addon-wise count using relation to Addons
    const addonCounts = await AddonBook.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("AddonBook.id")), "count"]
      ],
      where: { event_id, ticket_status: null },
      include: [
        {
          model: Addons,
          as: "Addon", // match your association alias
          attributes: ["id", "name"]
        }
      ],
      group: ["Addon.id", "Addon.name"],
      raw: true,
      nest: true,
    });

    // Calculate total tickets sold
    const totalTicketSale = ticketCounts.reduce(
      (acc, item) => acc + parseInt(item.count || 0),
      0
    );

    // Calculate total addons sold
    const totalAddonSale = addonCounts.reduce(
      (acc, item) => acc + parseInt(item.count || 0),
      0
    );

    return {
      ticket_sales: ticketCounts || [],
      addon_sales: addonCounts || [],
      total_ticket_sale: totalTicketSale,
      total_addon_sale: totalAddonSale,
    };
  } catch (error) {
    console.error("Error fetching ticket sales count:", error);
    throw new Error("Unable to fetch ticket sales count");
  }
}

export async function getAllEventSales() {
  try {
    // Fetch all events first
    const events = await Event.findAll({
      attributes: ["id", "name"],
      order: [["id", "DESC"]],
      raw: true,
    });

    const results = [];

    for (const event of events) {
      const event_id = event.id;

      // Ticket-wise count
      const ticketCounts = await MyTicketBook.findAll({
        attributes: [
          [Sequelize.col("EventTicketType.id"), "ticket_type_id"],
          [Sequelize.col("EventTicketType.title"), "ticket_name"],
          [Sequelize.fn("COUNT", Sequelize.col("MyTicketBook.id")), "count"],
        ],
        where: { event_id, ticket_status: null },
        include: [
          {
            model: EventTicketType,
            as: "EventTicketType",
            attributes: [],
          },
        ],
        group: ["EventTicketType.id", "EventTicketType.title"],
        raw: true,
      });

      // Addon-wise count
      const addonCounts = await AddonBook.findAll({
        attributes: [
          [Sequelize.col("Addon.id"), "addon_id"],
          [Sequelize.col("Addon.name"), "addon_name"],
          [Sequelize.fn("COUNT", Sequelize.col("AddonBook.id")), "count"],
        ],
        where: { event_id, ticket_status: null },
        include: [
          {
            model: Addons,
            as: "Addon",
            attributes: [],
          },
        ],
        group: ["Addon.id", "Addon.name"],
        raw: true,
      });

      // Totals
      const totalTicketSale = ticketCounts.reduce(
        (acc, t) => acc + parseInt(t.count || 0),
        0
      );
      const totalAddonSale = addonCounts.reduce(
        (acc, a) => acc + parseInt(a.count || 0),
        0
      );

      results.push({
        event_id,
        eventName: event.name,
        ticketType: ticketCounts,
        addonType: addonCounts,
        totalTicketSale,
        totalAddonSale,
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching all event sales:", error);
    throw new Error("Unable to fetch all event sales data");
  }
}

export async function getAllEventSalesCount() {
  try {
    // Fetch all events first
    const events = await Event.findAll({
      attributes: ["id", "name"],
      order: [["id", "DESC"]],
      raw: true,
    });

    const results = [];

    for (const event of events) {
      const event_id = event.id;

      // Ticket-wise count
      const ticketCounts = await MyTicketBook.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("MyTicketBook.id")), "count"],
        ],
        where: { event_id, ticket_status: null },
        raw: true,
      });

      // Addon-wise count
      const addonCounts = await AddonBook.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("AddonBook.id")), "count"],
        ],
        where: { event_id, ticket_status: null },
        raw: true,
      });

      // Totals
      const totalTicketSale = ticketCounts.reduce(
        (acc, t) => acc + parseInt(t.count || 0),
        0
      );
      const totalAddonSale = addonCounts.reduce(
        (acc, a) => acc + parseInt(a.count || 0),
        0
      );

      results.push({
        event_id,
        eventName: event.name,
        totalTicketSale,
        totalAddonSale,
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching all event sales:", error);
    throw new Error("Unable to fetch all event sales data");
  }
}

// Currency View
export async function getAllCurrency(req, res) {
  try {
    const currencies = await Currency.findAll({
      attributes: ["id", "Currency_symbol", "Currency", "conversion_rate"],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Currencies retrieved successfully!",
      data: currencies,
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while retrieving currencies. Please try again later.",
      error: error.message,
    });
  }
}

// Summary All Events
export async function getEventSaleSummary(req, res) {
  try {
    const { event_id } = req.query;

    // Prepare the base query for fetching events
    const eventWhereCondition = {
      IsDataAvailable: "Y",
    };

    // If eventId is provided, add it to the where condition
    if (event_id) {
      eventWhereCondition.id = event_id;
    }

    // Fetch events based on the condition
    const viewCms = await Event.findAll({
      where: eventWhereCondition,
      attributes: ["id", "Name", "StartDate", "EndDate", "payment_currency"],
      include: [
        {
          model: Currency,
          attributes: ["Currency_symbol", "Currency", "conversion_rate"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const eventsWithCounts = [];
    for (const event of viewCms) {
      const eventId = event.id;

      // ##############################Total Orders Start##############################

      const totalTicketSold = await MyTicketBook.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      const totalScannedTicketCount = await MyTicketBook.count({
        where: {
          event_id: eventId,
          // ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: TicketDetail,
            attributes: ["status", "ticket_num"],
            where: { status: "1" }, // Filter TicketDetail by status = 1
            required: true,
          },
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } },
                { couponCode: { [Op.not]: null } },
              ],
              // ticket_status: null,
            },
            attributes: [],
            required: true,
          },
        ],
      });

      const totalFreeStaffTicket = await EventStaffMember.count({
        where: {
          EventID: eventId,
          WaiverFlag: 1,
        },
      });

      const totalStaffTicketScanned = await EventStaffMember.count({
        where: {
          EventID: eventId,
          WaiverFlag: 1,
        },
        attributes: ["id"],
        include: [
          {
            model: TicketDetail,
            where: {
              status: "1",
            },
            required: true,
            attributes: ["status"],
          },
        ],
      });

      const totalAddonSold = await AddonBook.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });
      // total scanned addons
      const totalScannedAddonsCount = await AddonBook.count({
        where: {
          event_id: eventId,
          // ticket_status: { [Op.is]: null },
          scannedstatus: { [Op.eq]: "1" }, // Updated condition
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      const totalAddonTransfer = await AddonBook.count({
        where: {
          event_id: eventId,
          transfer_user_id: { [Op.not]: null },
          // ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Matches `is_free IS NULL`
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      const totalTicketTransfer = await BookTicket.count({
        where: {
          event_id: eventId,
          transfer_user_id: { [Op.not]: null },
          // ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      // const totalAttendees = await InvitationEvent.count({
      //   where: {
      //     EventID: eventId,
      //     Status: 2, // Completed member
      //   },
      // });
      // const summarizeTicketsAddons = await summarizeTicketAddonValues(event);
      // const totalAmountAndDiscounts = await getTotalAmountAndDiscounts(event);
      // total cancel ticket count
      const totalCancelTickets = await BookTicket.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.not]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });
      // total cancel ticket count
      const totalCancelAddons = await AddonBook.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.not]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });
      // total Accommodation Sold count
      const totalAccommodationsSold = await AccommodationBooking.count({
        where: {
          event_id: eventId,
          is_accommodation_cancel: "N",
        },
        include: [
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });
      // total cancel Accommodation count
      const totalCancelAccommodations = await AccommodationBooking.count({
        where: {
          event_id: eventId,
          is_accommodation_cancel: "Y",
        },
        include: [
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });

      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',event_id);
      let totalAmountAndDiscounts;
      let accommodationInfo;
      let cancelAmount;
      if (eventId == 111) {
        totalAmountAndDiscounts = await getTotalAmountAndDiscountsFor2025(eventId);
        accommodationInfo = await getAccommodationSales(111);
        cancelAmount = await getTotalCancelAmount(111)
      } else {
        totalAmountAndDiscounts = await getTotalAmountAndDiscounts(event);
        console.log('============================', totalAmountAndDiscounts.length);
        cancelAmount = await getTotalCancelAmount(eventId)
      }

      eventsWithCounts.push({
        ...event.toJSON(),
        totalOrdersCount: totalAmountAndDiscounts?.totalOrders || 0,
        totalTicketSold,
        totalScannedTicketCount,
        totalAddonSold,
        totalScannedAddonsCount,
        // totalAmounts,
        totalAmountAndDiscounts,
        totalAddonTransfer,
        totalTicketTransfer,
        // totalAttendees,
        totalFreeStaffTicket,
        totalStaffTicketScanned,
        accommodationInfo,
        totalCancelTickets,
        totalCancelAddons,
        totalCancelAccommodations,
        totalAccommodationsSold,
        cancelAmount
      });
    }

    return res.status(200).json({
      success: true,
      message: "View event wise sales successfully",
      data: eventsWithCounts,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}

// Summary Single event
export async function getEventSaleSummaryByEventId(req, res) {
  try {
    const { event_id } = req.query;

    // Prepare the base query for fetching events
    const eventWhereCondition = {
      IsDataAvailable: "Y",
    };

    // If eventId is provided, add it to the where condition
    if (event_id) {
      eventWhereCondition.id = event_id;
    }

    // Fetch events based on the condition
    const viewCms = await Event.findAll({
      where: eventWhereCondition,
      attributes: ["id", "Name", "StartDate", "EndDate", "payment_currency"],
      include: [
        {
          model: Currency,
          attributes: ["Currency_symbol", "Currency", "conversion_rate"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const eventsWithCounts = [];
    for (const event of viewCms) {
      const eventId = event.id;

      // ##############################Total Orders Start##############################
      const totalTicketFind = await MyTicketBook.findAll({
        where: {
          event_id: eventId,
          // ticket_status: { [Op.is]: null },
        },
        attributes: ["order_id"], // No attributes selected from MyTicketBook
        include: [
          {
            model: User,
            attributes: [], // No need to select attributes from User
            required: true,
          },
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
            attributes: [], // Select only 'id' from MyOrders
          },
        ],
        // group: ["MyOrders.id"], // Group results by MyOrders.id
      });

      // Extract unique order IDs from ticket bookings
      const orderTicketIds = [
        ...new Set(totalTicketFind.map((ticket) => ticket.order_id)),
      ];

      // Fetch unique order IDs from AddonBook
      const orderAddonIds = await AddonBook.findAll({
        where: {
          event_id: eventId,
          // ticket_status: { [Op.is]: null },
        },
        attributes: ["order_id"], // Only fetch 'order_id'
        include: [
          {
            model: User,
            attributes: [], // Exclude User attributes
            required: true,
          },
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            attributes: [], // Exclude Order attributes
            required: true,
          },
        ],
      });

      // Extract and deduplicate order IDs from AddonBook
      const uniqueOrderAddonIds = [
        ...new Set(orderAddonIds.map((addon) => addon.order_id)),
      ];

      const totalUniqueOrdersIds = [
        ...new Set([...orderTicketIds, ...uniqueOrderAddonIds]),
      ];

      const orderAccommodationIds = await MyOrders.findAll({
        where: {
          event_id: eventId,
          Approved: "succeeded",
          id: {
            [Op.notIn]: totalUniqueOrdersIds
          }
        },
        attributes: ["id"]
      });

      const uniqueOrderAccommodationIds = [
        ...new Set(orderAccommodationIds.map((accommodation) => accommodation.id)),
      ];

      const finalTotalUniqueOrdersIds = [
        ...new Set([...orderTicketIds, ...uniqueOrderAddonIds, ...uniqueOrderAccommodationIds]),
      ].length;

      // If needed, merge the two sets of unique order IDs
      // const totalOrdersCount = [
      //   ...new Set([...orderTicketIds, ...uniqueOrderAddonIds]),
      // ].length;
      const totalOrdersCount = finalTotalUniqueOrdersIds;


      // ##############################Total Orders End##############################

      // total sold ticket
      const totalTicketSold = await MyTicketBook.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      // total scanned ticket
      const totalScannedTicketCount = await MyTicketBook.count({
        where: {
          event_id: eventId,
          // ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: TicketDetail,
            attributes: ["status", "ticket_num"],
            where: { status: 1 }, // Filter TicketDetail by status = 1
            required: true,
          },
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } },
                { couponCode: { [Op.not]: null } },
              ],
              // ticket_status: null,
            },
            attributes: [],
            required: true,
          },
        ],
      });

      const totalFreeStaffTicket = await EventStaffMember.count({
        where: {
          EventID: eventId,
          WaiverFlag: 1,
        },
      });

      const totalStaffTicketScanned = await EventStaffMember.count({
        where: {
          EventID: eventId,
          WaiverFlag: 1,
        },
        attributes: ["id"],
        include: [
          {
            model: TicketDetail,
            where: {
              status: 1,
            },
            required: true,
            attributes: ["status"],
          },
        ],
      });
      // return totalStaffTicketScanned;
      // total addons
      const totalAddonSold = await AddonBook.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      // total scanned addons
      const totalScannedAddonsCount = await AddonBook.count({
        where: {
          event_id: eventId,
          // ticket_status: { [Op.is]: null },
          scannedstatus: { [Op.eq]: 1 }, // Updated condition
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
            required: true,
          },
        ],
      });

      const totalAddonTransfer = await AddonBook.count({
        where: {
          event_id: eventId,
          transfer_user_id: { [Op.not]: null },
          // ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Matches `is_free IS NULL`
              ],
              // ticket_status: null,
            },
          },
        ],
      });

      const totalTicketTransfer = await BookTicket.count({
        where: {
          event_id: eventId,
          transfer_user_id: { [Op.not]: null },
          // ticket_status: { [Op.is]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });

      // total cancel ticket count
      const totalCancelTickets = await BookTicket.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.not]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });
      // total cancel ticket count
      const totalCancelAddons = await AddonBook.count({
        where: {
          event_id: eventId,
          ticket_status: { [Op.not]: null },
        },
        include: [
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });
      // total Accommodation Sold count
      const totalAccommodationsSold = await AccommodationBooking.count({
        where: {
          event_id: eventId,
          is_accommodation_cancel: "N",
        },
        include: [
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });
      // total cancel Accommodation count
      const totalCancelAccommodations = await AccommodationBooking.count({
        where: {
          event_id: eventId,
          is_accommodation_cancel: "Y",
        },
        include: [
          {
            model: MyOrders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
                { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
              ],
              // ticket_status: null,
            },
          },
        ],
      });

      // const totalAttendees = await InvitationEvent.count({
      //   where: {
      //     EventID: eventId,
      //     Status: 2, // Completed member
      //   },
      // });

      // const summarizeTicketsAddons = await summarizeTicketAddonValues(event);
      // return summarizeTicketsAddons;
      let totalAmountAndDiscounts;
      let accommodationInfo;
      let cancelAmount;
      if (eventId == 111) {
        totalAmountAndDiscounts = await getTotalAmountAndDiscountsFor2025(111);
        accommodationInfo = await getAccommodationSales(111);
        cancelAmount = await getTotalCancelAmount(111)
      } else {
        totalAmountAndDiscounts = await getTotalAmountAndDiscounts(event);
        cancelAmount = await getTotalCancelAmount(eventId)
      }

      // return totalAmountAndDiscounts;
      eventsWithCounts.push({
        ...event.toJSON(),
        totalOrdersCount,
        totalTicketSold,
        totalAddonSold,
        totalScannedAddonsCount,
        totalScannedTicketCount,
        // totalAmounts,
        totalAmountAndDiscounts,
        totalAddonTransfer,
        totalTicketTransfer,
        // totalAttendees,
        totalFreeStaffTicket,
        totalStaffTicketScanned,
        accommodationInfo,
        // new keys update
        totalCancelTickets,
        totalCancelAddons,
        totalCancelAccommodations,
        totalAccommodationsSold,
        cancelAmount
      });
    }

    return res.status(200).json({
      success: true,
      message: "View event wise sales successfully",
      data: eventsWithCounts,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}

// fetch cancel amount 
export async function getTotalCancelAmount(eventID) {
  try {
    const totalOrders = await MyOrders.findAll({
      where: { event_id: eventID },
      attributes: [
        "id",
        "RRN",
        "total_amount",
        "total_tax_amount",
        "discountAmount",
        "discountType",
        "couponCode",
        "is_free",
        "adminfee",
        "createdAt",
        "totalAddonAmount",
        "totalAddonTax",
        "totalTicketAmount",
        "totalTicketTax",
        "totalAccommodationAmount",
        "totalAccommodationTax",
      ],
      include: [
        {
          model: BookTicket,
          where: { event_id: eventID, ticket_status: { [Op.not]: null } },
          required: false,
        },
        {
          model: AddonBook,
          where: { event_id: eventID, ticket_status: { [Op.not]: null } },
          required: false,
        },
        {
          model: BookAccommodationInfo,
          where: { event_id: eventID, is_accommodation_cancel: "Y" },
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    let canceledTotal = 0;
    let accommodationTotal = 0;

    totalOrders.forEach((order) => {
      if (eventID == 111) {
        // ✅ Rule for event 111 (tickets + addons with 10.75%, accommodation no tax)

        const ticketTotal =
          order.TicketBooks?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

        const addonTotal =
          order.AddonBooks?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0;

        const orderCancelBase = ticketTotal + addonTotal;

        canceledTotal += orderCancelBase * 1.1075; // add 10.75%

        if (order.BookAccommodationInfo) {
          accommodationTotal += Number(order.BookAccommodationInfo.total_amount || 0);
        }
      } else {
        // ✅ Rule for other events (only addons with 12%)
        const addonTotal =
          order.AddonBooks?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0;

        if (addonTotal > 0) {
          canceledTotal += addonTotal * 1.12; // 12% flat tax
        }
      }
    });

    // ✅ Final return
    return eventID == 111
      ? canceledTotal + accommodationTotal
      : canceledTotal;
  } catch (err) {
    console.error("Error in getTotalCancelAmount:", err);
    throw err;
  }
}


async function getAccommodationSales(eventId) {
  let grandTotalAccommodationAmount = 0;
  let grandTotalAccommodationTax = 0;
  let grandTotalPaidAmount = 0;
  let grandTotalDueAmount = 0;

  const getAccommodationOrders = await MyOrders.findAll({
    where: {
      event_id: eventId,
      book_accommodation_id: { [Op.ne]: null },
      order_context: { [Op.in]: ["regular", "extension"] }
    },
    attributes: [
      "id",
      "createdAt",
      "book_accommodation_id",
      "order_context",
      "totalAccommodationAmount",
      "totalAccommodationTax",
      "total_due_amount"
    ],
  });

  getAccommodationOrders.forEach((order) => {
    const accommodationAmount = Math.round(order.totalAccommodationAmount) || 0;
    const accommodationTax = Math.round(order.totalAccommodationTax) || 0;
    const dueAmount = Math.round(order.total_due_amount) || 0;
    const paidAmount = Math.round(accommodationAmount - dueAmount);

    grandTotalAccommodationAmount += accommodationAmount;
    grandTotalAccommodationTax += accommodationTax;
    grandTotalPaidAmount += paidAmount;
    grandTotalDueAmount += dueAmount;
  });

  const totalAccommodation = getAccommodationOrders.length;

  return {
    grandTotalAccommodationAmount,
    grandTotalAccommodationTax,
    grandTotalPaidAmount,
    grandTotalDueAmount,
    totalAccommodation
  }
}


export async function getTotalAmountAndDiscountsFor2025(eventID) {

  // ##############################Total Orders Start##############################
  const totalTicketFind = await MyTicketBook.findAll({
    where: {
      event_id: eventID,
      // ticket_status: { [Op.is]: null },
    },
    attributes: ["order_id"],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
      {
        model: MyOrders,
        where: {
          [Op.or]: [
            { is_free: { [Op.is]: null } },
            { couponCode: { [Op.not]: null } },
          ],
          // ticket_status: null,
        },
        required: true,
        attributes: [],
      },
    ],
  });

  // Extract unique order IDs from ticket bookings
  const orderTicketIds = [
    ...new Set(totalTicketFind.map((ticket) => ticket.order_id)),
  ];

  // Fetch unique order IDs from AddonBook
  const orderAddonIds = await AddonBook.findAll({
    where: {
      event_id: eventID,
      // ticket_status: { [Op.is]: null },
    },
    attributes: ["order_id"],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
      {
        model: Orders,
        where: {
          [Op.or]: [
            { is_free: { [Op.is]: null } },
            { couponCode: { [Op.not]: null } },
          ],
          // ticket_status: null,
        },
        attributes: [],
        required: true,
      },
    ],
  });


  // Extract and deduplicate order IDs from AddonBook
  const uniqueOrderAddonIds = [
    ...new Set(orderAddonIds.map((addon) => addon.order_id)),
  ];

  // If needed, merge the two sets of unique order IDs
  const totalUniqueOrdersIds = [
    ...new Set([...orderTicketIds, ...uniqueOrderAddonIds]),
  ];

  const orderAccommodationIds = await MyOrders.findAll({
    where: {
      event_id: eventID,
      Approved: "succeeded",
      id: {
        [Op.notIn]: totalUniqueOrdersIds
      }
    },
    attributes: ["id"]
  });

  const uniqueOrderAccommodationIds = [
    ...new Set(orderAccommodationIds.map((accommodation) => accommodation.id)),
  ];

  const finalTotalUniqueOrdersIds = [
    ...new Set([...orderTicketIds, ...uniqueOrderAddonIds, ...uniqueOrderAccommodationIds]),
  ];

  // return uniqueOrderAccommodationIds;
  // ##############################Total Orders End##############################

  const totalOrders = await MyOrders.findAll({
    where: {
      id: { [Op.in]: finalTotalUniqueOrdersIds },
      // [Op.or]: [
      //   { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
      //   { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
      // ],
      // ticket_status: null,
    },
    attributes: [
      "id",
      "actualamount",
      "couponCode",
      "discountValue",
      "discountType",
      "discountAmount",
      "total_amount",
      "total_tax_amount",
      "RRN",
      "paymenttype",
      "createdAt",
      "OriginalTrxnIdentifier",
      "is_free",
      "adminfee",
      "ticket_cancel_id",
    ], // Select only 'id' from MyOrders
    include: [
      {
        model: User,
        attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
        required: true,
      },
      {
        model: BookTicket,
        where: {
          // ticket_status: null,
          event_id: eventID,
        },
        attributes: ["id", "event_ticket_id"], // No need to select attributes from BookTicket
        required: false,
      },
      {
        model: AddonBook,
        where: {
          // ticket_status: null,
          event_id: eventID,
        },
        attributes: ["id"], // No need to select attributes from AddonBook
        required: false,
      },
    ],
    // oder by id desc
    order: [["id", "DESC"]],
    // group: ["MyOrders.id"], // Group by orders.id
  });

  // return totalOrders.length

  let amountInfo = {
    total_amount: 0,
    total_taxes: 0,
    gross_total: 0,
  };

  totalOrders.forEach((order) => {
    const totalAmount = Number(order.total_amount) || 0;
    const totalTax = Number(order.total_tax_amount) || 0;
    amountInfo.total_amount += totalAmount - totalTax;
    amountInfo.total_taxes += totalTax;
    amountInfo.gross_total += totalAmount;
  });

  // Final `amountInfo` will have the totals calculated

  // Round the final results to remove floating point values
  return {
    total_amount: amountInfo.total_amount,
    totalTax: amountInfo.total_taxes,
    gross_total: amountInfo.gross_total,
    // finalTotalUniqueOrdersIds,
    totalOrders: totalOrders.length
    // totalOrders
  };
}

export async function getTotalAmountAndDiscounts(eventInfo) {
  const eventID = eventInfo.id;

  // ##############################Total Orders Start##############################
  const totalTicketFind = await MyTicketBook.findAll({
    where: {
      event_id: eventID,
      // ticket_status: { [Op.is]: null },
    },
    attributes: ["order_id"],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
      {
        model: MyOrders,
        where: {
          [Op.or]: [
            { is_free: { [Op.is]: null } },
            { couponCode: { [Op.not]: null } },
          ],
          // ticket_status: null,
        },
        required: true,
        attributes: [],
      },
    ],
  });

  // Extract unique order IDs from ticket bookings
  const orderTicketIds = [
    ...new Set(totalTicketFind.map((ticket) => ticket.order_id)),
  ];

  // Fetch unique order IDs from AddonBook
  const orderAddonIds = await AddonBook.findAll({
    where: {
      event_id: eventID,
      // ticket_status: { [Op.is]: null },
    },
    attributes: ["order_id"],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
      {
        model: Orders,
        where: {
          [Op.or]: [
            { is_free: { [Op.is]: null } },
            { couponCode: { [Op.not]: null } },
          ],
          // ticket_status: null,
        },
        attributes: [],
        required: true,
      },
    ],
  });

  // Extract and deduplicate order IDs from AddonBook
  const uniqueOrderAddonIds = [
    ...new Set(orderAddonIds.map((addon) => addon.order_id)),
  ];

  // If needed, merge the two sets of unique order IDs
  const totalUniqueOrdersIds = [
    ...new Set([...orderTicketIds, ...uniqueOrderAddonIds]),
  ];

  // return totalUniqueOrdersIds;
  // ##############################Total Orders End##############################

  const totalOrders = await MyOrders.findAll({
    where: {
      id: { [Op.in]: totalUniqueOrdersIds },
      // [Op.or]: [
      //   { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
      //   { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
      // ],
      // ticket_status: null,
    },
    attributes: [
      "id",
      "actualamount",
      "couponCode",
      "discountValue",
      "discountType",
      "discountAmount",
      "total_amount",
      "RRN",
      "paymenttype",
      "createdAt",
      "OriginalTrxnIdentifier",
      "is_free",
      "adminfee",
      "ticket_cancel_id",
    ], // Select only 'id' from MyOrders
    include: [
      {
        model: User,
        attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
        required: true,
      },
      {
        model: BookTicket,
        where: {
          // ticket_status: null,
          event_id: eventID,
        },
        attributes: ["id", "event_ticket_id"], // No need to select attributes from BookTicket
        required: false,
      },
      {
        model: AddonBook,
        where: {
          // ticket_status: null,
          event_id: eventID,
        },
        attributes: ["id"], // No need to select attributes from AddonBook
        required: false,
      },
    ],
    // oder by id desc
    order: [["id", "DESC"]],
    // group: ["MyOrders.id"], // Group by orders.id
  });

  // return totalOrders.length

  let amountInfo = {
    total_amount: 0,
    total_taxes: 0,
    gross_total: 0,
  };

  totalOrders.forEach((order) => {
    let amountAfterDiscount = order.actualamount;

    if (order.couponCode) {
      amountAfterDiscount -= order.discountAmount; // Apply the discount if a coupon code exists
    }
    const taxAmount = Math.round((amountAfterDiscount * order.adminfee) / 100);

    // console.log(`>>>>>>>>${order.total_amount}>>>>>>>>>>>>>>${amountAfterDiscount} ======= ${taxAmount}`);

    // Calculate tax amount
    // Accumulate the values into amountInfo
    amountInfo.total_amount += amountAfterDiscount;
    amountInfo.total_taxes += taxAmount;
    amountInfo.gross_total += order.total_amount;
  });

  // Final `amountInfo` will have the totals calculated

  // Round the final results to remove floating point values
  return {
    total_amount: amountInfo.total_amount,
    totalTax: amountInfo.total_taxes,
    gross_total: amountInfo.gross_total,
    // totalUniqueOrdersIds,
    totalOrders: totalOrders.length
    // totalOrders
  };
}

export async function summarizeTicketAddonValues(eventInfo) {
  const eventId = eventInfo.id;
  const currencySymbol = eventInfo.Currency.Currency_symbol;

  let totalDiscountedIds = [];

  // Fetch discounted orders
  const findDiscountedOrders = await MyTicketBook.findAll({
    where: {
      // ticket_status: null,
      event_id: eventId,
    },
    attributes: ["id", "amount", "event_ticket_id"],
    include: [
      {
        model: EventTicketType,
        attributes: ["id", "title", "price"],
      },
      {
        model: MyOrders,
        where: {
          couponCode: { [Op.not]: null },
          // ticket_status: null,
        },
        attributes: [
          "id",
          "OriginalTrxnIdentifier",
          "discountType",
          "discountAmount",
          "total_amount",
          "discountValue",
          "actualamount",
          "couponCode",
          "adminfee",
        ],
        required: true,
      },
    ],
  });

  // Process discounted orders
  const discountedResult = Object.values(
    findDiscountedOrders.reduce((acc, order) => {
      const {
        MyOrder: { discountAmount, actualamount, adminfee, id: myOrderId },
        EventTicketType: { price: ticket_actual_price, title: ticket_name },
        event_ticket_id,
      } = order;

      totalDiscountedIds.push(myOrderId);

      const after_discount_ticket_price = ticket_actual_price - discountAmount;
      const key = `${discountAmount}_${event_ticket_id}`;

      // Compute ticket name with or without discount
      const formattedTicketName =
        discountAmount > 0
          ? `${ticket_name} ($${ticket_actual_price} with $${discountAmount} Discount)`
          : `${ticket_name} ($${ticket_actual_price})`;

      if (!acc[key]) {
        acc[key] = {
          ticket_type: "Ticket",
          ticket_name: formattedTicketName,
          event_ticket_id,
          discountAmount,
          ticket_actual_price,
          after_discount_ticket_price,
          total_sale: 0,
          totalTax: 0,
          total_amount: 0,
        };
      }

      acc[key].total_sale += 1;
      acc[key].total_amount =
        acc[key].total_sale * acc[key].after_discount_ticket_price;
      acc[key].total_discount =
        acc[key].total_sale * Math.round(acc[key].discountAmount); // Calculate total discount

      if (after_discount_ticket_price > 0) {
        acc[key].totalTax += Math.round(
          ((Math.round(actualamount) - Math.round(discountAmount)) * adminfee) /
          100
        );
      }

      return acc;
    }, {})
  );

  // Fetch tickets without discount
  const findAllTicketWithoutDiscount = await MyTicketBook.findAll({
    where: {
      // ticket_status: null,
      event_id: eventId,
    },
    attributes: ["id", "amount", "event_ticket_id"],
    include: [
      {
        model: EventTicketType,
        attributes: ["id", "title", "price"],
      },
      {
        model: MyOrders,
        where: {
          is_free: { [Op.is]: null },
          // ticket_status: null,
          id: {
            [Op.notIn]: [...totalDiscountedIds],
          },
        },
        attributes: [
          "id",
          "OriginalTrxnIdentifier",
          "discountType",
          "discountAmount",
          "total_amount",
          "discountValue",
          "actualamount",
          "couponCode",
          "adminfee",
        ],
        required: true,
      },
    ],
  });

  // Process tickets without discount
  const withoutDiscountResult = Object.values(
    findAllTicketWithoutDiscount.reduce((acc, order) => {
      const {
        MyOrder: { actualamount, adminfee, id: myOrderId },
        EventTicketType: { price: ticket_actual_price, title: ticket_name },
        event_ticket_id,
      } = order;

      const discountAmount = 0; // No discount
      const after_discount_ticket_price = ticket_actual_price;
      const key = `${discountAmount}_${event_ticket_id}`;

      // Compute ticket name with or without discount
      const formattedTicketName =
        discountAmount > 0
          ? `${ticket_name} ($${ticket_actual_price} with $${discountAmount} Discount)`
          : `${ticket_name} ($${ticket_actual_price})`;

      if (!acc[key]) {
        acc[key] = {
          ticket_type: "Ticket",
          ticket_name: formattedTicketName,
          event_ticket_id,
          discountAmount,
          ticket_actual_price,
          after_discount_ticket_price,
          total_sale: 0,
          totalTax: 0,
          total_amount: 0,
        };
      }

      acc[key].total_sale += 1;
      acc[key].total_amount =
        acc[key].total_sale * acc[key].after_discount_ticket_price;
      acc[key].totalTax += Math.round(
        (Math.round(actualamount) * adminfee) / 100
      );
      acc[key].total_discount =
        acc[key].total_sale * Math.round(acc[key].discountAmount); // Calculate total discount (will be 0 here)

      return acc;
    }, {})
  );

  const findAllAddons = await AddonBook.findAll({
    where: {
      event_id: eventId,
      // ticket_status: { [Op.is]: null },
    },
    attributes: ["id", "price", "addons_id"],
    include: [
      {
        model: Addons,
        attributes: ["id", "name", "price"],
      },
      {
        model: Orders,
        where: {
          [Op.or]: [
            { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
            { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
          ],
          // ticket_status: null,
        },
        attributes: [
          "id",
          "OriginalTrxnIdentifier",
          "discountType",
          "discountAmount",
          "total_amount",
          "discountValue",
          "actualamount",
          "couponCode",
          "adminfee",
        ],
        required: true,
      },
    ],
  });

  // Process tickets without discount
  const AddonsResult = Object.values(
    findAllAddons.reduce((acc, order) => {
      const {
        Order: { actualamount, adminfee, id: myOrderId },
        Addon: { price: ticket_actual_price, name: ticket_name },
        event_ticket_id,
      } = order;

      const discountAmount = 0; // No discount
      const after_discount_ticket_price = ticket_actual_price;
      const key = `${discountAmount}_${event_ticket_id}`;

      // Compute ticket name with or without discount
      const formattedTicketName =
        discountAmount > 0
          ? `${ticket_name} ($${ticket_actual_price} with $${discountAmount} Discount)`
          : `${ticket_name} ($${ticket_actual_price})`;

      if (!acc[key]) {
        acc[key] = {
          ticket_type: "Addon",
          ticket_name: formattedTicketName,
          event_ticket_id,
          discountAmount,
          ticket_actual_price,
          after_discount_ticket_price,
          total_sale: 0,
          totalTax: 0,
          total_amount: 0,
        };
      }

      acc[key].total_sale += 1;
      acc[key].total_amount =
        acc[key].total_sale * acc[key].after_discount_ticket_price;
      acc[key].totalTax += Math.round(
        (Math.round(actualamount) * adminfee) / 100
      );
      acc[key].total_discount =
        acc[key].total_sale * Math.round(acc[key].discountAmount); // Calculate total discount (will be 0 here)

      return acc;
    }, {})
  );

  // Merge results
  const finalResult = [
    ...discountedResult,
    ...withoutDiscountResult,
    ...AddonsResult,
  ];
  return finalResult;
}

// Events View
export async function getAllEventsWithData(req, res) {
  const viewCms = await Event.findAll({
    include: [
      {
        model: EventOrganiser,
        as: 'organiser',
        attributes: ['id', 'organisation_name', 'contact_person', 'contact_email'],
      }
    ],
    order: [["id", "DESC"]],
  });

  const eventsWithCounts = [];
  for (const event of viewCms) {
    const eventId = event.id;
    const totalTicketSold = await BookTicket.count({
      where: {
        event_id: eventId,
        ticket_status: { [Op.is]: null },
      },
      include: [
        {
          model: Orders,
          where: {
            [Op.or]: [
              { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
              { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
            ],
            ticket_status: null,
          },
        },
      ],
    });

    const totalAddonSold = await AddonBook.count({
      where: {
        event_id: eventId,
        ticket_status: { [Op.is]: null },
      },
      include: [
        {
          model: Orders,
          where: {
            [Op.or]: [
              { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
              { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
            ],
            ticket_status: null,
          },
          required: true,
        },
      ],
    });

    eventsWithCounts.push({
      ...event.toJSON(),
      totalTicketSold,
      totalAddonSold,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "View Events Successfully!",
    data: eventsWithCounts,
  };
}

// Events View
export async function eventTicketSoldDetails({ eventId }, res) {
  const totalTicketSold = await BookTicket.count({
    where: {
      event_id: eventId,
    },
  });

  const totalAddonSold = await AddonBook.count({
    where: {
      event_id: eventId,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "View Events Successfully!",
    totalTicketSold,
    totalAddonSold,
  };
}

// successfully working Rupam Singh 8-Oct 2024 Order api
export async function searchOrder(
  {
    email,
    startDate,
    endDate,
    eventName,
    name,
    lname,
    mobile,
    orderId,
    ticket_status,
    paymentOption
  },
  res
) {
  let orderConditions = {};

  const event = await Event.findOne({
    attributes: ["id"],
    where: {
      Name: {
        [Op.like]: `%${eventName}%`, // Use Sequelize's LIKE operator
      },
    },
  });

  let eventID
  if (event) {
    orderConditions.event_id = event.id;
    eventID = event.id;
  }

  // Date filters using SQL DATE function
  if (startDate || endDate) {
    orderConditions.createdAt = {};

    if (startDate) {
      const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0));
      orderConditions.createdAt[Op.gte] = startOfDay;
    }

    if (endDate) {
      const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59));
      orderConditions.createdAt[Op.lte] = endOfDay;
    }
  }

  // Order ID filter
  if (orderId) {
    orderConditions.OriginalTrxnIdentifier = {
      [Op.like]: `%${orderId.trim().toUpperCase()}%`,
    };
  }

  // Cancel Order filter
  if (ticket_status) {
    orderConditions.ticket_status = {
      [Op.like]: `%${ticket_status.trim().toUpperCase()}%`,
    };
  }

  // Email filter
  if (email) {
    orderConditions["$User.Email$"] = {
      [Op.like]: `%${email.trim().toUpperCase()}%`,
    };
  }

  // Mobile filter
  if (mobile) {
    orderConditions["$User.PhoneNumber$"] = mobile;
  }

  // Name filter
  if (name) {
    orderConditions["$User.FirstName$"] = {
      [Op.like]: `%${name.trim().toUpperCase()}%`,
    };
  }

  // Last name filter
  if (lname) {
    orderConditions["$User.LastName$"] = {
      [Op.like]: `%${lname.trim().toUpperCase()}%`,
    };
  }

  if (paymentOption) {
    orderConditions.paymentOption = paymentOption;
  }

  try {
    const orders = await Orders.findAll({
      attributes: [
        "id",
        "actualamount",
        "couponCode",
        "discountValue",
        "discountType",
        "discountAmount",
        "total_amount",
        "paymentOption",
        "total_tax_amount",
        "donationfee",
        "RRN",
        "paymenttype",
        "createdAt",
        "OriginalTrxnIdentifier",
        "is_free",
        "adminfee",
        "ticket_cancel_id",
        "ticket_status",
        "refund_reason",
        "event_id",
        "total_due_amount",
        "user_id",
        'totalCartAmount',
        'totalTicketAmount',
        'totalTicketTax',
        'totalAddonAmount',
        'totalAddonTax',
        'totalAccommodationAmount',
        'totalAccommodationTax',
        'accommodation_nightlyPerDaysRate',
        'accommodation_basePerDaysPriceHousing',
        'total_night_stay',
        'accommodationOndalindaPerDaysFeeAmount',
        'accommodationPerDaysPropertyOwnerAmount'
      ],
      where: {
        [Op.or]: [
          { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
          { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        ],
        ticket_status: { [Op.is]: null },
        ...orderConditions,
      },
      include: [
        {
          model: User,
          attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
        },
      ],
      order: [["id", "DESC"]],
    });

    let donation_total_amount = 0;
    const dataPromises = orders.map(async (order) => {
      let ticket, accommodationInfo = {}
      // console.log('>>>>>>>>>>>',order);

      if (order.donationfee) {
        donation_total_amount += Math.round(order.actualamount * order.donationfee / 100);
      }

      if (eventName) {

        if (!eventID) {
          return null;
        }

        // Assuming eventName is defined elsewhere
        ticket = await BookTicket.findOne({
          where: { order_id: order.id, event_id: eventID },
          include: [
            { model: Event, include: [Currency] },
            // { model: EventTicketType },
          ],
          order: [["id", "DESC"]],
          // raw: true,
        });

        if (!ticket) {
          ticket = await AddonBook.findOne({
            where: { order_id: order.id, event_id: eventID },
            include: [{ model: Addons }, { model: Event, include: [Currency] }],
            order: [["created", "DESC"]],
            // raw: true,
          });
        }

        accommodationInfo = await AccommodationBookingInfo.findOne({
          where: {
            order_id: order.id,
            event_id: eventID,
          },
          attributes: ['check_in_date', 'check_out_date', "id"],
          include: [
            {
              model: Housing,
              attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "ImageURL", "Pool", "NumKingBeds"],
              include: [{ model: HousingNeighborhood, attributes: ["name"] },
              {
                model: EventHousing,
                where: { EventID: eventID },
                attributes: ["id", 'OwnerAmount', 'TotalOndalindaFeeAmount', 'TotalStripeFeeAmount', 'ServiceFeeAmount', 'MexicanVATAmount', 'AccommodationTaxAmount', 'ticket_processing_fee_amount', 'NightlyPrice', 'ticket_bank_fee_amount', 'BaseNightlyPrice']
              }]
            },
            {
              model: Event,
              attributes: ["Name", "ImageURL"],
              include: [{
                model: Currency,
                attributes: ["Currency_symbol", "Currency"],
              }]
            }
          ],
          // raw: true,
        });

      } else {
        // If no event name is provided, search all tickets and addons for the order
        // Assuming eventName is defined elsewhere
        ticket = await BookTicket.findOne({
          where: { order_id: order.id },
          include: [
            { model: Event, include: [Currency] },
            // { model: EventTicketType },
          ],
          order: [["id", "DESC"]],
          // raw: true,
        });

        if (!ticket) {
          ticket = await AddonBook.findOne({
            where: { order_id: order.id },
            include: [{ model: Addons }, { model: Event, include: [Currency] }],
            order: [["created", "DESC"]],
            // raw: true,
          });
        }


        // console.log('>>>>>>>>>>>>>>>>');
        accommodationInfo = await AccommodationBookingInfo.findOne({
          where: { order_id: order.id },
          attributes: [],
          include: [
            {
              model: Housing,
              attributes: [
                "Name",
                "Neighborhood",
                "MaxOccupancy",
                "NumBedrooms",
                "ImageURL",
                "Pool",
                "NumKingBeds"
              ],
              include: [
                {
                  model: HousingNeighborhood,
                  attributes: ["name"]
                }
              ]
            },
            {
              model: Event,
              attributes: ["Name", "ImageURL"],
              include: [
                {
                  model: Currency,
                  attributes: ["Currency_symbol", "Currency"]
                }
              ]
            }
          ],
          // raw: true
        });

        if (accommodationInfo) {
          // ✅ Merge order + accommodationInfo into a single object
          ticket = {
            accommodationInfo: accommodationInfo?.dataValues || {}, // safely access values
          };

        }

      }

      // If no ticket or addon is found, return null
      if (!ticket) return null;

      // return order.dataValues.total_tax_amount;


      let eventNameSet = null;
      let currencySymbol = null;
      let currencyValue = null;

      if (ticket.accommodationInfo) {
        eventNameSet = ticket.accommodationInfo.Event.Name;
        currencySymbol = ticket.accommodationInfo.Event.Currency.Currency_symbol;
        currencyValue = ticket.accommodationInfo.Event.Currency.Currency;
      } else {
        eventNameSet = ticket.Event.Name;
        currencySymbol = ticket.Event.Currency.Currency_symbol;
        currencyValue = ticket.Event.Currency.Currency;
      }


      // Return the required event and order details
      return {
        eventName: eventNameSet,
        currencysign: currencySymbol,
        currencyvalue: currencyValue,
        orderid: order.dataValues.id,
        tickettotal: await BookTicket.count({
          where: { order_id: order.dataValues.id },
        }),
        ticketaddontotal: await AddonBook.count({
          where: { order_id: order.dataValues.id },
        }),
        orderrrn: order.dataValues.OriginalTrxnIdentifier,
        name: `${order.dataValues.User?.FirstName || "Unknown"} ${order.dataValues.User?.LastName || "User"}`,
        email: order.dataValues.User?.Email || "No email provided",
        mobile: order.dataValues.User?.PhoneNumber || "",
        couponcode: order.dataValues.couponCode || false,
        afterdiscount: order.dataValues.total_amount,
        actualamount: order.dataValues.actualamount || 0,
        donationfee: order.dataValues.donationfee,
        totalamount: order.dataValues.total_amount,
        stripekey: order.dataValues.RRN || "N/A",
        paymenttype: order.dataValues.paymenttype || "Unknown",
        orderDate: new Date(order.dataValues.createdAt).toISOString(),
        total_include_tax: order.dataValues.total_amount,
        tax_percentage: order.dataValues.adminfee ? order.dataValues.adminfee : 0,
        discountValue: order.dataValues.discountValue || 0,
        discountAmount: order.dataValues.discountAmount || 0,
        discountType: order.dataValues.discountType || "",
        ticket_cancel_id: order.dataValues?.ticket_cancel_id || null,
        is_free_ticket: order.dataValues?.is_free == 1 ? true : false,
        ticket_status: order.dataValues?.ticket_status || null,
        refund_reason: order.dataValues.refund_reason,
        accommodationInfo,
        userId: order.dataValues.user_id,
        total_due_amount: order.dataValues.total_due_amount ? order.dataValues.total_due_amount : 0,
        total_tax_amount: order.dataValues.total_tax_amount,
        paymentOption: order.dataValues.paymentOption ? order.dataValues.paymentOption : 'full',
        totalAccommodationAmount: order.totalAccommodationAmount ? order.totalAccommodationAmount : 0,
        totalAccommodationTax: order.totalAccommodationTax ? order.totalAccommodationTax : 0,
        accommodation_nightlyRate: order.accommodation_nightlyPerDaysRate ? order.accommodation_nightlyPerDaysRate : 0,
        accommodation_basePriceHousing: order.accommodation_basePerDaysPriceHousing ? order.accommodation_basePerDaysPriceHousing : 0,
        total_night_stay: order.total_night_stay ? order.total_night_stay : 0,
        accommodationPerDaysPropertyOwnerAmount: order.accommodationPerDaysPropertyOwnerAmount ? order.accommodationPerDaysPropertyOwnerAmount : 0,
        accommodationOndalindaPerDaysFeeAmount: order.accommodationOndalindaPerDaysFeeAmount ? order.accommodationOndalindaPerDaysFeeAmount : 0,
      };

    });

    const data = (await Promise.all(dataPromises)).filter(
      (orderData) => orderData !== null
    );


    let currencySign = data[0]?.currencysign || ""; // Default to empty string if undefined
    let donationresult = `${currencySign} ${donation_total_amount}`;
    // Return the result
    return res.json({
      statusCode: 200,
      success: true,
      message: "View Events Successfully!",
      data: data,
      donation_total_amount: donationresult,
      count: data.length,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
}

// successfully working Rupam Singh 8-Oct 2024 Event api
export async function eventOrder({ eventName }, res) {
  try {
    const event = await Event.findOne({
      attributes: ["id"],
      where: {
        Name: {
          [Op.like]: `%${eventName}%`, // Use Sequelize's LIKE operator
        },
      },
    });

    let eventID;
    const whereCondition = {
      [Op.or]: [
        { is_free: { [Op.is]: null } },
        { couponCode: { [Op.not]: null } }
      ],
      ticket_status: { [Op.is]: null },
    };

    // Only add event_id if it's defined and not null/empty
    if (event) {
      eventID = event.id;
      whereCondition.event_id = eventID;
    }

    const orders = await Orders.findAll({
      attributes: [
        "id",
        "event_id",
        "actualamount",
        "couponCode",
        "discountValue",
        "discountType",
        "discountAmount",
        "total_amount",
        "total_due_amount",
        "total_tax_amount",
        "RRN",
        "donationfee",
        "paymenttype",
        "createdAt",
        "OriginalTrxnIdentifier",
        "is_free",
        "adminfee",
        "ticket_cancel_id",
        "user_id",
        "refund_reason",
        "paymentOption",
        'totalCartAmount',
        'totalTicketAmount',
        'totalTicketTax',
        'totalAddonAmount',
        'totalAddonTax',
        'totalAccommodationAmount',
        'totalAccommodationTax',
        'accommodation_nightlyPerDaysRate',
        'accommodation_basePerDaysPriceHousing',
        'total_night_stay',
        'accommodationOndalindaPerDaysFeeAmount',
        'accommodationPerDaysPropertyOwnerAmount'
      ],
      where: whereCondition,
      include: [
        {
          model: User,
          attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
        }
      ],
      order: [["id", "DESC"]],
      raw: true,
    });

    // return res.json(orders);
    let data = [];
    let donation_total_amount = 0;
    for (let order of orders) {
      let tick1, ticket_addons, accommodationInfo = {};

      if (order.donationfee) {
        donation_total_amount += Math.round(order.actualamount * order.donationfee / 100);
      }

      if (eventName) {
        // Assuming eventName is defined elsewhere
        tick1 = await BookTicket.findOne({
          where: { order_id: order.id, event_id: eventID },
          include: [
            { model: Event, include: [Currency] },
            { model: EventTicketType },
          ],
          order: [["id", "DESC"]],
          raw: true,
        });

        ticket_addons = await AddonBook.findAll({
          where: { order_id: order.id, event_id: eventID },
          include: [{ model: Addons }, { model: Event, include: [Currency] }],
          // group: ['addons_id'],
          order: [["created", "DESC"]],
          raw: true,
        });

        accommodationInfo = await AccommodationBookingInfo.findOne({
          where: {
            order_id: order.id,
            event_id: eventID,
          },
          attributes: ['check_in_date', 'check_out_date', "id"],
          include: [
            {
              model: Housing,
              attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "ImageURL", "Pool", "NumKingBeds"],
              include: [{ model: HousingNeighborhood, attributes: ["name"] },
              {
                model: EventHousing,
                where: { EventID: eventID },
                attributes: ["id", 'OwnerAmount', 'TotalOndalindaFeeAmount', 'TotalStripeFeeAmount', 'ServiceFeeAmount', 'MexicanVATAmount', 'AccommodationTaxAmount', 'ticket_processing_fee_amount', 'NightlyPrice', 'ticket_bank_fee_amount', 'BaseNightlyPrice']
              }]
            },
            {
              model: Event,
              attributes: ["Name", "ImageURL"],
              include: [{
                model: Currency,
                attributes: ["Currency_symbol", "Currency"],
              }]
            }
          ],
          // raw: true,
        });

        // if (accommodationInfo) {
        //   return accommodationInfo;
        // }

      } else {
        tick1 = await BookTicket.findOne({
          where: { order_id: order.id },
          include: [
            { model: Event, include: [Currency] },
            { model: EventTicketType },
          ],
          // order: [['id', 'DESC']],
          raw: true,
        });

        ticket_addons = await AddonBook.findAll({
          where: { order_id: order.id },
          group: ["addons_id"],
          include: [{ model: Addons }, { model: Event, include: [Currency] }],
          order: [["created", "DESC"]],
          raw: true,
        });

        accommodationInfo = await AccommodationBookingInfo.findOne({
          where: {
            order_id: order.id
          },
          attributes: [],
          include: [
            {
              model: Housing,
              attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "ImageURL", "Pool", "NumKingBeds"],
              include: [{ model: HousingNeighborhood, attributes: ["name"] }]
            },
            {
              model: Event,
              attributes: ["Name", "ImageURL"],
              include: [{
                model: Currency,
                attributes: ["Currency_symbol", "Currency"],
              }]
            }
          ],
          // raw: true,
        });

      }

      if (tick1 || ticket_addons.length || accommodationInfo) {

        let eventName = null;
        let currencySymbol = null;
        let currencyValue = null;
        let ticketPrice = null;
        let addonPrice = null;


        if (tick1) {
          eventName = tick1["Event.Name"];
          currencySymbol = tick1["Event.Currency.Currency_symbol"];
          currencyValue = tick1["Event.Currency.Currency"];
          ticketPrice = tick1["EventTicketType.price"];
        } else if (ticket_addons.length) {
          eventName = ticket_addons[0]["Event.Name"];
          currencySymbol = ticket_addons[0]["Event.Currency.Currency_symbol"];
          currencyValue = ticket_addons[0]["Event.Currency.Currency"];
          // addonPrice = ticket_addons[0]["Addon.price"];
        } else if (accommodationInfo) {
          eventName = accommodationInfo["Event.Name"];
          currencySymbol = accommodationInfo["Event.Currency.Currency_symbol"];
          currencyValue = accommodationInfo["Event.Currency.Currency"];
        }
        // Always extract addonPrice if ticket_addons exist
        if (ticket_addons.length) {
          addonPrice = ticket_addons[0]["Addon.price"];
        }
        // console.log("<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", addonPrice);
        let order_data = {
          eventName: eventName,
          currencysign: currencySymbol,
          currencyvalue: currencyValue,
          orderid: order.id,
          tickettotal: await BookTicket.count({
            where: { order_id: order.id },
          }),
          ticketaddontotal: await AddonBook.count({
            where: { order_id: order.id },
          }),
          orderrrn: order.OriginalTrxnIdentifier,
          name: `${order["User.FirstName"]} ${order["User.LastName"]}`,
          email: order["User.Email"],
          mobile: order["User.PhoneNumber"],
          couponcode: order.couponCode || false,
          afterdiscount: order.total_amount,
          total_include_tax: order.total_amount,
          totalamount: order.actualamount,
          donationfee: order.donationfee,
          stripekey: order.RRN,
          userId: order.user_id,
          paymenttype: order.paymenttype,
          tax_percentage: order.adminfee ? order.adminfee : 0,
          actualamount: order.actualamount ? order.actualamount : 0,
          total_due_amount: order.total_due_amount ? order.total_due_amount : 0,
          total_tax_amount: order.total_tax_amount ? order.total_tax_amount : null,
          paymentOption: order.paymentOption ? order.paymentOption : 'full',
          orderDate: new Date(order.createdAt).toISOString(),
          discountValue: order.discountValue || 0,
          discountAmount: order.discountAmount || 0,
          discountType: order.discountType || "",
          is_free_ticket: order?.is_free == 1 ? true : false,
          ticket_cancel_id: order.ticket_cancel_id,
          refund_reason: order.refund_reason,
          totalCartAmount: order.totalCartAmount ? order.totalCartAmount : 0,
          totalTicketAmount: order.totalTicketAmount ? order.totalTicketAmount : 0,
          totalTicketTax: order.totalTicketTax ? order.totalTicketTax : 0,
          totalAddonAmount: order.totalAddonAmount ? order.totalAddonAmount : 0,
          totalAddonTax: order.totalAddonTax ? order.totalAddonTax : 0,
          totalAccommodationAmount: order.totalAccommodationAmount ? order.totalAccommodationAmount : 0,
          totalAccommodationTax: order.totalAccommodationTax ? order.totalAccommodationTax : 0,
          accommodation_nightlyRate: order.accommodation_nightlyPerDaysRate ? order.accommodation_nightlyPerDaysRate : 0,
          accommodation_basePriceHousing: order.accommodation_basePerDaysPriceHousing ? order.accommodation_basePerDaysPriceHousing : 0,
          total_night_stay: order.total_night_stay ? order.total_night_stay : 0,
          accommodationPerDaysPropertyOwnerAmount: order.accommodationPerDaysPropertyOwnerAmount ? order.accommodationPerDaysPropertyOwnerAmount : 0,
          accommodationOndalindaPerDaysFeeAmount: order.accommodationOndalindaPerDaysFeeAmount ? order.accommodationOndalindaPerDaysFeeAmount : 0,
          ticketPrice: ticketPrice,
          addonPrice: addonPrice,
          accommodationInfo
        };
        data.push(order_data);
      }
    }

    //   'totalAccommodationAmount',
    // 'totalAccommodationTax',
    // 'accommodation_nightlyRate',
    // 'accommodation_basePriceHousing',
    // 'total_night_stay'

    let currencySign = data[0]?.currencysign || ""; // Default to empty string if undefined
    let donationresult = donation_total_amount;
    // Modify the response format
    return res.json({
      statusCode: 200,
      success: true,
      message: "View Order Successfully from event service",
      data: data,
      donation_total_amount: donationresult,
      currency: currencySign,
      count: data.length,
    });
  } catch (error) {
    return res.json({
      statusCode: 200,
      success: false,
      message: error.message,
      data: [],
      count: 0,
    });
  }
}

// get total orders old without paginatation
export async function getTotalOrders({
  email,
  startDate,
  endDate,
  eventName,
  name,
  lname,
  mobile,
  orderId,
  type,
  transfer,
  paymentOption,
  couponCode
}, res) {
  try {

    // console.log("couponCode-------------------------",couponCode)
    const orderConditions = {
      [Op.or]: [
        { is_free: { [Op.is]: null } },
        { couponCode: { [Op.not]: null } },
      ],
      // ticket_status: { [Op.is]: null },  // comment kamal 15-09-2025
    };

    // Date filter
    if (startDate || endDate) {
      orderConditions.created = {};
      if (startDate) {
        orderConditions.created[Op.gte] = new Date(new Date(startDate).setHours(0, 0, 0));
      }
      if (endDate) {
        orderConditions.created[Op.lte] = new Date(new Date(endDate).setHours(23, 59, 59));
      }
    }

    // Order ID
    if (orderId?.trim()) {
      orderConditions.OriginalTrxnIdentifier = {
        [Op.like]: `%${orderId.trim().toUpperCase()}%`,
      };
    }

    // Free orders only
    if (type == "free") {
      orderConditions.is_free = 1;
    }

    // Payment Option
    // if (paymentOption && paymentOption.trim() !== "") {
    //   orderConditions.paymentOption = paymentOption.trim().toLowerCase();
    // }
    if (paymentOption && paymentOption.trim() !== "") {
      const normalized = paymentOption.trim().toLowerCase();
      if (normalized === "completed partial payment") {
        // ✅ only users who have payment intents (done partial payment)
        orderConditions.due_amount_intent = { [Op.ne]: null };
      } else {
        // ✅ normal flow for other paymentOption filters
        orderConditions.paymentOption = normalized;
      }
    }
    if (couponCode !== undefined && couponCode !== null && couponCode !== "") {
      if (couponCode == "Applied") {
        orderConditions.couponCode = { [Op.ne]: null };
      } else {
        orderConditions.couponCode = { [Op.eq]: null };
      }
    }
    // if (couponCode == "Applied") {
    //   orderConditions.couponCode = { [Op.ne]: null };
    // } else {
    //   orderConditions.couponCode = { [Op.eq]: null };
    // }

    // User filters
    if (email?.trim()) {
      orderConditions["$User.Email$"] = {
        [Op.like]: `%${email.trim().toUpperCase()}%`,
      };
    }

    if (mobile) {
      orderConditions["$User.PhoneNumber$"] = mobile;
    }

    if (name?.trim()) {
      orderConditions["$User.FirstName$"] = {
        [Op.like]: `%${name.trim().toUpperCase()}%`,
      };
    }

    if (lname?.trim()) {
      orderConditions["$User.LastName$"] = {
        [Op.like]: `%${lname.trim().toUpperCase()}%`,
      };
    }

    // console.log('orderConditions',orderConditions);    

    // Event name -> ID
    let eventId = null;
    if (eventName?.trim()) {
      const event = await Event.findOne({
        attributes: ["id"],
        where: {
          Name: {
            [Op.like]: `%${eventName.trim()}%`,
          },
        },
      });
      if (event) {
        eventId = event.id;
        orderConditions.event_id = event.id;
      }
    }

    const orders = await MyOrders.findAll({
      where: orderConditions,
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"]
        },
        {
          model: Event,
          attributes: ["Name"],
          include: [{
            model: Currency,
            attributes: ["Currency_symbol", "Currency"],
          }]
        },
        {
          model: BookTicket,
          attributes: ["id"]
        },
        {
          model: AddonBook,
          attributes: ["id"]
        },
        {
          model: BookAccommodationInfo,
          attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
          include: [
            {
              model: HousingInfo,
              attributes: [
                "Name",
                "Neighborhood",
                "MaxOccupancy",
                "NumBedrooms"
              ],
              include: [
                {
                  model: EventHousing,
                  ...(eventId ? { where: { EventID: eventId } } : {}),
                  attributes: ['id', 'EventID', 'NightlyPrice', 'AvailabilityStartDate', 'AvailabilityEndDate', 'isDateExtensionRequestedSent'],
                  order: [['id', 'DESC']]
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
              attributes: [
                "Name",
                "Neighborhood",
                "MaxOccupancy",
                "NumBedrooms"
              ],
              include: [
                {
                  model: EventHousing,
                  ...(eventId ? { where: { EventID: eventId } } : {}),
                  attributes: ['id', 'EventID', 'NightlyPrice', 'AvailabilityStartDate', 'AvailabilityEndDate'],
                  order: [['id', 'DESC']]
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

    // console.log("-------------orders-------------", orders.length)

    return res.json({
      statusCode: 200,
      success: true,
      message: "Orders fetched successfully!!!",
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


// New Api get total orders
// export async function getPaginatedOrders(queryParams) {
//   try {
//     const {
//       email,
//       startDate,
//       endDate,
//       eventName,
//       name,
//       lname,
//       mobile,
//       orderId,
//       type,
//       paymentOption,
//       keyword,
//       page = 1,
//       limit = 50,
//     } = queryParams;

//     const orderConditions = {
//       [Op.or]: [
//         { is_free: { [Op.is]: null } },
//         { couponCode: { [Op.not]: null } },
//       ],
//       ticket_status: { [Op.is]: null },
//     };

//     // Date filter
//     if (startDate || endDate) {
//       orderConditions.created = {};
//       if (startDate) {
//         orderConditions.created[Op.gte] = new Date(new Date(startDate).setHours(0, 0, 0));
//       }
//       if (endDate) {
//         orderConditions.created[Op.lte] = new Date(new Date(endDate).setHours(23, 59, 59));
//       }
//     }

//     // Order ID filter
//     if (orderId?.trim()) {
//       orderConditions.OriginalTrxnIdentifier = {
//         [Op.like]: `%${orderId.trim().toUpperCase()}%`,
//       };
//     }

//     // Free orders filter
//     if (type == "free") {
//       orderConditions.is_free = 1;
//     }

//     // Payment option filter
//     if (paymentOption && paymentOption.trim() !== "") {
//       orderConditions.paymentOption = paymentOption.trim().toLowerCase();
//     }


//     if (keyword && keyword.trim() !== "") {
//       const kw = `%${keyword.trim()}%`;

//       orderConditions[Op.or] = [
//         { "$User.FirstName$": { [Op.like]: kw } },
//         { "$User.LastName$": { [Op.like]: kw } },
//         { "$User.Email$": { [Op.like]: kw } },
//         { "$User.PhoneNumber$": { [Op.like]: kw } },
//       ];
//     }
//     // User filters
//     if (email?.trim()) {
//       orderConditions["$User.Email$"] = {
//         [Op.like]: `%${email.trim().toUpperCase()}%`,
//       };
//     }

//     if (mobile) {
//       orderConditions["$User.PhoneNumber$"] = mobile;
//     }

//     if (name?.trim()) {
//       orderConditions["$User.FirstName$"] = {
//         [Op.like]: `%${name.trim().toUpperCase()}%`,
//       };
//     }

//     if (lname?.trim()) {
//       orderConditions["$User.LastName$"] = {
//         [Op.like]: `%${lname.trim().toUpperCase()}%`,
//       };
//     }

//     // Event name filter
//     let eventId = null;
//     if (eventName?.trim()) {
//       const event = await Event.findOne({
//         attributes: ["id"],
//         where: {
//           Name: {
//             [Op.like]: `%${eventName.trim()}%`,
//           },
//         },
//       });
//       if (event) {
//         eventId = event.id;
//         orderConditions.event_id = event.id;
//       }
//     }
//     // Pagination setup
//     const pageNum = parseInt(page) || 1;
//     const limitNum = parseInt(limit) || 50;
//     const offset = (pageNum - 1) * limitNum;
//     // Query database
//     const { rows: orders, count } = await MyOrders.findAndCountAll({
//       where: orderConditions,
//       limit: limitNum,
//       offset,
//       subQuery: false,
//       distinct: true,
//       include: [
//         {
//           model: User,
//           required: true,
//           attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
//         },
//         {
//           model: Event,
//           attributes: ["Name"],
//           include: [
//             {
//               model: Currency,
//               attributes: ["Currency_symbol", "Currency"],
//             },
//           ],
//         },
//         {
//           model: BookTicket,
//           required: false,
//           attributes: ["id"],
//         },
//         {
//           model: AddonBook,
//           required: false,
//           attributes: ["id"],
//         },
//         {
//           model: BookAccommodationInfo,
//           attributes: [
//             "id",
//             "user_id",
//             "accommodation_id",
//             "check_in_date",
//             "check_out_date",
//             "total_night_stay",
//           ],
//           include: [
//             {
//               model: HousingInfo,
//               attributes: [
//                 "Name",
//                 "Neighborhood",
//                 "MaxOccupancy",
//                 "NumBedrooms",
//               ],
//               include: [
//                 {
//                   model: EventHousing,
//                   ...(eventId ? { where: { EventID: eventId } } : {}),
//                   attributes: [
//                     "id",
//                     "EventID",
//                     "NightlyPrice",
//                     "AvailabilityStartDate",
//                     "AvailabilityEndDate",
//                     "isDateExtensionRequestedSent",
//                   ],
//                 },
//                 {
//                   model: HousingNeighborhood,
//                   attributes: ["name"],
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           model: AccommodationExtension,
//           attributes: [
//             "id",
//             "user_id",
//             "accommodation_id",
//             "check_in_date",
//             "check_out_date",
//             "total_night_stay",
//           ],
//           include: [
//             {
//               model: HousingInfo,
//               attributes: [
//                 "Name",
//                 "Neighborhood",
//                 "MaxOccupancy",
//                 "NumBedrooms",
//               ],
//               include: [
//                 {
//                   model: EventHousing,
//                   ...(eventId ? { where: { EventID: eventId } } : {}),
//                   attributes: [
//                     "id",
//                     "EventID",
//                     "NightlyPrice",
//                     "AvailabilityStartDate",
//                     "AvailabilityEndDate",
//                   ],
//                 },
//                 {
//                   model: HousingNeighborhood,
//                   attributes: ["name"],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//       order: [["id", "DESC"]],
//       logging: false
//     });
//     const serialStart = (pageNum - 1) * limitNum + 1;
//     orders.forEach((order, index) => {
//       order.setDataValue('serialNum', serialStart + index);
//     });
//     // Calculate pagination metadata
//     const totalRecords = count;
//     const currentPage = pageNum;
//     const totalPages = Math.ceil(totalRecords / limitNum);
//     const recordsReturned = orders.length;
//     const effectivePageSize = limitNum;

//     return {
//       statusCode: 200,
//       success: true,
//       message: "Orders fetched successfully",
//       data: orders,
//       pagination: {
//         totalRecords,
//         currentPage,
//         totalPages,
//         pageSize: effectivePageSize,
//         recordsReturned
//       }
//     };
//   } catch (error) {
//     console.error("Error in getPaginatedOrders:", error);
//     return {
//       statusCode: 500,
//       success: false,
//       message: "Error fetching orders: " + error.message,
//     };
//   }
// }


export async function getPaginatedOrders(queryParams) {
  try {
    const {
      email,
      startDate,
      endDate,
      eventName,
      name,
      lname,
      mobile,
      orderId,
      type,
      paymentOption,
      keyword,
      page = 1,
      limit = 50,
    } = queryParams;

    const orderConditions = {
      [Op.or]: [
        { is_free: { [Op.is]: null } },
        { couponCode: { [Op.not]: null } },
      ],
      ticket_status: { [Op.is]: null },
    };

    // Date filters
    if (startDate || endDate) {
      orderConditions.created = {};
      if (startDate) {
        orderConditions.created[Op.gte] = new Date(new Date(startDate).setHours(0, 0, 0));
      }
      if (endDate) {
        orderConditions.created[Op.lte] = new Date(new Date(endDate).setHours(23, 59, 59));
      }
    }

    if (orderId?.trim()) {
      orderConditions.OriginalTrxnIdentifier = {
        [Op.like]: `%${orderId.trim().toUpperCase()}%`,
      };
    }

    if (type === "free") {
      orderConditions.is_free = 1;
    }

    if (paymentOption?.trim()) {
      orderConditions.paymentOption = paymentOption.trim().toLowerCase();
    }

    if (keyword?.trim()) {
      const kw = `%${keyword.trim()}%`;
      orderConditions[Op.or] = [
        { "$User.FirstName$": { [Op.like]: kw } },
        { "$User.LastName$": { [Op.like]: kw } },
        { "$User.Email$": { [Op.like]: kw } },
        { "$User.PhoneNumber$": { [Op.like]: kw } },
      ];
    }

    if (email?.trim()) {
      orderConditions["$User.Email$"] = {
        [Op.like]: `%${email.trim().toUpperCase()}%`,
      };
    }

    if (mobile) {
      orderConditions["$User.PhoneNumber$"] = mobile;
    }

    if (name?.trim()) {
      orderConditions["$User.FirstName$"] = {
        [Op.like]: `%${name.trim().toUpperCase()}%`,
      };
    }

    if (lname?.trim()) {
      orderConditions["$User.LastName$"] = {
        [Op.like]: `%${lname.trim().toUpperCase()}%`,
      };
    }

    let eventId = null;
    if (eventName?.trim()) {
      const event = await Event.findOne({
        attributes: ["id"],
        where: {
          Name: { [Op.like]: `%${eventName.trim()}%` },
        },
      });
      if (event) {
        eventId = event.id;
        orderConditions.event_id = event.id;
      }
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    // ✅ Step 1: Get paginated order IDs (with User included for filtering)
    const idResults = await MyOrders.findAll({
      where: orderConditions,
      attributes: ["id"],
      include: [
        {
          model: User,
          required: true,
          attributes: [],
        },
      ],
      limit: limitNum,
      offset,
      order: [["id", "DESC"]],
      raw: true,
    });

    const paginatedIds = idResults.map((item) => item.id);

    if (!paginatedIds.length) {
      return {
        statusCode: 200,
        success: true,
        message: "No orders found",
        data: [],
        pagination: {
          totalRecords: 0,
          currentPage: pageNum,
          totalPages: 0,
          pageSize: limitNum,
          recordsReturned: 0,
        },
      };
    }

    // ✅ Step 2: Fetch full records with includes
    const orders = await MyOrders.findAll({
      where: { id: { [Op.in]: paginatedIds } },
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
        },
        {
          model: Event,
          attributes: ["Name"],
          include: [
            {
              model: Currency,
              attributes: ["Currency_symbol", "Currency"],
            },
          ],
        },
        {
          model: BookTicket,
          required: false,
          attributes: ["id"],
        },
        {
          model: AddonBook,
          required: false,
          attributes: ["id"],
        },
        {
          model: BookAccommodationInfo,
          attributes: [
            "id",
            "user_id",
            "accommodation_id",
            "check_in_date",
            "check_out_date",
            "total_night_stay",
          ],
          include: [
            {
              model: HousingInfo,
              attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms"],
              include: [
                {
                  model: EventHousing,
                  ...(eventId ? { where: { EventID: eventId } } : {}),
                  attributes: [
                    "id",
                    "EventID",
                    "NightlyPrice",
                    "AvailabilityStartDate",
                    "AvailabilityEndDate",
                    "isDateExtensionRequestedSent",
                  ],
                },
                {
                  model: HousingNeighborhood,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
        {
          model: AccommodationExtension,
          attributes: [
            "id",
            "user_id",
            "accommodation_id",
            "check_in_date",
            "check_out_date",
            "total_night_stay",
          ],
          include: [
            {
              model: HousingInfo,
              attributes: ["Name", "Neighborhood", "MaxOccupancy", "NumBedrooms"],
              include: [
                {
                  model: EventHousing,
                  ...(eventId ? { where: { EventID: eventId } } : {}),
                  attributes: [
                    "id",
                    "EventID",
                    "NightlyPrice",
                    "AvailabilityStartDate",
                    "AvailabilityEndDate",
                  ],
                },
                {
                  model: HousingNeighborhood,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // Add serial numbers
    const serialStart = (pageNum - 1) * limitNum + 1;
    orders.forEach((order, index) => {
      order.setDataValue("serialNum", serialStart + index);
    });

    // ✅ Count total for pagination
    const totalRecords = await MyOrders.count({
      where: orderConditions,
      include: [
        {
          model: User,
          required: true,
          attributes: [],
        },
      ],
    });

    return {
      statusCode: 200,
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        totalRecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        pageSize: limitNum,
        recordsReturned: orders.length,
      },
    };
  } catch (error) {
    console.error("Error in getPaginatedOrders:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Error fetching orders: " + error.message,
    };
  }
}


















// Rupam Oct 7 Seach order detaisl
export async function searchOrderDetails(
  {
    email,
    startDate,
    endDate,
    eventName,
    name,
    lname,
    mobile,
    orderId,
    type,
    transfer,
  },
  res
) {
  let orderConditions = {};

  if (startDate) {
    orderConditions.created = {
      [Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0)),
    };
  }

  if (endDate) {
    orderConditions.created = {
      ...orderConditions.created,
      [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59)),
    };
  }

  if (orderId) {
    orderConditions.OriginalTrxnIdentifier = {
      [Op.like]: `%${orderId.trim().toUpperCase()}%`,
    };
  }

  if (type == "free") {
    orderConditions.is_free = 1;
  }

  if (email) {
    orderConditions["$User.Email$"] = {
      [Op.like]: `%${email.trim().toUpperCase()}%`,
    };
  }

  if (mobile) {
    orderConditions["$User.PhoneNumber$"] = mobile;
  }

  if (name) {
    orderConditions["$User.FirstName$"] = {
      [Op.like]: `%${name.trim().toUpperCase()}%`,
    };
  }

  if (lname) {
    orderConditions["$User.LastName$"] = {
      [Op.like]: `%${lname.trim().toUpperCase()}%`,
    };
  }

  try {
    // const orders = await Orders.findAll({
    //   where: orderConditions,
    //   attributes: ["id"], // Only select the 'id' column
    //   include: [{ model: User }],
    //   order: [["id", "DESC"]],
    // });


    const orders = await Orders.findAll({
      where: {
        [Op.or]: [
          { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
          { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        ],
        ticket_status: null,
        ...orderConditions,
      },
      attributes: ["id"], // Only select the 'id' column
      include: [{ model: User }],
      order: [["id", "DESC"]],
    });


    const orderIds = orders.map((order) => order.id);

    // console.log('orders============>', orderIds);
    // return false

    let data = [];
    let tickets = [];
    let addons = [];
    let accommodationData = [];
    let ticketConditions = {
      order_id: { [Op.in]: orderIds },
    };
    let addonConditions = {
      order_id: { [Op.in]: orderIds },
    };
    let accommodationConditions = {
      order_id: { [Op.in]: orderIds },
    };
    // Apply transfer condition if `transfer` is '1'
    if (transfer == 1) {
      ticketConditions["$TicketDetails.transfer_user_id$"] = {
        [Op.ne]: null,
      };
      addonConditions["$AddonBook.transfer_user_id$"] = { [Op.ne]: null };
    }

    // Common attributes
    const orderAttributes = [
      "id", "OriginalTrxnIdentifier", "total_amount", "RRN", "paymenttype",
      "createdAt", "actualamount", "couponCode", "is_free", "total_night_stay", "accommodation_nightlyPerDaysRate", "accommodationPerDaysPropertyOwnerAmount", "accommodationOndalindaPerDaysFeeAmount"
    ];
    const userAttributes = ["FirstName", "LastName", "id", "Email", "PhoneNumber"];


    if (eventName) {
      // Only fetch tickets if type is 'ticket' or 'all'
      if (type == "ticket" || type == "all" || type == "free") {
        tickets = await BookTicket.findAll({
          where: ticketConditions,
          include: [
            { model: EventTicketType },
            { model: TicketDetail },
            {
              model: Orders,
              attributes: orderAttributes,
            },
            {
              model: User,
              attributes: userAttributes,
            },
            {
              model: Event,
              where: eventName
                ? { Name: { [Op.like]: `%${eventName.trim()}%` } }
                : undefined,
              include: [Currency],
            },
          ],
          // group: ["event_ticket_id"],
          order: [["id", "DESC"]],
        });
      }

      // Only fetch addons if type is 'addon' or 'all'
      if (type == "addon" || type == "all" || type == "free") {
        addons = await AddonBook.findAll({
          where: addonConditions,
          include: [
            { model: Addons },
            {
              model: Orders,
              attributes: orderAttributes,
            },
            {
              model: User,
              attributes: userAttributes,
            },
            {
              model: Event,
              where: eventName
                ? { Name: { [Op.like]: `%${eventName.trim()}%` } }
                : undefined,
              include: [Currency],
            },
          ],
        });
      }

      if (type == "accommodation" || type == "all" || type == "free") {
        // Fetch accommodation data
        accommodationData = await AccommodationBookingInfo.findAll({
          where: accommodationConditions,
          include: [
            {
              model: Housing,
              attributes: ["id", "Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "Pool"],
              include: [{ model: HousingNeighborhood, attributes: ["name"] }]
            },
            {
              model: Event,
              include: [Currency],
              attributes: ["Name", "Country", "StartDate", "EndDate"]
            },
            {
              model: User,
              attributes: userAttributes
            },
            { model: MyOrders, attributes: orderAttributes },
          ]
        });

        // return accommodationData;

      }

    } else {

      // Fetch ticket data
      tickets = await BookTicket.findAll({
        where: ticketConditions,
        include: [
          { model: EventTicketType },
          { model: TicketDetail },
          { model: Orders, attributes: orderAttributes },
          { model: User, attributes: userAttributes },
          { model: Event, include: [Currency] }
        ],
        order: [["id", "DESC"]],
      });

      // Fetch addon data
      addons = await AddonBook.findAll({
        where: addonConditions,
        include: [
          { model: Addons },
          { model: Orders, attributes: orderAttributes },
          { model: User, attributes: userAttributes },
          { model: Event, include: [Currency] }
        ],
      });

      // Fetch accommodation data
      accommodationData = await AccommodationBookingInfo.findAll({
        where: accommodationConditions,
        include: [
          {
            model: Housing,
            attributes: ["id", "Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "Pool"],
            include: [{ model: HousingNeighborhood, attributes: ["name"] }]
          },
          {
            model: Event,
            include: [Currency],
            attributes: ["Name", "Country", "StartDate", "EndDate"]
          },
          {
            model: User,
            attributes: userAttributes
          },
          { model: MyOrders, attributes: orderAttributes },
        ]
      });

      // console.log(accommodationData);
      // return accommodationData
    }

    // Helper: Get Transfer User
    const getTransferUser = async (id) =>
      id ? await User.findOne({ where: { id }, attributes: userAttributes }) : null;

    // Tickets Loop
    for (let ticket of tickets) {
      const { Event = {}, User = {}, Order = {}, EventTicketType, TicketDetails = [] } = ticket;
      const ticketDetail = TicketDetails[0] || {};
      const transferUser = await getTransferUser(ticketDetail.transfer_user_id);

      data.push({
        eventname: Event.Name,
        event_id: Event.id,
        eventLocation: Event.Country,
        eventStartDateTime: Event.StartDate,
        eventEndDateTime: Event.EndDate,
        currencysign: Event.Currency?.Currency_symbol || "$",
        currencyvalue: Event.Currency?.Currency || "USD",

        user_id: User.id || "Unknown",
        name: User.FirstName || "Unknown",
        lname: User.LastName || "User",
        email: User.Email || "",
        mobile: User.PhoneNumber || "Unknown",

        OriginalTrxnIdentifier: Order.OriginalTrxnIdentifier || "",
        amount: Order.total_amount || "",
        stripekey: Order.RRN || "",
        paymenttype: Order.paymenttype || "",
        orderDate: Order.createdAt || "",
        actualamount: Order.actualamount || "",
        couponcode: Order.couponCode || false,
        afterdiscount: Order.total_amount || "",
        is_free_ticket: Order.is_free == 1,

        ticket_id: ticket.id,
        eventticketname: EventTicketType?.title,
        ticketPrice: EventTicketType?.price,
        qrcode: ticketDetail.qrcode || "",
        ticket_first_name: ticketDetail.fname || "",
        ticket_last_name: ticketDetail.lname || "",
        is_transfer: ticketDetail.transfer_user_id || "",
        ticket_status: ticketDetail.ticket_status || "",
        transfer_ticket_to_email: transferUser?.Email || "",
        ticket_type: "ticket",
      });
    }

    // Addons Loop
    for (let addon of addons) {
      const { Event = {}, User = {}, Order = {}, Addon = {} } = addon;
      const transferUser = await getTransferUser(addon.transfer_user_id);

      data.push({
        id: addon.id,
        eventname: Event.Name || "Unknown Event",
        eventLocation: Event.Country || "Unknown Location",
        eventStartDateTime: Event.StartDate || "Unknown Start Date",
        eventEndDateTime: Event.EndDate || "Unknown End Date",
        currencysign: Event.Currency?.Currency_symbol || "$",
        currencyvalue: Event.Currency?.Currency || "USD",

        order_id: Order.id || null,
        OriginalTrxnIdentifier: Order.OriginalTrxnIdentifier || null,
        name: `${User.FirstName || "Unknown"} ${User.LastName || "User"}`,
        lname: User.LastName || "User",
        email: User.Email || " ",
        mobile: User.PhoneNumber || "Unknown",
        amount: Order.total_amount || null,
        stripekey: Order.RRN || null,
        paymenttype: Order.paymenttype || "Unknown",
        orderDate: Order.createdAt || null,
        actualamount: Order.actualamount || null,
        couponcode: Order.couponCode || null,
        afterdiscount: Order.actualamount || Order.total_amount || null,
        addon_id: Addon.id || null,
        ticketPrice: Addon.price || null,
        eventticketname: Addon.name || "Unknown Addon",
        qrcode: addon.addon_qrcode || null,
        ticket_status: addon.ticket_status || "Not Assigned",
        ticket_type: "addon",
        is_transfer: !!addon.transfer_user_id,
        transfer_ticket_to_email: transferUser?.Email || "",
        is_free_ticket: Order.is_free == 1,
      });
    }

    // console.log(accommodationData);

    // Accommodation Data

    for (let accommodation of accommodationData) {
      const { Event = {}, User = {}, MyOrder = {}, Housing = {} } = accommodation;

      // "total_night_stay","accommodation_nightlyPerDaysRate","accommodationPerDaysPropertyOwnerAmount","accommodationOndalindaPerDaysFeeAmount"
      // console.log('>>>>>>>>>>', MyOrder);
      const transferUser = await getTransferUser(accommodation.transfer_user_id);

      const check_in_date = accommodation.check_in_date || null;
      const check_out_date = accommodation.check_out_date || null;
      let dateDifference = MyOrder.total_night_stay;
      let perNightPrice = MyOrder.accommodation_nightlyPerDaysRate;
      let accommodationOndalindaPerDaysFeeAmount = MyOrder.accommodationOndalindaPerDaysFeeAmount;
      let accommodationPerDaysPropertyOwnerAmount = MyOrder.accommodationPerDaysPropertyOwnerAmount;

      data.push({
        id: accommodationData.id,
        eventname: Event.Name || "Unknown Event",
        eventLocation: Event.Country?.trim() || "Unknown Location",
        eventStartDateTime: Event.StartDate || "Unknown Start Date",
        eventEndDateTime: Event.EndDate || "Unknown End Date",
        currencysign: Event.Currency?.Currency_symbol || "$",
        currencyvalue: Event.Currency?.Currency || "USD",
        order_id: MyOrder.id || null,
        OriginalTrxnIdentifier: MyOrder.OriginalTrxnIdentifier || null,
        name: `${User.FirstName || accommodation.first_name || "Unknown"} ${User.LastName || accommodation.last_name || "User"}`,
        lname: User.LastName || accommodation.last_name || "User",
        email: User.Email || accommodation.email || " ",
        mobile: User.PhoneNumber || "Unknown",
        amount: MyOrder.total_amount || accommodation.total_amount || null,
        stripekey: MyOrder.RRN || accommodation.transaction_id || null,
        paymenttype: MyOrder.paymenttype || accommodation.payment_method || "Unknown",
        orderDate: MyOrder.createdAt || accommodation.created_at || null,
        actualamount: MyOrder.actualamount || MyOrder.total_amount || accommodation.total_amount || null,
        couponcode: MyOrder.couponCode || null,
        afterdiscount: MyOrder.actualamount || MyOrder.total_amount || null,
        accommodation_id: accommodation.accommodation_id || accommodation.id || null,
        accommodationname: accommodation.accommodation_name || Housing.Name || "Unknown Accommodation",
        qrcode: accommodation.qr_code_image || "",
        accommodationtype: accommodation.type || "Unknown Type",
        accommodationprice: accommodation.total_amount || null,
        ticketPrice: accommodation.total_amount || null,
        accommodationstatus: accommodation.status === "Y" ? "Confirmed" : "Not Assigned",
        check_in_date: accommodation.check_in_date || null,
        check_out_date: accommodation.check_out_date || null,
        date_differace: dateDifference,
        perNightPrice: perNightPrice || 0,
        guests_count: accommodation.guests_count || null,
        no_of_bedrooms: accommodation.no_of_bedrooms || Housing.NumBedrooms || null,
        payment_status: accommodation.payment_status || null,
        ticket_status: "Not Assigned",
        ticket_type: "accommodation",
        is_transfer: !!accommodation.transfer_user_id,
        transfer_ticket_to_email: transferUser?.Email || "",
        is_free_ticket: MyOrder.is_free == 1,
        eventticketname: Housing?.Name
          ? `House Name: ${Housing.Name}, ${Housing.HousingNeighborhood?.name || ''}`
          : null,
        // Housing Info
        housing_id: Housing.id || null,
        housing_name: Housing.Name || null,
        housing_neighborhood: Housing.Neighborhood || null,
        housing_max_occupancy: Housing.MaxOccupancy || null,
        housing_num_bedrooms: Housing.NumBedrooms || null,
        housing_pool: Housing.Pool || null,
        accommodationOndalindaPerDaysFeeAmount,
        accommodationPerDaysPropertyOwnerAmount
      });
    }

    return res.json({
      statusCode: 200,
      success: true,
      message: "View Order Successfully!",
      data: data,
    });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error :" + error.message });
  }
}

// Rupam Nov 22 - 2024  Search order details v1->orders
export async function searchOrderDetailsForSales(
  {
    email,
    startDate,
    endDate,
    eventName,
    name,
    lname,
    mobile,
    orderId,
    type,
    transfer,
    discountAmount,
    ticketId,
  },
  res
) {
  let orderConditions = {};
  // if (startDate) {
  //   orderConditions.created = {
  //     [Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0)),
  //   };
  // }

  // if (endDate) {
  //   orderConditions.created = {
  //     ...orderConditions.created,
  //     [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59)),
  //   };
  // }

  if (startDate || endDate) {
    orderConditions.createdAt = {};

    if (startDate) {
      const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0));
      orderConditions.createdAt[Op.gte] = startOfDay;
    }

    if (endDate) {
      const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59));
      orderConditions.createdAt[Op.lte] = endOfDay;
    }
  }

  // let group = (discountAmount > 0) ? ['Orders.couponCode'] : undefined;

  if (orderId) {
    orderConditions.OriginalTrxnIdentifier = {
      [Op.like]: `%${orderId.trim().toUpperCase()}%`,
    };
  }

  if (type == "free") {
    orderConditions.is_free = 1;
  }

  if (email) {
    orderConditions["$User.Email$"] = {
      [Op.like]: `%${email.trim().toUpperCase()}%`,
    };
  }

  if (mobile) {
    orderConditions["$User.PhoneNumber$"] = mobile;
  }

  if (name) {
    orderConditions["$User.FirstName$"] = {
      [Op.like]: `%${name.trim().toUpperCase()}%`,
    };
  }

  if (lname) {
    orderConditions["$User.LastName$"] = {
      [Op.like]: `%${lname.trim().toUpperCase()}%`,
    };
  }


  if (ticketId && type == "ticket") {
    // orderConditions.couponCode = {
    //   [Op.is]: null,
    // };
    // orderConditions.ticket_status = {
    //   [Op.is]: null,
    // };
  }

  const matchedEvent = await Event.findOne({
    where: {
      Name: {
        [Op.like]: `%${eventName.trim()}%`,
      },
    },
    attributes: ['id'],
  });

  if (matchedEvent) {
    orderConditions.event_id = matchedEvent.id;
  }

  // console.log('>>>>>>>', orderConditions);
  // return false


  try {

    const orders = await Orders.findAll({
      where: {
        [Op.or]: [
          { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
          { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        ],
        ticket_status: null,
        ...orderConditions,
      },
      attributes: ["id"], // Only select the 'id' column
      include: [{ model: User }],
      order: [["id", "DESC"]],
      // ...(group && { group }),
    });

    const orderIds = orders.map((order) => order.id);
    // return orderIds;

    let data = [];
    let tickets = [];
    let addons = [];
    let ticketConditions = {
      order_id: { [Op.in]: orderIds },
    };
    let addonConditions = {
      order_id: { [Op.in]: orderIds },
    };


    // Apply transfer condition if `transfer` is '1'
    if (transfer == 1) {
      ticketConditions["$TicketDetails.transfer_user_id$"] = {
        [Op.ne]: null,
      };
      addonConditions["$AddonBook.transfer_user_id$"] = { [Op.ne]: null };
    }

    if (ticketId && type == "ticket") {
      ticketConditions.event_ticket_id = ticketId;
    }

    if (ticketId && type == "addon") {
      addonConditions.addons_id = ticketId;
    }

    if (matchedEvent) {
      ticketConditions.event_id = matchedEvent.id;
      addonConditions.event_id = matchedEvent.id;
    }

    if (eventName) {

      // Only fetch tickets if type is 'ticket' or 'all'
      if ((type == "ticket" || type == "all" || type == "free")) {
        tickets = await BookTicket.findAll({
          where: ticketConditions,
          include: [
            { model: EventTicketType },
            { model: TicketDetail },
            {
              model: Orders,
              attributes: [
                "id",
                "OriginalTrxnIdentifier",
                "total_amount",
                "RRN",
                "paymenttype",
                "createdAt",
                "actualamount",
                "discountAmount",
                "couponCode",
                "is_free",
                "adminfee",
              ],
            },
            {
              model: User,
              attributes: ["FirstName", "LastName", "id", "Email", "PhoneNumber"],
            },
            {
              model: Event,
              include: [Currency], // No need for where condition
            },
          ],
          order: [["id", "DESC"]],
        });
      }

      // Only fetch addons if type is 'addon' or 'all'
      if (type == "addon" || type == "all" || type == "free") {
        addons = await AddonBook.findAll({
          where: addonConditions,
          include: [
            {
              model: Addons,
              attributes: ["id", "name", "price", "count"],
            },
            {
              model: Orders,
              attributes: [
                "id",
                "OriginalTrxnIdentifier",
                "total_amount",
                "RRN",
                "paymenttype",
                "createdAt",
                "actualamount",
                "discountAmount",
                "couponCode",
                "is_free",
                "adminfee",
              ],
            },
            {
              model: User,
              attributes: [
                "FirstName",
                "LastName",
                "id",
                "Email",
                "PhoneNumber",
              ],
            },
            {
              model: Event,
              include: [Currency],
            },
          ],
          order: [["id", "DESC"]],
        });
      }


    } else {
      // Fetch ticket data without event filter
      tickets = await BookTicket.findAll({
        where: ticketConditions,
        include: [
          { model: EventTicketType },
          { model: TicketDetail },
          {
            model: Orders,
            attributes: [
              "id",
              "OriginalTrxnIdentifier",
              "total_amount",
              "RRN",
              "paymenttype",
              "createdAt",
              "actualamount",
              "couponCode",
              "is_free",
            ],
          },
          {
            model: User,
            attributes: ["FirstName", "LastName", "id", "Email", "PhoneNumber"],
          },
          { model: Event, include: [Currency] },
        ],
        order: [["id", "DESC"]],
      });

      // Fetch addon data without event filter
      addons = await AddonBook.findAll({
        where: ticketConditions,
        include: [
          { model: Addons },
          {
            model: Orders,
            attributes: [
              "id",
              "OriginalTrxnIdentifier",
              "total_amount",
              "RRN",
              "paymenttype",
              "createdAt",
              "actualamount",
              "couponCode",
              "is_free",
            ],
          },
          {
            model: User,
            attributes: ["FirstName", "LastName", "id", "Email", "PhoneNumber"],
          },
          { model: Event, include: [Currency] },
        ],
      });
    }

    let amount_info = {
      total_amount: 0,
      total_taxes: 0,
      gross_total: 0,
    };


    // Create separate object for each ticket
    for (let ticket of tickets) {
      const ticketDetail = ticket.TicketDetails && ticket.TicketDetails[0];

      let userTransfer = null;

      if (ticketDetail && ticketDetail.transfer_user_id) {
        userTransfer = await User.findOne({
          where: { id: ticketDetail.transfer_user_id },
          attributes: ["Email", "FirstName", "LastName"],
        });
      }

      let actual_ticket_price = 0,
        tax_on_ticket = 0,
        total_ticket_price_with_tax = 0;

      if (ticket.Order?.discountAmount) {
        actual_ticket_price =
          ticket.EventTicketType.price - ticket.Order?.discountAmount;

        if (actual_ticket_price > 0) {
          tax_on_ticket =
            (actual_ticket_price * (ticket.Order?.adminfee || 0)) / 100 || 0;

          amount_info.total_amount += actual_ticket_price;
          amount_info.total_taxes += tax_on_ticket;

          total_ticket_price_with_tax = actual_ticket_price + tax_on_ticket;
          amount_info.gross_total += total_ticket_price_with_tax;
        }
      } else {
        actual_ticket_price = ticket.EventTicketType.price || 0;
        tax_on_ticket =
          (actual_ticket_price * (ticket.Order?.adminfee || 0)) / 100 || 0;

        amount_info.total_amount += actual_ticket_price;
        amount_info.total_taxes += tax_on_ticket;

        total_ticket_price_with_tax = actual_ticket_price + tax_on_ticket;
        amount_info.gross_total += total_ticket_price_with_tax;
      }

      data.push({
        ticketPrice: actual_ticket_price,
        tax_on_ticket: tax_on_ticket,
        total_ticket_price_with_tax: total_ticket_price_with_tax,
        eventname: ticket.Event.Name,
        currencysign: ticket.Event.Currency.Currency_symbol,
        name: `${ticket.User?.FirstName || "Unknown"}`,
        lname: `${ticket.User?.LastName || "User"}`,
        email: ticket.User?.Email || "",
        mobile: ticket.User?.PhoneNumber || "Unknown",
        OriginalTrxnIdentifier: ticket.Order?.OriginalTrxnIdentifier || "",

        actualamount: ticket.Order?.actualamount || 0,
        couponcode: ticket.Order?.couponCode || "",
        discount_amount: ticket.Order?.discountAmount || 0,
        total_taxes:
          (ticket.Order?.actualamount * ticket.Order?.adminfee) / 100,
        total_pay_amount_with_taxes: ticket.Order?.total_amount || 0,
        tax_percentage: ticket.Order?.adminfee || 0,

        stripekey: ticket.Order?.RRN || "",
        paymenttype: ticket.Order?.paymenttype || "",
        orderDate: ticket.Order?.createdAt || "",
        ticket_id: ticket.id,
        is_free_ticket: ticket.Order?.is_free == 1 ? true : false,
        eventticketname: `${ticket.EventTicketType.title} (${ticket.Event.Currency.Currency_symbol} ${ticket.EventTicketType.price})`,
        ticket_first_name: ticket?.TicketDetails?.[0]?.fname || "",
        ticket_last_name: ticket?.TicketDetails?.[0]?.lname || "",
        is_transfer: ticket?.TicketDetails?.[0]?.transfer_user_id
          ? true
          : false,
        ticket_status: ticket?.TicketDetails?.[0]?.ticket_status || null,
        transfer_ticket_to_email: userTransfer?.Email || "",
        ticket_type: "ticket",
      });
    }
    // return true

    // Create separate object for each addon
    for (let addon of addons) {
      let userTransfer = null;

      if (addon && addon.transfer_user_id) {
        userTransfer = await User.findOne({
          where: { id: addon.transfer_user_id },
          attributes: ["Email", "FirstName", "LastName"],
        });
      }

      // Calculate tax on the addon
      const addon_price = addon.Addon.price || 0;
      const addon_tax = (addon_price * (addon.Order?.adminfee || 0)) / 100;
      const total_addon_price_with_tax = addon_price + addon_tax;
      // Update the amount_info object
      amount_info.total_amount += addon_price;
      amount_info.total_taxes += addon_tax;
      amount_info.gross_total += total_addon_price_with_tax;

      data.push({
        ticketPrice: addon_price,
        tax_on_ticket: addon_tax,
        total_ticket_price_with_tax: total_addon_price_with_tax,
        eventname: addon.Event?.Name || "Unknown Event",
        currencysign: addon.Event?.Currency?.Currency_symbol || "",
        order_id: addon.Order.id || null,
        OriginalTrxnIdentifier: addon.Order.OriginalTrxnIdentifier || null,
        name: `${addon.User?.FirstName || "Unknown"} ${addon.User?.LastName || "User"
          }`,
        lname: `${addon.User?.LastName || "User"}`,
        email: addon.User?.Email || " ",
        mobile: addon.User?.PhoneNumber || "Unknown",
        total_pay_amount_with_taxes: addon.Order.total_amount || 0,
        stripekey: addon.Order.RRN || "",
        paymenttype: addon.Order.paymenttype || "Unknown",
        orderDate: addon.Order.createdAt || null,

        actualamount: addon.Order.actualamount || 0,
        couponcode: addon.Order.couponCode || "",
        discount_amount: addon.Order?.discountAmount || 0,
        total_taxes: (addon.Order?.actualamount * addon.Order?.adminfee) / 100,
        total_pay_amount_with_taxes: addon.Order?.total_amount || 0,
        tax_percentage: addon.Order?.adminfee || 0,

        addon_id: addon.Addon.id || null,
        ticketPrice: addon.Addon.price || 0,
        eventticketname:
          `${addon.Addon.name} (${addon.Event?.Currency?.Currency_symbol} ${addon.Addon.price})` ||
          "Unknown Addon",
        ticket_status: addon.ticket_status || null,
        is_transfer: addon.transfer_user_id ? true : false,
        is_free_ticket: addon.Order.is_free == 1 ? true : false,
        transfer_ticket_to_email: userTransfer?.Email || "",
        ticket_type: "addon",
      });
    }

    return res.json({
      statusCode: 200,
      success: true,
      message: "View Order Successfully!",
      data: data,
      amount_info,
    });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error :" + error.message });
  }
}

// Search Events
export async function Search_Events({ Name }) {
  // const { Name } = req.body; // Assuming the search query parameter is "Name"
  try {
    const searchResults = await Event.findAll({
      where: {
        name: {
          [Op.like]: `%${Name}%`,
        },
      },
      order: [["id", "DESC"]],
    });
    return {
      statusCode: 200,
      success: true,
      message: "Search Events Successfully!",
      searchResults,
    };
  } catch (error) {
    console.log("error");
    //   res.status(500).json({ error: 'Internal Server Error' });
  }
}


// View events by id
export async function View_EventsByid({ id }, res) {
  try {
    const data = await Event.findOne({
      where: {
        id: id,
      },
    });
    if (!data) {
      const error = new Error("ID not found");
      error.StatusCodes = 404; // You can set an appropriate status code
      throw error;
    }
    return {
      data: data,
      message: "Events View Successfully",
    };
  } catch (error) {
    return error;
  }
}

export async function UpdateEvent({ id, filename }, req) {
  let {
    Name,
    ShortName,
    Venue,
    Address,
    City,
    State,
    Country,
    PostalCode,
    Price,
    Summary,
    ListPrice,
    StartDate,
    EndDate,
    SaleStartDate,
    SaleEndDate,
    EventType,
    PaymentCurrency,
    EventTimeZone,
    ticket_description,
    addon_description,
    other_description,
    ServiceFee,
    MexicanVAT,
    AccommodationTax,
    OndalindaFee,
    strip_fee,
    expiry_duration,
    partial_payment_duration,

    ticket_platform_fee_percentage,
    ticket_stripe_fee_percentage,
    ticket_bank_fee_percentage,
    ticket_processing_fee_percentage,
    accommodation_stripe_fee_percentage,
    accommodation_bank_fee_percentage,
    accommodation_processing_fee_percentage,
  } = req.body;

  if (ServiceFee == "") {
    ServiceFee = null;
  }
  if (MexicanVAT == "") {
    MexicanVAT = null;
  }
  if (AccommodationTax == "") {
    AccommodationTax = null;
  }
  if (OndalindaFee == "") {
    OndalindaFee = null;
  }
  if (strip_fee == "") {
    strip_fee = null;
  }

  ticket_platform_fee_percentage = ticket_platform_fee_percentage == "" ? null : ticket_platform_fee_percentage;
  ticket_stripe_fee_percentage = ticket_stripe_fee_percentage == "" ? null : ticket_stripe_fee_percentage;
  ticket_bank_fee_percentage = ticket_bank_fee_percentage == "" ? null : ticket_bank_fee_percentage;
  ticket_processing_fee_percentage = ticket_processing_fee_percentage == "" ? null : ticket_processing_fee_percentage;

  accommodation_stripe_fee_percentage = accommodation_stripe_fee_percentage == "" ? null : accommodation_stripe_fee_percentage;
  accommodation_bank_fee_percentage = accommodation_bank_fee_percentage == "" ? null : accommodation_bank_fee_percentage;
  accommodation_processing_fee_percentage = accommodation_processing_fee_percentage == "" ? null : accommodation_processing_fee_percentage;

  // Build base update data (without ImageURL first)
  const updateData = {
    Name,
    event_menu_name: Name,
    EventTimeZone,
    Venue,
    Address,
    City,
    State,
    Country,
    PostalCode,
    Price,
    Summary,
    ShortName,
    ListPrice,
    StartDate,
    EndDate,
    SaleStartDate,
    SaleEndDate,
    EventType,
    payment_currency: PaymentCurrency,
    ticket_description,
    addon_description,
    other_description,
    ServiceFee,
    MexicanVAT,
    AccommodationTax,
    OndalindaFee,
    strip_fee,
    expiry_duration,
    partial_payment_duration,
    ticket_platform_fee_percentage,
    ticket_stripe_fee_percentage,
    ticket_bank_fee_percentage,
    ticket_processing_fee_percentage,
    accommodation_stripe_fee_percentage,
    accommodation_bank_fee_percentage,
    accommodation_processing_fee_percentage,
  };

  // ✅ Only add ImageURL if filename is not empty
  if (filename && filename.trim() !== "") {
    updateData.ImageURL = filename;
  }


  // ✅ Conditionally add expiry_duration and partial_payment_duration
  if (expiry_duration !== null) {
    updateData.expiry_duration = expiry_duration;
  }
  if (partial_payment_duration !== null) {
    updateData.partial_payment_duration = partial_payment_duration;
  }

  await Event.update(updateData, {
    where: { id: id },
  });

  return {
    statusCode: 200,
    success: true,
    message: "Events Update Successfully!",
  };
}

// Add Events
export async function Add_Events(
  {
    Name,
    ShortName,
    Venue,
    Address,
    City,
    State,
    Country,
    PostalCode,
    Price,
    Summary,
    ListPrice,
    StartDate,
    EndDate,
    SaleStartDate,
    SaleEndDate,
    EventType,
    PaymentCurrency,
    EventTimeZone,
    ticket_description,
    addon_description,
    other_description,
    ServiceFee,
    MexicanVAT,
    AccommodationTax,
    OndalindaFee,
    strip_fee,
    expiry_duration,
    partial_payment_duration,

    ticket_platform_fee_percentage,
    ticket_stripe_fee_percentage,
    ticket_bank_fee_percentage,
    ticket_processing_fee_percentage,
    accommodation_stripe_fee_percentage,
    accommodation_bank_fee_percentage,
    accommodation_processing_fee_percentage,
  },
  filename,
  res
) {

  try {
    if (ServiceFee == "") {
      ServiceFee = null;
      // ServiceFee = 0.00;
    }
    if (MexicanVAT == "") {
      MexicanVAT = null;
      // MexicanVAT = 0.00;
    }
    if (AccommodationTax == "") {
      AccommodationTax = null;
      // MexicanVAT = 0.00;
    }
    if (OndalindaFee == "") {
      OndalindaFee = null;
      // MexicanVAT = 0.00;
    }
    if (strip_fee == "") {
      strip_fee = null;
      // MexicanVAT = 0.00;
    }

    ticket_platform_fee_percentage = ticket_platform_fee_percentage == "" ? null : ticket_platform_fee_percentage;
    ticket_stripe_fee_percentage = ticket_stripe_fee_percentage == "" ? null : ticket_stripe_fee_percentage;
    ticket_bank_fee_percentage = ticket_bank_fee_percentage == "" ? null : ticket_bank_fee_percentage;
    ticket_processing_fee_percentage = ticket_processing_fee_percentage == "" ? null : ticket_processing_fee_percentage;

    accommodation_stripe_fee_percentage = accommodation_stripe_fee_percentage == "" ? null : accommodation_stripe_fee_percentage;
    accommodation_bank_fee_percentage = accommodation_bank_fee_percentage == "" ? null : accommodation_bank_fee_percentage;
    accommodation_processing_fee_percentage = accommodation_processing_fee_percentage == "" ? null : accommodation_processing_fee_percentage;

    const Eventdata = await Event.create({
      Name,
      event_menu_name: Name,
      EventTimeZone,
      Venue,
      Address,
      City,
      State,
      Country,
      PostalCode,
      Price,
      Summary,
      ShortName,
      ListPrice,
      StartDate,
      EndDate,
      SaleStartDate,
      SaleEndDate,
      EventType,
      ImageURL: filename,
      payment_currency: PaymentCurrency,
      // new keys added(28-01-2025)
      ticket_description,
      addon_description,
      other_description,
      // new keys added(05-02-2025)
      ServiceFee,
      MexicanVAT,
      AccommodationTax,
      OndalindaFee,
      // new keys added(04-03-2025)
      strip_fee,
      // new keys added(05-05-2025) accommodation request expiry duration
      expiry_duration,
      partial_payment_duration,
      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage,
      accommodation_stripe_fee_percentage,
      accommodation_bank_fee_percentage,
      accommodation_processing_fee_percentage,
    });

    const redirectUrl = `/admin/events/add-2step/?id=${Eventdata.id}`;
    return {
      statusCode: StatusCodes.OK,
      status: true,
      message: "Event added Successfully",
      id: Eventdata.id,
      redirectUrl, // Add the redirect URL in the response
    };
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
    };
  }
}

// Events Invited
export async function View_EventInvite(req) {
  const viewCms = await InvitationEvent.findAll({
    order: [["id", "DESC"]],
  });
  return {
    statusCode: 200,
    success: true,
    message: "View Invited Events Successfully!",
    viewCms,
  };
}

// View Active Event List with valid Date Range
export async function viewActiveEventList({ id }, res) {
  try {
    const currentDate = new Date(); // Get current date and time
    const data = await Event.findAll({
      where: {
        // StartDate: { [Op.lte]: currentDate },
        // EndDate: { [Op.gte]: currentDate }
        // EndDate: { [Op.gt]: currentDate },  // comment 03-06-2025
        status: "Y"
      },
      order: [["StartDate", "DESC"]],
    });
    if (data.length === 0) {
      return res.status(404).json({ message: "No active events found" });
    }
    return res.status(200).json({
      data: data,
      message: "Active event list retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// view events completed details with ticket details with addons
export async function viewCompletedEventDetails({ id }, req, res) {
  try {
    const eventDetails = await Event.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Currency, // Include Currency
        },
        {
          model: EventTicketType, // Include EventTicketType
        },
        {
          model: Addons, // Include Addons
        },
      ],
    });

    if (!eventDetails) {
      return {
        message: "Invalid Event Id",
        success: false,
      };
    }

    // Initialize an array to store the addon count results
    const addonCountResults = [];

    for (const addon of eventDetails.Addons) {
      const addonBookCount = await AddonBook.count({
        where: {
          addons_id: addon.id,
          // ticket_status: { [Op.is]: null },
        },
      });
      addonCountResults.push({
        addonId: addon.id,
        total_addon: addon.count,
        count: addonBookCount,
      });
    }

    return {
      message: "View Completed Events Successfully",
      success: true,
      data: {
        eventDetails: eventDetails,
        addonCountResults: addonCountResults,
      },
    };
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
}

// view events completed details with ticket details with addons for admin preview the event(31-01-25:kamal)
export async function viewEventDetailsAdminPreview({ id }, req, res) {
  try {
    const eventDetails = await Event.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Currency, // Include Currency
        },
        {
          model: EventTicketType, // Include EventTicketType
          separate: true,
          order: [['display_order', 'ASC']],
        },
        {
          model: Addons, // Include Addons
          separate: true,
          order: [['display_order', 'ASC']],
        },
      ],
    });

    if (!eventDetails) {
      return {
        message: "Invalid Event Id",
        success: false,
      };
    }

    // Initialize an array to store the addon count results
    const addonCountResults = [];

    for (const addon of eventDetails.Addons) {
      const addonBookCount = await AddonBook.count({
        where: {
          addons_id: addon.id,
          // ticket_status: { [Op.is]: null },
        },
      });
      addonCountResults.push({
        addonId: addon.id,
        total_addon: addon.count,
        count: addonBookCount,
      });
    }

    return {
      message: "View Completed Events Successfully",
      success: true,
      data: {
        eventDetails: eventDetails,
        addonCountResults: addonCountResults,
      },
    };
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
}

export async function viewCancelTickets(req, res) {
  const {
    email,
    startDate,
    endDate,
    eventName,
    name,
    lname,
    mobile,
    orderId,
    ticketType,
  } = req; // Use req.body to fetch request payload

  try {
    // Build dynamic filters
    const eventFilters = {};
    const userFilters = {};
    const orderConditions = {};

    // Date filters using SQL DATE function
    if (startDate || endDate) {
      orderConditions.createdAt = {};

      if (startDate) {
        const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0));
        orderConditions.createdAt[Op.gte] = startOfDay;
      }

      if (endDate) {
        const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59));
        orderConditions.createdAt[Op.lte] = endOfDay;
      }
    }
    if (eventName) {
      eventFilters.Name = {
        [Op.like]: `%${eventName.trim().toUpperCase()}%`, // Case insensitive LIKE query
      };
    }

    if (email) {
      userFilters.Email = {
        [Op.like]: `%${email.trim().toUpperCase()}%`,
      };
    }

    if (name) {
      userFilters.FirstName = {
        [Op.like]: `%${name.trim().toUpperCase()}%`,
      };
    }

    if (lname) {
      userFilters.LastName = {
        [Op.like]: `%${lname.trim().toUpperCase()}%`,
      };
    }

    if (mobile) {
      userFilters.PhoneNumber = {
        [Op.like]: `%${mobile}%`,
      };
    }

    if (orderId) {
      orderConditions.OriginalTrxnIdentifier = orderId;
    }

    // Fetch event ID based on event name
    const event = await Event.findOne({
      where: eventFilters, // Apply dynamic filters for events
      include: { model: Currency },
    });

    if (!event) {
      return res.json({
        success: false,
        message: "Event not found!",
        data: [],
        count: 0,
      });
    }

    const eventID = event.id;

    // Fetch all orders
    let totalOrders;

    if (ticketType === "ticket") {
      // Query for tickets only
      totalOrders = await MyOrders.findAll({
        where: orderConditions,
        attributes: [
          "id",
          "actualamount",
          "couponCode",
          "discountValue",
          "discountType",
          "discountAmount",
          "total_amount",
          "RRN",
          "paymenttype",
          "createdAt",
          "OriginalTrxnIdentifier",
          "is_free",
          "adminfee",
          "ticket_cancel_id",
          "ticket_status",
        ],
        include: [
          {
            model: User,
            attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
            where: userFilters,
            required: Object.keys(userFilters).length > 0,
          },
          {
            model: BookTicket,
            where: {
              event_id: eventID,
              ticket_status: { [Op.not]: null },
            },
            attributes: ["id"],
            required: true, // Ensure only orders with tickets are included
            include: [
              {
                model: TicketDetail,
                attributes: ["id", "fname", "lname"],
              },
              {
                model: EventTicketType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });
    } else if (ticketType === "addon") {
      // Query for addons only
      totalOrders = await MyOrders.findAll({
        where: orderConditions,
        attributes: [
          "id",
          "actualamount",
          "couponCode",
          "discountValue",
          "discountType",
          "discountAmount",
          "total_amount",
          "RRN",
          "paymenttype",
          "createdAt",
          "OriginalTrxnIdentifier",
          "is_free",
          "adminfee",
          "ticket_cancel_id",
          "ticket_status",
        ],
        include: [
          {
            model: User,
            attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
            where: userFilters,
            required: Object.keys(userFilters).length > 0,
          },
          {
            model: AddonBook,
            where: {
              event_id: eventID,
              ticket_status: { [Op.not]: null },
            },
            include: { model: Addons },
            attributes: ["id", "fname", "lname"],
            required: true,
          },
        ],
        order: [["id", "DESC"]],
      });
    } else {
      return [];
    }
    // return totalOrders
    // Process the data
    const data = totalOrders.flatMap((order) => {
      const result = [];

      // Process ticket orders only if ticketType is "ticket"
      if (ticketType === "ticket" && order.TicketBooks.length > 0) {
        order.TicketBooks.forEach((ticket) => {
          result.push({
            eventName: eventName,
            orderid: order.id,
            orderrrn: order.OriginalTrxnIdentifier,
            name: `${order.User?.FirstName || ""} ${order.User?.LastName || ""
              }`,
            email: order.User?.Email || "",
            mobile: order.User?.PhoneNumber || "",
            ticketName: ticket.EventTicketType?.title, // Ticket name
            price: ticket.EventTicketType?.price, // Ticket price
            Currency_symbol: event.Currency.Currency_symbol,
            ticketType: "Ticket", // Mark as Ticket
            orderDate: new Date(order.createdAt).toISOString(),
          });
        });
      }

      // Process addon orders only if ticketType is "addon"
      else if (ticketType === "addon" && order.AddonBooks.length > 0) {
        order.AddonBooks.forEach((addon) => {
          result.push({
            eventName: eventName,
            orderid: order.id,
            orderrrn: order.OriginalTrxnIdentifier,
            name: `${order.User?.FirstName || ""} ${order.User?.LastName || ""
              }`,
            email: order.User?.Email || "",
            mobile: order.User?.PhoneNumber || "",
            ticketName: addon.Addon?.name, // Addon name
            price: addon.Addon?.price, // Addon price
            Currency_symbol: event.Currency.Currency_symbol,
            ticketType: "Addon", // Mark as Addon
            orderDate: new Date(order.createdAt).toISOString(),
          });
        });
      }

      return result;
    });

    return res.json({
      success: true,
      message: "View Cancel tickets list Successfully!",
      data,
      count: data.length,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: [],
      count: 0,
    });
  }
}

// Cancel Orders find
export async function eventCancelOrder({ eventName }, res) {
  try {
    const event = await Event.findOne({
      attributes: ["id"],
      where: {
        Name: {
          [Op.like]: `%${eventName}%`, // Use Sequelize's LIKE operator
        },
      },
    });

    const eventID = event.id;
    const orders = await Orders.findAll({
      attributes: [
        "id",
        "actualamount",
        "couponCode",
        "discountValue",
        "discountType",
        "discountAmount",
        "total_amount",
        "RRN",
        "paymenttype",
        "createdAt",
        "OriginalTrxnIdentifier",
        "is_free",
        "adminfee",
        "ticket_cancel_id",
        "refund_reason",
        "cancel_date",
      ],
      where: {
        [Op.or]: [
          { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
          { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        ],
        ticket_status: { [Op.not]: null },
      },
      include: [
        {
          model: User,
          attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
        },
      ],
      order: [["cancel_date", "DESC"]],
      raw: true, // This will return plain objects instead of Sequelize instances
    });

    let data = [];
    let ticketCount = 0;
    let addonCount = 0;
    for (let order of orders) {
      let tick1, ticket_addons;

      if (eventName) {
        // Assuming eventName is defined elsewhere
        tick1 = await BookTicket.findOne({
          where: { order_id: order.id, event_id: eventID },
          include: [
            { model: Event, include: [Currency] },
            { model: EventTicketType },
          ],
          order: [["id", "DESC"]],
          raw: true,
        });

        // count for event cancel tickets
        ticketCount = await BookTicket.findAll({
          where: {
            event_id: eventID,
            ticket_status: { [Op.not]: null },
          },
        });

        // console.log("==================ticketCount", ticketCount.length)

        ticket_addons = await AddonBook.findAll({
          where: { order_id: order.id, event_id: eventID },
          include: [{ model: Addons }, { model: Event, include: [Currency] }],
          // group: ['addons_id'],
          order: [["created", "DESC"]],
          raw: true,
        });

        // count for event cancel Addons
        addonCount = await AddonBook.findAll({
          where: { event_id: eventID, ticket_status: { [Op.not]: null } },
        });
      } else {
        tick1 = await BookTicket.findOne({
          where: { order_id: order.id },
          include: [
            { model: Event, include: [Currency] },
            { model: EventTicketType },
          ],
          // order: [['id', 'DESC']],
          raw: true,
        });

        ticket_addons = await AddonBook.findAll({
          where: { order_id: order.id },
          group: ["addons_id"],
          include: [{ model: Addons }, { model: Event, include: [Currency] }],
          order: [["created", "DESC"]],
          raw: true,
        });
      }

      if (tick1 || ticket_addons.length) {
        let order_data = {
          eventName: tick1
            ? tick1["Event.Name"]
            : ticket_addons[0]["Event.Name"],
          orderid: order.id,
          tickettotal: await BookTicket.count({
            where: { order_id: order.id },
          }),
          ticketaddontotal: await AddonBook.count({
            where: { order_id: order.id },
          }),
          orderrrn: order.OriginalTrxnIdentifier,
          name: `${order["User.FirstName"]} ${order["User.LastName"]}`,
          email: order["User.Email"],
          mobile: order["User.PhoneNumber"],
          currencysign: tick1
            ? tick1["Event.Currency.Currency_symbol"]
            : ticket_addons[0]["Event.Currency.Currency_symbol"],
          currencyvalue: tick1
            ? tick1["Event.Currency.Currency"]
            : ticket_addons[0]["Event.Currency.Currency"],
          couponcode: order.couponCode || false,
          afterdiscount: order.total_amount,
          total_include_tax: order.total_amount,
          totalamount: order.actualamount,
          stripekey: order.RRN,
          paymenttype: order.paymenttype,
          tax_percentage: order.adminfee ? order.adminfee : 0,
          actualamount: order.actualamount ? order.actualamount : 0,
          orderDate: new Date(order.createdAt).toISOString(),
          discountValue: order.discountValue || 0,
          discountAmount: order.discountAmount || 0,
          discountType: order.discountType || "",
          is_free_ticket: order?.is_free == 1 ? true : false,
          ticket_cancel_id: order.ticket_cancel_id,
          refund_reason: order.refund_reason,
        };

        data.push(order_data);
      }
    }

    // Modify the response format
    return res.json({
      // statusCode: 200,
      success: true,
      message: "View Cancel Orders Successfully!",
      data: data,
      count: data.length,
      ticketCount: ticketCount.length,
      addonCount: addonCount.length,
      // orders,
    });
  } catch (error) {
    return res.json({
      statusCode: 200,
      success: false,
      message: error.message,
      data: [],
      count: 0,
    });
  }
}

// Search cancel Orders
export async function searchCancelOrder(
  {
    email,
    startDate,
    endDate,
    eventName,
    name,
    lname,
    mobile,
    orderId,
    ticket_status,
  },
  res
) {
  let orderConditions = {};

  // Date filters using SQL DATE function
  if (startDate || endDate) {
    orderConditions.createdAt = {};

    if (startDate) {
      const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0));
      orderConditions.createdAt[Op.gte] = startOfDay;
    }

    if (endDate) {
      const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59));
      orderConditions.createdAt[Op.lte] = endOfDay;
    }
  }

  // Order ID filter
  if (orderId) {
    orderConditions.OriginalTrxnIdentifier = {
      [Op.like]: `%${orderId.trim().toUpperCase()}%`,
    };
  }

  // Cancel Order filter
  if (ticket_status) {
    orderConditions.ticket_status = {
      [Op.like]: `%${ticket_status.trim().toUpperCase()}%`,
    };
  }

  // Email filter
  if (email) {
    orderConditions["$User.Email$"] = {
      [Op.like]: `%${email.trim().toUpperCase()}%`,
    };
  }

  // Mobile filter
  if (mobile) {
    orderConditions["$User.PhoneNumber$"] = mobile;
  }

  // Name filter
  if (name) {
    orderConditions["$User.FirstName$"] = {
      [Op.like]: `%${name.trim().toUpperCase()}%`,
    };
  }

  // Last name filter
  if (lname) {
    orderConditions["$User.LastName$"] = {
      [Op.like]: `%${lname.trim().toUpperCase()}%`,
    };
  }

  try {
    const orders = await Orders.findAll({
      attributes: [
        "id",
        "actualamount",
        "couponCode",
        "discountValue",
        "discountType",
        "discountAmount",
        "total_amount",
        "RRN",
        "paymenttype",
        "createdAt",
        "OriginalTrxnIdentifier",
        "is_free",
        "adminfee",
        "ticket_cancel_id",
        "ticket_status",
        "refund_reason",
      ],
      where: {
        [Op.or]: [
          { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
          { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        ],
        ticket_status: "cancel",
        ...orderConditions,
      },
      include: [
        {
          model: User,
          attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const dataPromises = orders.map(async (order) => {
      let ticket;

      if (eventName) {
        // Check for BookTicket by event name
        ticket = await BookTicket.findOne({
          where: { order_id: order.id },
          include: [
            {
              model: Event,
              where: { Name: { [Op.like]: `%${eventName.trim()}%` } },
              include: [Currency],
            },
          ],
          order: [["id", "DESC"]],
        });

        // If no BookTicket, check for AddonBook by event name
        if (!ticket) {
          ticket = await AddonBook.findOne({
            where: { order_id: order.id },
            include: [
              { model: Addons },
              {
                model: Event,
                where: { Name: { [Op.like]: `%${eventName.trim()}%` } },
                include: [Currency],
              },
            ],
          });
        }
      } else {
        // If no event name is provided, search all tickets and addons for the order
        ticket = await BookTicket.findOne({
          where: { order_id: order.id },
          include: [{ model: Event, include: [Currency] }],
          order: [["id", "DESC"]],
        });

        if (!ticket) {
          ticket = await AddonBook.findOne({
            where: { order_id: order.id },
            include: [{ model: Addons }, { model: Event, include: [Currency] }],
          });
        }
      }

      // If no ticket or addon is found, return null
      if (!ticket) return null;

      // Count total tickets and addons for the order
      const tickettotal = await BookTicket.count({
        where: { order_id: order.id },
      });
      const ticketaddontotal = await AddonBook.count({
        where: { order_id: order.id },
      });

      // Return the required event and order details
      return {
        eventName: ticket.Event.dataValues.Name,
        orderid: order.id,
        eventLocation: ticket.Event.dataValues.Country,
        eventStartDateTime: ticket.Event.dataValues.StartDate,
        eventEndDateTime: ticket.Event.dataValues.EndDate,
        currencysign: ticket.Event.Currency.dataValues.Currency_symbol,
        currencyvalue: ticket.Event.Currency.dataValues.Currency,
        orderrrn: order.OriginalTrxnIdentifier,
        // Optimized user information with fallback values in case `User` is null
        name: `${order.User?.FirstName || "Unknown"} ${order.User?.LastName || "User"
          }`,
        email: order.User?.Email || "No email provided",
        mobile: order.User?.PhoneNumber || "",
        totalamount: order.total_amount,
        stripekey: order.RRN || "N/A",
        paymenttype: order.paymenttype || "Unknown",
        orderDate: new Date(order.createdAt).toISOString(),
        actualamount: order.actualamount || 0,
        couponcode: order.couponCode || false,
        afterdiscount: order.total_amount,
        total_include_tax: order.total_amount,
        tax_percentage: order.adminfee ? order.adminfee : 0,
        discountValue: order.discountValue || 0,
        discountAmount: order.discountAmount || 0,
        discountType: order.discountType || "",
        ticket_cancel_id: order.ticket_cancel_id,
        is_free_ticket: order?.is_free == 1 ? true : false,
        ticket_status: order?.dataValues?.ticket_status || null,
        ticket_cancel_id: order?.dataValues?.ticket_cancel_id || null,
        tickettotal,
        ticketaddontotal,
        refund_reason: order.refund_reason,
      };
    });

    const data = (await Promise.all(dataPromises)).filter(
      (orderData) => orderData !== null
    );

    // Return the result
    return res.json({
      statusCode: 200,
      success: true,
      message: "View Events Successfully!",
      data: data,
      count: data.length,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
}

// Create Tickets and addons
export async function addTicketsAddons(
  {
    eventId,
    ticketType,
    name,
    sortName,
    price,
    quantity = 0,
    startDate,
    endDate,
    time,
    useDate,
    location,
    dressCode,
    description,
    ticketOrder
  },
  filename,
  res
) {
  try {
    let savedData;
    let message; // Variable to store the success message
    const safeQuantity = parseInt(quantity) || 0;

    if (ticketType == "ticket") {
      // Save to EventTicketType table
      savedData = await EventTicketType.create({
        eventid: eventId,
        title: name,
        ticket_image: filename,
        count: safeQuantity,
        price: price,
        description: description,
        sale_start_date: startDate,
        sale_end_date: endDate,
        display_order: ticketOrder
      });

      message = "Ticket Added Successfully!";

    } else if (ticketType == "addon") {
      // Save to Addons table
      savedData = await Addons.create({
        event_id: eventId,
        name: name,
        sortName: sortName,
        // addon_name,
        price: price,
        description: description,
        addon_time: time,
        addon_location: location,
        addon_dress_code: dressCode,
        sale_start_date: startDate,
        sale_end_date: endDate,
        addon_image: filename, // Assuming Addons table has a similar field
        addon_day: useDate,
        // count: quantity,
        count: safeQuantity,
        display_order: ticketOrder

      });
      message = "Addon Added Successfully!";

    } else if (ticketType == "special") {
      // Save to Addons table
      savedData = await Addons.create({
        event_id: eventId,
        name: name,
        sortName: sortName,
        // addon_name,
        price: price,
        // count,
        // addon_image,
        description: description,
        addon_time: time,
        addon_location: location,
        addon_dress_code: dressCode,
        sale_start_date: startDate,
        sale_end_date: endDate,
        addon_type: "Special",
        addon_image: filename, // Assuming Addons table has a similar field
        addon_day: useDate,
        // count: quantity,
        count: safeQuantity,
        display_order: ticketOrder

      });
      message = " Special Addon Added Successfully!";
    } else {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Invalid ticketType. Please specify 'ticket' or 'addon'.",
      };
    }
    return {
      statusCode: StatusCodes.OK,
      success: true,
      message: message,
      id: savedData.id,
    };
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      error: error.message,
    };
  }
}

// Find Ticket and addons

export async function findAllTicketsAndAddons({ eventId }, res) {
  try {
    // Fetch tickets
    const tickets = await EventTicketType.findAll({
      where: { eventid: eventId },
      attributes: [
        "id",
        "title",
        "ticket_image",
        "quantity",
        "price",
        "description",
        "sale_start_date",
        "sale_end_date",
        "status",
        "display_order",
        "count",
      ],
      order: [["id", "DESC"]],
    });

    // Fetch Event info with timezone + currency
    const EventInfo = await Event.findOne({
      where: { id: eventId },
      attributes: ["id", "Name", "EventTimeZone"],
      include: {
        model: Currency,
        attributes: ["id", "Currency", "Currency_symbol"],
      },
    });

    const CurrencySymbol = EventInfo?.Currency?.dataValues?.Currency_symbol || "";
    const EventTimeZone = EventInfo?.EventTimeZone || "UTC";

    // Helper: format DB date into event timezone (readable + safe)
    const formatDateToTZ = (date) =>
      date
        ? moment.utc(date).tz(EventTimeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;

    // Standardize tickets
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      name: ticket.title,
      image: ticket.ticket_image,
      count: ticket.count,
      price: ticket.price,
      description: ticket.description,
      startDate: (ticket.sale_start_date),
      endDate: (ticket.sale_end_date),
      ticketType: "Ticket",
      status: ticket.status,
      ticketOrder: ticket.display_order,
      currency: CurrencySymbol,
      EventTimeZone,
    }));

    // Fetch addons
    const addons = await Addons.findAll({
      where: { event_id: eventId },
      attributes: [
        "id",
        "name",
        "sortName",
        "price",
        "description",
        "addon_time",
        "addon_location",
        "addon_dress_code",
        "sale_start_date",
        "sale_end_date",
        "addon_image",
        "status",
        "addon_day",
        "count",
        "display_order",
        "addon_type",
      ],
      order: [["id", "DESC"]],
    });

    // Standardize addons
    const formattedAddons = addons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      image: addon.addon_image,
      price: addon.price,
      description: addon.description,
      startDate: (addon.sale_start_date),
      endDate: (addon.sale_end_date),
      location: addon.addon_location,
      ticketType: addon.addon_type === "Special" ? "Special" : "Addon",
      status: addon.status,
      useDate: addon.addon_day,
      time: addon.addon_time,
      count: addon.count,
      ticketOrder: addon.display_order,
      currency: CurrencySymbol,
      EventTimeZone,
    }));

    // Merge
    const combinedData = [...formattedTickets, ...formattedAddons];

    return {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Data fetched successfully!",
      data: combinedData,
    };
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error.message,
    };
  }
}


// Deleted Event ticket and addons
export async function DeleteTicketAddon(req, res) {
  try {
    const { ticketType, id } = req;

    if (!ticketType || !id) {
      return {
        success: false,
        message: "Missing ticketType or id in request body.",
      };
    }
    let deletedData;
    let message;
    if (ticketType == "Ticket") {
      // Delete from EventTicketType table
      deletedData = await EventTicketType.destroy({
        where: { id: id },
      });
      message = "Ticket deleted successfully!";
    } else if (ticketType == "Addon") {
      // Delete from Addons table
      deletedData = await Addons.destroy({
        where: { id: id },
      });
      message = "Addon deleted successfully!";
    }
    //  else if (ticketType === "special") {
    //   // Delete from Addons table with addon_type 'Special'
    //   deletedData = await Addons.destroy({ where: { id, addon_type: "Special" } });
    //   message = "Special Addon deleted successfully!";
    // }
    else {
      return {
        success: false,
        message: "Invalid ticketType. Please specify 'ticket', 'addon', or 'special'.",
      };
    }
    return {
      success: true,
      message,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}


// view one ticket and addon details
export async function viewTicketDetails(req, res) {
  try {
    const { ticketType, ticket_id } = req;
    let ticketData;

    // Fetch data for Ticket type
    if (ticketType === 'Ticket') {
      // Query the EventTicketType table
      ticketData = await EventTicketType.findOne({
        where: { id: ticket_id },
        attributes: [
          "id",
          "title",
          "ticket_image",
          "quantity",
          "price",
          "description",
          "sale_start_date",
          "sale_end_date",
          "display_order",
          "count"
        ],
      });

      if (!ticketData) {
        return { message: "Ticket not found" };
      }

      // Standardize ticket data response
      ticketData = {
        id: ticketData.id,
        name: ticketData.title,
        image: ticketData.ticket_image,
        count: ticketData.count,
        price: ticketData.price,
        description: ticketData.description,
        startDate: ticketData.sale_start_date,
        endDate: ticketData.sale_end_date,
        location: ticketData.location,
        ticketType: "ticket", // Add ticketType as 'Ticket'
        ticketOrder: ticketData.display_order
      };

    }
    // Fetch data for Addon type
    else if (ticketType === 'Addon') {
      // Query the Addons table
      ticketData = await Addons.findOne({
        where: { id: ticket_id },
        attributes: [
          "id",
          "name",
          "sortName",
          "price",
          "description",
          "addon_time",
          "addon_location",
          "addon_dress_code",
          "sale_start_date",
          "sale_end_date",
          "addon_image",
          "addon_day",
          "count",
          "display_order"
        ],
      });

      if (!ticketData) {
        return { message: "Addon not found" };
      }

      // Standardize addon data response
      ticketData = {
        id: ticketData.id,
        name: ticketData.name,
        image: ticketData.addon_image,
        price: ticketData.price,
        description: ticketData.description,
        startDate: ticketData.sale_start_date,
        endDate: ticketData.sale_end_date,
        location: ticketData.addon_location,
        dressCode: ticketData.addon_dress_code,
        sortName: ticketData.sortName,
        ticketType: "addon", // Add ticketType as 'Addon'
        useDate: ticketData.addon_day,
        time: ticketData.addon_time,
        count: ticketData.count,
        ticketOrder: ticketData.display_order


      };

    } else if (ticketType === 'Special') {
      // Query the Addons table
      ticketData = await Addons.findOne({
        where: { id: ticket_id },
        attributes: [
          "id",
          "name",
          "sortName",
          "price",
          "description",
          "addon_time",
          "addon_location",
          "addon_dress_code",
          "sale_start_date",
          "sale_end_date",
          "addon_image",
          "addon_day",
          "count",
          "display_order"
        ],
      });

      if (!ticketData) {
        return { message: "Addon not found" };
      }

      // Standardize addon data response
      ticketData = {
        id: ticketData.id,
        name: ticketData.name,
        image: ticketData.addon_image,
        price: ticketData.price,
        description: ticketData.description,
        startDate: ticketData.sale_start_date,
        endDate: ticketData.sale_end_date,
        location: ticketData.addon_location,
        dressCode: ticketData.addon_dress_code,
        sortName: ticketData.sortName,
        ticketType: "special", // Add ticketType as 'Addon'
        useDate: ticketData.addon_day,
        time: ticketData.addon_time,
        count: ticketData.count,
        ticketOrder: ticketData.display_order
      };
    }
    else {
      return { message: "Invalid ticket type" };
    }

    // Return the formatted ticket or addon data
    return {
      success: true,
      message: "Ticket data fetched successfully!",
      data: ticketData,
    };

  } catch (err) {
    console.log("Error:", err.message);
    return { message: "Internal Server Error" };
  }
}


// Update Tickets and Addons 
export async function updateTicketsAddons(
  { id,
    eventId,
    ticketType,
    name,
    sortName,
    price,
    quantity,
    startDate,
    endDate,
    time,
    useDate,
    location,
    dressCode,
    description,
    ticketOrder
  },
  filename,
  res
) {
  try {
    let updatedData;
    let message; // Variable to store the success message
    const safeQuantity = parseInt(quantity) || 0;
    if (ticketType === "ticket") {
      // Update EventTicketType table
      updatedData = await EventTicketType.findOne({
        where: { id: id },
      });

      if (!updatedData) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: "Ticket not found!",
        };
      }

      // Update the ticket record with the new values
      updatedData = await updatedData.update({
        title: name,
        ticket_image: filename,
        // count: quantity,
        count: safeQuantity,
        price: price,
        description: description,
        sale_start_date: startDate,
        sale_end_date: endDate,
        display_order: ticketOrder
      });
      message = "Ticket Updated Successfully!";
    } else if (ticketType === "addon") {
      // Update Addons table
      updatedData = await Addons.findOne({
        where: { id: id },
      });

      if (!updatedData) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: "Addon not found!",
        };
      }

      // Update the addon record with the new values
      updatedData = await updatedData.update({
        name: name,
        sortName: sortName,
        price: price,
        description: description,
        addon_time: time,
        addon_location: location,
        addon_dress_code: dressCode,
        sale_start_date: startDate,
        sale_end_date: endDate,
        addon_image: filename,
        addon_day: useDate,
        // count: quantity,
        count: safeQuantity,
        display_order: ticketOrder
      });
      message = "Addon Updated Successfully!";
    } else if (ticketType === "special") {
      // Update Addons table for special addon
      updatedData = await Addons.findOne({
        where: { id: id, event_id: eventId },
      });
      if (!updatedData) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: "Special Addon not found!",
        };
      }
      // Update the special addon record with the new values
      updatedData = await updatedData.update({
        name: name,
        sortName: sortName,
        price: price,
        description: description,
        addon_time: time,
        addon_location: location,
        addon_dress_code: dressCode,
        sale_start_date: startDate,
        sale_end_date: endDate,
        addon_type: "Special", // Ensure it's marked as "Special"
        addon_image: filename, // Update only if new filename is provided
        count: safeQuantity,
        display_order: ticketOrder
      });
      message = "Special Addon Updated Successfully!";
    } else {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Invalid ticketType. Please specify 'ticket' or 'addon'.",
      };
    }
    return {
      statusCode: StatusCodes.OK,
      success: true,
      message: message,
      id: updatedData.id,
    };
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error.message,
    };
  }
}


// Deleted Event (Event,Addons,Event_Ticket_Type)
export async function DeleteEvent(req, res) {
  try {
    const { eventId } = req;
    if (!eventId) {
      return {
        success: false,
        message: "Missing eventId in request body.",
      };
    }
    // Check if there are any orders associated with the event
    const orderInfo = await Orders.findOne({ where: { event_id: eventId } });
    if (orderInfo) {
      return {
        success: false,
        message: "Cannot delete the event. Orders are associated with this event.",
      };
    }

    // Delete related records from Addons table
    const deletedAddons = await Addons.destroy({
      where: { event_id: eventId },
    });

    // Delete related records from EventTicketType table
    const deletedTicketTypes = await EventTicketType.destroy({
      where: { eventid: eventId },
    });

    // Delete the event from Event table
    const deletedEvent = await Event.destroy({
      where: { id: eventId },
    });

    // Check if the event exists before deletion
    if (deletedEvent === 0) {
      return {
        success: false,
        message: "No event found with the provided eventId.",
      };
    }
    return {
      success: true,
      message: "Event and related data deleted successfully!",
      data: {
        deletedAddons,
        deletedTicketTypes,
        deletedEvent,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}



// Publish Event
export async function publishEvent(req, res) {
  const { eventId } = req; // Extract eventId from the request body
  try {
    // Find the event by its ID
    const event = await Event.findOne({
      where: { id: eventId },
      attributes: ['id', 'status']
    });
    if (!event) {
      return {
        success: false,
        message: "Event not found with the provided eventId.",
      };
    }
    // Toggle the event status
    const newStatus = event.status == "Y" ? "N" : "Y";
    // Update the event's status
    await Event.update({ status: newStatus }, { where: { id: eventId } });
    return {
      success: true,
      message: `Event publish successfully!`,
    };
  } catch (error) {
    // Handle errors and send an error response
    console.error("Error updating event status:", error);
    return {
      success: false,
      message: "An error occurred while updating the event status.",
    };
  }
}


// update Status for ticket and addons(Active nad inactive)
export async function updateStatus(req, res) {
  const { id, ticketType } = req; // Extract id and ticketType from the request body

  try {
    let updatedData;
    let message;

    // Step 1: Update the status in the appropriate table based on ticketType
    if (ticketType === "Ticket") {
      // Update EventTicketType table
      updatedData = await EventTicketType.findOne({ where: { id: id } });

      if (!updatedData) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found!",
        });
      }

      // Toggle the status for the ticket
      const newStatus = updatedData.status === "Y" ? "N" : "Y";
      await updatedData.update({ status: newStatus });
      message = "Ticket status updated successfully!";
    } else if (ticketType === "Addon") {
      // Update Addons table
      updatedData = await Addons.findOne({ where: { id: id } });

      if (!updatedData) {
        return {
          success: false,
          message: "Addon not found!",
        };
      }
      // Toggle the status for the addon
      const newStatus = updatedData.status === "Y" ? "N" : "Y";
      await updatedData.update({ status: newStatus });
      message = "Addon status updated successfully!";
    } else {
      return {
        success: false,
        message: "Invalid ticketType. Please specify 'ticket' or 'addon'.",
      };
    }

    // Step 2: Return a success response
    return {
      success: true,
      message: message,
      ticketType: ticketType,
      status: updatedData.status, // Return the updated status
    };
  } catch (error) {
    // Handle errors and send an error response
    console.error("Error updating ticket/addon status:", error);
    return {
      success: false,
      message: "An error occurred while updating the status.",
      error: error.message,
    };
  }
}


//... update event status(30-05-2025 - kamal)
export async function updateEventStatus(req, res) {
  try {
    const { id } = req;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required.",
      });
    }
    const event = await Event.findOne({ where: { id }, attributes: ['id', 'status'] });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }
    const newStatus = event.status === "Y" ? "N" : "Y";
    await event.update({ status: newStatus });
    return res.status(200).json({
      success: true,
      message: `Event status updated successfully.`,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the event status.",
      error: error.message,
    });
  }
}




















