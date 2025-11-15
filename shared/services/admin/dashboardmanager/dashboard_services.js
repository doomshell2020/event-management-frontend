import { sequelize } from "@/database/connection"; // Import the named export
import { Op, fn, col } from "sequelize";
import {
  InvitationEvent,
  User,
  Event,
  BookTicket,
  EventTicketType,
  Addons,
  AddonBook,
  Order,
  Orders,
  Currency,
  MyOrders,
  MyTicketBook,
  EventStaffMember,
  AccommodationBookingInfo,
  BookAccommodationInfo,
  Housing,
  HousingNeighborhood,
  AccommodationExtension
} from "@/database/models";

export async function getSalesTicTypeEventId({ eventId }, req, res) {

  try {
    // Find the event based on the event ID
    const event = await Event.findOne({
      include: [{ model: Currency }],
      where: { id: eventId },
      attributes: ["id", "Name", "status"],
    });

    if (!event) {
      return {
        statusCode: 400,
        success: false,
        data: {
          ticketSalesData: [],
          tierWiseTicketSalesArray: [],
          tierWiseAddonSalesArray: [],
          last10UsersRegisters: [],
        },
      };
    }

    // ##############################Total Orders Start##############################
    const totalTicketFind = await MyTicketBook.findAll({
      where: {
        event_id: eventId,
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
        event_id: eventId,
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

    // ##############################Total Orders End##############################

    const totalOrders = await MyOrders.findAll({
      where: {
        id: { [Op.in]: totalUniqueOrdersIds },
        // [Op.or]: [
        //   { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
        //   { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        // ],
        // ticket_status: { [Op.is]: null },
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
            event_id: eventId,
          },
          attributes: ["id", "event_ticket_id"], // No need to select attributes from BookTicket
          required: false,
        },
        {
          model: AddonBook,
          where: {
            // ticket_status: null,
            event_id: eventId,
          },
          attributes: ["id"], // No need to select attributes from AddonBook
          required: false,
        },
      ],
      // oder by id desc
      order: [["id", "DESC"]],
      // group: ["MyOrders.id"], // Group by orders.id
    });

    let priceInfo = {
      total_amount: 0,
      total_taxes: 0,
      gross_total: 0,
    };

    totalOrders.forEach((order) => {
      let amountAfterDiscount = order.actualamount;

      if (order.couponCode) {
        amountAfterDiscount -= order.discountAmount; // Apply the discount if a coupon code exists
      }
      const taxAmount = Math.round(
        (amountAfterDiscount * order.adminfee) / 100
      ); // Calculate tax amount
      // console.log(
      //   ">>>>>>>>>>>",
      //   taxAmount,
      //   amountAfterDiscount + taxAmount,
      //   order.id
      // );

      // Accumulate the values into priceInfo
      priceInfo.total_amount += amountAfterDiscount;
      priceInfo.total_taxes += taxAmount;
      priceInfo.gross_total += order.total_amount;
    });

    const totalOrdersCount = totalUniqueOrdersIds.length;
    let ticketInfo;
    let cancelAmount;
    if (eventId == 111) {
      ticketInfo = await summarizeTicketAddonValues2025(event);
      cancelAmount = await getTotalCancelAmount(111)
    } else {
      ticketInfo = await summarizeTicketAddonValues(event);
      cancelAmount = await getTotalCancelAmount(eventId)
    }

    return {
      success: true,
      data: {
        event,
        priceInfo,
        ticketInfo,
        totalOrdersCount,
        cancelAmount,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return {
      statusCode: 500,
      success: false,
      message:
        "An error occurred while fetching the data Error:" + error.message,
    };
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

export async function summarizeTicketAddonValues2025(eventInfo) {
  const eventId = eventInfo.id;
  const currencySymbol = eventInfo.Currency.Currency_symbol;

  const ticket_price_info = {
    total_amount: 0,
    total_ticket_counts: 0,
    total_ticket_limit: 0,
  };

  const addon_price_info = {
    total_amount: 0,
    total_ticket_counts: 0,
    total_addon_limit: 0,
  };

  // --- accumulators ---
  let totalDiscountAmount = 0;
  let totalTicketAmount = 0;
  let totalTicketTax = 0;
  let totalAddonAmount = 0;
  let totalAddonTax = 0;
  let grandTickAddonIncludeTaxes = 0;
  let grandTickAddonWithoutTaxes = 0;
  let grandTickAddonTaxes = 0;

  const orderInfo = await MyOrders.findAll({
    where: {
      event_id: eventId,
      [Op.or]: [
        { is_free: { [Op.is]: null } },
        { couponCode: { [Op.not]: null } },
      ],
    },
    include: [
      {
        model: User,
        attributes: [],
      },
      { model: BookTicket, attributes: [] },
      { model: AddonBook, attributes: [] },
    ],
    attributes: [
      "id",
      "createdAt",
      "totalAddonAmount",
      "totalAddonTax",
      "totalTicketAmount",
      "totalTicketTax",
      "discountAmount",
    ],
  });

  // accumulate values
  orderInfo.forEach((single) => {
    totalDiscountAmount += Math.round(parseFloat(single.discountAmount) || 0);
    totalTicketAmount += Math.round(parseFloat(single.totalTicketAmount) || 0);
    totalTicketTax += Math.round(parseFloat(single.totalTicketTax) || 0);
    totalAddonAmount += Math.round(parseFloat(single.totalAddonAmount) || 0);
    totalAddonTax += Math.round(parseFloat(single.totalAddonTax) || 0);
  });

  grandTickAddonIncludeTaxes = (totalTicketAmount + totalTicketTax + totalAddonAmount + totalAddonTax) - (totalDiscountAmount);
  grandTickAddonWithoutTaxes = (totalTicketAmount + totalAddonAmount) - (totalDiscountAmount);
  grandTickAddonTaxes = (totalTicketTax + totalAddonTax);


  // --- Tickets ---
  const findAllTickets = await MyTicketBook.findAll({
    where: { event_id: eventId },
    attributes: ["id", "event_ticket_id"],
    include: [
      {
        model: EventTicketType,
        attributes: ["id", "ticket_name", "price", "count"],
      }
    ],
  });


  const tickets = Object.values(
    findAllTickets.reduce((acc, order) => {
      const {
        EventTicketType: { id, ticket_name, price, count },
      } = order;

      const key = id;
      if (!acc[key]) {
        acc[key] = {
          ticket_type: "Ticket",
          ticket_name: `${ticket_name} (${currencySymbol}${price})`,
          event_ticket_id: id,
          ticket_actual_price: Number(price) || 0,
          total_sale: 0,
          total_count: count,
          total_amount: 0,
        };
      }

      acc[key].total_sale += 1;
      acc[key].total_amount = acc[key].total_sale * acc[key].ticket_actual_price;
      return acc;
    }, {})
  );

  // --- Addons ---
  const findAllAddons = await AddonBook.findAll({
    where: { event_id: eventId },
    attributes: ["id", "addons_id"],
    include: [
      {
        model: Addons,
        attributes: ["id", "name", "price", "count"],
      },
    ],
  });

  const addons = Object.values(
    findAllAddons.reduce((acc, order) => {
      const {
        Addon: { id, name, price, count },
      } = order;

      const key = id;
      if (!acc[key]) {
        acc[key] = {
          ticket_type: "Addon",
          ticket_name: `${name} (${currencySymbol}${price})`,
          id,
          ticket_actual_price: Number(price) || 0,
          total_sale: 0,
          total_count: count,
          total_amount: 0,
        };
      }

      acc[key].total_sale += 1;
      acc[key].total_amount = acc[key].total_sale * acc[key].ticket_actual_price;
      return acc;
    }, {})
  );

  // --- Totals for tickets ---
  tickets.forEach((ticket) => {
    ticket_price_info.total_amount += ticket.total_amount;
    ticket_price_info.total_ticket_counts += ticket.total_sale;
    ticket_price_info.total_ticket_limit += ticket.total_count;
  });

  // --- Totals for addons ---
  addons.forEach((addon) => {
    addon_price_info.total_amount += addon.total_amount;
    addon_price_info.total_ticket_counts += addon.total_sale;
    addon_price_info.total_addon_limit = addon.total_count;
  });


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

  const accommodationsInfo = {
    grandTotalAccommodationAmount,
    grandTotalAccommodationTax,
    grandTotalPaidAmount,
    grandTotalDueAmount
  }

  const totalOrderCount = orderInfo.length;

  // --- Sort tickets by price high → low
  tickets.sort((a, b) => b.ticket_actual_price - a.ticket_actual_price);


  return {
    paymentInfo: {
      accommodationsInfo,
      totalDiscountAmount,
      totalTicketAmount,
      totalTicketTax,
      totalAddonAmount,
      totalAddonTax,
      grandTickAddonIncludeTaxes,
      grandTickAddonWithoutTaxes,
      grandTickAddonTaxes
    },
    totalOrderCount,
    tickets,
    addons,
    ticket_price_info,
    addon_price_info,
  };
}


export async function summarizeTicketAddonValues(eventInfo) {
  const eventId = eventInfo.id;
  const currencySymbol = eventInfo.Currency.Currency_symbol;

  const ticket_price_info = {
    totalTax: 0,
    total_amount: 0,
    total_discount: 0,
    total_ticket_counts: 0,
    total_ticket_limit: 0,
  };

  const addon_price_info = {
    totalTax: 0,
    total_amount: 0,
    total_discount: 0,
    total_ticket_counts: 0,
    total_addon_limit: 0,
  };

  let totalDiscountedIds = [];

  // Fetch discounted orders
  const findDiscountedOrders = await MyTicketBook.findAll({
    where: {
      // ticket_status: { [Op.is]: null },
      event_id: eventId,
    },
    attributes: ["id", "amount", "event_ticket_id"],
    include: [
      {
        model: EventTicketType,
        attributes: ["id", "title", "ticket_name", "price", "count"],
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

  // const findDiscountedOrders = await MyTicketBook.findAll({
  //   where: {
  //     event_id: eventId,
  //   },
  //   attributes: ["id", "amount", "event_ticket_id"],
  //   include: [
  //     {
  //       model: EventTicketType,
  //       attributes: ["id", "title", "ticket_name", "price", "count"],
  //     },
  //     {
  //       model: MyOrders,
  //       where: {
  //         couponCode: { [Op.not]: null },
  //       },
  //       attributes: [
  //         "id",
  //         "OriginalTrxnIdentifier",
  //         "discountType",
  //         "discountAmount",
  //         "total_amount",
  //         "discountValue",
  //         "actualamount",
  //         "couponCode",
  //         "adminfee",
  //       ],
  //       required: true,
  //     },
  //   ],
  // });

  // ✅ Remove duplicate MyTicketBook rows by OriginalTrxnIdentifier
  // const seen = new Set();
  // const uniqueResults = [];

  // for (const item of findDiscountedOrders) {
  //   const trxId = item?.MyOrder?.OriginalTrxnIdentifier;
  //   if (trxId && !seen.has(trxId)) {
  //     seen.add(trxId);
  //     uniqueResults.push(item);
  //   }
  // }

  // Process discounted orders
  const discountedResult = Object.values(
    findDiscountedOrders.reduce((acc, order) => {
      const {
        MyOrder: {
          discountAmount,
          actualamount,
          adminfee,
          discountType,
          discountValue,
          id: myOrderId,
        },
        EventTicketType: { price: ticket_actual_price, ticket_name, count },
        event_ticket_id,
      } = order;

      totalDiscountedIds.push(myOrderId);

      const after_discount_ticket_price = ticket_actual_price - discountAmount;
      const key = `${discountAmount}_${event_ticket_id}`;

      // Compute ticket name with or without discount
      // const formattedTicketName =
      // discountAmount > 0
      // ? `${ticket_name} ($${ticket_actual_price} with $${discountAmount} Discount)`
      // : `${ticket_name} ($${ticket_actual_price})`;

      const formattedTicketName =
        discountAmount > 0
          ? order.MyOrder.discountType == "percentage"
            ? `${ticket_name} (${currencySymbol}${ticket_actual_price} with ${order.MyOrder.discountValue}% Discount - (${currencySymbol}${discountAmount}))`
            : `${ticket_name} (${currencySymbol}${ticket_actual_price} with ${currencySymbol}${discountAmount} Discount)`
          : `${ticket_name} (${currencySymbol}${ticket_actual_price})`;

      if (!acc[key]) {
        acc[key] = {
          myOrderId,
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
      acc[key].total_discount = acc[key].total_sale * acc[key].discountAmount; // Calculate total discount
      acc[key].myOrderId = myOrderId;
      if (after_discount_ticket_price > 0) {
        acc[key].totalTax += (after_discount_ticket_price * adminfee) / 100;
      }
      acc[key].total_count = count;
      return acc;
    }, {})
  );
  // return discountedResult;
  // Fetch tickets without discount
  const findAllTicketWithoutDiscount = await MyTicketBook.findAll({
    where: {
      // ticket_status: { [Op.is]: null },
      event_id: eventId,
    },
    attributes: ["id", "amount", "event_ticket_id"],
    include: [
      {
        model: EventTicketType,
        attributes: ["id", "title", "ticket_name", "price", "count"],
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
  // console.log('>>>>>>>>>>>>>',findAllTicketWithoutDiscount);

  // return findAllTicketWithoutDiscount

  // Process tickets without discount
  const withoutDiscountResult = Object.values(
    findAllTicketWithoutDiscount.reduce((acc, order) => {
      const {
        MyOrder: { actualamount, adminfee, id: myOrderId },
        EventTicketType: { price: ticket_actual_price, ticket_name, count },
        event_ticket_id,
      } = order;

      const discountAmount = 0; // No discount
      const after_discount_ticket_price = ticket_actual_price;
      const key = `${discountAmount}_${event_ticket_id}`;

      // Compute ticket name with or without discount
      const formattedTicketName =
        discountAmount > 0
          ? `${ticket_name} (${currencySymbol}${ticket_actual_price} with ${currencySymbol}${discountAmount} Discount)`
          : `${ticket_name} (${currencySymbol}${ticket_actual_price})`;

      if (!acc[key]) {
        acc[key] = {
          myOrderId,
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
      acc[key].totalTax += (after_discount_ticket_price * adminfee) / 100;
      acc[key].total_discount = acc[key].total_sale * acc[key].discountAmount;
      acc[key].total_count = count;
      acc[key].myOrderId = myOrderId;
      return acc;
    }, {})
  );
  // return withoutDiscountResult

  const findAllAddons = await AddonBook.findAll({
    where: {
      event_id: eventId,
      // ticket_status: { [Op.is]: null },
    },
    attributes: ["id", "price", "addons_id"],
    include: [
      {
        model: Addons,
        attributes: ["id", "name", "addon_name", "price", "count"],
        order: [["addon_type", "DESC"]], // Order Addons by `addon_type` in ascending order
      },
      {
        model: Orders,
        where: {
          [Op.or]: [
            { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
            { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
          ],
          // ticket_status: { [Op.is]: null },
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
      }
    ],
  });
  // return findAllAddons
  // Process tickets without discount
  const AddonsResult = Object.values(
    findAllAddons.reduce((acc, order) => {
      const {
        Order: { actualamount, adminfee, id: myOrderId },
        Addon: { price: ticket_actual_price, name: ticket_name, count, id },
      } = order;

      const discountAmount = 0; // No discount
      const after_discount_ticket_price = ticket_actual_price;
      const key = `${discountAmount}_${id}`;

      // Compute ticket name with or without discount
      const formattedTicketName =
        discountAmount > 0
          ? `${ticket_name} (${currencySymbol}${ticket_actual_price} with ${currencySymbol}${discountAmount} Discount)`
          : `${ticket_name} (${currencySymbol}${ticket_actual_price})`;

      if (!acc[key]) {
        acc[key] = {
          myOrderId,
          ticket_type: "Addon",
          ticket_name: formattedTicketName,
          id,
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
        acc[key].total_sale * acc[key].ticket_actual_price;
      acc[key].totalTax += (after_discount_ticket_price * adminfee) / 100;
      acc[key].total_discount = acc[key].total_sale * acc[key].discountAmount; // Calculate total discount (will be 0 here)
      acc[key].total_count = count;
      acc[key].myOrderId = myOrderId;
      return acc;
    }, {})
  );
  // return findAllAddons;

  // Separate results into tickets and addons
  const tickets = [...discountedResult, ...withoutDiscountResult];
  const addons = [...AddonsResult];
  // Calculate total amounts, tax, discounts, and counts for tickets
  tickets.forEach((ticket) => {
    // console.log('>>>>>>>>>>>ticket.totalTax',ticket.totalTax);

    ticket_price_info.total_amount += ticket.total_amount;
    ticket_price_info.totalTax += ticket.totalTax;
    ticket_price_info.total_discount += ticket.total_discount;
    ticket_price_info.total_ticket_counts += ticket.total_sale; // Count total tickets
    ticket_price_info.total_ticket_limit = ticket.total_count; // Count total tickets
  });

  // Calculate total amounts, tax, discounts, and counts for addons
  addons.forEach((addon) => {
    // console.log('>>>>>>>>>>>addon.total_count', addon.total_count++);

    addon_price_info.total_amount += addon.total_amount;
    addon_price_info.totalTax += addon.totalTax;
    addon_price_info.total_discount += addon.total_discount;
    addon_price_info.total_ticket_counts += addon.total_sale; // Count total addons
    // addon_price_info.total_addon_limit = addon.total_count; // change kamal(04-04-2025) count for addons according to dashboard
    addon_price_info.total_addon_limit += addon.total_count;
  });

  tickets.sort((a, b) => b.ticket_actual_price - a.ticket_actual_price);
  addons
    ? addons.sort((a, b) => b.addon_type - a.addon_type)
    : [];

  // tickets.sort((a, b) => a.discountAmount - b.discountAmount);
  // addons ? addons.sort((a, b) => a.discountAmount - b.discountAmount) : [];

  // Merge results
  return {
    tickets,
    addons,
    ticket_price_info,
    addon_price_info,
  };
}

export async function getTotalAmountAndDiscounts(eventInfo) {
  const eventId = eventInfo.id;

  let totalDiscountedIds = [];

  // Fetch discounted orders (similar to your original logic)
  const findDiscountedOrders = await MyTicketBook.findAll({
    where: {
      // ticket_status: null, 
      event_id: eventId
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
        attributes: ["id", "discountAmount", "actualamount", "adminfee"],
        required: true,
      },
    ],
  });

  // Process discounted orders
  const discountedResult = findDiscountedOrders.reduce(
    (acc, order) => {
      const {
        MyOrder: { discountAmount, actualamount, adminfee, id: myOrderId },
        EventTicketType: { price: ticket_actual_price },
      } = order;

      // Push discounted ticket ids into totalDiscountedIds array
      totalDiscountedIds.push(myOrderId);

      const after_discount_ticket_price =
        Math.round(ticket_actual_price) - Math.round(discountAmount);
      const total_sale = 1; // Each order represents one sale

      acc.total_amount += total_sale * after_discount_ticket_price;
      acc.total_discount += total_sale * Math.round(discountAmount);
      if (after_discount_ticket_price > 0) {
        acc.totalTax +=
          ((Math.round(actualamount) - Math.round(discountAmount)) * adminfee) /
          100;
      }

      return acc;
    },
    { total_amount: 0, total_discount: 0, totalTax: 0 }
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
  const withoutDiscountResult = findAllTicketWithoutDiscount.reduce(
    (acc, order) => {
      const {
        MyOrder: { actualamount, adminfee },
        EventTicketType: { price: ticket_actual_price },
      } = order;

      const total_sale = 1; // Each order represents one sale

      acc.total_amount += total_sale * Math.round(ticket_actual_price);
      acc.totalTax += Math.round((Math.round(actualamount) * adminfee) / 100);

      return acc;
    },
    { total_amount: 0, total_discount: 0, totalTax: 0 }
  );

  // Fetch addons (similar logic)
  const findAllAddons = await AddonBook.findAll({
    where: {
      event_id: eventId,
      // ticket_status: { [Op.is]: null } 
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
            { is_free: { [Op.is]: null } },
            { couponCode: { [Op.not]: null } },
          ],
          // ticket_status: null,
        },
        attributes: ["id", "actualamount", "adminfee"],
        required: true,
      },
    ],
  });

  // Process addons
  const addonsResult = findAllAddons.reduce(
    (acc, order) => {
      const {
        Order: { actualamount, adminfee },
        Addon: { price: addon_price },
      } = order;

      const total_sale = 1; // Each order represents one sale

      acc.total_amount += total_sale * Math.round(addon_price);
      acc.totalTax += Math.round((Math.round(actualamount) * adminfee) / 100);
      return acc;
    },
    { total_amount: 0, total_discount: 0, totalTax: 0 }
  );

  // Round the final results to remove floating point values
  return {
    total_amount: Math.round(
      discountedResult.total_amount +
      withoutDiscountResult.total_amount +
      addonsResult.total_amount
    ),
    total_discount: Math.round(
      discountedResult.total_discount + withoutDiscountResult.total_discount
    ),
    totalTax: Math.round(
      discountedResult.totalTax +
      withoutDiscountResult.totalTax +
      addonsResult.totalTax
    ),
  };
}


// View Last 10 Invitations
export async function View_InvitationsMembers(req) {
  const data = await InvitationEvent.findAll({
    // order: [["FirstName", "ASC"]],
    // where: {
    //     LastName: { [Op.not]: '' } // Filtering out empty FirstName
    // },
    order: [["createdAt", "DESC"]],
    include: [{ model: User }],
    where: { Status: 0 },
    limit: 10,
  });
  return {
    statusCode: 200,
    success: true,
    message: "View Last 10 Invitations Successfully!",
    data,
  };
}

// rupam view last 10 submit registration form
export async function view_SubmitApplication(req) {
  const data = await User.findAll({
    order: [["DateCreated", "DESC"]],
    attributes: [
      "id",
      "Email",
      "FirstName",
      "LastName",
      "DateCreated",
      "ImageURL",
    ],
    limit: 10,
  });
  return {
    statusCode: 200,
    success: true,
    message: "View Last 10 Submitted Applications Successfully!",
    data,
  };
}
// view All events
export async function view_Events(req) {
  const data = await Event.findAll({
    order: [["id", "DESC"]],
    attributes: ["id", "Name"],
  });
  return {
    statusCode: 200,
    success: true,
    message: "View All Events Successfully!",
    data,
  };
}

// view All events
export async function viewEventsIsDataAvailable(req, res) {
  const data = await Event.findAll({
    where: {
      IsDataAvailable: "Y",
    },
    order: [["id", "DESC"]],
    attributes: ["id", "Name"],
  });
  return {
    statusCode: 200,
    success: true,
    message: "View All Events Successfully!",
    data,
  };
}

export async function View_Pastevents(req) {
  const current_date = new Date();
  const data = await Event.findAll({
    where: {
      EndDate: {
        [Op.lte]: current_date,
      },
    },
    order: [["id", "DESC"]],
    limit: 10,
  });
  return {
    statusCode: 200,
    success: true,
    message: "View Past event Successfully!",
    data,
  };
}

//Rupam
export async function getTicketsSoldPerDayByEventId({ eventId }, req, res) {

  try {
    // Find the event based on the event ID
    const event = await Event.findOne({
      include: [{ model: Currency }],
      where: { id: eventId },
    });

    if (!event) {
      return {
        statusCode: 400,
        success: false,
        data: {
          ticketSalesData: [],
          tierWiseTicketSalesArray: [],
          tierWiseAddonSalesArray: [],
          last10UsersRegisters: [],
        },
      };
    }

    const orders = await Orders.findAll({
      attributes: [
        "id",
        "actualamount",
        "total_amount",
        "donationfee",
      ],
      where: {
        event_id: eventId,

      },
      order: [["id", "DESC"]],
      raw: true, // This will return plain objects instead of Sequelize instances
    });
    let total_revenue_amount = 0;
    let donation_total_amount = 0;
    for (let order of orders) {
      total_revenue_amount += parseFloat(order.total_amount) || 0;
      if (order.donationfee) {
        donation_total_amount +=
          Math.round(order.actualamount * (order.donationfee / 100)) || 0;
      }
    }

    const total_revenue = total_revenue_amount
    const currencySymbol = event.Currency.Currency_symbol
    const total_donation = donation_total_amount
    // ##############################Total Orders Start##############################
    const totalTicketFind = await MyTicketBook.findAll({
      where: {
        event_id: eventId,
        ticket_status: { [Op.is]: null },
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
            ticket_status: null,
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
        event_id: eventId,
        ticket_status: { [Op.is]: null },
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
            ticket_status: null,
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
    // ##############################Total Orders End##############################

    // Get ticket details for the event
    const ticketDetailsOpenSale = await EventTicketType.findAll({
      where: {
        eventid: event.id,
        type: "open_sales",
      },
      order: [["id", "ASC"]],
    });

    // Calculate tier-wise ticket sales (only for tickets in approved orders)
    const tierWiseTicketSalesArray = [];
    for (let i = 0; i < ticketDetailsOpenSale.length; i++) {
      const ticketType = ticketDetailsOpenSale[i];
      const ticketSold = await BookTicket.count({
        where: {
          event_id: event.id,
          ticket_status: { [Op.is]: null },
          event_ticket_id: ticketType.id,
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

      const tierSalesData = {
        // tier: `Tier-${i + 1}`,
        tier: ticketType.ticket_sort_name,
        tickets_sold: ticketSold || 0,
        total_ticket_count: ticketType.count || 0,
        per_ticket_price: ticketType.price || 0,
        ticket_name: ticketType.title || "Unknown",
        ticketId: ticketType.id || 0,
        currencysymbol: event.Currency.Currency_symbol || "Unknown",
        currencyname: event.Currency.Currency || "Unknown",
      };
      tierWiseTicketSalesArray.push(tierSalesData);
    }

    // Addon tier-wise sales calculation (only for addons in approved orders)
    const addonDetails = await Addons.findAll({
      where: {
        event_id: event.id,
      },
      order: [["id", "ASC"]],
    });


    let total_addon_count = 0;
    const totaladdonSold = await AddonBook.count({
      where: {
        event_id: event.id,
        ticket_status: null
      },
    });


    const tierWiseAddonSalesArray = [];
    for (let i = 0; i < addonDetails.length; i++) {

      const addonType = addonDetails[i];
      total_addon_count += parseFloat(addonType.count) || 0;
      const addonSold = await AddonBook.count({
        where: {
          addons_id: addonType.id,
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
      const addonSalesData = {
        tier: `ADD-ON`,
        addons_sold: addonSold || 0,
        total_ticket_count: addonType.count || 0,
        per_ticket_price: addonType.price || 0,
        ticket_name: addonType.name || "Unknown Addon",
        addonId: addonType.id || 0,
        currencysymbol: event.Currency.Currency_symbol || "Unknown",
        currencyname: event.Currency.Currency || "Unknown",
      };
      tierWiseAddonSalesArray.push(addonSalesData);
    }

    // Calculate tickets and addons sold per day for the last 10 days
    const ticketSalesData = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'

      // Sum tickets sold for the day (ignoring time by using DATE() in SQL)
      const ticketSoldPerDay = await BookTicket.sum("ticket_buy", {
        where: {
          event_id: event.id,
          ticket_status: { [Op.is]: null },
          [Op.and]: [
            sequelize.where(
              sequelize.fn("DATE", sequelize.col("created")),
              formattedDate
            ),
          ],
          order_id: totalUniqueOrdersIds,
        },
      });

      // Count addons sold for the day (using DATE() in SQL)
      const addonSoldPerDay = await AddonBook.count({
        where: {
          event_id: event.id,
          ticket_status: { [Op.is]: null },
          [Op.and]: [
            sequelize.where(
              sequelize.fn("DATE", sequelize.col("created")),
              formattedDate
            ),
          ],
          order_id: totalUniqueOrdersIds, // Only include addons from approved orders
        },
      });
      ticketSalesData.push({
        date: formattedDate,
        ticket_sold: ticketSoldPerDay || 0,
        addon_sold: addonSoldPerDay || 0,
        currencysymbol: event.Currency.Currency_symbol || "Unknown",
        currencyname: event.Currency.Currency || "Unknown",
      });
    }

    const last10UsersRegisters = [];
    const last10Users = await User.findAll({
      attributes: ["FirstName", "LastName", "Email", "ImageURL", "DateCreated"],
      order: [["DateCreated", "DESC"]],
      where: {
        Role: {
          [Op.or]: [
            { [Op.ne]: 3 }, // Role is not 3
            { [Op.is]: null }, // OR Role is null
          ],
        },
      },
      limit: 5,
    });
    last10Users.forEach((user) => {
      // const registrationDate = new Date(user.DateCreated).toISOString().split("T")[0]; // Extract 'YYYY-MM-DD'

      last10UsersRegisters.push({
        Email: user.Email || "N/A",
        FirstName: user.FirstName || "N/A",
        LastName: user.LastName || "N/A",
        ImageURL: user.ImageURL || null,
        DateCreated: user.DateCreated,
      });
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        ticketSalesData,
        tierWiseTicketSalesArray,
        tierWiseAddonSalesArray,
        last10UsersRegisters,
        total_donation,
        total_revenue,
        currencySymbol,
        total_addon_count,
        totaladdonSold,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return {
      statusCode: 500,
      success: false,
      message: "An error occurred while fetching the data.",
    };
  }
}

// view tickets , addons , total Sales per months ...
import moment from "moment";
// successfully working Api for monthly data fetching(19-02-2024)without cancel order and cancel tickets and addons
export async function TicketsAddonsSalesMonthly({ eventId }) {
  try {
    // Step 1: Fetch Event & Currency details
    const event = await Event.findOne({
      where: { id: eventId },
      include: [{ model: Currency, attributes: ["id", "Currency_symbol", "Currency"] }],
      attributes: ["id", "Name", "status"],
    });

    if (!event) {
      return { statusCode: 404, success: false, message: "Event not found." };
    }

    const eventName = event.Name;
    const currencySymbol = event.Currency?.Currency_symbol || "";

    // Step 2: Fetch Orders
    const orders = await Order.findAll({
      where: {
        event_id: eventId,
        [Op.or]: [{ is_free: { [Op.is]: null } }, { couponCode: { [Op.not]: null } }],
      },
      attributes: ["id", "createdAt", "adminfee", "discountAmount", "actualamount", "total_amount", "couponCode"],
    });

    if (orders.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "No data found for this event.",
        data: {},
      };
    }

    // Step 3: Group orders by month (MM/YYYY)
    const orderDataByMonth = {};
    let grandTotalTax = 0;
    let grandTotalAmount = 0;
    let grandTotalTickets = 0;
    let grandTotalAddons = 0;
    let totalTicketAmountWithoutTax = 0; // **New total sum for ticketAmountWithoutTax**
    let totalOrderAmount = 0; // **New total sum for totalAmount**
    const totalTaxByMonth = {};

    orders.forEach((order) => {
      const monthYear = moment(order.createdAt).format("MM/YYYY");

      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
          totalAdminFee: 0,
          totalDiscount: 0,
          totalTaxAmount: 0,
          ticketCount: 0,
          ticketAmount: 0,
          ticketAmountWithoutTax: 0,
          ticketTax: 0,
          addonCount: 0,
          addonAmount: 0,
          addonAmountWithoutTax: 0,
          addonTax: 0,
        };
      }

      let taxableAmount = parseFloat(order.actualamount) || 0;
      if (order.couponCode) {
        taxableAmount -= parseFloat(order.discountAmount) || 0;
      }

      const taxAmount = (taxableAmount * (parseFloat(order.adminfee) || 0)) / 100;
      orderDataByMonth[monthYear].orders.push({ ...order.toJSON(), taxAmount });
      orderDataByMonth[monthYear].totalOrders++;
      orderDataByMonth[monthYear].totalAmount += parseFloat(order.total_amount) || 0;
      orderDataByMonth[monthYear].totalAdminFee += parseFloat(order.adminfee) || 0;
      orderDataByMonth[monthYear].totalDiscount += parseFloat(order.discountAmount) || 0;
      orderDataByMonth[monthYear].totalTaxAmount += taxAmount;

      grandTotalTax += Math.round(taxAmount);
      totalOrderAmount += parseFloat(order.total_amount) || 0; // **Sum totalAmount**

      if (!totalTaxByMonth[monthYear]) {
        totalTaxByMonth[monthYear] = 0;
      }
      totalTaxByMonth[monthYear] += Math.round(taxAmount);
    });

    // Step 4: Fetch and process Tickets
    const orderIds = orders.map((order) => order.id);
    const adminFeeMap = new Map(orders.map((order) => [order.id, order.adminfee]));
    const discountMap = new Map(orders.map((order) => [order.id, order.discountAmount || 0]));
    const discountedOrders = new Set();

    const tickets = await BookTicket.findAll({
      // where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
      where: { order_id: orderIds },
      attributes: ["order_id", "amount"],
    });

    tickets.forEach((ticket) => {
      for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
        if (orders.some(order => order.id === ticket.order_id && moment(order.createdAt).format("MM/YYYY") === monthYear)) {
          const amount = parseFloat(ticket.amount) || 0;
          let discountAmount = 0;
          if (!discountedOrders.has(ticket.order_id)) {
            discountAmount = discountMap.get(ticket.order_id) || 0;
            discountedOrders.add(ticket.order_id);
          }

          const discountedAmount = Math.round(amount - discountAmount, 0);
          const adminFeePercentage = adminFeeMap.get(ticket.order_id) || 0;
          const adminFeeAmount = (discountedAmount * adminFeePercentage) / 100;
          const finalAmount = discountedAmount + adminFeeAmount;
          const taxAmount = finalAmount - discountedAmount;

          data.ticketCount++;
          data.ticketAmount += finalAmount;
          data.ticketAmountWithoutTax += discountedAmount;
          data.ticketTax += taxAmount;

          grandTotalTickets++;
          totalTicketAmountWithoutTax += discountedAmount; // **Sum ticketAmountWithoutTax**
        }
      }
    });

    // Step 5: Fetch and process Addons
    const addons = await AddonBook.findAll({
      where: { order_id: orderIds },
      attributes: ["order_id", "price"],
    });

    addons.forEach((addon) => {
      for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
        if (orders.some(order => order.id === addon.order_id && moment(order.createdAt).format("MM/YYYY") === monthYear)) {
          const amount = parseFloat(addon.price) || 0;
          const adminFeePercentage = adminFeeMap.get(addon.order_id) || 0;
          const adminFeeAmount = (amount * adminFeePercentage) / 100;
          const finalAmount = amount + adminFeeAmount;
          const taxAmount = finalAmount - amount;

          data.addonCount++;
          data.addonAmount += finalAmount;
          data.addonAmountWithoutTax += amount;
          data.addonTax += taxAmount;

          grandTotalAddons++;

          totalTicketAmountWithoutTax += amount; // **Sum ticketAmountWithoutTax**

        }
      }
    });

    // Step 6: Structure response
    return {
      statusCode: 200,
      success: true,
      message: "Orders grouped by month.",
      data: {
        eventName,
        currencySymbol,
        ordersByMonth: orderDataByMonth,
        totalTaxByMonth,
        grandTotalTax,
        grandTotalTickets,
        grandTotalAddons,
        totalTicketAmountWithoutTax, // **Total sum of ticketAmountWithoutTax**
        totalOrderAmount, // **Total sum of totalAmount**
      },
    };
  } catch (error) {
    console.error("Error fetching monthly order data:", error);
    return { statusCode: 500, success: false, message: "Internal server error." };
  }
}


// Api Changes for monthly report with cancel tickets and addons
export async function TicketsAddonsSalesMonthlyReport({ eventId }) {
  try {
    // Step 1: Fetch Event & Currency details
    const event = await Event.findOne({
      where: { id: eventId },
      include: [{ model: Currency, attributes: ["id", "Currency_symbol", "Currency"] }],
      attributes: ["id", "Name", "status"],
    });

    if (!event) {
      return { statusCode: 404, success: false, message: "Event not found." };
    }

    const cancelTicketsReport = await TicketsAddonsSalesMonthlyReport2(eventId);
    const eventName = event.Name;
    const currencySymbol = event.Currency?.Currency_symbol || "";

    // Step 2: Fetch Orders
    const orders = await Order.findAll({
      where: {
        event_id: eventId,
        [Op.or]: [{ is_free: { [Op.is]: null } }, { couponCode: { [Op.not]: null } }],
        // ticket_status: null,
      },
      attributes: ["id", "createdAt", "adminfee", "discountAmount", "actualamount", "total_amount", "couponCode", "ticket_status"],
    });

    if (orders.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "No data found for this event.",
        data: {},
      };
    }

    // Step 3: Group orders by month (MM/YYYY)
    const orderDataByMonth = {};
    let grandTotalTax = 0;
    let grandTotalAmount = 0;
    let grandTotalTickets = 0;
    let grandTotalAddons = 0;
    let totalTicketAmountWithoutTax = 0; // **New total sum for ticketAmountWithoutTax**
    let totalOrderAmount = 0; // **New total sum for totalAmount**
    const totalTaxByMonth = {};

    orders.forEach((order) => {
      const monthYear = moment(order.createdAt).format("MM/YYYY");

      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
          totalAdminFee: 0,
          totalDiscount: 0,
          totalTaxAmount: 0,
          ticketCount: 0,
          ticketAmount: 0,
          ticketAmountWithoutTax: 0,
          ticketTax: 0,
          addonCount: 0,
          addonAmount: 0,
          addonAmountWithoutTax: 0,
          addonTax: 0,
        };
      }

      let taxableAmount = parseFloat(order.actualamount) || 0;
      if (order.couponCode) {
        taxableAmount -= parseFloat(order.discountAmount) || 0;
      }

      const taxAmount = Math.round((taxableAmount * (parseFloat(order.adminfee) || 0)) / 100);
      orderDataByMonth[monthYear].orders.push({ ...order.toJSON(), taxAmount });
      orderDataByMonth[monthYear].totalOrders++;
      orderDataByMonth[monthYear].totalAmount += parseFloat(order.total_amount) || 0;
      orderDataByMonth[monthYear].totalAdminFee += parseFloat(order.adminfee) || 0;
      orderDataByMonth[monthYear].totalDiscount += parseFloat(order.discountAmount) || 0;
      orderDataByMonth[monthYear].totalTaxAmount += taxAmount;

      // grandTotalTax += Math.round(taxAmount);
      totalOrderAmount += parseFloat(order.total_amount) || 0; // **Sum totalAmount**
    });

    // Step 4: Fetch and process Tickets
    const orderIds = orders.map((order) => order.id);
    const adminFeeMap = new Map(orders.map((order) => [order.id, order.adminfee]));
    const discountMap = new Map(orders.map((order) => [order.id, order.discountAmount || 0]));
    const discountedOrders = new Set();

    const tickets = await BookTicket.findAll({
      where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
      attributes: ["order_id", "amount", "ticket_status"],
    });

    tickets.forEach((ticket) => {
      for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
        if (orders.some(order => order.id === ticket.order_id && moment(order.createdAt).format("MM/YYYY") === monthYear)) {
          const amount = parseFloat(ticket.amount) || 0;
          let discountAmount = 0;
          if (!discountedOrders.has(ticket.order_id)) {
            discountAmount = discountMap.get(ticket.order_id) || 0;
            discountedOrders.add(ticket.order_id);
          }

          const discountedAmount = Math.round(amount - discountAmount, 0);
          const adminFeePercentage = adminFeeMap.get(ticket.order_id) || 0;
          const adminFeeAmount = (discountedAmount * adminFeePercentage) / 100;
          const finalAmount = discountedAmount + adminFeeAmount;
          const taxAmount = finalAmount - discountedAmount;

          data.ticketCount++;
          data.ticketAmount += finalAmount;
          data.ticketAmountWithoutTax += discountedAmount;
          data.ticketTax += taxAmount;

          grandTotalTickets++;
          totalTicketAmountWithoutTax += discountedAmount; // **Sum ticketAmountWithoutTax**
        }
      }
    });

    // Step 5: Fetch and process Addons
    const addons = await AddonBook.findAll({
      where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
      attributes: ["order_id", "price", "ticket_status"],
    });

    addons.forEach((addon) => {
      for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
        if (orders.some(order => order.id === addon.order_id && moment(order.createdAt).format("MM/YYYY") === monthYear)) {
          const amount = parseFloat(addon.price) || 0;
          const adminFeePercentage = adminFeeMap.get(addon.order_id) || 0;
          const adminFeeAmount = (amount * adminFeePercentage) / 100;
          const finalAmount = amount + adminFeeAmount;
          const taxAmount = finalAmount - amount;

          data.addonCount++;
          data.addonAmount += finalAmount;
          data.addonAmountWithoutTax += amount;
          data.addonTax += taxAmount;
          grandTotalAddons++;

          totalTicketAmountWithoutTax += amount; // **Sum ticketAmountWithoutTax**

        }
      }
    });


    for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
      // Calculate totalAmount as the sum of:
      // ticketAmountWithoutTax + addonAmountWithoutTax + ticketTax + addonTax
      data.totalAmount = Math.round(
        data.ticketAmountWithoutTax +
        data.addonAmountWithoutTax +
        data.ticketTax +
        data.addonTax
      );

      // Update grandTotalAmount
      grandTotalAmount += data.totalAmount;
      // Calculate totalTaxByMonth
      totalTaxByMonth[monthYear] = Math.round(data.ticketTax + data.addonTax);
      grandTotalTax += totalTaxByMonth[monthYear];
    }

    // for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
    //   totalTaxByMonth[monthYear] = Math.round(data.ticketTax + data.addonTax);
    //   grandTotalTax += totalTaxByMonth[monthYear];
    // }




    // Step 6: Structure response
    return {
      statusCode: 200,
      success: true,
      message: "Orders grouped by month.",
      data: {
        eventName,
        currencySymbol,
        ordersByMonth: orderDataByMonth,
        totalTaxByMonth,
        grandTotalTax,
        grandTotalTickets,
        grandTotalAddons,
        totalTicketAmountWithoutTax, // **Total sum of ticketAmountWithoutTax**
        totalOrderAmount: grandTotalAmount, // **Total sum of totalAmount**
        cancelTicketsReport,
      },
    };
  } catch (error) {
    console.error("Error fetching monthly order data:", error);
    return { statusCode: 500, success: false, message: "Internal server error." };
  }
}

// New functionality added(17-03-2025)
export async function TicketsAddonsSalesMonthlyReport2(eventId) {
  try {
    const orders = await Order.findAll({
      where: { event_id: eventId },
      attributes: ["id", "createdAt", "total_amount", "adminfee", "discountAmount"],
    });

    let orderDataByMonth = {};
    let totalOrdersAmount = 0;
    let totalTicketsAmount = 0;
    let totalAddonsAmount = 0;
    let totalCanceledTickets = 0;
    let totalCanceledAddons = 0;
    let totalCanceledAmountWithoutTax = 0;
    let totalTaxAppliedOnCanceled = 0;

    const orderIds = orders.map(order => order.id);
    const tickets = await BookTicket.findAll({
      where: { order_id: { [Op.in]: orderIds } },
      attributes: ["amount", "createdAt", "ticket_status", "order_id"],
    });
    const addons = await AddonBook.findAll({
      where: { order_id: { [Op.in]: orderIds } },
      attributes: ["price", "createdAt", "ticket_status", "order_id"],
    });

    orders.forEach((order) => {
      const monthYear = moment(order.createdAt).format("MM/YYYY");
      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          totalOrdersAmount: 0,
          totalTicketsAmount: 0,
          totalAddonsAmount: 0,
          canceledTickets: 0,
          canceledAddons: 0,
          totalCanceledAmountWithoutTax: 0,
          totalTaxAppliedOnCanceled: 0,
          cancelAmount: 0,
        };
      }
      const orderAmount = parseFloat(order.total_amount) || 0;
      orderDataByMonth[monthYear].totalOrdersAmount += orderAmount;
      totalOrdersAmount += orderAmount;
    });

    tickets.forEach((ticket) => {
      const monthYear = moment(ticket.createdAt).format("MM/YYYY");
      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          totalOrdersAmount: 0,
          totalTicketsAmount: 0,
          totalAddonsAmount: 0,
          canceledTickets: 0,
          canceledAddons: 0,
          totalCanceledAmountWithoutTax: 0,
          totalTaxAppliedOnCanceled: 0,
          cancelAmount: 0,
        };
      }
      const ticketAmount = parseFloat(ticket.amount) || 0;
      const order = orders.find(o => o.id === ticket.order_id);
      const adminFeePercentage = parseFloat(order?.adminfee) || 0;
      const discountAmount = parseFloat(order?.discountAmount) || 0;
      const taxableAmount = ticketAmount - discountAmount;
      const taxAmount = (taxableAmount * adminFeePercentage) / 100;

      if (ticket.ticket_status === "cancel") {
        orderDataByMonth[monthYear].canceledTickets++;
        totalCanceledTickets++;
        orderDataByMonth[monthYear].totalCanceledAmountWithoutTax += ticketAmount;
        totalCanceledAmountWithoutTax += ticketAmount;
        orderDataByMonth[monthYear].totalTaxAppliedOnCanceled += taxAmount;
        totalTaxAppliedOnCanceled += taxAmount;
        orderDataByMonth[monthYear].cancelAmount += ticketAmount + taxAmount;
      } else {
        orderDataByMonth[monthYear].totalTicketsAmount += ticketAmount + taxAmount;
        totalTicketsAmount += ticketAmount + taxAmount;
      }
    });

    addons.forEach((addon) => {
      const monthYear = moment(addon.createdAt).format("MM/YYYY");
      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          totalOrdersAmount: 0,
          totalTicketsAmount: 0,
          totalAddonsAmount: 0,
          canceledTickets: 0,
          canceledAddons: 0,
          totalCanceledAmountWithoutTax: 0,
          totalTaxAppliedOnCanceled: 0,
          cancelAmount: 0,
        };
      }
      const addonAmount = parseFloat(addon.price) || 0;
      const order = orders.find(o => o.id === addon.order_id);
      const adminFeePercentage = parseFloat(order?.adminfee) || 0;
      const taxAmount = (addonAmount * adminFeePercentage) / 100;

      if (addon.ticket_status === "cancel") {
        orderDataByMonth[monthYear].canceledAddons++;
        totalCanceledAddons++;
        orderDataByMonth[monthYear].totalCanceledAmountWithoutTax += addonAmount;
        totalCanceledAmountWithoutTax += addonAmount;
        orderDataByMonth[monthYear].totalTaxAppliedOnCanceled += taxAmount;
        totalTaxAppliedOnCanceled += taxAmount;
        orderDataByMonth[monthYear].cancelAmount += addonAmount + taxAmount;
      } else {
        orderDataByMonth[monthYear].totalAddonsAmount += addonAmount + taxAmount;
        totalAddonsAmount += addonAmount + taxAmount;
      }
    });

    const totalCancelAmount = totalCanceledAmountWithoutTax + totalTaxAppliedOnCanceled;

    if (Object.keys(orderDataByMonth).length === 0) {
      return { statusCode: 200, success: true, message: "No data found for this event.", data: {} };
    }

    return {
      data: {
        ordersByMonth: orderDataByMonth,
        totalOrdersAmount: totalOrdersAmount,  // No rounding
        totalTicketsAmount: totalTicketsAmount,  // No rounding
        totalAddonsAmount: totalAddonsAmount,  // No rounding
        totalCanceledTickets,
        totalCanceledAddons,
        totalCancelAmount: Math.round(totalCancelAmount),  // Rounded only in the final output
        grandTotalCanceledAmountWithoutTax: Math.round(totalCanceledAmountWithoutTax),  // Rounded here
        grandTotalTaxAppliedOnCanceled: Math.round(totalTaxAppliedOnCanceled),  // Rounded here
      },
    };
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return { statusCode: 500, success: false, message: "Internal server error." };
  }
}

export async function TicketsAddonsSalesMonthlyTest({ eventId }) {
  try {
    // Step 1: Fetch Event & Currency details
    const event = await Event.findOne({
      where: { id: eventId },
      include: [{ model: Currency, attributes: ["id", "Currency_symbol", "Currency"] }],
      attributes: ["id", "Name", "status"],
    });

    if (!event) {
      return { statusCode: 404, success: false, message: "Event not found." };
    }

    const eventName = event.Name;
    const currencySymbol = event.Currency?.Currency_symbol || "";

    // Step 2: Fetch Orders
    const orders = await Order.findAll({
      where: {
        event_id: eventId,
        [Op.or]: [{ is_free: { [Op.is]: null } }, { couponCode: { [Op.not]: null } }],
      },
      attributes: ["id", "createdAt", "adminfee", "discountAmount", "actualamount", "total_amount", "couponCode"],
    });

    if (orders.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "No data found for this event.",
        data: {},
      };
    }

    // Step 3: Group orders by month (MM/YYYY)
    const orderDataByMonth = {};
    let grandTotalTax = 0;
    let grandTotalAmount = 0;
    let grandTotalTickets = 0;
    let grandTotalAddons = 0;
    let totalTicketAmountWithoutTax = 0;
    let grandTotalCancelTax = 0;
    let grandTotalCancelAmount = 0;


    for (const order of orders) {
      const monthYear = moment(order.createdAt).format("MM/YYYY");

      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          totalCancelTax: 0,
          totalCancelAmount: 0,
          ticketCount: 0,
          addonCount: 0,
          finaladdonAmountcal: 0,
          totalActualAmount: 0,
        };
      }

      let adminFeePercentage = parseFloat(order.adminfee) || 0;
      let order_id = order.id;
      let discountAmount = parseFloat(order.discountAmount) || 0;

      // Fetch Tickets
      const tickets = await BookTicket.findAll({
        where: { order_id },
        attributes: ["order_id", "amount", "ticket_status"],
      });

      let ticketamount = 0;
      let cancelTicketAmount = 0;
      let ticketCount = tickets.length;
      tickets.forEach((ticket) => {
        let amount = parseFloat(ticket.amount) || 0;
        if (ticket.ticket_status === "cancel") {
          cancelTicketAmount += amount;
        } else {
          ticketamount += amount;
        }
      });

      let ticketfinalamount = ticketamount - discountAmount;

      // Fetch Addons
      const addons = await AddonBook.findAll({
        where: { order_id },
        attributes: ["order_id", "price", "ticket_status"],
      });

      let addonCount = addons.length;
      let addonamount = 0;
      let cancelAddonAmount = 0;
      addons.forEach((addon) => {
        let price = parseFloat(addon.price) || 0;
        if (addon.ticket_status === "cancel") {
          cancelAddonAmount += price;
        } else {
          addonamount += price;
        }
      });

      let finaladdonAmountcal = ticketfinalamount + addonamount;

      // **Corrected Tax Calculation (Rounded Only at the End)**
      const totalamounttax = (finaladdonAmountcal * adminFeePercentage) / 100;
      // const totalamounttax = Math.round((finaladdonAmountcal * adminFeePercentage) / 100);
      const actualamount = finaladdonAmountcal + totalamounttax;

      // **Corrected Cancel Tax Calculation**
      const totalCanceltax = (cancelAddonAmount * adminFeePercentage) / 100;
      // const totalCanceltax = Math.round((cancelAddonAmount * adminFeePercentage) / 100);
      const actualcancelamount = cancelAddonAmount;


      // Update monthly grouped data
      orderDataByMonth[monthYear].totalCancelTax += totalCanceltax;
      orderDataByMonth[monthYear].totalCancelAmount += actualcancelamount;
      orderDataByMonth[monthYear].ticketCount += ticketCount;
      orderDataByMonth[monthYear].addonCount += addonCount;
      orderDataByMonth[monthYear].finaladdonAmountcal += finaladdonAmountcal;
      totalTicketAmountWithoutTax += finaladdonAmountcal;
      orderDataByMonth[monthYear].totalActualAmount += actualamount;

      // Update Grand Totals
      grandTotalTickets += ticketCount;
      grandTotalAddons += addonCount;
      grandTotalTax += totalamounttax;
      grandTotalAmount += actualamount;
      grandTotalCancelTax += totalCanceltax;
      grandTotalCancelAmount += actualcancelamount;
    }

    // **Final Round-off at the End**
    // grandTotalTax = grandTotalTax;
    grandTotalTax = Math.round(grandTotalTax);
    grandTotalAmount = Math.round(grandTotalAmount);
    grandTotalCancelTax = Math.round(grandTotalCancelTax);
    // grandTotalCancelTax = grandTotalCancelTax;
    grandTotalCancelAmount = Math.round(grandTotalCancelAmount);
    totalTicketAmountWithoutTax = Math.round(totalTicketAmountWithoutTax);

    // Step 5: Structure response
    return {
      statusCode: 200,
      success: true,
      message: "Orders grouped by month.",
      data: {
        eventName,
        currencySymbol,
        ordersByMonth: orderDataByMonth,
        grandTotalTax,
        grandTotalTickets,
        grandTotalAddons,
        totalTicketAmountWithoutTax,
        totalOrderAmount: grandTotalAmount,
        grandTotalCancelTax,
        grandTotalCancelAmount,
      },
    };
  } catch (error) {
    console.error("Error fetching monthly order data:", error);
    return { statusCode: 500, success: false, message: "Internal server error!!." };
  }
}

// new -------
export async function getLastHousesBookedV1({ event_id }) {
  if (!event_id) {
    return {
      statusCode: 400,
      success: false,
      message: "event_id is required.",
      data: null
    };
  }
  try {
    const orderInfo = await MyOrders.findAll({
      where: {
        event_id,
        book_accommodation_id: { [Op.ne]: null } // accommodation_id should NOT be null
      },
      attributes: ['id', 'user_id', 'created', 'event_id', 'OriginalTrxnIdentifier', 'book_accommodation_id'],
      include: [
        { model: User, attributes: ['id', 'FirstName', 'LastName', 'Email', 'ImageURL'] },
        {
          model: BookAccommodationInfo, attributes: ['event_id', 'accommodation_id', 'created_at', 'check_in_date', 'check_out_date'],
          include: [{
            model: Housing,
            attributes: ['Name', 'Neighborhood'],
            include: { model: HousingNeighborhood, attributes: ['name'] }
          }]

        },
        {
          model: AccommodationExtension, attributes: ["id", "user_id", "accommodation_id", "check_in_date", "check_out_date", "total_night_stay"],
          include: [{
            model: Housing,
            attributes: ['Name', 'Neighborhood'],
            include: { model: HousingNeighborhood, attributes: ['name'] }
          }]
        }
      ],
      order: [['id', 'DESC']],
      limit: 5,
      nest: true // you can also remove nest since raw is removed
    });

    return {
      statusCode: 200,
      success: true,
      message: "Last houses booked.",
      data: orderInfo
    };
  } catch (error) {
    console.error("getRecentlyBookedTicketsUser error:", error.message);
    return {
      statusCode: 500,
      success: false,
      message: "An error occurred while fetching Accommations.",
      data: null
    };
  }
}

// get last houses booked 
export async function getLastHousesBooked({ event_id }) {
  if (!event_id) {
    return {
      statusCode: 400,
      success: false,
      message: "event_id is required.",
      data: null
    };
  }
  try {
    const bookedHousing = await AccommodationBookingInfo.findAll({
      where: { event_id },
      attributes: ['event_id', 'accommodation_id', 'created_at', 'check_in_date', 'check_out_date'],
      include: [{
        model: Housing,
        attributes: ['Name', 'Neighborhood'],
        include: { model: HousingNeighborhood, attributes: ['name'] }
      }, {
        model: MyOrders,
        attributes: ['OriginalTrxnIdentifier', 'created'],
      }, {
        model: User,
        attributes: ['FirstName', 'LastName', "Email"],
      }],
      order: [['id', 'DESC']],
      // limit: 10,
      limit: 5,
      raw: true,
      nest: true
    });

    return {
      statusCode: 200,
      success: true,
      message: "Last houses booked.",
      data: bookedHousing
    };
  } catch (error) {
    console.error("getLastHousesBooked error:", error.message);

    return {
      statusCode: 500,
      success: false,
      message: "An error occurred while fetching booked houses.",
      data: null
    };
  }
}


// Recently booked tickets User

export async function getRecentlyBookedTicketsUser({ event_id } = {}) {
  if (!event_id) {
    return {
      statusCode: 400,
      success: false,
      message: "event_id is required.",
      data: null
    };
  }
  try {
    const orderInfo = await MyOrders.findAll({
      where: { event_id, order_context: "regular" },
      attributes: ['id', 'user_id', 'created', 'event_id', 'OriginalTrxnIdentifier'],
      include: [
        { model: User, attributes: ['id', 'FirstName', 'LastName', 'Email', 'ImageURL'] },
        { model: BookTicket, attributes: ['event_id', 'cust_id'] },
        { model: AddonBook, attributes: ['user_id', 'event_id'] }
      ],
      order: [['id', 'DESC']],
      nest: true
    });

    // filter orders where at least one of TicketBooks or AddonBooks is not empty
    const filteredOrders = orderInfo.filter(order =>
      (order.TicketBooks && order.TicketBooks.length > 0) ||
      (order.AddonBooks && order.AddonBooks.length > 0)
    );
    // return only latest 5 after filtering
    const limitedOrders = filteredOrders.slice(0, 5);
    return {
      statusCode: 200,
      success: true,
      message: "Recently booked tickets retrieved successfully.",
      data: limitedOrders
    };
  } catch (error) {
    console.error("getRecentlyBookedTicketsUser error:", error.message);
    return {
      statusCode: 500,
      success: false,
      message: "An error occurred while fetching recently booked tickets.",
      data: null
    };
  }
}






// New functionality added(11-09-2025)

// export async function TicketsAddonsSalesSummaryReport({ eventId }) {
//   try {
//     // Step 1: Fetch Event & Currency details
//     const event = await Event.findOne({
//       where: { id: eventId },
//       include: [{ model: Currency, attributes: ["id", "Currency_symbol", "Currency"] }],
//       attributes: ["id", "Name", "status"],
//     });

//     if (!event) {
//       return { statusCode: 404, success: false, message: "Event not found." };
//     }

//     const eventName = event.Name;
//     const currencySymbol = event.Currency?.Currency_symbol || "";

//     // Step 2: Fetch Orders (with discountAmount included)
//     const orders = await Order.findAll({
//       where: {
//         event_id: eventId,
//         [Op.or]: [{ is_free: { [Op.is]: null } }, { couponCode: { [Op.not]: null } }],
//       },
//       attributes: [
//         "id",
//         "createdAt",
//         "totalAddonAmount",
//         "totalAddonTax",
//         "totalTicketAmount",
//         "totalTicketTax",
//         "discountAmount",
//       ],
//     });

//     if (orders.length === 0) {
//       return {
//         statusCode: 200,
//         success: true,
//         message: "No data found for this event.",
//         data: {},
//       };
//     }

//     // Build orderIds array for counting tickets/addons
//     const orderIds = orders.map((o) => o.id);

//     // Fetch ticket rows and addon rows for counting (only order_id needed)
//     const ticketRows = await BookTicket.findAll({
//       where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
//       attributes: ["order_id"],
//     });

//     const addonRows = await AddonBook.findAll({
//       where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
//       attributes: ["order_id"],
//     });

//     // Build maps: orderId => ticketCount / addonCount
//     const ticketCountMap = new Map();
//     ticketRows.forEach((t) => {
//       const oid = t.order_id;
//       ticketCountMap.set(oid, (ticketCountMap.get(oid) || 0) + 1);
//     });

//     const addonCountMap = new Map();
//     addonRows.forEach((a) => {
//       const oid = a.order_id;
//       addonCountMap.set(oid, (addonCountMap.get(oid) || 0) + 1);
//     });

//     // Step 3: Group orders by month (MM/YYYY)
//     const orderDataByMonth = {};
//     let grandTotalTax = 0;
//     let grandTotalAmount = 0;

//     let grandTotalTickets = 0;         // actual ticket quantity
//     let grandTotalTicketsAmount = 0;   // total of ticket amounts
//     let grandTotalTicketsTax = 0;      // total of ticket taxes

//     let grandTotalAddons = 0;          // actual addon quantity
//     let grandTotalAddonsAmount = 0;    // total of addon amounts
//     let grandTotalAddonsTax = 0;       // total of addon taxes

//     let grandTotalDiscount = 0;
//     const totalTaxByMonth = {};

//     orders.forEach((order) => {
//       const monthYear = moment(order.createdAt).format("MM/YYYY");

//       if (!orderDataByMonth[monthYear]) {
//         orderDataByMonth[monthYear] = {
//           orders: [],
//           totalOrders: 0,
//           totalAmount: 0,
//           totalDiscount: 0,
//           ticketCount: 0,
//           ticketAmount: 0,
//           ticketTax: 0,
//           addonCount: 0,
//           addonAmount: 0,
//           addonTax: 0,
//         };
//       }

//       // Extract values directly from order
//       let ticketAmount = parseFloat(order.totalTicketAmount) || 0;
//       const ticketTax = parseFloat(order.totalTicketTax) || 0;
//       const addonAmount = parseFloat(order.totalAddonAmount) || 0;
//       const addonTax = parseFloat(order.totalAddonTax) || 0;
//       const discountAmount = parseFloat(order.discountAmount) || 0;

//       // Apply discount to ticketAmount only
//       ticketAmount = ticketAmount - discountAmount;
//       // Actual quantities for this order (from maps)
//       const ticketQty = ticketCountMap.get(order.id) || 0;
//       const addonQty = addonCountMap.get(order.id) || 0;

//       // Push order
//       orderDataByMonth[monthYear].orders.push(order.toJSON());

//       // Increment counters
//       orderDataByMonth[monthYear].totalOrders++;
//       orderDataByMonth[monthYear].ticketCount += ticketQty;
//       orderDataByMonth[monthYear].addonCount += addonQty;

//       // Sum amounts & taxes
//       orderDataByMonth[monthYear].ticketAmount += ticketAmount;
//       orderDataByMonth[monthYear].ticketTax += ticketTax;
//       orderDataByMonth[monthYear].addonAmount += addonAmount;
//       orderDataByMonth[monthYear].addonTax += addonTax;
//       orderDataByMonth[monthYear].totalDiscount += discountAmount;

//       // Monthly total (tickets + addons + taxes - discount)
//       orderDataByMonth[monthYear].totalAmount +=
//         ticketAmount + ticketTax + addonAmount + addonTax - discountAmount;

//       // Grand totals (quantities + amounts + taxes + discount)
//       grandTotalTickets += ticketQty;
//       grandTotalAddons += addonQty;

//       grandTotalTicketsAmount += ticketAmount;
//       grandTotalTicketsTax += ticketTax;

//       grandTotalAddonsAmount += addonAmount;
//       grandTotalAddonsTax += addonTax;

//       grandTotalDiscount += discountAmount;
//     });

//     // Step 4: Calculate monthly & grand totals (tax & total amount sums)
//     for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
//       totalTaxByMonth[monthYear] = Math.round(data.ticketTax + data.addonTax);
//       grandTotalTax += totalTaxByMonth[monthYear];
//       grandTotalAmount += data.totalAmount;
//     }

//     // Step 5: Structure response
//     return {
//       statusCode: 200,
//       success: true,
//       message: "Orders grouped by month.",
//       data: {
//         eventName,
//         currencySymbol,
//         ordersByMonth: orderDataByMonth,
//         totalTaxByMonth,
//         grandTotalTax,
//         grandTotalTickets,
//         grandTotalTicketsAmount,
//         grandTotalTicketsTax,
//         grandTotalAddons,
//         grandTotalAddonsAmount,
//         grandTotalAddonsTax,
//         grandTotalDiscount,
//         totalOrderAmount: grandTotalAmount,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching monthly order data:", error);
//     return { statusCode: 500, success: false, message: "Internal server error." };
//   }
// }
export async function TicketsAddonsSalesSummaryReport({ eventId }) {
  try {
    // Step 1: Fetch Event & Currency details
    const event = await Event.findOne({
      where: { id: eventId },
      include: [{ model: Currency, attributes: ["id", "Currency_symbol", "Currency"] }],
      attributes: ["id", "Name", "status"],
    });

    if (!event) {
      return { statusCode: 404, success: false, message: "Event not found." };
    }

    //  const accommodationReports = await AccommodationSalesSummaryReportSecond(eventId);
    const eventName = event.Name;
    const currencySymbol = event.Currency?.Currency_symbol || "";

    // Step 2: Fetch Orders (with discountAmount included)
    const orders = await Order.findAll({
      where: {
        event_id: eventId,
        [Op.or]: [{ is_free: { [Op.is]: null } }, { couponCode: { [Op.not]: null } }],
      },
      attributes: [
        "id",
        "createdAt",
        "totalAddonAmount",
        "totalAddonTax",
        "totalTicketAmount",
        "totalTicketTax",
        "discountAmount",
      ],
    });

    if (orders.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "No data found for this event.",
        data: {},
      };
    }

    // Build orderIds array for counting tickets/addons
    const orderIds = orders.map((o) => o.id);

    // Fetch ticket rows and addon rows for counting (only order_id needed)
    const ticketRows = await BookTicket.findAll({
      where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
      attributes: ["order_id"],
    });

    const addonRows = await AddonBook.findAll({
      where: { order_id: orderIds, ticket_status: { [Op.is]: null } },
      attributes: ["order_id"],
    });

    // Build maps: orderId => ticketCount / addonCount
    const ticketCountMap = new Map();
    ticketRows.forEach((t) => {
      const oid = t.order_id;
      ticketCountMap.set(oid, (ticketCountMap.get(oid) || 0) + 1);
    });

    const addonCountMap = new Map();
    addonRows.forEach((a) => {
      const oid = a.order_id;
      addonCountMap.set(oid, (addonCountMap.get(oid) || 0) + 1);
    });

    // Step 3: Group orders by month (MM/YYYY)
    const orderDataByMonth = {};
    let grandTotalTax = 0;
    let grandTotalAmount = 0;

    let grandTotalTickets = 0;
    let grandTotalTicketsAmount = 0;
    let grandTotalTicketsTax = 0;

    let grandTotalAddons = 0;
    let grandTotalAddonsAmount = 0;
    let grandTotalAddonsTax = 0;

    let grandTotalDiscount = 0;
    const totalTaxByMonth = {};

    orders.forEach((order) => {
      const monthYear = moment(order.createdAt).format("MM/YYYY");

      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
          totalDiscount: 0,
          ticketCount: 0,
          ticketAmount: 0,
          ticketTax: 0,
          addonCount: 0,
          addonAmount: 0,
          addonTax: 0,
        };
      }

      // Extract values directly from order
      let ticketAmount = parseFloat(order.totalTicketAmount) || 0;
      const ticketTax = parseFloat(order.totalTicketTax) || 0;
      const addonAmount = parseFloat(order.totalAddonAmount) || 0;
      const addonTax = parseFloat(order.totalAddonTax) || 0;
      const discountAmount = parseFloat(order.discountAmount) || 0;

      // Apply discount only once (subtract from ticketAmount)
      ticketAmount = ticketAmount - discountAmount;

      // Actual quantities for this order (from maps)
      const ticketQty = ticketCountMap.get(order.id) || 0;
      const addonQty = addonCountMap.get(order.id) || 0;

      // Push order
      orderDataByMonth[monthYear].orders.push(order.toJSON());

      // Increment counters
      orderDataByMonth[monthYear].totalOrders++;
      orderDataByMonth[monthYear].ticketCount += ticketQty;
      orderDataByMonth[monthYear].addonCount += addonQty;

      // Sum amounts & taxes
      orderDataByMonth[monthYear].ticketAmount += ticketAmount;
      orderDataByMonth[monthYear].ticketTax += ticketTax;
      orderDataByMonth[monthYear].addonAmount += addonAmount;
      orderDataByMonth[monthYear].addonTax += addonTax;
      orderDataByMonth[monthYear].totalDiscount += discountAmount;

      // Monthly total (already discounted ticket + addons + taxes)
      orderDataByMonth[monthYear].totalAmount +=
        ticketAmount + ticketTax + addonAmount + addonTax;

      // Grand totals
      grandTotalTickets += ticketQty;
      grandTotalAddons += addonQty;

      grandTotalTicketsAmount += ticketAmount;
      grandTotalTicketsTax += ticketTax;

      grandTotalAddonsAmount += addonAmount;
      grandTotalAddonsTax += addonTax;

      grandTotalDiscount += discountAmount;
    });

    // Step 4: Calculate monthly & grand totals (tax & total amount sums)
    for (const [monthYear, data] of Object.entries(orderDataByMonth)) {
      totalTaxByMonth[monthYear] = Math.round(data.ticketTax + data.addonTax);
      grandTotalTax += totalTaxByMonth[monthYear];
      grandTotalAmount += data.totalAmount;
    }

    // console.log("--------------------------",accommodationReports);
    // Step 5: Structure response
    return {
      statusCode: 200,
      success: true,
      message: "Orders grouped by month.",
      data: {
        eventName,
        currencySymbol,
        ordersByMonth: orderDataByMonth,
        totalTaxByMonth,
        grandTotalTax,
        grandTotalTickets,
        grandTotalTicketsAmount,
        grandTotalTicketsTax,
        grandTotalAddons,
        grandTotalAddonsAmount,
        grandTotalAddonsTax,
        grandTotalDiscount,
        totalOrderAmount: grandTotalAmount,
        FaceAmountTicketAddons: grandTotalTicketsAmount + grandTotalAddonsAmount, // ✅ New key
      },
    };
  } catch (error) {
    console.error("Error fetching monthly order data:", error);
    return { statusCode: 500, success: false, message: "Internal server error." };
  }
}




// New functionality added(11-09-2025)
// export async function AccommodationSalesSummaryReportSecond(eventId) {
export async function AccommodationSalesSummaryReportSecond({ eventId }) {
  try {
    // Step 1: Fetch all accommodation orders (only those with book_accommodation_id not null)
    const orders = await Order.findAll({
      where: {
        event_id: eventId,
        book_accommodation_id: { [Op.ne]: null },
        order_context: "regular"
      },
      attributes: [
        "id",
        "createdAt",
        "book_accommodation_id",
        "totalAccommodationAmount",
        "totalAccommodationTax",
        "partial_payment_amount",
        "partial_payment_tax"
      ],
    });

    if (orders.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "No accommodation bookings found for this event.",
        data: {},
      };
    }

    let orderDataByMonth = {};
    let grandTotalAccommodationAmount = 0;
    let grandTotalAccommodationTax = 0;
    let grandTotalPartialAmount = 0;
    let grandTotalPartialTax = 0;

    // Step 2: Group by Month-Year
    orders.forEach((order) => {
      const monthYear = moment(order.createdAt).format("MM/YYYY");

      if (!orderDataByMonth[monthYear]) {
        orderDataByMonth[monthYear] = {
          totalAccommodationAmount: 0,
          totalAccommodationTax: 0,
          partial_payment_amount: 0,
          partial_payment_tax: 0,
          accommodationCount: 0,
        };
      }

      const accommodationAmount = parseFloat(order.totalAccommodationAmount) || 0;
      const accommodationTax = parseFloat(order.totalAccommodationTax) || 0;
      const partialAmount = parseFloat(order.partial_payment_amount) || 0;
      const partialTax = parseFloat(order.partial_payment_tax) || 0;

      // Update monthly totals
      orderDataByMonth[monthYear].totalAccommodationAmount += accommodationAmount;
      orderDataByMonth[monthYear].totalAccommodationTax += accommodationTax;
      orderDataByMonth[monthYear].partial_payment_amount += partialAmount;
      orderDataByMonth[monthYear].partial_payment_tax += partialTax;
      orderDataByMonth[monthYear].accommodationCount += 1; // count bookings

      // Update grand totals
      grandTotalAccommodationAmount += accommodationAmount;
      grandTotalAccommodationTax += accommodationTax;
      grandTotalPartialAmount += partialAmount;
      grandTotalPartialTax += partialTax;
    });

    // Step 3: Calculate total accommodation count correctly (sum of all months)
    const totalAccommodationCount = Object.values(orderDataByMonth).reduce(
      (sum, month) => sum + month.accommodationCount,
      0
    );

    // Step 4: Final response
    return {
      statusCode: 200,
      success: true,
      message: "Accommodation bookings grouped by month.",
      data: {
        ordersByMonth: orderDataByMonth,
        grandTotalAccommodationAmount,
        grandTotalAccommodationTax,
        grandTotalPartialAmount,
        grandTotalPartialTax,
        totalAccommodationCount, // ✅ correct total
      },
    };
  } catch (error) {
    console.error("Error fetching accommodation monthly report:", error);
    return { statusCode: 500, success: false, message: "Internal server error." };
  }
}










