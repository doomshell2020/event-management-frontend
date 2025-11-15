import {
  Orders,
  User,
  MyOrders,
  MyTicketBook,
  BookTicket,
  Event,
  EventTicketType,
  AddonBook,
  Currency,
  Coupon,
  TicketDetail,
  TicketTransfer,
  MembershipType,
  Addons,
  Payment,
  Order,
  Emailtemplet,
  Housing,
  AccommodationBookingInfo,
  HousingNeighborhood,
  EventHousing
} from "@/database/models";
import { StatusCodes } from "http-status-codes";
const {
  NotFoundError,
  BadRequestError,
} = require("@/utils_back/api-errors");
import { sendEmail } from "@/utils_back/sendEmail"; // send mail via mandril
import {
  renameTicketTemplate,
  renameAddonTemplate,
  ticketTransferTemplate,
  transferAddonTemplate,
  SendRemainingAmountEmailTemplate
} from "@/utils_back/email-templates"; // Email-template
import { generateQR } from "@/utils_back/qrGenerator";
import { generateTicketQrToS3, generateAccommodationQrToS3 } from "@/utils_back/generateQrToS3";

let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
let NEXT_S3_URL = process.env.NEXT_PUBLIC_S3_URL;



const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const encryptionKey = "yourEncryptionKey";
const CryptoJS = require("crypto-js");



// view Orders
// export async function PromotionCodes({ event_id }, res) {
//     console.log("evebehjdfs", event_id)
//     const viewOrder = await Coupon.findAll({
//         where: { event: event_id },
//         order: [["ID", "DESC"]],
//     });
//     return {
//         statusCode: 200,
//         success: true,
//         message: 'View Promation Successfully!',
//         viewOrder
//     };
// }

export async function PromotionCodes({ eventName }, res) {
  try {
    const couponData = await Coupon.findAll({
      where: { status: "Y" },
      include: [
        {
          model: Event,
          where: { name: eventName },
          attributes: ['id', 'name'],
          include: [{ model: Currency, attributes: ['Currency_symbol'] }],
        },
      ],
      order: [["id", "DESC"]],
    });

    // Get redemption counts in one query
    const couponRedemptions = await Orders.findAll({
      attributes: [
        'couponCode',
        [Sequelize.fn('COUNT', Sequelize.col('couponCode')), 'totalRedeemed']
      ],
      where: {
        couponCode: {
          [Op.in]: couponData.map(c => c.code)
        }
      },
      group: ['couponCode']
    });

    const redemptionMap = {};
    couponRedemptions.forEach(r => {
      redemptionMap[r.couponCode] = parseInt(r.get('totalRedeemed'), 10);
    });

    const data = couponData.map((value, index) => {
      const coupon = {
        id: value.id,
        SNO: index + 1,
        PromoCode: value.code,
        Discount:
          value.discount_type === "percentage"
            ? `${parseFloat(value.discount_value)}% OFF`
            : `${value.Event.Currency.Currency_symbol}${parseFloat(
              value.discount_value
            )} OFF`,
        ApplicableFor: value.applicable_for.toUpperCase(),
        CreatedOn: value.createdAt.toISOString().split("T")[0],
        Usage: redemptionMap[value.code] || 0,
      };

      if (value.validity_period === "unlimited") {
        coupon.Duration = "Unlimited";
        coupon.StartOn = null;
        coupon.ExpiresOn = null;
      } else {
        const StartOn = new Date(value.specific_date_from);
        const ExpiresOn = new Date(value.specific_date_to);
        const duration =
          Math.round((ExpiresOn - StartOn) / (1000 * 60 * 60 * 24)) + 1;
        coupon.Duration = duration + " Days";
        coupon.StartOn = StartOn.toISOString().split("T")[0];
        coupon.ExpiresOn = ExpiresOn.toISOString().split("T")[0];
      }

      return coupon;
    });

    res.status(200).json({
      success: true,
      coupon: data.length > 0 ? data : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve promotion codes :" + error.message,
    });
  }
}

// Search Orders
// export async function Search_orders({ eventName, FirstName, LastName, Email, Mobile, orderId, startDate, endDate }) {
//     try {
//         let orderCondition = {};
//         let userCondition = {};
//         // Convert dates to proper format
//         if (startDate) {
//             orderCondition.created = { [Op.gte]: new Date(startDate + 'T00:00:00Z') };
//         }
//         if (endDate) {
//             orderCondition.created = { ...orderCondition.created, [Op.lte]: new Date(endDate + 'T23:59:59Z') };
//         }
//         // Add conditions based on provided filters
//         if (orderId) {
//             orderCondition.OriginalTrxnIdentifier = { [Op.like]: `%${orderId.trim().toUpperCase()}%` };
//         }
//         if (Email) {
//             userCondition.Email = { [Op.like]: `%${Email.trim().toUpperCase()}%` };
//         }
//         if (Mobile) {
//             userCondition.Mobile = { [Op.like]: `%${Mobile.trim()}%` };
//         }
//         if (FirstName) {
//             userCondition.FirstName = { [Op.like]: `%${FirstName.trim().toUpperCase()}%` };
//         }
//         if (LastName) {
//             userCondition.LastName = { [Op.like]: `%${LastName.trim().toUpperCase()}%` };
//         }

//         orderCondition.is_free = null;

//         // Query orders with conditions
//         const orders = await Orders.findAll({
//             include: [{
//                 model: User,
//                 where: userCondition
//             }],
//             where: orderCondition,
//             order: [['id', 'DESC']]
//         });
//         let data = [];
//         for (const order of orders) {
//             let tickets;
//             if (eventName) {
//                 // console.log(order.OriginalTrxnIdentifier)
//                 tickets = await BookTicket.findAll({
//                     // where: {
//                     //     order_id: order.id,

//                     //     // '$Event.name$': { [Op.like]: `%${eventName.trim()}%` }
//                     // },
//                     include: [
//                         { model: Event, include: [Currency] },
//                         { model: EventTicketType }
//                     ],
//                     // group: ['event_ticket_id'],
//                     // group: ['BookTicket.event_ticket_id'],
//                     order: [['id', 'DESC']]
//                 });
//                 if (!tickets.length) {
//                     tickets = await AddonBook.findAll({
//                         include: [{ model: Event, include: [Currency] }],
//                         where: {
//                             order_id: order.id,
//                             '$Event.name$': { [Op.like]: `%${eventName.trim()}%` }
//                         }
//                     });
//                 }
//             } else {
//                 tickets = await BookTicket.findAll({
//                     include: [{ model: Event, include: [Currency] }, EventTicketType],
//                     where: { order_id: order.id },
//                     // group: ['BookTicket.event_ticket_id'],
//                     // group: ['event_ticket_id'],
//                     order: [['id', 'DESC']]
//                 });

//                 if (!tickets.length) {
//                     tickets = await AddonBook.findAll({
//                         include: [{ model: Event, include: [Currency] }],
//                         where: { order_id: order.id }
//                     });
//                 }
//             }
//             if (!tickets.length) {
//                 continue;
//             }

//             const order_data = {
//                 eventName: tickets[0].Event.Name,
//                 eventLocation: tickets[0].Event.location,
//                 eventStartDateTime: new Date(tickets[0].Event.date_from).toLocaleString(),
//                 // eventEndDateTime: new Date(tickets[0].Event.date_to).toLocaleString(),
//                 eventImageURL: `${process.env.SITE_URL}/images/eventimages/${tickets[0].Event.feat_image}`,
//                 currencysign: tickets[0].Event.Currency.Currency_symbol,
//                 currencyvalue: tickets[0].Event.Currency.Currency,
//                 orderid: order.id,
//                 orderrrn: order.OriginalTrxnIdentifier,
//                 name: `${order.User.FirstName} ${order.User.LastName}`,
//                 email: order.User.Email,
//                 mobile: order.User.PhoneNumber,
//                 totalamount: order.total_amount,
//                 stripekey: order.RRN,
//                 paymenttype: order.paymenttype,
//                 // orderDate: new Date(order.created).toISOString(),
//                 actualamount: Number(order.actualamount).toLocaleString(),
//                 couponcode: order.couponCode || false,
//                 afterdiscount: order.total_amount,
//                 // tickettotal,
//                 // ticketaddontotal: ticket_addons_count,
//             };

//             data.push(order_data);
//         }

//         return {
//             statusCode: 200,
//             success: true,
//             data,
//             count: data.length
//         };
//     } catch (error) {
//         console.error("Error:", error);
//         return {
//             statusCode: 500,
//             success: false,
//             message: 'Internal Server Error'
//         };
//     }
// }

