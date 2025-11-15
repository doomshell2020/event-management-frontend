import { generateQR } from "../../utils_back/qrGenerator";
import {
  Event,
  AddonBook,
  BookTicket,
  Orders,
  Order,
  User,
  EventTicketType,
  MyOrders,
  MyTicketBook
} from "../../database/models";
import { count } from "console";
const Sequelize = require("sequelize");
const { Op, fn, col } = Sequelize;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, orderId, ticketId, ticketType, eventName } = req.body;
    const eventID = 108;
    
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
    // ##############################Total Orders End##############################


    // const totalOrders = await MyOrders.findAll({
    //   where: {
    //     id: { [Op.in]: totalUniqueOrdersIds },
    //     // [Op.or]: [
    //     //   { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
    //     //   { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
    //     // ],
    //     // ticket_status: null,
    //   },
    //   attributes: [
    //     "id",
    //     "actualamount",
    //     "couponCode",
    //     "discountValue",
    //     "discountType",
    //     "discountAmount",
    //     "total_amount",
    //     "RRN",
    //     "paymenttype",
    //     "createdAt",
    //     "OriginalTrxnIdentifier",
    //     "is_free",
    //     "adminfee",
    //     "ticket_cancel_id",
    //   ], // Select only 'id' from MyOrders
    //   include: [
    //     {
    //       model: User,
    //       attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
    //       required: true,
    //     },
    //     {
    //       model: BookTicket,
    //       where: {
    //         // ticket_status: null,
    //         event_id: eventID,
    //       },
    //       attributes: ["id", "event_ticket_id"], // No need to select attributes from BookTicket
    //       required: false,
    //     },
    //     {
    //       model: AddonBook,
    //       where: {
    //         // ticket_status: null,
    //         event_id: eventID,
    //       },
    //       attributes: ["id"], // No need to select attributes from AddonBook
    //       required: false,
    //     },
    //   ],
    //   // oder by id desc
    //   order: [["id", "DESC"]],
    //   // group: ["MyOrders.id"], // Group by orders.id
    // });


    // let amountInfo = {
    //   total_amount: 0,
    //   total_taxes: 0,
    //   gross_total: 0,
    //   currencySign: event.Currency?.Currency_symbol,
    // };

    // totalOrders.forEach((order) => {
    //   let amountAfterDiscount = order.actualamount;

    //   if (order.couponCode) {
    //     amountAfterDiscount -= order.discountAmount; // Apply the discount if a coupon code exists
    //   }
    //   const taxAmount = (amountAfterDiscount * order.adminfee) / 100; // Calculate tax amount
    //   // Accumulate the values into amountInfo
    //   amountInfo.total_amount += amountAfterDiscount;
    //   amountInfo.total_taxes += Math.round(taxAmount);
    //   amountInfo.gross_total += order.total_amount;
    // });


    const totalTicketSold = await MyOrders.findAll({
      where: {
        id: { [Op.in]: totalUniqueOrdersIds },
        actualamount: null  // Add condition to check if actualamount is null
      },
      include: [
        {
          model: BookTicket,
          where: {
            event_id: eventID, // Correctly add event_id condition for BookTicket
          },
          required: false,
        },
        {
          model: AddonBook,
          where: {
            event_id: eventID, // Correctly add event_id condition for AddonBook
          },
          required: false,
        },
        
      ],
      order: [["id", "DESC"]], // Order by id in descending order
    });

    // res.status(200).json({
    //   success: true,
    //   message: "Orders fetch successfully",totalTicketSold
    // });

    // return totalTicketSold

    // Create an array of promises for all the updates
    let count = 0;
    const updatePromises = totalTicketSold
    // .filter(cur => cur.actualamount == null) // Filter records with null or empty string for actualamount
    .map(async (cur) => {
      count++; // Perform your desired action here
        // console.log('>>>>>>>>>>>>>',cur);  
      // Sum up the amount from TicketBooks and price from AddonBooks
      const ticketAmount = cur.TicketBooks.reduce(
        (acc, ticket) => acc + parseFloat(ticket.amount),
        0
      );
      const addonAmount = cur.AddonBooks.reduce(
        (acc, addon) => acc + parseFloat(addon.price),
        0
      );  
      // Calculate the actual amount
      const actualAmount = ticketAmount + addonAmount;  
      // Update the actual amount in the MyOrders table
      await MyOrders.update(
        { actualamount: actualAmount },
        { where: { id: cur.id } }
      );
      console.log(`Actual Amount for Order ${cur.id}: ${actualAmount}`);      
      
    });
    console.log('>>>>>>>>>>',count);

    // Wait for all the updates to complete
    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      totalOrder: totalTicketSold.length,
      message: "Orders fetch successfully",
      data: totalTicketSold,
    });
    // const qrResult = await generateQR({ userId, orderId, ticketId, ticketType });

    // if (qrResult.success) {
    //   // If QR generation is successful, send back the QR code file path
    //   res.status(200).json({
    //     success: true,
    //     message: "QR Code generated successfully",
    //     // filePath: qrResult.filePath, // This would be the relative path to the file in the /public/qrCodes folder
    //   });
    // } else {
    //   // If QR generation failed, send back an error response
    //   res.status(500).json({
    //     success: false,
    //     // message: qrResult.message,
    //   });
    // }
  } else {
    // If not a POST request, return a method not allowed error
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