// above old funtion  (Rupam Singh)
export async function Search_orders({
  eventName,
  FirstName,
  LastName,
  Email,
  Mobile,
  orderId,
  startDate,
  endDate,
}) {
  try {
    let orderCondition = {};
    let userCondition = {};
    // Convert dates to proper format
    if (startDate) {
      orderCondition.created = { [Op.gte]: new Date(startDate + "T00:00:00Z") };
    }
    if (endDate) {
      orderCondition.created = {
        ...orderCondition.created,
        [Op.lte]: new Date(endDate + "T23:59:59Z"),
      };
    }
    // Add conditions based on provided filters
    if (orderId) {
      orderCondition.OriginalTrxnIdentifier = {
        [Op.like]: `%${orderId.trim().toUpperCase()}%`,
      };
    }
    if (Email) {
      userCondition.Email = { [Op.like]: `%${Email.trim().toUpperCase()}%` };
    }
    if (Mobile) {
      userCondition.Mobile = { [Op.like]: `%${Mobile.trim()}%` };
    }
    if (FirstName) {
      userCondition.FirstName = {
        [Op.like]: `%${FirstName.trim().toUpperCase()}%`,
      };
    }
    if (LastName) {
      userCondition.LastName = {
        [Op.like]: `%${LastName.trim().toUpperCase()}%`,
      };
    }

    let eventID;
    const event = await Event.findOne({
      attributes: ["id"],
      where: {
        Name: {
          [Op.like]: `%${eventName}%`, // Use Sequelize's LIKE operator
        },
      },
    });

    if (event) {
      eventID = event.id;
      orderCondition.event_id = eventID;
    }

    orderCondition.is_free = null;

    // Query orders with conditions
    const orders = await Orders.findAll({
      include: [
        {
          model: User,
          where: userCondition,
        },
      ],
      where: orderCondition,
      order: [["id", "DESC"]],
    });
    let data = [];
    for (const order of orders) {
      let tickets, ticket_addons, accommodationInfo = {};

      if (eventName) {
        // console.log(order.OriginalTrxnIdentifier)
        tickets = await BookTicket.findAll({
          where: {
            order_id: order.id,
            "$Event.name$": { [Op.like]: `%${eventName.trim()}%` },
          },
          include: [
            { model: Event, include: [Currency] },
            { model: EventTicketType },
          ],
          // group: ['event_ticket_id'],
          // group: ['BookTicket.event_ticket_id'],
          order: [["id", "DESC"]],
        });

        if (!tickets.length) {
          tickets = await AddonBook.findAll({
            include: [{ model: Event, include: [Currency] }],
            where: {
              order_id: order.id,
              event_id: eventID
            },
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
        tickets = await BookTicket.findAll({
          include: [{ model: Event, include: [Currency] }, EventTicketType],
          where: { order_id: order.id },
          // group: ['BookTicket.event_ticket_id'],
          // group: ['event_ticket_id'],
          order: [["id", "DESC"]],
        });

        if (!tickets.length) {
          tickets = await AddonBook.findAll({
            include: [{ model: Event, include: [Currency] }],
            where: { order_id: order.id },
          });
        }
      }

      if (!tickets.length) {
        continue;
      }

      const order_data = {
        eventName: tickets[0].Event.Name,
        eventLocation: tickets[0].Event.location,
        eventStartDateTime: new Date(
          tickets[0].Event.date_from
        ).toLocaleString(),
        // eventEndDateTime: new Date(tickets[0].Event.date_to).toLocaleString(),
        eventImageURL: `${process.env.SITE_URL}/images/eventimages/${tickets[0].Event.feat_image}`,
        currencysign: tickets[0].Event.Currency.Currency_symbol,
        currencyvalue: tickets[0].Event.Currency.Currency,
        orderid: order.id,
        orderrrn: order.OriginalTrxnIdentifier,
        name: `${order.User.FirstName} ${order.User.LastName}`,
        email: order.User.Email,
        mobile: order.User.PhoneNumber,
        totalamount: order.total_amount,
        stripekey: order.RRN,
        paymenttype: order.paymenttype,
        // orderDate: new Date(order.created).toISOString(),
        actualamount: Number(order.actualamount).toLocaleString(),
        couponcode: order.couponCode || false,
        afterdiscount: order.total_amount,
        // tickettotal,
        // ticketaddontotal: ticket_addons_count,
      };

      data.push(order_data);
    }

    return {
      statusCode: 200,
      success: true,
      data,
      count: data.length,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    };
  }
}

// change ticket name(old Rupam sir)
// export async function changeTicketName(
//   { fname, lname, ticket_id, ticket_type, is_admin },
//   res
// ) {
//   // return false
//   let response = {};
//   try {
//     if (ticket_type == true) {
//       // const ticket = await BookTicket.findOne({ where: { id: ticket_id } });
//       const ticketDetail = await TicketDetail.findOne({
//         where: { id: ticket_id },
//       });

//       if (!ticketDetail) {
//         return res.status(404).json({
//           success: false,
//           message: "Ticket details not found.",
//         });
//       }
//       if (is_admin === "true") {
//         ticketDetail.fname = fname;
//         ticketDetail.lname = lname;
//         await ticketDetail.save(); // Use save instead of update
//         response = {
//           success: true,
//           message: "The name has been successfully updated by the admin.",
//         };
//       } else if (ticketDetail.name_update_count < 11) {
//         ticketDetail.fname = fname;
//         ticketDetail.lname = lname;
//         ticketDetail.name_update_count += 1;
//         await ticketDetail.save(); // Use save instead of update

//         response = {
//           success: true,
//           message: "The name has been successfully updated.",
//         };
//       } else {
//         response = {
//           success: false,
//           message:
//             "The maximum number of name changes has been reached. Please reach out to the administrator for assistance.",
//         };
//       }
//     } else {
//       const addonBook = await AddonBook.findOne({ where: { id: ticket_id } });
//       if (!addonBook) {
//         return res.status(404).json({
//           success: false,
//           message: "Addon details not found.",
//         });
//       }

//       if (is_admin === "true") {
//         addonBook.fname = fname;
//         addonBook.lname = lname;
//         await addonBook.save(); // Use save instead of update

//         response = {
//           success: true,
//           message: "The name has been successfully updated by the admin.",
//         };
//       } else if (addonBook.name_update_count < 11) {
//         addonBook.fname = fname;
//         addonBook.lname = lname;
//         addonBook.name_update_count += 1;
//         await addonBook.save(); // Use save instead of update

//         response = {
//           success: true,
//           message: "The name has been successfully updated.",
//         };
//       } else {
//         response = {
//           success: false,
//           message:
//             "The maximum number of name changes has been reached. Please reach out to the administrator for assistance.",
//         };
//       }
//     }

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error updating ticket name:", error.message);
//     res.status(500).json({
//       success: false,
//       message:
//         "An error occurred while updating the name. Please try again later.",
//     });
//   }
// }

// change ticket name(new kamal-18-10-2024 include ticket in email after the rename ticket)

export async function changeTicketName(
  {
    fname,
    lname,
    ticket_id,
    ticket_type,
    is_admin,
    user_id,
    is_transfer,
    email,
  },
  res
) {
  // return false
  let response = {};
  try {
    if (ticket_type == true) {
      // const ticket = await BookTicket.findOne({ where: { id: ticket_id } });
      const ticketDetail = await TicketDetail.findOne({
        where: { id: ticket_id },
      });

      if (!ticketDetail) {
        return res.status(404).json({
          success: false,
          message: "Ticket details not found.",
        });
      }
      if (is_admin === true) {
        ticketDetail.fname = fname;
        ticketDetail.lname = lname;
        await ticketDetail.save(); // Use save instead of update
        response = {
          success: true,
          message: "The name has been successfully updated by the admin.",
        };
      } else if (ticketDetail.name_update_count < 11) {
        ticketDetail.fname = fname;
        ticketDetail.lname = lname;
        ticketDetail.name_update_count += 1;
        await ticketDetail.save(); // Use save instead of update
        // User Details Find
        const userDetails = await User.findOne({
          where: { id: user_id },
          attributes: ["Email", "FirstName", "LastName"],
        });
        // ticket Book
        const ticketBookDetails = await BookTicket.findOne({
          where: { id: ticketDetail.tid },
          attributes: ["id", "order_id"],
        });
        // order Id find
        const orderDetails = await Order.findOne({
          where: { id: ticketBookDetails.order_id },
          attributes: ["id", "OriginalTrxnIdentifier"],
        });
        let email = userDetails.Email;

        const ticketQrCode = `${NEXT_S3_URL}/qrCodes/${ticketDetail.qrcode}`;

        //       let emailTemplateHtml = `
        //       <div style="max-width: 100%;  margin: auto; background-color: #f6f1e9;">
        //    <table style="width: 100%; background-color: #f6f1e9;">
        //      <tbody>
        //        <tr>
        //          <td>
        //            <div style="background-image: url(https://staging.eboxtickets.com/images/ondalinda/tickt-confm-bg.png); width: 100%; background-size: cover; background-position: center; text-align: center; padding: 50px 0;">
        //              <img alt="Ondalinda-logo" style="max-width: 90%;" src="https://staging.eboxtickets.com/images/ondalinda/invitition-new-black-logo.png">
        //            </div>
        //          </td>
        //        </tr>
        //      </tbody>
        //    </table>
        //    <table style="background-color: #f6f1e9; max-width: 600px; margin: auto;" width="100%">
        //      <tbody>
        //        <tr>
        //          <td style="width: 100%; max-width: 100%;">
        //            <table style="width: 100%; margin: auto; padding: 0 10px;">
        //              <tbody>
        //                <tr>
        //                  <td>
        //                    <br>
        //                    <br>
        //                    <p style="font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;"> Dear ${userDetails.FirstName}, </p>
        //                  </td>
        //                </tr>
        //                <tr>
        //                  <td>
        //                  <p style="font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.9;">We are excited to inform you that your OxMontenegro ticket has been successfully renamed. </p>
        //                  </td>
        //                </tr>
        //                <tr>
        //                  <td>
        //                    <p style="font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.9;"> Your updated ticket details are now available within your account for your convenience. If you have any questions or require assistance with this ticket renaming, please don't hesitate to reach out to us at hello@ondalinda.com. </p>
        //                  </td>
        //                </tr>
        //                <tr>
        //                  <td>
        //                    <br>
        //                    <br>
        //                    <div style="border-bottom: 1px solid rgb(207, 207, 207);"></div>
        //                    <br>
        //                    <br>
        //                  </td>
        //                </tr>
        //              </tbody>
        //            </table>
        //          </td>
        //        </tr>

        //        <tr>
        //        <td style="font-size:30px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;text-align:center">My Tickets</td>
        //        </tr>
        //        <tr>
        //          <td style="height: 20px;"></td>
        //        </tr>
        //        <!-- tickets -->
        //        <tr>
        //          <td>
        //            <div style=" max-width: 500px; background-color: #1F1D28; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
        //              <div style="background-image: url(https://staging.eboxtickets.com/images/ondalinda/careyes-tickets-bg.jpg); height: 200px; background-size: cover; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
        //                <div style="text-align: center; margin:auto;">
        //                  <h2 style=" margin: 0px; font-family: Arial, Helvetica, sans-serif;  font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;"> O<span style="color: #57b6b2;">x</span>MONTENEGRO </h2>
        //                  <p style=" font-style: italic; color: white;
        //                            font-size: 20px; margin: 0; font-family: none;">July 3-6, 2025</p>
        //                </div>
        //              </div>
        //              <div style="padding: 30px 20px;">
        //                <table style="width: 100%; color: white; font-family: Arial, Helvetica, sans-serif;">
        //                  <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
        //                    <td>Last Name</td>
        //                    <td>First Name</td>
        //                    <td>Order#</td>
        //                  </tr>
        //                  <tr style="text-transform: uppercase; font-size: 14px; ">
        //                  <td>${lname}</td>
        //                    <td>${fname}</td>
        //                    <td>${orderDetails.OriginalTrxnIdentifier}</td>
        //                  </tr>
        //                  <tr>
        //                    <td colspan="3" style="height: 30px;"></td>
        //                  </tr>
        //                  <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
        //                    <td colspan="3">TICKETS</td>
        //                  </tr>
        //                  <tr style="color: white; text-transform: uppercase; font-size: 14px;">
        //                    <td colspan="3">VIP EXPERIENCE PACKAGE</td>
        //                  </tr>
        //                  <tr>
        //                    <td colspan="3" style="height: 30px;"></td>
        //                  </tr>
        //                  <tr>
        //                    <td colspan="3">
        //                      <table cellspacing="0" style="width: 100%; ">
        //                        <tr style="color: #57b6b2; font-size: 14px;">
        //                          <td style="border-bottom: 1px solid #57b6b2;  padding: 10px 0;">Date & Time </td>
        //                          <td style="border-bottom: 1px solid #57b6b2;  padding: 10px 0;">Location </td>
        //                          <td style="border-bottom: 1px solid #57b6b2;  padding: 10px 0;">Event</td>
        //                        </tr>
        //                        <tr style="color: white; font-size: 11px;">
        //                          <td style="border-bottom: 1px solid #fff;  padding: 10px 0;">Thu 3rd July	</td>
        //                          <td style="border-bottom: 1px solid #fff;  padding: 10px 0;">La Serenissima</td>
        //                          <td style="border-bottom: 1px solid #fff;  padding: 10px 0;">Dinner & Party</td>
        //                        </tr>
        //                        <tr style="color: white; font-size: 11px;">
        //                          <td style="border-bottom: 1px solid #fff;  padding: 10px 0;">Fri 4th July</td>
        //                          <td style="border-bottom: 1px solid #fff;  padding: 10px 0;">Shining Armour</td>
        //                          <td style="border-bottom: 1px solid #fff;  padding: 10px 0;">Night Party</td>
        //                        </tr>
        //                        <tr style="color: white; font-size: 11px;">
        //                          <td style=" padding: 10px 0;">Sat 5th July	</td>
        //                          <td style=" padding: 10px 0;">Mythical & Mystical Creatures	</td>
        //                          <td style=" padding: 10px 0;">All Night Party</td>
        //                        </tr>
        //                      </table>
        //                    </td>
        //                  </tr>
        //                </table>
        //                <div style="margin: 60px 0;">
        //                  <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
        //                    <img style="width: 100%;" src=${ticketQrCode} alt="">
        //                  </div>
        //                </div>

        //              </div>
        //            </div>
        //          </td>
        //        </tr>
        //        <td style="height: 30px;"></td>
        //        </tr>`;
        //       emailTemplateHtml += `
        //      </tbody>
        //    </table>
        //    <table style="width:100%;">
        //    <tr>
        //      <td>
        //        <p style="font-size: 14px; margin-bottom: 0px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; text-align: center;"> Best Regards, </p>
        //      </td>
        //    </tr>
        //    <tr>
        //      <td>
        //        <p style="font-size: 14px; margin-top: 0px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; text-align: center;"> The ONDALINDA Team. </p>
        //      </td>
        //    </tr>
        //    <table style="width: 100%;">
        //      <tbody>
        //        <tr>
        //          <td width="100%" colspan="3" style="background-color: #333333;">
        //            <table style="width: 100%; margin: auto; text-align: center;">
        //              <tbody>
        //                <tr>
        //                  <td>
        //                    <br>
        //                    <br>
        //                    <a href="https://www.instagram.com/ondalinda_/?hl=en"  style="color: transparent;">
        //                      <img alt="" src="https://ondalinda.com/assets/EmailTemplateImages/images/outline-light-instagram-48.png" style="width: 30px;">
        //                    </a>
        //                    <a href="https://www.ondalinda.com/" style="padding: 0 20px; color: transparent;">
        //                      <img alt="" src="https://ondalinda.com/assets/EmailTemplateImages/images/outline-light-link-48.png" style="width: 30px;">
        //                    </a>
        //                    <a href="https://soundcloud.com/user-524758910"  style="color: transparent;">
        //                      <img alt="" src="https://ondalinda.com/assets/EmailTemplateImages/images/outline-light-soundcloud-48.png" style="width: 30px;">
        //                    </a>
        //                    <br>
        //                    <br>
        //                  </td>
        //                </tr>
        //                <tr>
        //                  <td style="border-bottom: 2px solid #505050;"></td>
        //                </tr>
        //                <tr>
        //                  <td style="padding: 0 5px;">
        //                    <br>
        //                    <p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; font-style: italic; color: white;"> Copyright © *2025* *Ondalinda Productions LLC*, All rights reserved.</p>
        //                  </td>
        //                </tr>
        //                <tr>
        //                  <td style="padding: 0 5px;">
        //                    <p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: white;"> Want to change how you receive these emails? <br> You can <a href="https://ondalindaxcareyes.us13.list-manage.com/profile?u=f32d4202e82375411d0b96b7f&id=d8385a0049&e=[UNIQID]&c=5491c3aa7f" style="color: white;">update your preferences</a> or <a href="https://ondalindaxcareyes.us13.list-manage.com/unsubscribe?u=f32d4202e82375411d0b96b7f&id=d8385a0049&e=[UNIQID]&c=5491c3aa7f" style="color: white;">unsubscribe from this list</a>
        //                    </p>
        //                    <br>
        //                  </td>
        //                </tr>
        //              </tbody>
        //            </table>
        //          </td>
        //        </tr>
        //    </table>
        //  </div>`;

        // content our database and email send mail-champ--

        const renameTemplate = await Emailtemplet.findOne({
          where: { eventId: 110, templateId: 6 },
        }); // Rename
        const sanitizedTemplate = renameTemplate.dataValues.description;
        const subject = renameTemplate.dataValues.subject;

        // mail champ template name
        const mailChampTemplateName =
          renameTemplate.dataValues.mandril_template;
        let template = renameTicketTemplate({
          UserName: userDetails.FirstName,
          LastName: lname,
          FirstName: fname,
          OrderID: orderDetails.OriginalTrxnIdentifier,
          QRCODE: ticketQrCode,
          html: sanitizedTemplate,
        });
        let extractedTemplate = template.html;

        // send Rename confirmation Email
        await sendRenameConfirmation({
          email,
          extractedTemplate,
          mailChampTemplateName,
          subject,
        });

        response = {
          success: true,
          message: "The name has been successfully updated.",
        };
      } else {
        response = {
          success: false,
          message:
            "The maximum number of name changes has been reached. Please reach out to the administrator for assistance.",
        };
      }
    } else {
      const addonBook = await AddonBook.findOne({
        where: { id: ticket_id },
        include: { model: Addons },
      });

      if (!addonBook) {
        return res.status(404).json({
          success: false,
          message: "Addon details not found.",
        });
      }

      if (is_admin === true) {
        addonBook.fname = fname;
        addonBook.lname = lname;
        await addonBook.save(); // Use save instead of update
        response = {
          success: true,
          message: "The name has been successfully updated by the admin.",
        };
      } else if (addonBook.name_update_count < 11) {
        addonBook.fname = fname;
        addonBook.lname = lname;
        addonBook.name_update_count += 1;
        await addonBook.save(); // Use save instead of update

        // User Details Find
        const userDetails = await User.findOne({
          where: { id: user_id },
          attributes: ["Email", "FirstName", "LastName"],
        });

        const addonBookDetails = await AddonBook.findOne({
          where: { id: addonBook.id },
          attributes: ["id", "order_id"],
        });
        // order Id find
        const orderDetails = await Order.findOne({
          where: { id: addonBook.order_id },
          attributes: ["id", "OriginalTrxnIdentifier"],
        });
        let email = userDetails.Email;
        const addonQrCode = `${NEXT_S3_URL}/qrCodes/${addonBook.addon_qrcode}`;

        const addonName = addonBook?.Addon?.dataValues?.name;
        const addonSortName = addonBook?.Addon?.dataValues?.sortName;
        const addonLocation = addonBook?.Addon?.dataValues?.addon_location;
        // const addonImage = addonBook?.Addon?.dataValues?.addon_image;
        const addonImage = `${NEXT_S3_URL}/profiles/${addonBook?.Addon?.dataValues?.addon_image || ""
          }`;
        const addonTime = addonBook?.Addon?.dataValues?.addon_time;
        const sort_day = addonBook?.Addon?.dataValues?.sort_day;
        const addonColor =
          addonBook?.Addon?.dataValues?.addon_type == "Special"
            ? "#DF8EA3"
            : "#499A96";
        //         let emailTemplateHtml = `
        //   <div style="max-width: 100%;  margin: auto; background-color: #f6f1e9;">
        // <table style="width: 100%; background-color: #f6f1e9;">
        //  <tbody>
        //    <tr>
        //      <td>
        //        <div style="background-image: url(https://staging.eboxtickets.com/images/ondalinda/tickt-confm-bg.png); width: 100%; background-size: cover; background-position: center; text-align: center; padding: 50px 0;">
        //          <img alt="Ondalinda-logo" style="max-width: 90%;" src="https://staging.eboxtickets.com/images/ondalinda/invitition-new-black-logo.png">
        //        </div>
        //      </td>
        //    </tr>
        //  </tbody>
        // </table>
        // <table style="background-color: #f6f1e9; max-width: 600px; margin: auto;" width="100%">
        //  <tbody>
        //    <tr>
        //      <td style="width: 100%; max-width: 100%;">
        //        <table style="width: 100%; margin: auto; padding: 0 10px;">
        //          <tbody>
        //            <tr>
        //              <td>
        //                <br>
        //                <br>
        //                <p style="font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;"> Dear ${userDetails.FirstName}, </p>
        //              </td>
        //            </tr>
        //            <tr>
        //              <td>
        //                <p style="font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.9;">We are excited to inform you that your OxMontenegro ticket has been successfully renamed. </p>
        //              </td>
        //            </tr>
        //            <tr>
        //              <td>
        //                <p style="font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.9;"> Your updated ticket details are now available within your account for your convenience. If you have any questions or require assistance with this ticket renaming, please don't hesitate to reach out to us at hello@ondalinda.com. </p>
        //              </td>
        //            </tr>
        //            <tr>
        //              <td>
        //                <br>
        //                <br>
        //                <div style="border-bottom: 1px solid rgb(207, 207, 207);"></div>
        //                <br>
        //                <br>
        //              </td>
        //            </tr>
        //          </tbody>
        //        </table>
        //      </td>
        //    </tr>

        //     <tr>
        //          <td style="font-size:30px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;text-align:center">My Tickets</td>
        //          </tr>

        //    <tr>
        //      <td style="height: 20px;"></td>
        //    </tr>
        //     <!-- addons -->
        //        <tr>
        //          <td>
        //            <div style=" max-width: 500px; background-color: #E6DFD5; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
        //              <div style="background-image: url(https://staging.ondalinda.com/assets/img/front-images/order-email-addon-bnr-bg.jpg); height: 200px; background-size: cover; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
        //                <div style="text-align: center; margin:auto;">
        //                  <h2 style=" margin: 0px;   font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
        //                    <span style="font-family: Arial, Helvetica, sans-serif; font-style: normal;">O</span><span style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style: normal;">x</span>MONTENEGRO
        //                  </h2>
        //                  <p style=" font-style: italic; color: white;
        //                            font-size: 20px; margin: 0; font-family: none;">July 3-6, 2025</p>
        //                </div>
        //              </div>
        //              <div style="padding: 30px 20px;">
        //                <table style="width: 100%; color: #000; font-family: Arial, Helvetica, sans-serif;">
        //                  <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
        //                    <td>Last Name</td>
        //                    <td>First Name</td>
        //                    <td>Order#</td>
        //                  </tr>
        //                  <tr style="text-transform: uppercase; font-size: 14px; ">
        //                  <td>${lname}</td>
        //                    <td>${fname}</td>
        //                    <td>${orderDetails.OriginalTrxnIdentifier}</td>
        //                  </tr>
        //                  <tr>
        //                    <td colspan="3" style="height: 30px;"></td>
        //                  </tr>
        //                  <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
        //                    <td colspan="3">TICKETS</td>
        //                  </tr>
        //                  <tr style="color: #000;  font-size: 14px;">
        //                    <td colspan="3" style="border-bottom: 1px solid #000; padding-bottom: 10px;"> Illiryan Voyage | Karaka ship</td>
        //                  </tr>
        //                  <tr>
        //                    <td colspan="3" style="height: 30px;"></td>
        //                  </tr>
        //                  <tr>
        //                    <td colspan="3">
        //                      <table cellspacing="0" style="width: 100%; ">
        //                        <tr style="color: #000; font-size: 12px;">
        //                          <td>
        //                            <b>Time:</b> 5pm
        //                          </td>
        //                          <td style="text-align:right;">
        //                            <b>Location:</b> Karaka Ship
        //                          </td>

        //                        </tr>
        //                      </table>
        //                    </td>
        //                  </tr>
        //                </table>
        //                <div style="margin: 60px 0;">
        //                  <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
        //                    <img style="width: 100%;" src=${addonQrCode} alt="">
        //                  </div>
        //                </div>

        //      </tbody>
        //    </table>`;
        //         emailTemplateHtml += `
        //  </tbody>
        // </table>
        // <table style="width:100%;">
        // <tr>
        //  <td>
        //    <p style="font-size: 14px; margin-bottom: 0px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; text-align: center;"> Best Regards, </p>
        //  </td>
        // </tr>
        // <tr>
        //  <td>
        //    <p style="font-size: 14px; margin-top: 0px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; text-align: center;"> The ONDALINDA Team. </p>
        //  </td>
        // </tr>
        // <table style="width: 100%;">
        //  <tbody>
        //    <tr>
        //      <td width="100%" colspan="3" style="background-color: #333333;">
        //        <table style="width: 100%; margin: auto; text-align: center;">
        //          <tbody>
        //            <tr>
        //              <td>
        //                <br>
        //                <br>
        //                <a href="https://www.instagram.com/ondalinda_/?hl=en" style="color: transparent;">
        //                  <img alt="" src="https://ondalinda.com/assets/EmailTemplateImages/images/outline-light-instagram-48.png" style="width: 30px;">
        //                </a>
        //                <a href="https://www.ondalinda.com/" style="padding: 0 20px; color: transparent;">
        //                  <img alt="" src="https://ondalinda.com/assets/EmailTemplateImages/images/outline-light-link-48.png" style="width: 30px;">
        //                </a>
        //                <a href="https://soundcloud.com/user-524758910" style="color: transparent;">
        //                  <img alt="" src="https://ondalinda.com/assets/EmailTemplateImages/images/outline-light-soundcloud-48.png" style="width: 30px;">
        //                </a>
        //                <br>
        //                <br>
        //              </td>
        //            </tr>
        //            <tr>
        //              <td style="border-bottom: 2px solid #505050;"></td>
        //            </tr>
        //            <tr>
        //              <td style="padding: 0 5px;">
        //                <br>
        //                <p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; font-style: italic; color: white;"> Copyright © *2025* *Ondalinda Productions LLC*, All rights reserved.</p>
        //              </td>
        //            </tr>
        //            <tr>
        //              <td style="padding: 0 5px;">
        //                <p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: white;"> Want to change how you receive these emails? <br> You can <a href="https://ondalindaxcareyes.us13.list-manage.com/profile?u=f32d4202e82375411d0b96b7f&id=d8385a0049&e=[UNIQID]&c=5491c3aa7f" style="color: white;">update your preferences</a> or <a href="https://ondalindaxcareyes.us13.list-manage.com/unsubscribe?u=f32d4202e82375411d0b96b7f&id=d8385a0049&e=[UNIQID]&c=5491c3aa7f" style="color: white;">unsubscribe from this list</a>
        //                </p>
        //                <br>
        //              </td>
        //            </tr>
        //          </tbody>
        //        </table>
        //      </td>
        //    </tr>
        // </table>
        // </div>`;

        const renameTemplate = await Emailtemplet.findOne({
          where: { eventId: 110, templateId: 8 },
        }); // Rename
        const sanitizedTemplate = renameTemplate.dataValues.description;
        const subject = renameTemplate.dataValues.subject;
        // mail champ template name
        const mailChampTemplateName =
          renameTemplate.dataValues.mandril_template;
        let template = renameAddonTemplate({
          UserName: userDetails.FirstName,
          LName: lname,
          FName: fname,
          OrderID: orderDetails.OriginalTrxnIdentifier,
          QRCODE: addonQrCode,
          Time: addonTime,
          backGround: addonColor,
          addonImage: addonImage,
          addonLocation: addonLocation,
          addonName: addonSortName,
          sort_day: sort_day,
          addon_name: addonName,
          addon_time: addonTime,
          addon_location: addonLocation,
          html: sanitizedTemplate,
        });
        let extractedTemplate = template.html;

        // send Rename confirmation Email
        await sendRenameConfirmation({
          email,
          extractedTemplate,
          mailChampTemplateName,
          subject,
        });
        // await sendRenameConfirmation({ email, emailTemplateHtml });
        response = {
          success: true,
          message: "The name has been successfully updated.",
        };
      } else {
        response = {
          success: false,
          message:
            "The maximum number of name changes has been reached. Please reach out to the administrator for assistance.",
        };
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating ticket name:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      // "An error occurred while updating the name. Please try again later.",
    });
  }
}
// // Helper to send Rename confirmation email
async function sendRenameConfirmation({
  email,
  extractedTemplate,
  mailChampTemplateName,
  subject,
}) {
  const template = mailChampTemplateName; // mailchimp template name
  const mergeVars = { ALLDATA: extractedTemplate };
  await sendEmail(email, mergeVars, template, subject);

  // const template = "Careyes 2024 Event Ticket Rename Confirmation-Test";
  // const mergeVars = { ALLDATA: emailTemplateHtml };
  // await sendEmail(email, mergeVars, template);
}
// // End ----


// // Kamal code transfer ticket(18-10-2024)
export async function transferTicket({
  fromName,
  toName,
  email,
  ticket_id,
  ticket_type,
  status,
  addons,
}) {
  try {
    // Validate input
    if (!fromName || !toName || !email || !ticket_id || !ticket_type) {
      return { success: false, message: "Missing required parameters." };
    }
    // Find the user by email
    const user = await User.findOne({
      where: { email },
      attributes: ['id', "Email", "FirstName", "LastName"],
    });
    if (!user) {
      return { success: false, message: "User not found." };
    }
    // Check eligibility for ticket transfer
    if (status !== 1) {
      return {
        success: false,
        message: "User is not eligible for ticket transfer.",
      };
    }
    // Find the ticket details
    const ticketDetail = await TicketDetail.findOne({
      where: { id: ticket_id },
    });
    if (!ticketDetail) {
      return { success: false, message: "Ticket not found." };
    }

    const ticket = await BookTicket.findOne({
      where: { id: ticketDetail.tid },
      include: { model: EventTicketType },
    });

    const ticketName = ticket.EventTicketType?.title;
    const transferFrom = user.id;
    const transferTo = ticket.cust_id;

    // Transfer logic based on ticket_type
    if (ticket_type == "ticket") {
      // Transfer the main ticket
      await transferTicketDetails(
        ticket,
        ticketDetail,
        transferFrom,
        transferTo
      );
      // Check and transfer any addons
      if (addons && addons.length > 0) {
        await transferAddons(
          ticket,
          transferFrom,
          transferTo,
          ticket_id,
          addons
        );
      }
      // Send confirmation email
      const order = await Order.findOne({
        where: { id: ticket.order_id },
      });
      const UserFind = await User.findOne({
        where: { id: ticket.transfer_user_id },
        attributes: ["Email", "FirstName", "LastName"],
      });
      const ticketDataId = ticket.id;
      const findTicketsQrCode = await TicketDetail.findOne({
        where: { tid: ticketDataId },
        attributes: ['id', 'qrcode', 'fname', 'lname'],
        raw: true,
      });
      const firstName = findTicketsQrCode?.fname || UserFind.FirstName;
      const lastName = findTicketsQrCode?.lname || UserFind.LastName;
      const ticketQrCode = `${NEXT_S3_URL}/qrCodes/${findTicketsQrCode.qrcode}`;
      // Addon details
      let emailTemplateHtmls = "";
      if (addons && addons.length > 0) {
        for (const addonId of addons) {
          const findAddonsData = await AddonBook.findOne({
            where: { ticket_id: ticket.id, id: addonId },
            include: { model: Addons },
            attributes: ['id', 'addon_qrcode'],
            raw: true,
          });
          let addonQrCode = "";
          if (findAddonsData) {
            addonQrCode = `${NEXT_S3_URL}/qrCodes/${findAddonsData.addon_qrcode}`;
          }
          if (findAddonsData) {
            const addonName = findAddonsData["Addon.name"];
            const addonLocation = findAddonsData["Addon.addon_location"];
            const addonTime = findAddonsData["Addon.addon_time"];
            const addonSortName = findAddonsData["Addon.sortName"];
            // const addonImage = findAddonsData["Addon.addon_image"];
            const addonImage = findAddonsData["Addon.addon_image"]
              ? `${NEXT_S3_URL}/profiles/${findAddonsData["Addon.addon_image"]}`
              : "";
            const sort_day = findAddonsData["Addon.sort_day"];
            const addonColor =
              findAddonsData["Addon.addon_type"] == "Special"
                ? "#DF8EA3"
                : "#499A96";
            emailTemplateHtmls += `
             <!-- addons -->
             <tr>
          <td style="height:20px;"></td>
          </tr>
             <tr>
               <td>
                 <div style=" max-width: 500px; background-color: ${addonColor}; border-radius: 30px; margin: auto; overflow: hidden; background-color: #e6dfd5;border-radius: 30px; ">
                   <div style="background-image: url(${addonImage}); height: 220px; background-size: cover; border-radius: 30px; overflow: hidden; background-position: center; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                     <div
                                        style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                        <div style="text-align: center; margin:auto;">
                                            <h2
                                                style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                                O<span
                                                    style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;">x</span>CAREYES
                                            </h2>
                                            <p
                                                style=" color: white;
                                font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style:normal; margin: 0;">
                                                Nov 6 - 9, 2025</p>
                                        </div>
                                    </div>
                   </div>
                   <div style="padding: 30px 20px;">
                     <table style="width: 100%; color: #fff; font-family: Arial, Helvetica, sans-serif;">
                       <tr style="color: #FCA3BB; text-transform: uppercase; font-size: 14px;">
                         <td>Last Name</td>
                         <td>First Name</td>
                         <td>Order#</td>
                       </tr>
                       <tr style="text-transform: uppercase; font-size: 14px; color: #000; ">
                         <td>${lastName}</td>
                         <td>${firstName}</td>
                         <td>${order.OriginalTrxnIdentifier}</td>
                       </tr>


                       <tr>
                                                <td colspan="3" style="height: 60px; border-bottom: 1px solid #FCA3BB;"></td>
                                            </tr>
    
                                            <tr>
                                                <td colspan="3" style="height: 15px; "></td>
                                            </tr>



                       <tr style="color: #FCA3BB; text-transform: uppercase; font-size: 14px;">
                         <td colspan="3">TICKETS</td>
                       </tr>

                       <tr style="color: #000;  font-size: 14px;">
                         <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                         <td style="color: #FCA3BB; text-transform: uppercase;font-size: 14px;text-align: right;">3 Days</td>
                       </tr>
                       <tr>
                         <td colspan="3" style="height: 30px; color: #000;"></td>
                       </tr>
                       <tr style="color: black; font-size: 12px;">
                                                <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
    font-weight: 500;">
                                                      Transportation is valid within Careyes &amp; To / From official Ondalinda events only.
                                                </td>
                                            </tr>
                     </table>
                     <div style="margin: 60px 0;">
                       <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                         <img style="width: 100%;" src=${addonQrCode} alt="">
                       </div>
                     </div>

          </td>
            </tr>
            <tr>
          <td style="height:20px;"></td>
          </tr>`;
          }
        }
      }
      //  new send email maindrial and content send our database - template manager
      const transferTemplate = await Emailtemplet.findOne({
        // where: { eventId: 110, templateId: 9 },
        where: { eventId: 111, templateId: 9 },
      }); // Rename
      const sanitizedTemplate = transferTemplate.dataValues.description;
      const subject = transferTemplate.dataValues.subject;
      // mail champ template name
      const mailChampTemplateName =
        transferTemplate.dataValues.mandril_template;
      let template = ticketTransferTemplate({
        ticketQR: ticketQrCode,
        TicketOrderID: order.OriginalTrxnIdentifier,
        fName: firstName,
        Lname: lastName,
        fromName: fromName,
        toName: toName,
        TicketName: ticketName,
        AdoonData: emailTemplateHtmls,
        html: sanitizedTemplate,
      });
      let emailTemplateHtml = template.html;
      // send Rename confirmation Email
      await sendTransferConfirmation({
        email,
        emailTemplateHtml,
        mailChampTemplateName,
        subject,
      });
      //       Your ticket has being successfully transferred to Adriana Morales, we
      // have sent them an email with the ticket confirmation.
      return {
        success: true,
        message: `Your ticket has being successfully transferred to ${firstName} ${lastName}, We have sent them an email with the ticket confirmation.`,
      };

    }

    return { success: false, message: "Invalid ticket type." };
  } catch (error) {
    console.error("Error transferring ticket:", error);
    return {
      success: false,
      message: `Internal Server Error: ${error.message}`,
    };
  }
}
// Helper to transfer ticket details
async function transferTicketDetails(
  ticket,
  ticketDetail,
  transferFrom,
  transferTo
) {

  // const qrCodeImage = await generateQR({
  //   userId: transferFrom,
  //   orderId: ticket.order_id,
  //   ticketId: ticketDetail.id,
  //   ticketType: "ticket",
  // });

  const qrCodeImage = await generateTicketQrToS3({
    userId: transferFrom,
    orderId: ticket.order_id,
    ticketId: ticketDetail.id,
    ticketType: "ticket",
  });

  if (qrCodeImage.success) {
    const newQrCode = qrCodeImage.filePath;
    ticketDetail.qrcode = newQrCode;
    ticketDetail.transfer_user_id = transferFrom;
    ticketDetail.transfer_reply = "tickettransfer";
    ticketDetail.transfer_status = "Y";
    await ticketDetail.save();

    ticket.transfer_user_id = transferFrom;
    ticket.transfer_reply = "tickettransfer";
    ticket.transfer_status = "Y";
    await ticket.save();

    // Create transfer record for ticket
    await TicketTransfer.create({
      user_id_to: transferFrom,
      user_id_from: transferTo,
      user_id_to_qrcode: ticketDetail.qrcode,
      user_id_from_qrcode: ticketDetail.qrcode,
      typeofticket: "ticket",
      createdate: new Date(),
    });
  }
}
// Helper to transfer addons
async function transferAddons(
  ticket,
  transferFrom,
  transferTo,
  ticket_id,
  addons
) {
  for (const addonId of addons) {
    const addonsBook = await AddonBook.findOne({
      where: {
        user_id: ticket.cust_id,
        transfer_user_id: null,
        ticket_status: null,
        id: addonId,
      },
    });

    if (addonsBook) {

      // const qrCodeImage = await generateQR({
      //   userId: transferFrom,
      //   orderId: addonsBook.order_id,
      //   ticketId: addonsBook.id,
      //   ticketType: "addon",
      // });

      const qrCodeImage = await generateTicketQrToS3({
        userId: transferFrom,
        orderId: addonsBook.order_id,
        ticketId: addonsBook.id,
        ticketType: "addon",
      });


      if (qrCodeImage.success) {
        const newQrCode = qrCodeImage.filePath;
        addonsBook.transfer_user_id = transferFrom;
        addonsBook.transfer_reply = "addontransfer";
        addonsBook.addon_qrcode = newQrCode;
        addonsBook.ticket_id = ticket_id;
        await addonsBook.save();

        // Create transfer record for addon
        await TicketTransfer.create({
          user_id_to: transferFrom,
          user_id_from: transferTo,
          user_id_to_qrcode: addonsBook.addon_qrcode,
          user_id_from_qrcode: addonsBook.addon_qrcode,
          typeofticket: "addon",
          createdate: new Date(),
        });
      }
    }
  }
}

// Helper to send confirmation email
async function sendTransferConfirmation({
  fromName,
  toName,
  email,
  emailTemplateHtml,
  mailChampTemplateName,
  subject,
}) {
  const template = mailChampTemplateName;
  const mergeVars = { ALLDATA: emailTemplateHtml };
  await sendEmail(email, mergeVars, template, subject);
}

// ---End ---//

// view ticket and addons

export async function myTickets({ user_id }, res) {
  // const user_id = req.body.userId; // Get userId from request body
  try {
    const tickets = [];

    const ticketDetails = await BookTicket.findAll({
      include: [
        { model: Orders },
        { model: User },
        { model: TicketDetail },
        {
          model: Event,
          where: { status: "Y" }, // Filter for events with status "Y"
        },
        { model: EventTicketType },
      ],
      where: {
        // event_id: {
        //   [Op.in]: [109, 110],
        // },
        [Op.or]: [{ cust_id: user_id }, { transfer_user_id: user_id }],
      },
      order: [["id", "DESC"]],
    });

    // Process Ticket Details
    for (const ticket of ticketDetails) {
      // console.log('>>>>>>>>>>',ticket.EventTicketType.ticket_image);
      const ticketDetail = ticket.TicketDetails[0];
      let userTransfer;
      if (ticketDetail.transfer_user_id) {
        userTransfer = await User.findOne({
          where: { id: ticket.transfer_user_id },
          attributes: ["Email", "FirstName", "LastName"],
        });
      }
      // if (ticket.event_id == 109 || ticket.event_id == 110) {
      tickets.push({
        eventId: ticket.Event.id,
        ticket_image: ticket.EventTicketType.ticket_image,
        eventticketname: ticket.EventTicketType.title,
        transfer_user_id: ticket.transfer_user_id,
        ticketid: ticket.id,
        transferticket: ticket.transfer_reply,
        transferticketemail: userTransfer?.Email || null,
        name: ticketDetail?.fname || null,
        lname: ticketDetail?.lname || null,
        email: ticket.User.email,
        price: ticket.User.email, // Adjust price field accordingly
        OriginalTrxnIdentifier: ticket.Order?.OriginalTrxnIdentifier || null,
        eventImageURL: ticket.Event.ImageURL,
        eventnameHTML: ticket.Event.Venue,
        eventdateformat: ticket.Event.StartDate,
        eventimagename: ticket.Event.ImageURL,
        // qrcode: `${process.env.SITE_URL}/qrimages/Ondalinda/${ticketDetail?.qrcode}`,
        qrcode: ticketDetail?.qrcode,
        qrcodename: ticketDetail?.qrcode || null,
        ticket_status: ticket?.ticket_status || null,
        cancel_date: ticket?.cancel_date || null,
        isticket: true,
        ticketRenameCount: ticketDetail?.name_update_count || 0,
      });
      // }
    }

    // Fetch Addon Details
    const ticketAddons = await AddonBook.findAll({
      include: [
        { model: Addons },
        { model: User },
        { model: Orders },
        {
          model: Event,
          where: { status: "Y" }, // Filter for events with status "Y"
        },
      ],
      where: {
        // event_id: {
        //   [Op.in]: [109, 110], // Match if event_id is 109 or 110
        // },
        [Op.or]: [{ user_id: user_id }, { transfer_user_id: user_id }],
        // ticket_status: {
        //   [Op.is]: null, // Check if ticket_status is NULL
        // },
      },
      order: [["created", "DESC"]],
    });

    // Process Addon Details
    for (const addon of ticketAddons) {
      let userTransfer;
      if (addon.transfer_user_id) {
        userTransfer = await User.findOne({
          where: { id: addon.transfer_user_id },
          attributes: ["Email", "FirstName", "LastName"],
        });
      }
      // if (addon.event_id == 109 || addon.event_id == 110) {
      tickets.push({
        eventId: addon.Event.id,
        ticket_image: addon.Addon.addon_image,
        addon_type: addon.Addon.addon_type,
        sortName: addon.Addon.sortName,
        eventticketname: addon.Addon.name,
        transfer_user_id: addon.transfer_user_id,
        ticketid: addon.id,
        transferticket: addon.transfer_reply,
        transferticketemail: userTransfer?.Email || null,
        name: addon.fname || null,
        lname: addon.lname || null,
        email: addon.User.email,
        addonPrice: addon.Addon.price,
        addonDescription: addon.Addon.description,
        addon_day: addon.Addon.addon_day,
        sort_day: addon.Addon.sort_day,
        addon_time: addon.Addon.addon_time,
        addon_location: addon.Addon.addon_location,
        addon_dress_code: addon.Addon.addon_dress_code,
        OriginalTrxnIdentifier: addon.Order?.OriginalTrxnIdentifier || null,
        eventImageURL: `${process.env.SITE_URL}/images/eventimages/${addon.Event.feat_image}`,
        eventnameHTML: addon.Event.Venue,
        eventdateformat: addon.Event.StartDate,
        eventimagename: addon.Event.eventimagename,
        // qrcode: `${process.env.SITE_URL}/qrimages/Ondalinda/${addon.addon_qrcode}`,
        // qrcodename: addon.addon_qrcode || null,
        ticket_status: addon?.ticket_status || null,
        cancel_date: addon?.cancel_date || null,
        qrcode: addon.addon_qrcode,
        qrcodename: addon.addon_qrcode || null,
        isticket: false,
      });
      // }
    }

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching tickets.",
    });
  }
}

// order success
export async function orderSuccess(
  { payment_intent, payment_intent_client_secret, redirect_status },
  req,
  res
) {
  try {
    // Find the order by payment intent (RRN)
    const order_api_check = await Orders.findOne({
      where: { RRN: payment_intent },
    });

    // Find the payment by payment intent
    const payment_check = await Payment.findOne({
      where: { payment_intent: payment_intent },
    });

    if (!payment_check) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const user_id = payment_check.user_id;

    // Find the user by ID
    const user_cred = await User.findOne({
      where: { id: user_id },
    });

    const fname = user_cred?.FirstName || "";
    const lname = user_cred?.LastName || "";

    let response = {};

    if (payment_check.paymentstatus === "succeeded") {
      // Get the order details and related ticket and event details
      const order_detail = await Orders.findOne({
        where: { RRN: payment_intent },
        include: [
          {
            model: User,
            attributes: ["Email", "FirstName"],
          },
        ],
      });

      const order_id = order_detail.id;

      const event_detail = await BookTicket.findOne({
        where: { order_id: order_id },
        include: [{ model: Event }],
      });
      if (!order_detail) {
        return res.json({
          success: false,
          message: "Order not found.",
        });
      }
      const useremail = order_detail.User.Email;
      const name = order_detail.User.FirstName;

      // Prepare response for successful payment
      response = {
        success: true,
        message: "Payment Completed Successfully !!",
        order_id: order_detail.OriginalTrxnIdentifier,
        purchase_id: payment_intent,
        user_id: user_id,
        event_id: event_detail.Event.dataValues.id,
        eventnamehtml: event_detail.Event.dataValues.Name,
        eventimagename: event_detail.Event.dataValues.ImageURL,
        eventdateformat: event_detail.Event.dataValues.createdAt,
        email: useremail,
      };
    } else {
      // Prepare response for failed payment
      response = {
        success: false,
        message: "Payment Failed",
        // purchase_id: payment_intent,
        // user_id: user_id,
        // email: user_cred?.email || '',
        // eventnamehtml: order_detail?.Ticket[0]?.Event.eventnamehtml || '',
        // eventimagename: order_detail?.Ticket[0]?.Event.eventimagename || '',
        // eventdateformat: order_detail?.Ticket[0]?.Event.eventdateformat || ''
      };
    }

    // res.status(200).json(response);
    return response;
  } catch (error) {
    console.error("Error processing order success:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the order.",
    });
  }
}

// transferticketcheck
export async function transferTicketCheck({ ticket_id }, req, res) {
  if (ticket_id) {
    try {
      const ticket = await BookTicket.findOne({
        where: {
          id: ticket_id,
          // transfer_status: 'Y',
        },
      });
      // console.log("ticket_id", ticket);
      // return false
      if (ticket) {
        return {
          success: true,
          message: "Successfully",
        };
      } else {
        return {
          success: false,
          message: "Data not available",
        };
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  } else {
    res.json({
      success: false,
      message: "Ticket id is required",
    });
  }
}

// scanTickets all data show
import moment from "moment";
// change Api ScanTicket view and  search succssfully working (24-01-2025)
// export async function ticketExport(
//   {
//     name,
//     lname,
//     email,
//     mobile,
//     orderId,
//     scanned,
//     startDate,
//     endDate,
//     event_id,
//     ticket_type,
//   },
//   res
// ) {
//   try {
//     const commonConditions = [];

//     // Date Conditions
//     if (startDate) {
//       const formattedStartDate = moment(startDate).startOf("day").toISOString();
//       commonConditions.push({
//         "$Order.createdAt$": { [Op.gte]: formattedStartDate },
//       });
//     }
//     if (endDate) {
//       const formattedEndDate = moment(endDate).endOf("day").toISOString();
//       commonConditions.push({
//         "$Order.createdAt$": { [Op.lte]: formattedEndDate },
//       });
//     }

//     // Additional Conditions
//     if (orderId) {
//       commonConditions.push({
//         "$Order.OriginalTrxnIdentifier$": {
//           [Op.like]: `%${orderId.toUpperCase()}%`,
//         },
//       });
//     }
//     if (email) {
//       commonConditions.push({
//         "$User.Email$": { [Op.like]: `%${email.toUpperCase()}%` },
//       });
//     }
//     if (mobile) {
//       commonConditions.push({
//         "$User.PhoneNumber$": { [Op.like]: `%${mobile.toUpperCase()}%` },
//       });
//     }
//     if (name) {
//       commonConditions.push({
//         "$User.FirstName$": { [Op.like]: `%${name.toUpperCase()}%` },
//       });
//     }
//     if (lname) {
//       commonConditions.push({
//         "$User.LastName$": { [Op.like]: `%${lname.toUpperCase()}%` },
//       });
//     }

//     // Scanned/Cancelled Status Handling
//     let scanstatus = "all";
//     if (scanned === "scanned") {
//       scanstatus = 1;
//       commonConditions.push({ scannedstatus: 1 });
//     } else if (scanned === "notscanned") {
//       scanstatus = 0;
//       commonConditions.push({ scannedstatus: 0 });
//     } else if (scanned === "cancelled") {
//       commonConditions.push({
//         ticket_status: { [Op.not]: null },
//       });
//     }

//     // Fetch Tickets
//     const findTickets =
//       ticket_type !== "addon"
//         ? await BookTicket.findAll({
//           include: [
//             {
//               model: TicketDetail,
//               where: {
//                 ...(scanstatus !== "all" && { status: scanstatus }),
//               },
//             },
//             EventTicketType,
//             {
//               model: User,
//               attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
//             },
//             {
//               model: Orders,
//               where: {
//                 [Op.or]: [
//                   { is_free: { [Op.is]: null } },
//                   { discountType: { [Op.ne]: "" } },
//                 ],
//               },
//             },
//           ],
//           where: {
//             event_id: event_id,
//             ...(commonConditions.length > 0 && { [Op.and]: commonConditions }),
//           },
//         })
//         : [];

//     // Fetch Addons
//     const findAddons =
//       ticket_type !== "ticket"
//         ? await AddonBook.findAll({
//           include: [
//             {
//               model: User,
//               attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
//             },
//             {
//               model: Addons,
//               attributes: ["id", "name"],
//             },
//             {
//               model: Orders,
//               where: {
//                 [Op.or]: [
//                   { is_free: { [Op.is]: null } },
//                   { couponCode: { [Op.not]: null } },
//                 ],
//               },
//             },
//           ],
//           where: {
//             event_id: event_id,
//             ...(commonConditions.length > 0 && { [Op.and]: commonConditions }),
//           },
//         })
//         : [];

//     // Prepare Order Data
//     const orderData = [];
//     let totalTickets = 0;
//     let totalScannedTickets = 0;
//     let totalCancelTicket = 0;
//     let totalAddons = 0;
//     let totalScannedAddons = 0;
//     let totalCancelAddon = 0;


//     // Process Tickets
//     for (const ticket of findTickets) {
//       // totalTickets++;
//       const ticketDetail = ticket.TicketDetails?.[0];
//       if (ticketDetail?.status === 1) totalScannedTickets++;
//       if (ticket.ticket_status === "cancel") totalCancelTicket++;
//       if (ticket.ticket_status === null) totalTickets++;

//       const membershipType = await MembershipType.findOne({
//         where: {
//           // id: ticketDetail.membership_type_id,
//         },
//         attributes: ["title"],
//       });

//       const ticketData = {
//         orderId: ticket.Order.OriginalTrxnIdentifier,
//         totalOrderAmount: ticket.Order.total_amount,
//         orderDate: moment(ticket.Order.createdAt).format("YYYY-MM-DD"),
//         ticketType: "ticket",
//         ticketQR: ticketDetail?.qrcode,
//         ticketId: ticketDetail?.id,
//         ticketName: ticket.EventTicketType?.title,
//         memberFirstName: ticket.User.FirstName || "",
//         memberLastName: ticket.User.LastName || "",
//         memberEmail: ticket.User.Email || "",
//         memberMobile: ticket.User.PhoneNumber || "",
//         membershipType: membershipType?.title || "N/A",
//         isTransfer: ticketDetail?.transfer_reply ? "Yes" : "No",
//         isCanceled: ticketDetail?.ticket_status === "cancel",
//       };

//       if (ticketDetail.transfer_reply) {
//         const transferUser = await User.findOne({
//           where: { id: ticketDetail.transfer_user_id },
//           attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
//         });
//         ticketData.transferToFname = transferUser?.FirstName || "";
//         ticketData.transferToLname = transferUser?.LastName || "";
//       }

//       ticketData.ticketRenameFname = ticketDetail.fname || "";
//       ticketData.ticketRenameLname = ticketDetail.lname || "";

//       if (ticketDetail.scanner_id) {
//         const scannerDetails = await User.findOne({
//           where: { id: ticketDetail.scanner_id },
//           attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
//         });
//         ticketData.usedBy = ticketDetail.usedby || "";
//         ticketData.usedDate = moment(ticketDetail.usedate).format(
//           "YYYY-MM-DD HH:mm:ss"
//         );
//         ticketData.scannedBy = `${scannerDetails?.FirstName} ${scannerDetails?.LastName}`;
//       }
//       orderData.push(ticketData);
//     }

//     // Process Addons
//     for (const addon of findAddons) {
//       // totalAddons++;
//       if (addon.scannedstatus === 1) totalScannedAddons++;
//       if (addon.ticket_status === "cancel") totalCancelAddon++;
//       if (addon.ticket_status === null) totalAddons++;
//       // console.log("-------------------------------", addon.Addon.dataValues.name)


//       const addonData = {
//         orderId: addon.Order.OriginalTrxnIdentifier,
//         totalOrderAmount: addon.Order.total_amount,
//         orderDate: moment(addon.Order.createdAt).format("YYYY-MM-DD"),
//         ticketType: "addon",
//         ticketQR: addon.addon_qrcode,
//         addonId: addon.id,
//         addonName: addon.name,
//         memberFirstName: addon.User.FirstName || "",
//         memberLastName: addon.User.LastName || "",
//         memberEmail: addon.User.Email || "",
//         memberMobile: addon.User.PhoneNumber || "",
//         ticketName: addon.Addon.dataValues.name || "",
//         isTransfer: addon.transfer_reply ? "Yes" : "No",
//         isCanceled: addon.ticket_status === "cancel",
//       };

//       if (addon.transfer_reply) {
//         const transferUser = await User.findOne({
//           where: { id: addon.transfer_user_id },
//           attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
//         });
//         addonData.transferToFname = transferUser?.FirstName || "";
//         addonData.transferToLname = transferUser?.LastName || "";
//       }

//       addonData.ticketRenameFname = addon.fname || "";
//       addonData.ticketRenameLname = addon.lname || "";

//       if (addon.scannedstatus == 1) {
//         const scannerDetails = await User.findOne({
//           where: { id: addon.scanner_id },
//         });
//         addonData.usedBy = addon.usedby || "";
//         addonData.usedDate = moment(addon.usedate).format(
//           "YYYY-MM-DD HH:mm:ss"
//         );
//         addonData.scannedBy = `${scannerDetails?.FirstName} ${scannerDetails?.LastName}`;
//       }
//       orderData.push(addonData);
//     }

//     orderData.sort((a, b) => a.orderId.localeCompare(b.orderId));

//     return res.status(200).json({
//       success: true,
//       message: "Orders Data fetched successfully!",
//       data: orderData,
//       ticketSaleInfo: {
//         totalTickets,
//         totalScannedTickets,
//         totalCancelTicket,
//         totalAddons,
//         totalScannedAddons,
//         totalCancelAddon,
//       },
//     });
//   } catch (error) {
//     console.error("Error during ticket export:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error during ticket export",
//       error: error.message,
//     });
//   }
// }
export async function ticketExport(
  {
    name,
    lname,
    email,
    mobile,
    orderId,
    scanned,
    startDate,
    endDate,
    event_id,
    ticket_type,
  },
  res
) {
  try {
    const commonConditionsTicket = [];
    const commonConditionsAddon = [];

    // Date Conditions
    if (startDate) {
      const formattedStartDate = moment(startDate).startOf("day").toISOString();
      commonConditionsTicket.push({ "$Order.createdAt$": { [Op.gte]: formattedStartDate } });
      commonConditionsAddon.push({ "$Order.createdAt$": { [Op.gte]: formattedStartDate } });
    }
    if (endDate) {
      const formattedEndDate = moment(endDate).endOf("day").toISOString();
      commonConditionsTicket.push({ "$Order.createdAt$": { [Op.lte]: formattedEndDate } });
      commonConditionsAddon.push({ "$Order.createdAt$": { [Op.lte]: formattedEndDate } });
    }

    // Additional Filters
    if (orderId) {
      const condition = { "$Order.OriginalTrxnIdentifier$": { [Op.like]: `%${orderId.toUpperCase()}%` } };
      commonConditionsTicket.push(condition);
      commonConditionsAddon.push(condition);
    }
    if (email) {
      const condition = { "$User.Email$": { [Op.like]: `%${email.toUpperCase()}%` } };
      commonConditionsTicket.push(condition);
      commonConditionsAddon.push(condition);
    }
    if (mobile) {
      const condition = { "$User.PhoneNumber$": { [Op.like]: `%${mobile.toUpperCase()}%` } };
      commonConditionsTicket.push(condition);
      commonConditionsAddon.push(condition);
    }
    if (name) {
      const condition = { "$User.FirstName$": { [Op.like]: `%${name.toUpperCase()}%` } };
      commonConditionsTicket.push(condition);
      commonConditionsAddon.push(condition);
    }
    if (lname) {
      const condition = { "$User.LastName$": { [Op.like]: `%${lname.toUpperCase()}%` } };
      commonConditionsTicket.push(condition);
      commonConditionsAddon.push(condition);
    }

    // Scanned/Cancelled status
    let scanstatus = "all";
    if (scanned == "scanned") {
      scanstatus = 1;
      commonConditionsAddon.push({ scannedstatus: 1 });
    } else if (scanned == "notscanned") {
      scanstatus = 0;
      commonConditionsAddon.push({ scannedstatus: 0 });
    } else if (scanned == "cancelled") {
      commonConditionsTicket.push({ ticket_status: { [Op.not]: null } });
      commonConditionsAddon.push({ ticket_status: { [Op.not]: null } });
    }

    // console.log("commonConditionsTicket", commonConditionsTicket);
    // console.log("commonConditionsAddon", commonConditionsAddon);

    // Fetch Tickets (latest first)
    const findTickets = ticket_type !== "addon"
      ? await BookTicket.findAll({
        include: [
          {
            model: TicketDetail,
            where: { ...(scanstatus !== "all" && { status: scanstatus }) },
          },
          EventTicketType,
          {
            model: User,
            attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
          },
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } },
                { discountType: { [Op.ne]: "" } },
              ],
            },
          },
        ],
        where: {
          event_id,
          ...(commonConditionsTicket.length > 0 && { [Op.and]: commonConditionsTicket }),
        },
        order: [[{ model: Orders }, 'createdAt', 'DESC']], // sort by order createdAt DESC
      })
      : [];

    // Fetch Addons (latest first)
    const findAddons = ticket_type !== "ticket"
      ? await AddonBook.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "FirstName", "LastName", "Email", "PhoneNumber"],
          },
          {
            model: Addons,
            attributes: ["id", "name"],
          },
          {
            model: Orders,
            where: {
              [Op.or]: [
                { is_free: { [Op.is]: null } },
                { couponCode: { [Op.not]: null } },
              ],
            },
          },
        ],
        where: {
          event_id,
          ...(commonConditionsAddon.length > 0 && { [Op.and]: commonConditionsAddon }),
        },
        order: [[{ model: Orders }, 'createdAt', 'DESC']], // sort by order createdAt DESC
      })
      : [];

    // Prepare data
    const orderData = [];
    let totalTickets = 0,
      totalScannedTickets = 0,
      totalCancelTicket = 0,
      totalAddons = 0,
      totalScannedAddons = 0,
      totalCancelAddon = 0;

    // Process Tickets
    for (const ticket of findTickets) {
      const ticketDetail = ticket.TicketDetails?.[0];
      if (ticketDetail?.status === 1) totalScannedTickets++;
      if (ticket.ticket_status === "cancel") totalCancelTicket++;
      if (ticket.ticket_status === null) totalTickets++;

      const ticketData = {
        orderId: ticket.Order.OriginalTrxnIdentifier,
        totalOrderAmount: ticket.Order.total_amount,
        orderDate: moment(ticket.Order.createdAt).format("YYYY-MM-DD"),
        ticketType: "ticket",
        ticketQR: ticketDetail?.qrcode,
        ticketId: ticketDetail?.id,
        ticketName: ticket.EventTicketType?.title,
        memberFirstName: ticket.User?.FirstName || "",
        memberLastName: ticket.User?.LastName || "",
        memberEmail: ticket.User?.Email || "",
        memberMobile: ticket.User?.PhoneNumber || "",
        membershipType: "N/A",
        isTransfer: ticketDetail?.transfer_reply ? "Yes" : "No",
        isCanceled: ticketDetail?.ticket_status === "cancel",
        ticketRenameFname: ticketDetail?.fname || "",
        ticketRenameLname: ticketDetail?.lname || "",
      };

      if (ticketDetail?.transfer_reply) {
        const transferUser = await User.findOne({
          where: { id: ticketDetail.transfer_user_id },
          attributes: ["FirstName", "LastName"],
        });
        ticketData.transferToFname = transferUser?.FirstName || "";
        ticketData.transferToLname = transferUser?.LastName || "";
      }

      if (ticketDetail?.scanner_id) {
        const scannerDetails = await User.findOne({
          where: { id: ticketDetail.scanner_id },
          attributes: ["FirstName", "LastName"],
        });
        ticketData.usedBy = ticketDetail.usedby || "";
        ticketData.usedDate = moment(ticketDetail.usedate).format("YYYY-MM-DD HH:mm:ss");
        ticketData.scannedBy = `${scannerDetails?.FirstName || ""} ${scannerDetails?.LastName || ""}`;
      }
      orderData.push(ticketData);
    }

    // Process Addons
    for (const addon of findAddons) {
      if (addon.scannedstatus === 1) totalScannedAddons++;
      if (addon.ticket_status === "cancel") totalCancelAddon++;
      if (addon.ticket_status === null) totalAddons++;

      const addonData = {
        orderId: addon.Order.OriginalTrxnIdentifier,
        totalOrderAmount: addon.Order.total_amount,
        orderDate: moment(addon.Order.createdAt).format("YYYY-MM-DD"),
        ticketType: "addon",
        ticketQR: addon.addon_qrcode,
        addonId: addon.id,
        addonName: addon.name,
        memberFirstName: addon.User?.FirstName || "",
        memberLastName: addon.User?.LastName || "",
        memberEmail: addon.User?.Email || "",
        memberMobile: addon.User?.PhoneNumber || "",
        ticketName: addon.Addon?.name || "",
        isTransfer: addon.transfer_reply ? "Yes" : "No",
        isCanceled: addon.ticket_status === "cancel",
        ticketRenameFname: addon.fname || "",
        ticketRenameLname: addon.lname || "",
      };

      if (addon.transfer_reply) {
        const transferUser = await User.findOne({
          where: { id: addon.transfer_user_id },
          attributes: ["FirstName", "LastName"],
        });
        addonData.transferToFname = transferUser?.FirstName || "";
        addonData.transferToLname = transferUser?.LastName || "";
      }

      if (addon.scannedstatus === 1) {
        const scannerDetails = await User.findOne({ where: { id: addon.scanner_id } });
        addonData.usedBy = addon.usedby || "";
        addonData.usedDate = moment(addon.usedate).format("YYYY-MM-DD HH:mm:ss");
        addonData.scannedBy = `${scannerDetails?.FirstName || ""} ${scannerDetails?.LastName || ""}`;
      }
      orderData.push(addonData);
    }

    // ✅ Now orderData is already sorted by createdAt DESC due to DB ordering
    return res.status(200).json({
      success: true,
      message: "Orders Data fetched successfully!",
      data: orderData,
      ticketSaleInfo: {
        totalTickets,
        totalScannedTickets,
        totalCancelTicket,
        totalAddons,
        totalScannedAddons,
        totalCancelAddon,
      },
    });
  } catch (error) {
    console.error("Error during ticket export:", error);
    return res.status(500).json({
      success: false,
      message: "Error during ticket export",
      error: error.message,
    });
  }
}



export async function eventOrderList(req, res) {
  const { eventName } = req;
  try {
    // Fetch event ID based on event name
    // return false
    const event = await Event.findOne({
      // attributes: ["id"],
      where: {
        Name: {
          [Op.like]: `%${eventName}%`, // Use Sequelize's LIKE operator
        },
      },
    });
    const eventID = event.id;

    // Fetch all orders
    const totalOrders = await MyOrders.findAll({
      where: {
        [Op.or]: [
          { is_free: { [Op.is]: null } }, // Include records where `is_free` is null
          { couponCode: { [Op.not]: null } }, // Include records where `couponCode` is not null
        ],
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
      ],
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
          attributes: ["id"], // No need to select additional attributes
          required: true,
          include: {
            model: TicketDetail,
            attributes: ["id", "fname", "lname"],
            where: {
              fname: { [Op.is]: null }, // Ensure fname is null
              lname: { [Op.is]: null }, // Ensure lname is null
            },
          },
        },
        {
          model: AddonBook,
          where: {
            // ticket_status: null,
            event_id: eventID,
            fname: { [Op.is]: null }, // Ensure fname is null
            lname: { [Op.is]: null }, // Ensure lname is null
          },
          attributes: ["id", "fname", "lname"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
      group: ["MyOrders.id"],
    });

    // Process orders into the desired format
    let data = [];

    for (let order of totalOrders) {
      const ticketCount = await BookTicket.count({
        where: { order_id: order.id },
      });
      const addonCount = await AddonBook.count({
        where: { order_id: order.id },
      });
      if (ticketCount > 1 || addonCount > 1) {
        let order_data = {
          eventName: eventName, // Assuming the event name is the same for all
          orderid: order.id,
          tickettotal: await BookTicket.count({
            where: { order_id: order.id },
          }),
          ticketaddontotal: await AddonBook.count({
            where: { order_id: order.id },
          }),
          orderrrn: order.OriginalTrxnIdentifier,
          name: `${order.User?.FirstName || ""} ${order.User?.LastName || ""}`,
          email: order.User?.Email || "",
          mobile: order.User?.PhoneNumber || "",
          orderDate: new Date(order.createdAt).toISOString(),
        };

        data.push(order_data);
      }
    }

    // Respond with the formatted data
    return res.json({
      // statusCode: 200,
      success: true,
      message: "View Event Order List Successfully!",
      data: data,
    });
  } catch (error) {
    return res.json({
      // statusCode: 200,
      success: false,
      message: error.message,
      data: [],
      count: 0,
    });
  }
}

export async function findCompleteOrderListByEvent(req, res) {
  try {
    const {
      email,
      eventname,
      Name,
      PhoneNumber,
      OriginalTrxnIdentifier,
      startDate,
      endDate,
    } = req;

    const event = await Event.findOne({
      attributes: ["id", "Name", "StartDate", "EndDate", "payment_currency"],
      include: [
        {
          model: Currency,
          attributes: ["Currency_symbol", "Currency", "conversion_rate"],
        },
      ],
      where: {
        Name: {
          [Op.like]: `%${eventname}%`, // Use Sequelize's LIKE operator
        },
      },
    });

    if (!event) {
      return res.json({
        success: false,
        message: "Event not found",
        data: [],
      });
    }

    const eventID = event.id;

    // ##############################Total Orders Start##############################
    const totalTicketFind = await MyTicketBook.findAll({
      where: {
        event_id: eventID,
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

    const orderTicketIds = [
      ...new Set(totalTicketFind.map((ticket) => ticket.order_id)),
    ];

    const orderAddonIds = await AddonBook.findAll({
      where: {
        event_id: eventID,
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

    const uniqueOrderAddonIds = [
      ...new Set(orderAddonIds.map((addon) => addon.order_id)),
    ];

    const totalUniqueOrdersIds = [
      ...new Set([...orderTicketIds, ...uniqueOrderAddonIds]),
    ];
    // ##############################Total Orders End##############################

    // Build search conditions
    const orderConditions = {
      id: { [Op.in]: totalUniqueOrdersIds },
      // ticket_status: null,
    };

    // Apply search filters individually if provided
    if (email) {
      orderConditions["$User.Email$"] = { [Op.like]: `%${email}%` };
    }

    if (Name) {
      orderConditions[Op.or] = [
        { "$User.FirstName$": { [Op.like]: `%${Name}%` } },
        { "$User.LastName$": { [Op.like]: `%${Name}%` } },
      ];
    }

    if (PhoneNumber) {
      orderConditions["$User.PhoneNumber$"] = { [Op.like]: `%${PhoneNumber}%` };
    }

    if (OriginalTrxnIdentifier) {
      orderConditions["OriginalTrxnIdentifier"] = {
        [Op.like]: `%${OriginalTrxnIdentifier}%`,
      };
    }

    if (startDate && endDate) {
      // Convert strings to Date objects
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      orderConditions.createdAt = {
        [Op.between]: [start, end],
      };
    } else if (startDate) {
      // Convert startDate string to a Date object
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const endOfDay = new Date(`${startDate}T23:59:59.999Z`);

      orderConditions.createdAt = {
        [Op.between]: [start, endOfDay],
      };
    } else if (endDate) {
      // Convert endDate string to a Date object
      const startOfDay = new Date(`${endDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      orderConditions.createdAt = {
        [Op.between]: [startOfDay, end],
      };
    }

    const totalOrders = await MyOrders.findAll({
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
      ],
      include: [
        {
          model: User,
          attributes: ["FirstName", "LastName", "Email", "PhoneNumber"],
          required: true,
        },
        {
          model: BookTicket,
          where: {
            event_id: eventID,
          },
          attributes: ["id", "event_ticket_id"],
          required: false,
        },
        {
          model: AddonBook,
          where: {
            event_id: eventID,
          },
          attributes: ["id"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    let amountInfo = {
      total_amount: 0,
      total_taxes: 0,
      gross_total: 0,
      currencySign: event.Currency?.Currency_symbol,
    };

    totalOrders.forEach((order) => {
      let amountAfterDiscount = order.actualamount;

      if (order.couponCode) {
        amountAfterDiscount -= order.discountAmount;
      }
      const taxAmount = Math.round(
        (amountAfterDiscount * order.adminfee) / 100
      );

      amountInfo.total_amount += amountAfterDiscount;
      amountInfo.total_taxes += taxAmount;
      amountInfo.gross_total += order.total_amount;
    });

    return res.json({
      success: true,
      message: "View Order List Successfully!",
      data: { totalOrders, event, amountInfo },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: [],
    });
  }
}

// find All Addons for priticular user_id
export async function findAddons(req, res) {
  try {
    const { user_id, event_id } = req;
    const addonData = await AddonBook.findAll({
      where: {
        user_id: user_id,
        event_id: event_id,
        ticket_status: null, // Adding condition for ticket_status
        transfer_user_id: null,
      },
      include: { model: Addons },
    });
    return res.json({
      success: true,
      message: "View All Addons Successfully!",
      data: addonData,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
    });
  }
}

export async function transferOneAddon({
  fromName,
  toName,
  email,
  addon_id,
  ticket_type,
  status,
}) {
  try {
    // Validate input
    if (!fromName || !toName || !email || !addon_id || !ticket_type) {
      return { success: false, message: "Missing required parameters." };
    }
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { success: false, message: "User not found." };
    }
    // Check eligibility for ticket transfer
    if (status !== 1) {
      return {
        success: false,
        message: "User is not eligible for ticket transfer.",
      };
    }
    const addon = await AddonBook.findOne({
      where: { id: addon_id },
      raw: true,
    });
    const transferFrom = user.id;
    const transferTo = addon.user_id;
    // Transfer logic based on ticket_type
    if (ticket_type == "addon") {
      const UserFind = await User.findOne({
        where: { id: transferFrom },
        attributes: ["Email", "FirstName", "LastName"],
      });
      const firstName = UserFind.FirstName;
      const lastName = UserFind.LastName;

      const order = await Order.findOne({
        where: { id: addon.order_id },
        attributes: ["OriginalTrxnIdentifier", "id"],
      });
      // Transfer the main ticket
      await transferAddon(addon, transferFrom, transferTo, addon_id);
      // Send confirmation email
      // Addon details
      const findAddonsData = await AddonBook.findOne({
        where: { id: addon_id },
        include: { model: Addons },
        raw: true,
      });
      let addonQrCode = "";
      if (findAddonsData) {
        addonQrCode = `${NEXT_S3_URL}/qrCodes/${findAddonsData.addon_qrcode}`;
      }
      const addonName = findAddonsData["Addon.name"];
      const addonLocation = findAddonsData["Addon.addon_location"];
      const addonTime = findAddonsData["Addon.addon_time"];
      const addonSortName = findAddonsData["Addon.sortName"];
      // const addonImage = findAddonsData["Addon.addon_image"];
      const addonImage = findAddonsData["Addon.addon_image"]
        ? `${NEXT_S3_URL}/profiles/${findAddonsData["Addon.addon_image"]}`
        : "";
      const sort_day = findAddonsData["Addon.sort_day"];
      const addonColor =
        findAddonsData["Addon.addon_type"] == "Special" ? "#DF8EA3" : "#499A96";
      //  new send email maindrial and content send our database - template manager
      const transferTemplate = await Emailtemplet.findOne({
        // where: { eventId: 110, templateId: 15 },
        where: { eventId: 111, templateId: 15 },
      }); // Rename
      const sanitizedTemplate = transferTemplate.dataValues.description;
      const subject = transferTemplate.dataValues.subject;
      // mail champ template name
      const mailChampTemplateName =
        transferTemplate.dataValues.mandril_template;
      let template = transferAddonTemplate({
        fromName: fromName,
        toName: toName,
        LName: lastName,
        FName: firstName,
        OrderID: order.OriginalTrxnIdentifier,
        QRCODE: addonQrCode,
        Time: addonTime,
        backGround: addonColor,
        addonImage: addonImage,
        addonLocation: addonLocation,
        addonName: addonSortName,
        sort_day: sort_day,
        addon_name: addonName,
        addon_time: addonTime,
        addon_location: addonLocation,
        html: sanitizedTemplate,
      });
      let emailTemplateHtml = template.html;
      // send Rename confirmation Email
      await sendAddonTransferConfirmation({
        email,
        emailTemplateHtml,
        mailChampTemplateName,
        subject,
      });
      return { success: true, message: `Your addon has being successfully transferred to ${firstName} ${lastName}, We have sent them an email with the ticket confirmation.`, };

    }
    return { success: false, message: "Invalid ticket type." };
  } catch (error) {
    console.error("Error transferring ticket:", error);
    return {
      success: false,
      message: `Internal Server Error: ${error.message}`,
    };
  }
}
// Helper to transfer addons
async function transferAddon(addon, transferFrom, transferTo, addon_id) {
  const addonsBook = await AddonBook.findOne({
    where: {
      user_id: addon.user_id,
      transfer_user_id: null,
      ticket_status: null,
      id: addon_id,
    },
  });

  if (addonsBook) {

    // const qrCodeImage = await generateQR({
    //   userId: transferFrom,
    //   orderId: addonsBook.order_id,
    //   ticketId: addonsBook.id,
    //   ticketType: "addon",
    // });

    const qrCodeImage = await generateTicketQrToS3({
      userId: transferFrom,
      orderId: addonsBook.order_id,
      ticketId: addonsBook.id,
      ticketType: "addon",
    });

    if (qrCodeImage.success) {
      const newQrCode = qrCodeImage.filePath;
      addonsBook.transfer_user_id = transferFrom;
      addonsBook.transfer_reply = "addontransfer";
      addonsBook.addon_qrcode = newQrCode;
      // addonsBook.ticket_id = addon_id;
      await addonsBook.save();

      // Create transfer record for addon
      await TicketTransfer.create({
        user_id_to: transferFrom,
        user_id_from: transferTo,
        user_id_to_qrcode: addonsBook.addon_qrcode,
        user_id_from_qrcode: addonsBook.addon_qrcode,
        typeofticket: "addon",
        createdate: new Date(),
      });
    }
  }
}

// Helper to send confirmation email
async function sendAddonTransferConfirmation({
  fromName,
  toName,
  email,
  emailTemplateHtml,
  mailChampTemplateName,
  subject,
}) {
  const template = mailChampTemplateName;
  // const template = "Careyes 2024 Event Ticket Transfer Confirmation-Test";
  // const variables = { TONAME: toName, FROMNAME: fromName };
  const mergeVars = { ALLDATA: emailTemplateHtml };
  await sendEmail(email, mergeVars, template, subject);
}


//  Send Remaining Amount Email function multiple members and single member(13-05-2025)
export async function SendRemainingAmountEmail(req, res) {
  try {
    const { orderId } = req;
    const orderIds = Array.isArray(orderId) ? orderId : [orderId];
    const results = [];
    for (const id of orderIds) {
      const order = await Order.findOne({
        where: { id },
        include: {
          model: User,
          attributes: ["Email", "FirstName", "LastName"],
        },
        attributes: [
          "id",
          "user_id",
          "event_id",
          "total_amount",
          "total_due_amount",
          "OriginalTrxnIdentifier",
          "adminfee"
        ],
      });
      if (!order) {
        results.push({ id, success: false, message: "Order not found" });
        continue;
      }

      const eventInfo = await Event.findOne({ where: { id: order.event_id }, include: { model: Currency, attributes: ['Currency_symbol'] }, attributes: ['id'] })
      const Currency_symbol = eventInfo.Currency.Currency_symbol

      // ✅ Step 1: Calculate admin fee tax (if it's a percentage)
      const adminFeeRate = parseFloat(order.adminfee); // e.g., 9.85 means 9.85%
      const adminFeeTax = (order.total_due_amount * adminFeeRate) / 100;
      // ✅ Step 2: Add admin fee tax to total_due_amount
      const updatedDueAmount = parseFloat(order.total_due_amount) + adminFeeTax;


      // return false
      const emailTemplate = await Emailtemplet.findOne({
        where: { eventId: 111, templateId: 33 },
      });

      if (!emailTemplate) {
        results.push({ id, success: false, message: "Email template not found" });
        continue;
      }
      // Staff Id Encrypt
      // function encryptData(data) {
      //   return CryptoJS.AES.encrypt(
      //     JSON.stringify(data),
      //     encryptionKey
      //   ).toString();
      // }
      function encryptData(data) {
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(data),
          encryptionKey
        ).toString();

        // Make Base64 URL-safe
        return encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }

      const userName = `${order.User.FirstName} ${order.User.LastName}`;
      const email = order.User.Email;
      const formattedDueAmount = Math.round(order.total_due_amount).toLocaleString();
      const formattedAmount = Math.round(updatedDueAmount).toLocaleString();
      const formattedAdminFeeAmount = Math.round(adminFeeTax).toLocaleString();
      const encryptedOrderId = encryptData(order.OriginalTrxnIdentifier);
      // console.log("<<<<<<<<<<><>>>>>>>>>>>>>>>>>>>>>>>>>>>", encryptedOrderId)
      // return false
      const paymentLink = `${SITE_URL}accommodations/partial-payment/${encryptedOrderId}`;
      const processedTemplate = SendRemainingAmountEmailTemplate({
        PaymentLink: paymentLink,
        UserName: userName,
        DueAmount: formattedDueAmount,
        TaxAmount: formattedAdminFeeAmount,
        TaxPercent: adminFeeRate,
        TotalDueWithTax: formattedAmount,
        CurrencySymbol: Currency_symbol,
        // RemainingAmount: formattedAmount,
        html: emailTemplate.description,
      });
      const mergeVars = { ALLDATA: processedTemplate.html };
      await sendEmail(email, mergeVars, emailTemplate.mandril_template, emailTemplate.subject);
      results.push({ id, success: true, message: "Remaining amount email sent successfully." });
    }
    return res.status(200).json({ success: true, message: "Remaining amount email sent successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error Sending Remaining Amount Email: " + error.message,
    });
  }
}


// find due amount for partial pay users base on orderId
export async function findDueAmount({ transactionId }, res) {
  try {
    const orderInfo = await Order.findOne({
      where: { OriginalTrxnIdentifier: transactionId },
      include: {
        model: User,
        attributes: ["Email", "FirstName", "LastName"],
      },
      attributes: [
        "id",
        "user_id",
        "event_id",
        "total_amount",
        "total_due_amount",
        "OriginalTrxnIdentifier",
        "book_accommodation_id",
        "paymentOption",
        "adminfee",
        "totalCartAmount"
      ],
    });

    if (!orderInfo) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found for the given transaction ID.",
      };
    }

    // Parallel fetch: housingInfo and event
    const [housingInfo, event] = await Promise.all([
      Housing.findOne({
        where: { id: orderInfo.book_accommodation_id },
        attributes: ["Name"],
      }),
      Event.findOne({
        attributes: ["id", "Name", "StartDate", "EndDate", "payment_currency", "ImageURL"],
        include: [
          {
            model: Currency,
            attributes: ["Currency_symbol", "Currency", "conversion_rate"],
          },
        ],
        where: { id: orderInfo.event_id },
      }),
    ]);

    const adminFeeRate = parseFloat(orderInfo.adminfee || 0); // e.g., 9.85%
    const adminFeeTax = (parseFloat(orderInfo.total_due_amount || 0) * adminFeeRate) / 100;
    const updatedDueAmount = parseFloat(orderInfo.total_due_amount || 0) + adminFeeTax;
    const updatedTotalOrderAmount = updatedDueAmount + orderInfo.total_amount;
    return {
      statusCode: 200,
      success: true,
      message: "Find due amount successfully!",
      // data: {
      //   orderInfo,
      //   housingInfo,
      //   event,
      // },
      data: {
        orderInfo: {
          ...orderInfo.toJSON(),
          admin_fee_tax: adminFeeTax.toFixed(2),
          total_due_with_adminfee: updatedDueAmount.toFixed(2),
          total_order_amount: updatedTotalOrderAmount.toFixed(2),
        },
        housingInfo,
        event,
      },
    };
  } catch (error) {
    console.error("Error in findDueAmount:", error.message);
    return {
      statusCode: 500,
      success: false,
      message: "Internal server error.",
      error: error.message,
    };
  }
}