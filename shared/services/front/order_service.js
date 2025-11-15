import {
  CartModel,
  TransportationCart,
  Payment,
  Addons,
  AddonBook,
  User,
  EventTicketType,
  BookTicket,
  TicketDetail,
  Event,
  Order,
  Orders,
  MyOrders,
  Currency,
  EventStaffMember,
  InvitationEvent,
  Emailtemplet,
  AccommodationBookingInfo,
  BookAccommodationInfo,
  AccommodationExtension,
  HousingNeighborhood,
  HousingTypes,
  EventHousing,
  Housing, HousingInfo
} from "@/database/models";
import { Op } from "sequelize";
import CryptoJS from "crypto-js";
import { generateQR, generateAccommodationQR } from "@/utils_back/qrGenerator";
import { generateTicketQrToS3, generateAccommodationQrToS3 } from "@/utils_back/generateQrToS3";
import { sequelize } from "@/database/connection"; // Import the named export
import { sendEmail, sendEmailWithBCC } from "@/utils_back/sendEmail"; // send mail via mandril
import {
  cancelTicketTemplate,
  orderTemplate, //Tickets+Accommodations
  orderTicketsTemplate, // Only Tickets template
  resendTicketTemplate,
  staffTicketTemplate, // new-template-24-03-2025
  staffTicketCompTemplate, // new-template-24-03-2025
  staffTicketCoreTemplate,// new-template-24-03-2025
  PaymentConfirmationTemplate,  //new-template-15-05-2025
  sendPartialPayment50Template,
  sendPartialPayment100Template, processTemplate
} from "@/utils_back/email-templates";
import fs from "fs";
import path from "path";
import util from "util";
import moment from "moment";
import { get } from "lodash";
let encryptionKey = process.env.DATA_ENCODE_SECRET_KEY;
let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const currentEnv = process.env.APP_ENV;

function formatSmartPrice(amount) {
  if (isNaN(amount)) return "Invalid amount";

  const isInteger = Number(amount) % 1 === 0;
  const formatted = isInteger
    ? Number(amount).toLocaleString()               // No decimals
    : Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return formatted;
}

function formatSmartWithRoundPrice(amount) {
  const num = Number(amount);
  if (isNaN(num)) return 0;
  const rounded = Math.round(num);
  const formatted = rounded.toLocaleString();
  return formatted;
}

// partial payment accept...
export async function updateDueAmount(req, res) {
  console.log('----------------------------updateDueAmount called ---------------------------');

  try {
    const { paymentIntentId, OriginalTrxnIdentifier } = req.body;

    // Validate required fields
    if (!paymentIntentId || !OriginalTrxnIdentifier) {
      return res.status(400).json({ status: false, message: "Missing required parameters." });
    }


    const paymentData = await Payment.findOne({
      where: { payment_intent: paymentIntentId }
    });

    if (!paymentData) {
      return res.status(404).json({ status: false, message: "Payment record not found." });
    }

    // Mark payment as succeeded
    await paymentData.update({ paymentstatus: "succeeded" });

    const order = await Order.findOne({
      where: { OriginalTrxnIdentifier }
    });

    if (!order) {
      return res.status(404).json({ status: false, message: "Order not found." });
    }

    const bookingAccommodationInfo = await AccommodationBookingInfo.findOne({
      where: {
        order_id: order.id
      },
      include: [
        {
          model: Housing,
          attributes: ["id", "Name", "Neighborhood"],
          include: [{ model: HousingNeighborhood, attributes: ["name"] }]
        }
      ]
    })
    const propertyName = bookingAccommodationInfo?.Housing.Name
    const Neighborhood = bookingAccommodationInfo?.Housing?.HousingNeighborhood.name
    const checkInDate = new Date(bookingAccommodationInfo.check_in_date);
    const checkOutDate = new Date(bookingAccommodationInfo.check_out_date);
    const customCheckIn = checkInDate.getDate();
    const customCheckOut = checkOutDate.getDate();
    const customMonth = checkInDate.toLocaleString("en-US", { month: "long" });
    const customYear = checkOutDate.getFullYear();
    const customCheckInOut = `${customCheckIn} to the ${customCheckOut} of ${customMonth}, ${customYear}`;


    // Calculate values safely
    const partialPaymentTax = parseFloat(order.totalAccommodationTax || 0) / 2;
    const newAmount = paymentData.amount || 0;

    const newTotalAmount = (order.total_amount || 0) + newAmount;
    const newActualAmount = (order.actualamount || 0) + newAmount;
    const newTotalTaxAmount = Math.round((order.total_tax_amount || 0) + partialPaymentTax);

    // Update order
    await order.update({
      due_amount_intent: paymentIntentId,
      paymentOption: "full",
      total_due_amount: null,
      total_amount: newTotalAmount,
      actualamount: newActualAmount,
      partial_payment_amount: order.total_due_amount,
      partial_payment_tax: partialPaymentTax,
      total_tax_amount: newTotalTaxAmount
    });

    await bookingAccommodationInfo.update({ payment_status: "full" });


    // Email confirmation
    const emailTemplate = await Emailtemplet.findOne({
      where: { eventId: 111, templateId: 34 }
    });
    if (emailTemplate) {
      const { mandril_template: templateName, subject, description } = emailTemplate;
      const MyEventsLink = `${SITE_URL}/user/my-event/`;
      const processedTemplate = PaymentConfirmationTemplate({
        // userName: paymentData.name,
        propertyName: propertyName,
        Neighborhood: Neighborhood,
        StayDates: customCheckInOut,
        MyEventsLink: MyEventsLink,
        html: description
      });
      const mergeVars = {
        ALLDATA: processedTemplate?.html || ""
      };
      // await sendEmail(paymentData.email, mergeVars, templateName, subject);
      await sendEmailWithBCC(paymentData.email, [], mergeVars, templateName, subject);
    }
    return res.json({
      status: true,
      message: "Payment Success!"
    });

  } catch (error) {
    console.error("Payment Update Error:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
  }
}

export async function createOrderStylePackage(req, res) {
  console.log('----------------------------createOrderStylePackage called ---------------------------');

  const {
    paymentIntentId,
    eventId,
    cartData,
    couponDetails,
    userId,
    amount,
    adminFees,
    donationFees,
    totalTax,
    isStylingAddon
  } = req.body;

  try {
    // Check if order already exists for this paymentIntentId
    const existingOrder = await MyOrders.findOne({
      where: { RRN: paymentIntentId },
      include: [
        { model: BookTicket },
        { model: AddonBook },
      ]
    });
    // console.log('........................',existingOrder)
    // return false;

    if (existingOrder) {
      const totalOrders = await MyOrders.findOne({
        where: { id: existingOrder.id },
        attributes: [
          "id",
          "OriginalTrxnIdentifier",
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
          { model: User, attributes: ["ID", "FirstName", "LastName", "Email"] },
          {
            model: BookTicket,
            attributes: ["id", "event_ticket_id", "amount"],
            include: [
              { model: EventTicketType, attributes: ["id", "title", "ticket_image"] },
              { model: TicketDetail, attributes: ["id", "ticket_num", "qrcode"] },
            ],
            required: false,
          },
          {
            model: AddonBook,
            include: [{
              model: Addons, attributes: ["id",
                "name",
                "addon_location",
                "addon_time",
                "addon_day",
                "addon_image",
                "sortName",
                "sort_day",
                "addon_type"]
            }],
            attributes: ["id", "price", "addon_qrcode"],
            required: false,
          },
        ],
        order: [["id", "DESC"]],
      });

      const paymentData = await Payment.findOne({
        where: { payment_intent: paymentIntentId },
      });

      return res.json({
        success: true,
        status: 200,
        message: "Order already exists",
        data: { totalOrders, paymentData },
      });
    }

    // ----- continue with existing order creation logic -----
    const totalCartAmt = amount || 0;
    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || 0;
    const discount_amount = couponDetails?.discount_amount || 0;
    const code = couponDetails?.coupon_code || null;
    const adminFee = adminFees ?? 0;
    const donationFee = donationFees ?? 0;

    // Update paymentInfo status to succeeded
    const paymentData = await Payment.findOne({
      where: { payment_intent: paymentIntentId },
    });

    if (paymentData) {
      await paymentData.update({ paymentstatus: "succeeded", totalTaxes: totalTax });
    }

    const {
      ticketBankFee = 0,
      ticketPlatformFee = 0,
      ticketProcessingFee = 0,
      ticketStripeFee = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      totalCartAmount = 0,
      totalAddonAmount = 0,
      totalAddonTax = 0,
      totalTicketAmount = 0,
      totalTicketTax = 0,
      clientsecret = null
    } = paymentData || {};

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"],
    });

    let totalTicketCount = 0;
    let totalAddonCount = 0;
    let totalActualAmount = 0;

    for (const cartItem of cartData) {
      if (cartItem.ticketType == "ticket") {
        totalTicketCount += cartItem.noTickets;
        totalActualAmount += cartItem.price * cartItem.noTickets;
      } else if (cartItem.ticketType == "addon") {
        totalAddonCount += cartItem.noTickets;
        totalActualAmount += cartItem.price * cartItem.noTickets;
      }
    }

    const orderResponse = await Order.create({
      user_id: userId,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      event_id: eventId,
      adminfee: adminFee,
      donationfee: donationFee,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      discountAmount: discount_amount,
      totalCartAmount: totalCartAmount,
      couponCode: code,
      discountType: discount_type,
      actualamount: totalActualAmount,
      RRN: paymentIntentId,
      total_tax_amount: totalTax,
      OrderIdentifier: clientsecret,
      totalAddonAmount,
      totalAddonTax,
      totalTicketAmount,
      totalTicketTax,
      ticketBankFee,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketStripeFee,
      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage
    });

    const orderId = orderResponse.id;
    const trxnIde = `M-${userId}-${orderId}`;
    await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });

    for (const cartItem of cartData) {
      if (cartItem.ticketType == "ticket" && cartItem.ticketId) {
        const ticketPrice = cartItem.price || 0;
        const ticketCount = cartItem.noTickets || 0;

        for (let index = 1; index <= ticketCount; index++) {
          const ticketBook = await BookTicket.create({
            order_id: orderId,
            event_id: eventId,
            event_ticket_id: cartItem.ticketId,
            cust_id: userId,
            ticket_buy: 1,
            amount: ticketPrice,
            mobile: userInfo.PhoneNumber,
            adminfee: adminFee,
          });

          const ticketId = ticketBook.id;
          const ticketNum = `T${ticketId}`;
          const ticketDetail = await TicketDetail.create({
            tid: ticketId,
            ticket_num: ticketNum,
            generated_id: ticketNum,
            user_id: userId,
            status: "0",
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: ticketDetail.id,
            ticketType: "ticket",
          });

          if (qrCodeImage.success) {
            await ticketDetail.update({ qrcode: qrCodeImage.filePath });
          }
        }
      } else if (cartItem.ticketType == "addon" && cartItem.ticketId) {
        const addonPrice = cartItem.price || 0;
        const addonCount = cartItem.noTickets || 0;

        for (let index = 1; index <= addonCount; index++) {
          const addonBook = await AddonBook.create({
            addons_id: cartItem.ticketId,
            event_id: eventId,
            order_id: orderId,
            user_id: userId,
            price: addonPrice,
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: addonBook.id,
            ticketType: "addon",
          });

          if (qrCodeImage.success) {
            await addonBook.update({ addon_qrcode: qrCodeImage.filePath });
          }
        }
      }
    }

    const totalOrders = await MyOrders.findOne({
      where: { id: orderId },
      attributes: [
        "id",
        "OriginalTrxnIdentifier",
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
        { model: User, attributes: ["ID", "FirstName", "LastName", "Email"] },
        {
          model: BookTicket,
          attributes: ["id", "event_ticket_id", "amount"],
          include: [
            { model: EventTicketType, attributes: ["id", "title", "ticket_image"] },
            { model: TicketDetail, attributes: ["id", "ticket_num", "qrcode"] },
          ],
          required: false,
        },
        {
          model: AddonBook,
          include: [{
            model: Addons, attributes: [
              "id",
              "name",
              "addon_location",
              "addon_time",
              "addon_day",
              "addon_image",
              "sortName",
              "sort_day",
              "addon_type"
            ]
          }],
          attributes: ["id", "price", "addon_qrcode"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      status: 200,
      message: "Order created successfully",
      data: { totalOrders, paymentData },
    });

  } catch (error) {
    console.error("Error createOrderStylePackage Function Order:", error.message);
    return {
      success: false,
      status: 404,
      message: `Error createOrderStylePackage Function Order: ${error.message}`,
    };
  }
}



export async function updateDueAmountV3(req, res) {
  console.log('----------------------------updateDueAmount called ---------------------------');

  try {
    const { paymentIntentId, OriginalTrxnIdentifier } = req.body;

    // Validate required fields
    if (!paymentIntentId || !OriginalTrxnIdentifier) {
      return res.status(400).json({ status: false, message: "Missing required parameters." });
    }

    const paymentData = await Payment.findOne({
      where: { payment_intent: paymentIntentId }
    });

    if (!paymentData) {
      return res.status(404).json({ status: false, message: "Payment record not found." });
    }

    // Mark payment as succeeded
    await paymentData.update({ paymentstatus: "succeeded" });

    const order = await Order.findOne({
      where: { OriginalTrxnIdentifier }
    });

    if (!order) {
      return res.status(404).json({ status: false, message: "Order not found." });
    }

    const bookingAccommodationInfo = await AccommodationBookingInfo.findOne({
      where: { order_id: order.id },
      include: [
        {
          model: Housing,
          attributes: ["id", "Name", "Neighborhood"],
          include: [{ model: HousingNeighborhood, attributes: ["name"] }]
        }
      ]
    });

    const propertyName = bookingAccommodationInfo?.Housing.Name || null;
    const Neighborhood = bookingAccommodationInfo?.Housing?.HousingNeighborhood.name || null;
    const checkInDate = bookingAccommodationInfo?.check_in_date ? new Date(bookingAccommodationInfo.check_in_date) : null;
    const checkOutDate = bookingAccommodationInfo?.check_out_date ? new Date(bookingAccommodationInfo.check_out_date) : null;
    const customCheckInOut = checkInDate && checkOutDate
      ? `${checkInDate.getDate()} to the ${checkOutDate.getDate()} of ${checkInDate.toLocaleString("en-US", { month: "long" })}, ${checkOutDate.getFullYear()}`
      : null;

    // Calculate values safely
    const partialPaymentTax = parseFloat(order.totalAccommodationTax || 0) / 2;
    const newAmount = paymentData.amount || 0;
    const newTotalAmount = (order.total_amount || 0) + newAmount;
    const newActualAmount = (order.actualamount || 0) + newAmount;
    const newTotalTaxAmount = Math.round((order.total_tax_amount || 0) + partialPaymentTax);

    // Update order
    await order.update({
      due_amount_intent: paymentIntentId,
      paymentOption: "full",
      total_due_amount: null,
      total_amount: newTotalAmount,
      actualamount: newActualAmount,
      partial_payment_amount: order.total_due_amount,
      partial_payment_tax: partialPaymentTax,
      total_tax_amount: newTotalTaxAmount
    });

    if (bookingAccommodationInfo) {
      await bookingAccommodationInfo.update({ payment_status: "full" });
    }

    // Respond with updated order & accommodation info
    return res.json({
      status: true,
      message: "Payment updated successfully",
      data: {
        order,
        paymentIntentId, OriginalTrxnIdentifier
        payment: {
          id: paymentData.id,
          payment_intent: paymentData.payment_intent,
          amount: paymentData.amount,
          paymentstatus: paymentData.paymentstatus
        },
        accommodation: bookingAccommodationInfo ? {
          id: bookingAccommodationInfo.id,
          propertyName,
          Neighborhood,
          checkInOut: customCheckInOut,
          payment_status: bookingAccommodationInfo.payment_status
        } : null
      }
    });

  } catch (error) {
    console.error("Payment Update Error:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
  }
}


// Main function to create an order without using transactions
export async function createOrderV2(req, res) {
  console.log('----------------------------createOrderV2 called ---------------------------');

  const {
    paymentIntentId,
    eventId,
    cartData,
    couponDetails,
    userId,
    amount,
    adminFees,
    donationFees,
    totalTax
  } = req.body;


  try {
    // -----------------------------
    // 1️⃣ Check if order already exists
    // -----------------------------
    const existingOrder = await Order.findOne({ where: { RRN: paymentIntentId } });
    // console.log('existingOrder------------------', existingOrder);
    // return false;
    if (existingOrder) {

      console.log("✅ Order already exists, returning existing order details");

      const paymentData = await Payment.findOne({
        where: { payment_intent: paymentIntentId },
        attributes: { exclude: ["order_items", "fee_details_json"] },
      });

      const totalOrders = await MyOrders.findOne({
        where: { id: existingOrder.id },
        attributes: [
          "id",
          "OriginalTrxnIdentifier",
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
          { model: User, attributes: ["ID", "FirstName", "LastName", "Email"] },
          {
            model: BookTicket,
            attributes: ["id", "event_ticket_id", "amount"],
            include: [
              { model: EventTicketType, attributes: ["id", "title", "ticket_image"] },
              { model: TicketDetail, attributes: ["id", "ticket_num", "qrcode"] },
            ],
            required: false,
          },
          {
            model: AddonBook,
            include: [{
              model: Addons, attributes: [
                "id", "name", "addon_location", "addon_time", "addon_day",
                "addon_image", "sortName", "sort_day", "addon_type"
              ]
            }],
            attributes: ["id", "price", "addon_qrcode"],
            required: false,
          },
        ],
        order: [["id", "DESC"]],
      });

      return {
        success: true,
        status: 200,
        message: "Order already exists.",
        data: { totalOrders, paymentData }
      };
    }

    // -----------------------------
    // 2️⃣ Create order (if not exists)
    // -----------------------------
    const totalCartAmt = amount || 0;
    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || 0;
    const discount_amount = couponDetails?.discount_amount || 0;
    const code = couponDetails?.coupon_code || null;
    const adminFee = adminFees ?? 0;
    const donationFee = donationFees ?? 0;

    const paymentData = await Payment.findOne({
      where: { payment_intent: paymentIntentId },
      attributes: { exclude: ["order_items", "fee_details_json"] },
    });

    if (paymentData) {
      await paymentData.update({ paymentstatus: "succeeded", totalTaxes: totalTax });
    }

    const {
      ticketBankFee = 0,
      ticketPlatformFee = 0,
      ticketProcessingFee = 0,
      ticketStripeFee = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      totalCartAmount = 0,
      totalAddonAmount = 0,
      totalAddonTax = 0,
      totalTicketAmount = 0,
      totalTicketTax = 0,
      clientsecret = null
    } = paymentData || {};

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"],
    });

    let totalTicketCount = 0;
    let totalAddonCount = 0;
    let totalActualAmount = 0;

    for (const cartItem of cartData) {
      if (cartItem.ticketType == "ticket") {
        totalTicketCount += cartItem.noTickets;
        totalActualAmount += cartItem.price * cartItem.noTickets;
      } else if (cartItem.ticketType == "addon") {
        totalAddonCount += cartItem.noTickets;
        totalActualAmount += cartItem.price * cartItem.noTickets;
      }
    }

    const orderResponse = await Order.create({
      user_id: userId,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      event_id: eventId,
      adminfee: adminFee,
      donationfee: donationFee,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      discountAmount: discount_amount,
      totalCartAmount: totalCartAmount,
      couponCode: code,
      discountType: discount_type,
      actualamount: totalActualAmount,
      RRN: paymentIntentId,
      total_tax_amount: totalTax,
      OrderIdentifier: clientsecret,

      totalAddonAmount,
      totalAddonTax,
      totalTicketAmount,
      totalTicketTax,

      ticketBankFee,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketStripeFee,

      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage
    });

    const orderId = orderResponse.id;
    const trxnIde = `M-${userId}-${orderId}`;
    await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });

    const cartItemIdsToDelete = [];

    for (const cartItem of cartData) {
      if (cartItem.ticketType == "ticket" && cartItem.ticketId) {
        const ticketPrice = cartItem.price || 0;
        const ticketCount = cartItem.noTickets || 0;

        for (let index = 1; index <= ticketCount; index++) {
          const ticketBook = await BookTicket.create({
            order_id: orderId,
            event_id: eventId,
            event_ticket_id: cartItem.ticketId,
            cust_id: userId,
            ticket_buy: 1,
            amount: ticketPrice,
            mobile: userInfo.PhoneNumber,
            adminfee: adminFee,
          });

          const ticketDetail = await TicketDetail.create({
            tid: ticketBook.id,
            ticket_num: `T${ticketBook.id}`,
            generated_id: `T${ticketBook.id}`,
            user_id: userId,
            status: "0",
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: ticketDetail.id,
            ticketType: "ticket",
          });
          if (qrCodeImage.success) {
            await ticketDetail.update({ qrcode: qrCodeImage.filePath });
          }

          cartItemIdsToDelete.push(cartItem.cartId);
        }
      } else if (cartItem.ticketType == "addon" && cartItem.ticketId) {
        const addonPrice = cartItem.price || 0;
        const addonCount = cartItem.noTickets || 0;

        for (let index = 1; index <= addonCount; index++) {
          const addonBook = await AddonBook.create({
            addons_id: cartItem.ticketId,
            event_id: eventId,
            order_id: orderId,
            user_id: userId,
            price: addonPrice,
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: addonBook.id,
            ticketType: "addon",
          });
          if (qrCodeImage.success) {
            await addonBook.update({ addon_qrcode: qrCodeImage.filePath });
          }

          cartItemIdsToDelete.push(cartItem.cartId);
        }
      }
    }

    await CartModel.destroy({
      where: { id: cartItemIdsToDelete },
    });

    const totalOrders = await MyOrders.findOne({
      where: { id: orderId },
      attributes: [
        "id",
        "OriginalTrxnIdentifier",
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
        { model: User, attributes: ["ID", "FirstName", "LastName", "Email"] },
        {
          model: BookTicket,
          attributes: ["id", "event_ticket_id", "amount"],
          include: [
            { model: EventTicketType, attributes: ["id", "title", "ticket_image"] },
            { model: TicketDetail, attributes: ["id", "ticket_num", "qrcode"] },
          ],
          required: false,
        },
        {
          model: AddonBook,
          include: [{
            model: Addons, attributes: ["id",
              "name",
              "addon_location",
              "addon_time",
              "addon_day",
              "addon_image",
              "sortName",
              "sort_day",
              "addon_type"]
          }],
          attributes: ["id", "price", "addon_qrcode"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    return {
      success: true,
      status: 200,
      message: "Payment details updated successfully.",
      data: { totalOrders, paymentData },
    };
  } catch (error) {
    console.error("Error createOrderV2 Function Order:", error);
    return {
      success: false,
      message: `Error createOrderV2 Function Order: ${error.message}`,
      status: 404,
    };
  }
}

export async function createOrderForAccommodation(req, res) {
  console.log('----------------------------createOrderForAccommodation called ---------------------------');
  const {
    paymentIntentId,
    eventId,
    cartData = [],
    couponDetails,
    userId,
    amount,
    adminFees,
    donationFees,
    propertyDetailsObj,
    totalTax,
    finalPrice,
    selectedPaymentOption
  } = req.body;

  // console.log('existingOrder------------------', paymentIntentId);
  // return false;

  const parsedPropertyDetails = typeof propertyDetailsObj == 'string'
    ? JSON.parse(propertyDetailsObj)
    : propertyDetailsObj;

  try {
    // check if order already exists (avoid duplicate orders)
    const existingOrder = await Order.findOne({ where: { RRN: paymentIntentId } });

    if (existingOrder) {
      const paymentData = await Payment.findOne({
        where: { payment_intent: paymentIntentId },
        attributes: { exclude: ["order_items", "fee_details_json"] },
      });

      const totalOrders = await MyOrders.findOne({
        where: { id: existingOrder.id },
        // attributes: [
        //   "id", "OriginalTrxnIdentifier", "RRN", "total_amount", "total_tax_amount",
        //   "discountAmount", "discountType", "couponCode", "is_free", "adminfee", "createdAt",
        //   "totalAddonAmount", "totalAddonTax", "totalTicketAmount", "totalTicketTax",
        //   "totalAccommodationAmount", "totalAccommodationTax", "book_accommodation_id","accommodationPerDaysPropertyOwnerAmount"
        // ],
        include: [
          { model: User, attributes: ["ID", "FirstName", "LastName", "Email"] },
          {
            model: BookTicket,
            attributes: ["id", "event_ticket_id", "amount"],
            include: [
              { model: EventTicketType, attributes: ["id", "title", "ticket_image"] },
              { model: TicketDetail, attributes: ["id", "ticket_num", "qrcode"] },
            ],
            required: false,
          },
          {
            model: AddonBook,
            include: [{ model: Addons, attributes: ["id", "name", "addon_location", "addon_time", "addon_day", "addon_image", "sortName", "sort_day", "addon_type"] }],
            attributes: ["id", "price", "addon_qrcode"],
            required: false,
          },
          {
            model: BookAccommodationInfo,
            include: [{ model: Housing, attributes: ['Name', 'Neighborhood'], include: { model: HousingNeighborhood, attributes: ['name'] } }],
            attributes: ["id", "accommodation_id", "created_at", "check_in_date", "check_out_date", "guests_count", "no_of_bedrooms", "total_night_stay", "total_amount", "payment_status", "qr_code_image"],
            required: false,
          }
        ],
        order: [["id", "DESC"]],
      });

      return {
        success: true,
        status: 200,
        message: "Order already exists.",
        data: { totalOrders, paymentData },
      };
    }

    const totalCartAmt = amount || 0;
    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || 0;
    const discount_amount = couponDetails?.discount_amount || 0;
    const code = couponDetails?.coupon_code || null;
    const adminFee = adminFees ?? 0;

    // update payment info
    let paymentData = await Payment.findOne({
      where: { payment_intent: paymentIntentId },
      attributes: { exclude: ["order_items", "fee_details_json"] },
    });
    if (paymentData) {
      await paymentData.update({ paymentstatus: "succeeded" });
    }

    // extract needed values
    const {
      totalAccommodationAmount = 0,
      totalAccommodationTax = 0,
      ticketBankFee = 0,
      ticketPlatformFee = 0,
      ticketProcessingFee = 0,
      ticketStripeFee = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      totalCartAmount = 0,
      totalAddonAmount = 0,
      totalAddonTax = 0,
      totalTicketAmount = 0,
      totalTicketTax = 0,
      clientsecret = null,
      accommodationAmount = 0,
      accommodation_nightlyRate = 0,
      accommodation_basePriceHousing = 0,
      total_night_stay = 0,
      id: paymentId,
      accommodationBankFee = 0,
      accommodationProcessingFee = 0,
      accommodationStripeFee = 0,
      accommodation_nightlyPerDaysRate = 0,
      accommodation_basePerDaysPriceHousing = 0,
      accommodationPerDaysPropertyOwnerAmount = 0,
      accommodationPerDaysServiceFeeAmount = 0,
      accommodationPerDaysMexicanVATAmount = 0,
      accommodationPerDaysTaxAmount = 0,
      accommodationOndalindaPerDaysFeeAmount = 0,
      accommodationOndalindaPerDaysTotalAfterTaxes = 0,
    } = paymentData || {};

    const halfAccommodation = totalAccommodationAmount ? totalAccommodationAmount / 2 : 0;

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"],
    });

    // create order
    const orderResponse = await Order.create({
      user_id: userId,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      event_id: eventId,
      adminfee: adminFee,
      donationfee: 0,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      discountAmount: discount_amount,
      couponCode: code,
      totalCartAmount,
      discountType: discount_type,
      paymentOption: selectedPaymentOption,
      total_tax_amount: totalTax,
      actualamount: totalCartAmt,
      total_due_amount: selectedPaymentOption == 'partial' ? halfAccommodation : null,
      RRN: paymentIntentId,
      OrderIdentifier: clientsecret,
      book_accommodation_id: parsedPropertyDetails?.propertyId || null,
      accommodation_nightlyRate,
      accommodation_basePriceHousing,
      total_night_stay,
      totalAccommodationAmount,
      totalAccommodationTax,
      totalAddonAmount,
      totalAddonTax,
      totalTicketAmount,
      totalTicketTax,
      ticketBankFee,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketStripeFee,
      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage,
      accommodationBankFee,
      accommodationProcessingFee,
      accommodationStripeFee,
      accommodation_nightlyPerDaysRate,
      accommodation_basePerDaysPriceHousing,
      accommodationPerDaysPropertyOwnerAmount,
      accommodationPerDaysServiceFeeAmount,
      accommodationPerDaysMexicanVATAmount,
      accommodationPerDaysTaxAmount,
      accommodationOndalindaPerDaysFeeAmount,
      accommodationOndalindaPerDaysTotalAfterTaxes
    });

    // transaction identifier
    const orderId = orderResponse.id;
    const trxnIde = `M-${userId}-${orderId}`;
    await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });

    const cartItemIdsToDelete = [];

    // accommodation booking
    let accommodationBook = null;
    if (parsedPropertyDetails?.propertyId) {
      accommodationBook = await AccommodationBookingInfo.create({
        user_id: userId,
        event_id: eventId,
        transaction_id: paymentIntentId,
        order_id: orderId,
        payment_id: paymentId || 0,
        first_name: userInfo?.FirstName || '',
        last_name: userInfo?.LastName || '',
        email: userInfo?.Email || '',
        accommodation_id: parsedPropertyDetails?.propertyId,
        total_night_stay: parsedPropertyDetails?.totalNight || 0,
        check_in_date: parsedPropertyDetails?.arrivalDate,
        check_out_date: parsedPropertyDetails?.departureDate,
        guests_count: parsedPropertyDetails?.guest_count || 1,
        no_of_bedrooms: parsedPropertyDetails?.no_of_bedrooms || 1,
        status: 'Y',
        total_amount: accommodationAmount || 0,
        paid_amount: parsedPropertyDetails?.paid_amount || 0,
        payment_status: selectedPaymentOption || 'full',
        payment_method: 'Online',
        qr_code_image: parsedPropertyDetails?.qr_code_image || null,
      });

      await orderResponse.update({ accommodation_bookings_info_id: accommodationBook?.id || null });

      const qrResponse = await generateAccommodationQrToS3({
        user_id: userId,
        event_id: eventId,
        accommodation_id: parsedPropertyDetails?.propertyId,
        check_in_date: parsedPropertyDetails?.arrivalDate,
        check_out_date: parsedPropertyDetails?.departureDate,
        order_id: orderId,
      });
      if (qrResponse.success) {
        await accommodationBook.update({ qr_code_image: qrResponse.filePath });
      }
    }

    // handle cart items (tickets & addons)
    for (const cartItem of cartData) {
      if (!cartItem.ticketId) continue;

      if (cartItem.ticketType == "ticket") {
        for (let i = 0; i < (cartItem.noTickets || 0); i++) {
          const ticketBook = await BookTicket.create({
            order_id: orderId,
            event_id: eventId,
            event_ticket_id: cartItem.ticketId,
            cust_id: userId,
            ticket_buy: 1,
            amount: cartItem.price || 0,
            mobile: userInfo.PhoneNumber,
            adminfee: adminFee,
          });

          const ticketDetail = await TicketDetail.create({
            tid: ticketBook.id,
            ticket_num: `T${ticketBook.id}`,
            generated_id: `T${ticketBook.id}`,
            user_id: userId,
            status: "0",
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: ticketDetail.id,
            ticketType: "ticket",
          });
          if (qrCodeImage.success) {
            await ticketDetail.update({ qrcode: qrCodeImage.filePath });
          }
        }
      }

      if (cartItem.ticketType == "addon") {
        for (let i = 0; i < (cartItem.noTickets || 0); i++) {
          const addonBook = await AddonBook.create({
            addons_id: cartItem.ticketId,
            event_id: eventId,
            order_id: orderId,
            user_id: userId,
            price: cartItem.price || 0,
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: addonBook.id,
            ticketType: "addon",
          });
          if (qrCodeImage.success) {
            await addonBook.update({ addon_qrcode: qrCodeImage.filePath });
          }
        }
      }

      cartItemIdsToDelete.push(cartItem.cartId);
    }

    // delete cart
    if (cartItemIdsToDelete.length) {
      await CartModel.destroy({ where: { id: cartItemIdsToDelete } });
    }

    // get final order with relations
    const totalOrders = await MyOrders.findOne({
      where: { id: orderId },
      // attributes: [
      //   "id", "OriginalTrxnIdentifier", "RRN", "total_amount", "total_tax_amount",
      //   "discountAmount", "discountType", "couponCode", "is_free", "adminfee", "createdAt",
      //   "totalAddonAmount", "totalAddonTax", "totalTicketAmount", "totalTicketTax",
      //   "totalAccommodationAmount", "totalAccommodationTax", "book_accommodation_id"
      // ],
      include: [
        { model: User, attributes: ["ID", "FirstName", "LastName", "Email"] },
        {
          model: BookTicket,
          attributes: ["id", "event_ticket_id", "amount"],
          include: [
            { model: EventTicketType, attributes: ["id", "title", "ticket_image"] },
            { model: TicketDetail, attributes: ["id", "ticket_num", "qrcode"] },
          ],
          required: false,
        },
        {
          model: AddonBook,
          include: [{ model: Addons, attributes: ["id", "name", "addon_location", "addon_time", "addon_day", "addon_image", "sortName", "sort_day", "addon_type"] }],
          attributes: ["id", "price", "addon_qrcode"],
          required: false,
        },
        {
          model: BookAccommodationInfo,
          include: [{ model: Housing, attributes: ['Name', 'Neighborhood'], include: { model: HousingNeighborhood, attributes: ['name'] } }],
          attributes: ["id", "accommodation_id", "created_at", "check_in_date", "check_out_date", "guests_count", "no_of_bedrooms", "total_night_stay", "total_amount", "payment_status", "qr_code_image"],
          required: false,
        }
      ],
      order: [["id", "DESC"]],
    });

    return {
      success: true,
      status: 200,
      message: "Payment details updated successfully.",
      data: { totalOrders, paymentData },
    };

  } catch (error) {
    console.error("Error Order Creating createOrderForAccommodation:", error);
    return {
      success: false,
      status: 404,
      message: `Error Order Creating createOrderForAccommodation: ${error.message}`,
    };
  }
}


const sendOrderEmailWithAccommodation = async (userInfo, orderObj, cartData, parsedPropertyDetails, userId) => {
  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<----sendOrderEmailWithAccommodation----->>>>>>>>>>>>>>>>>>>>>>>>>>>")
  // console.log('==========================================',parsedPropertyDetails);
  // return true

  const eventIds = orderObj.eventId;
  const createdOrderId = orderObj.order_id;

  const { accommodation_nightlyRate, accommodation_basePriceHousing, total_night_stay, totalAccommodationAmount, totalAccommodationTax, paymentOption, total_due_amount = 0 } = orderObj;
  cartData = cartData || [];
  // const metaPaymentObj = orderObj.paymentBreakDownObj;
  // Define common style for table rows
  const rowStyle = `font-family: Arial, Helvetica, sans-serif;font-size: min(max(9px, 2vw), 16px);text-transform: uppercase;`;
  let emailTemplateHtml = ``

  let housingData = null;
  if (parsedPropertyDetails?.propertyId) {

    housingData = await Housing.findOne({
      where: {
        id: parsedPropertyDetails.propertyId
      },
      attributes: ["Name", "ImageURL", "ID", "OwnerEmail", 'OwnerName', 'ManagerName', 'ManagerEmail'],
      include: { model: HousingNeighborhood, attributes: ["name"] }
    });

  }

  // Wait for all promises to resolve
  // const emailRows = await Promise.all(itemPromises);
  // emailTemplateHtml += emailRows.join("");

  const isPartialPayment = paymentOption === "partial";

  // Ensure values are treated as numbers
  const paidAmount = parseFloat(orderObj.total_amount || 0);
  const dueAmount = parseFloat(total_due_amount || 0);
  const totalAmount = orderObj.finalPrice;
  const fullHomeownerPayout = parseFloat(orderObj.accommodationPerDaysPropertyOwnerAmount * total_night_stay);

  const isPartial = paymentOption === "partial";
  // Adjusted HomeownerPayout if partial
  const HomeownerPayout = isPartial ? fullHomeownerPayout / 2 : fullHomeownerPayout;


  if (cartData && cartData.length > 0) {
    const findAllTicketsData = await BookTicket.findAll({
      where: {
        order_id: orderObj.order_id
      },
      raw: true,
    });

    for (const ticket of findAllTicketsData) {
      const ticketDataId = ticket.id;
      const findAllTicketsqrcode = await TicketDetail.findOne({
        where: {
          tid: ticketDataId
        },
        raw: true,
      });

      const findTicketName = await BookTicket.findOne({
        include: {
          model: EventTicketType, // Ensure this is properly associated in your Sequelize models
          attributes: ["title", "ticket_image"], // Specify the columns you want to retrieve from EventTicketType
          // where: { eventid: eventIds }, // add 04-02-2025(multiple event send email kamal)
        },
        where: {
          order_id: orderObj.order_id
        },
        raw: true,
      });
      const ticketName =
        findTicketName["EventTicketType.title"] || "Unnamed Ticket";
      const ticketImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${findTicketName["EventTicketType.ticket_image"] || "Unnamed "
        }`;
      const ticketqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${findAllTicketsqrcode.qrcode}`;
      emailTemplateHtml += `           
                <tr>
                    <td style="height: 20px;"></td>
                </tr>

                <tr>
                    <td>
                        <div style="max-width: 500px; background-color: #ef9c7c; border-radius: 30px; border: 1px solid #ef9c7c; margin: auto; overflow: hidden;">
                            <div
                                style="
                                    background-image: url('${ticketImage}');
                                    height: 220px;
                                    background-position: center;
                                    background-size: cover;
                                    border-radius: 30px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                "
                            >
                                <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                    <div style="text-align: center; margin: auto;">
                                        <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                            O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                        </h2>
                                        <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                            Nov 6 - 9, 2025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style="padding: 30px 20px;">
                                <table style="width: 100%; color: black; font-family: Arial, Helvetica, sans-serif;">
                                    <tr style="color:rgb(255, 255, 255); text-transform: uppercase; font-size: 14px;">
                                        <td>Last Name</td>
                                        <td>First Name</td>
                                        <td>Order#</td>
                                    </tr>
                                    <tr style="text-transform: uppercase; font-size: 14px;">
                                        <td>${userInfo.LastName}</td>
                                        <td>${userInfo.FirstName}</td>
                                        <td>${orderObj.trxnIde}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="height: 60px; border-bottom: 1px solid #ffffff;"></td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 15px;"></td>
                                    </tr>

                                    <tr style="color: #ffffff; text-transform: uppercase; font-size: 14px;">
                                        <td colspan="3">TICKETS</td>
                                    </tr>

                                    <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                        <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>
                                        <td style="color: #ffffff; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 30px;"></td>
                                    </tr>

                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 6:</b> Los Danzantes | 9pm to 4am | Zyanya</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 7:</b> The Cloud People | 10pm to 6am | Polo Fields</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="padding-bottom: 20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 8:</b> The Zapotec Gods | 11pm to 7am | Cabeza del Indio</td>
                                    </tr>
                                </table>

                                <div style="margin: 60px 0;">
                                    <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                        <img style="width: 100%;" src="${ticketqrcode}" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
    `;
    }

    const findAlladdonsData = await AddonBook.findAll({
      include: {
        model: Addons, // Ensure this is properly associated in your Sequelize models
        attributes: [
          "id",
          "name",
          "addon_location",
          "addon_time",
          "addon_day",
          "addon_image",
          "sortName",
          "sort_day",
          "addon_type",
        ], // Specify the columns you want to retrieve from EventTicketType
        // where: { event_id: eventIds }, // add 04-02-2025(multiple event send email kamal)
      },
      where: {
        order_id: orderObj.order_id
      },
      raw: true,
    });

    findAlladdonsData.forEach((addonsticket) => {
      const addonname = addonsticket["Addon.name"] || "";
      const addonSortName = addonsticket["Addon.sortName"] || "";
      let addonLocation = addonsticket["Addon.addon_location"] || "";
      let addonTime = addonsticket["Addon.addon_time"] || "";
      const addonDay = addonsticket["Addon.sort_day"] || " ";
      const addonImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${addonsticket["Addon.addon_image"] || ""
        }`;
      const addonqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${addonsticket.addon_qrcode}`;

      const backgroundColor =
        addonsticket["Addon.addon_type"] == "Special" ? "#e6dfd5" : "#e6dfd5";

      emailTemplateHtml += `<tr>
                            <td style="height: 30px;"></td>
                        </tr>
                        <tr>
                            <td>
                                <div style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #e6dfd5; margin: auto; overflow: hidden; ">
                                    <div
                                        style="
                                            background-image: url('${addonImage}');
                                            height: 220px;
                                            background-size: cover;
                                            border-radius: 30px;
                                            overflow: hidden;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        "
                                    >
                                        <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                            <div style="text-align: center; margin: auto;">
                                                <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                    O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                                </h2>
                                                <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                    Nov 6 - 9, 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="padding: 30px 20px;">
                                        <table style="width: 100%; color: #000000; font-family: Arial, Helvetica, sans-serif;">
                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td>Last Name</td>
                                                <td>First Name</td>
                                                <td>Order#</td>
                                            </tr>
                                            <tr style="text-transform: uppercase; font-size: 14px;">
                                                <td>${userInfo.LastName}</td>
                                                <td>${userInfo.FirstName}</td>
                                                <td>${orderObj.trxnIde}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 60px; border-bottom: 1px solid #fca3bb;"></td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 15px;"></td>
                                            </tr>

                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td colspan="3">TICKETS</td>
                                            </tr>                                            

                                            <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                                <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                                                <td style="color: #fca3bb; text-transform: uppercase; font-size: 14px; text-align: right;">3 DAYS</td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 30px;"></td>
                                            </tr>

                                            <tr style="color: black; font-size: 12px;">
                                                <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;">
                                                    <b>Transportation is valid inside Careyes and to and from 
                                                    official Ondalinda events only.</b>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="margin: 60px 0;">
                                            <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                                <img style="width: 100%;" src="${addonqrcode}" alt="AddonImg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 50px;"></td>
                        </tr>
              `;
    });

  }
  // 🧩 Format accommodation dates
  const formatDates = (details) => {
    if (!details?.propertyId) return {};

    const checkInDate = new Date(details.arrivalDate);
    const checkOutDate = new Date(details.departureDate);

    const formattedCheckIn = checkInDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const formattedCheckOut = checkOutDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const customCheckIn = checkInDate.getDate();
    const customCheckOut = checkOutDate.getDate();
    const customMonth = checkInDate.toLocaleString("en-US", { month: "long" });
    const customYear = checkOutDate.getFullYear();
    const customCheckInOut = `${customCheckIn} to the ${customCheckOut} of ${customMonth}, ${customYear}`;


    return { formattedCheckIn, formattedCheckOut, customCheckInOut };
  };

  const { formattedCheckIn, formattedCheckOut, customCheckInOut } = formatDates(parsedPropertyDetails);

  // 📨 Send Email Utility
  const sendEmailToRecipient = async ({ templateId, htmlBuilderFn, isPartial = false }) => {
    const emailTemplate = await Emailtemplet.findOne({
      where: { eventId: eventIds, templateId }
    });

    if (!emailTemplate) {
      console.error(`❌ Email template with templateId ${templateId} not found for eventId ${eventIds}`);
      return;
    }

    const {
      mandril_template: templateName,
      subject,
      description: htmlTemplate,
    } = emailTemplate;

    const owner = housingData?.OwnerName?.trim() || "";
    const manager = housingData?.ManagerName?.trim() || "";
    const userName = [owner, manager].filter(Boolean).join(" / ") || "Guest";

    const mergeVars = {
      ALLDATA: htmlBuilderFn({
        userName,
        housingData,
        HomeownerPayout,
        customCheckInOut,
        htmlTemplate
      }).html
    };

    const homeowner = housingData?.OwnerEmail?.trim();
    const houseManager = housingData?.ManagerEmail?.trim();

    let recipientEmail = houseManager || homeowner;
    let bccEmails = houseManager && homeowner ? [homeowner] : [];

    // Developer override
    if ([10315, 11492, 10272].includes(userId)) {
      const wasHouseOwnerEmailSent = await sendEmailWithBCC("rupam@doomshell.com", ["sachin@doomshell.com"], mergeVars, templateName, subject);
      if (wasHouseOwnerEmailSent) {
        await MyOrders.update(
          { houseOwnerEmailSent: "Y" },
          { where: { id: createdOrderId } }
        );
      }
    } else {
      if (!recipientEmail) {
        console.warn("⚠️ No valid recipient email found. Email not sent.");
        return;
      }
      const wasHouseOwnerEmailSent = await sendEmailWithBCC(recipientEmail, bccEmails, mergeVars, templateName, subject);

      if (wasHouseOwnerEmailSent) {
        await MyOrders.update(
          { houseOwnerEmailSent: "Y" },
          { where: { id: createdOrderId } }
        );
      }

    }
  };

  // ✉️ First main order summary email send to member
  const templateOrder = await Emailtemplet.findOne({
    where: {
      eventId: eventIds,
      templateId: 32,
    },
  });

  if (templateOrder) {
    const { mandril_template, subject, description } = templateOrder;
    const EventPageUrl = `${SITE_URL}user/my-event/`;

    const processedTemplate = orderTemplate({
      HouseName: housingData?.Name,
      HousingNeighborhood: housingData?.HousingNeighborhood?.name,
      checkInDate: formattedCheckIn,
      checkOutDate: formattedCheckOut,
      MyEventPageURL: EventPageUrl,
      OrderSummary: emailTemplateHtml,
      html: description,
    });

    const mergeVars = { ALLDATA: processedTemplate.html };
    const toEmail = userInfo?.Email;

    // if ([10315, 11492, 10272].includes(userId)) {
    //   await sendEmailWithBCC(toEmail, [], mergeVars, mandril_template, subject);
    // } else {
    const orderConfirmationEmailSent = await sendEmailWithBCC(toEmail, [], mergeVars, mandril_template, subject);

    // ✅ If sent successfully, update in DB
    if (orderConfirmationEmailSent) {
      await MyOrders.update(
        { orderConfirmationEmailSent: "Y" },
        { where: { id: createdOrderId } }
      );
    }
    // }
  }

  // ✉️ Conditional partial or full payment emails
  if (isPartialPayment) {
    await sendEmailToRecipient({
      templateId: 37,
      htmlBuilderFn: ({ userName, housingData, HomeownerPayout, customCheckInOut, htmlTemplate }) =>
        sendPartialPayment50Template({
          UserName: userName,
          propertyName: housingData?.Name,
          propertyAddress: housingData?.HousingNeighborhood?.name,
          amountWithCurrency: `${formatSmartWithRoundPrice(HomeownerPayout)} USD`,
          remainingWithCurrency: `${formatSmartWithRoundPrice(HomeownerPayout)} USD`,
          AccommodationBookingDates: customCheckInOut,
          html: htmlTemplate,
        }),
      isPartial: true,
    });
  } else {
    await sendEmailToRecipient({
      templateId: 38,
      htmlBuilderFn: ({ userName, housingData, HomeownerPayout, customCheckInOut, htmlTemplate }) =>
        sendPartialPayment100Template({
          UserName: userName,
          propertyName: housingData?.Name,
          propertyAddress: housingData?.HousingNeighborhood?.name,
          amountWithCurrency: `${formatSmartWithRoundPrice(HomeownerPayout)} USD`,
          AccommodationBookingDates: customCheckInOut,
          html: htmlTemplate,
        }),
    });
  }

  console.log(`>>>>>>> Order has been created successfully`);
  return;
};

// this call when webhook not call then
async function createOrderForAccommodationFallbackWebhook({ payment_intent, metadata }) {

  console.log('----------------------------Create Order For Accommodation called Not from Webhook ---------------------------');

  const {
    eventId = null,
    cartData = [],
    couponDetails = {},
    userId = null,
    amount = 0,
    adminFees = 0,
    donationFees = 0,
    totalTax = 0,
    propertyDetailsObj = {},
    finalPrice = 0,
    selectedPaymentOption = "full"
  } = metadata;

  const parsedPropertyDetails = propertyDetailsObj;
  const paymentIntentId = payment_intent;

  try {
    // const totalCartAmt = amount / 100;
    const totalCartAmt = amount || 0;
    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || 0;
    const discount_amount = couponDetails?.discount_amount || 0;
    const code = couponDetails?.coupon_code || null;
    const adminFee = adminFees ?? 0;
    const donationFee = donationFees ?? 0;
    // Update paymentInfo status to succeeded
    let paymentData = await Payment.findOne({ where: { payment_intent: paymentIntentId } });

    if (paymentData) {
      await paymentData.update({ paymentstatus: "succeeded" });
    }

    // Initialize totals
    let totalTicketCount = 0;
    let totalAddonCount = 0;
    let totalActualAmount = 0;

    // Safe check: Make sure cartData is an array
    if (Array.isArray(cartData) && cartData.length > 0) {
      for (const cartItem of cartData) {
        if (cartItem.ticketType == "ticket") {
          totalTicketCount += cartItem.noTickets || 0;
        } else if (cartItem.ticketType == "addon") {
          totalAddonCount += cartItem.noTickets || 0;
        }
        // Optional: Add actual amount calculation if needed
        // totalActualAmount += (cartItem.price || 0) * (cartItem.noTickets || 0);
      }
    }

    totalActualAmount = totalCartAmt;

    const {
      totalAccommodationAmount = 0,
      totalAccommodationTax = 0,
      ticketBankFee = 0,
      ticketPlatformFee = 0,
      ticketProcessingFee = 0,
      ticketStripeFee = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      totalCartAmount = 0,
      totalAddonAmount = 0,
      totalAddonTax = 0,
      totalTicketAmount = 0,
      totalTicketTax = 0,
      clientsecret = null,
      accommodationAmount = 0,
      paymentOption,
      accommodation_nightlyRate = 0,
      accommodation_basePriceHousing = 0,
      total_night_stay = 0,
      id: paymentId, // yahan se paymentData.id ka value paymentId mein store hoga

      accommodationBankFee = 0,
      accommodationProcessingFee = 0,
      accommodationStripeFee = 0,
      accommodation_nightlyPerDaysRate = 0,
      accommodation_basePerDaysPriceHousing = 0,
      accommodationPerDaysPropertyOwnerAmount = 0,
      accommodationPerDaysServiceFeeAmount = 0,
      accommodationPerDaysMexicanVATAmount = 0,
      accommodationPerDaysTaxAmount = 0,
      accommodationOndalindaPerDaysFeeAmount = 0,
      accommodationOndalindaPerDaysTotalAfterTaxes = 0,
    } = paymentData || {};

    const halfAccommodation = (totalAccommodationAmount && totalAccommodationTax)
      ? (totalAccommodationAmount / 2)
      : 0;

    // Handle invitation event status and expiration update
    const invitationWhereClause = { UserID: userId, EventID: eventId };
    // Try to find an existing invitation
    let invitation = await InvitationEvent.findOne({ where: invitationWhereClause });

    // if (invitation) {

    //   if (invitation.EligibleHousingIDs) {
    //     const extractIds = invitation.EligibleHousingIDs
    //       .split(',')
    //       .map(id => parseInt(id.trim(), 10))
    //       .filter(id => !isNaN(id));
    //     // release all property accept those booked 
    //     const [updatedRows] = await EventHousing.update(
    //       { isBooked: 'N' },
    //       {
    //         where: {
    //           EventID: eventId,
    //           HousingID: {
    //             [Op.in]: extractIds
    //           }
    //         }
    //       }
    //     );
    //   }
    //   // Update both fields in one query
    //   // const updatedStatus = totalTicketCount > 0 ? 2 : 1;
    //   await InvitationEvent.update(
    //     {
    //       // Status: updatedStatus,
    //       Status: 2,
    //       expire_status: 'purchased',
    //       accommodation_status: "Booked"
    //     },
    //     {
    //       where: { id: invitation.id }
    //     }
    //   );

    // } else {
    //   // Determine status based on totalTicketCount
    //   const updatedStatus = totalTicketCount > 0 ? 2 : 1;
    //   // Create a new invitation
    //   invitation = await InvitationEvent.create({
    //     UserID: userId,
    //     EventID: eventId,
    //     Status: updatedStatus,
    //     accommodation_status: "Booked",
    //     expire_status: 'purchased',
    //   });

    // }

    // Update housing booking status if property ID is available
    // if (parsedPropertyDetails?.propertyId) {
    //   await EventHousing.update(
    //     { isBooked: "Y" },
    //     {
    //       where: {
    //         EventID: eventId,
    //         HousingID: parsedPropertyDetails.propertyId
    //       }
    //     }
    //   );
    // }

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"],
    });


    // Create order
    const orderResponse = await Order.create({
      user_id: userId,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      event_id: eventId,
      adminfee: adminFee,
      donationfee: 0,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      discountAmount: discount_amount,
      couponCode: code,
      totalCartAmount: totalCartAmount,
      discountType: discount_type,
      paymentOption: selectedPaymentOption,
      total_tax_amount: totalTax,
      actualamount: totalCartAmt,
      total_due_amount: selectedPaymentOption == 'partial' ? halfAccommodation : null,
      RRN: paymentIntentId,
      OrderIdentifier: paymentData?.clientsecret || null,
      book_accommodation_id: parsedPropertyDetails?.propertyId || null,
      // accommodation_name: parsedPropertyDetails?.propertyId || null,

      accommodation_nightlyRate,
      accommodation_basePriceHousing,
      total_night_stay,

      totalAccommodationAmount,
      totalAccommodationTax,

      totalAddonAmount,
      totalAddonTax,
      totalTicketAmount,
      totalTicketTax,

      ticketBankFee,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketStripeFee,

      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage,

      accommodationBankFee,
      accommodationProcessingFee,
      accommodationStripeFee,
      accommodation_nightlyPerDaysRate,
      accommodation_basePerDaysPriceHousing,
      accommodationPerDaysPropertyOwnerAmount,
      accommodationPerDaysServiceFeeAmount,
      accommodationPerDaysMexicanVATAmount,
      accommodationPerDaysTaxAmount,
      accommodationOndalindaPerDaysFeeAmount,
      accommodationOndalindaPerDaysTotalAfterTaxes
    });


    // Generate the transaction identifier
    const orderId = orderResponse.id;
    const trxnIde = `M-${userId}-${orderId}`;
    await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });
    const cartItemIdsToDelete = []; // Collect IDs for bulk delete

    const safePaymentId = paymentData?.id || 0;
    let accomadationBook = null;
    if (parsedPropertyDetails?.propertyId) {
      // set here AccommodationBookingInfo data set 
      accomadationBook = await AccommodationBookingInfo.create({
        user_id: userId,
        event_id: eventId,
        transaction_id: paymentIntentId,
        order_id: orderId,
        payment_id: safePaymentId || 0,
        first_name: userInfo?.FirstName || '',
        last_name: userInfo?.LastName || '',
        email: userInfo?.Email || '',
        accommodation_id: parsedPropertyDetails?.propertyId,
        // accommodation_name: parsedPropertyDetails?.accommodation_name || '',
        total_night_stay: parsedPropertyDetails?.totalNight || 0,
        check_in_date: parsedPropertyDetails?.arrivalDate,
        check_out_date: parsedPropertyDetails?.departureDate,
        guests_count: parsedPropertyDetails?.guest_count || 1,
        no_of_bedrooms: parsedPropertyDetails?.no_of_bedrooms || 1,
        status: 'Y', // assuming active
        total_amount: accommodationAmount || 0,
        paid_amount: parsedPropertyDetails?.paid_amount || 0,
        payment_status: selectedPaymentOption || 'full',
        payment_method: 'Online',
        qr_code_image: parsedPropertyDetails?.qr_code_image || null,
      });

      // update accommodationInfoId 
      await orderResponse.update({
        accommodation_bookings_info_id: accomadationBook?.id || null,
      });

      // After booking creation
      const qrResponse = await generateAccommodationQrToS3({
        user_id: userId,
        event_id: eventId,
        accommodation_id: parsedPropertyDetails?.propertyId,
        check_in_date: parsedPropertyDetails?.arrivalDate,
        check_out_date: parsedPropertyDetails?.departureDate,
        order_id: orderId,
      });

      if (qrResponse.success) {
        await accomadationBook.update({ qr_code_image: qrResponse.filePath });
      }
    }

    // Loop through the cartData and handle ticket and addon bookings
    if (cartData) {
      for (const cartItem of cartData) {

        if (cartItem.ticketType === "ticket" && cartItem.ticketId) {
          const ticketPrice = cartItem.price || 0;
          const ticketCount = cartItem.noTickets || 0;

          for (let index = 1; index <= ticketCount; index++) {
            const ticketBook = await BookTicket.create({
              order_id: orderId,
              event_id: eventId,
              event_ticket_id: cartItem.ticketId,
              cust_id: userId,
              ticket_buy: 1,
              amount: ticketPrice,
              mobile: userInfo.PhoneNumber,
              adminfee: adminFee,
              // is_buy_addons_ids: addonIdsString,  // new functionality 08-04-2025
            });

            const ticketId = ticketBook.id;
            const ticketNum = `T${ticketId}`;
            const ticketDetail = await TicketDetail.create({
              tid: ticketId,
              ticket_num: `T${ticketId}`,
              generated_id: ticketNum,
              user_id: userId,
              status: "0",
            });

            const qrCodeImage = await generateTicketQrToS3({
              userId,
              orderId,
              ticketId: ticketDetail.id,
              ticketType: "ticket",
            });


            if (qrCodeImage.success) {
              await ticketDetail.update({ qrcode: qrCodeImage.filePath });
            }

            cartItemIdsToDelete.push(cartItem.cartId); // Collect cart item ID for deletion
          }
        } else if (cartItem.ticketType === "addon" && cartItem.ticketId) {
          const addonPrice = cartItem.price || 0;
          const addonCount = cartItem.noTickets || 0;

          for (let index = 1; index <= addonCount; index++) {
            const addonBook = await AddonBook.create({
              addons_id: cartItem.ticketId,
              event_id: eventId,
              order_id: orderId,
              user_id: userId,
              price: addonPrice,
            });

            const qrCodeImage = await generateTicketQrToS3({
              userId,
              orderId,
              ticketId: addonBook.id,
              ticketType: "addon",
            });
            if (qrCodeImage.success) {
              await addonBook.update({ addon_qrcode: qrCodeImage.filePath });
            }

            cartItemIdsToDelete.push(cartItem.cartId); // Collect cart item ID for deletion
          }
        }
      }
    }

    // Delete the cart items after processing
    if (cartData) {
      await CartModel.destroy({
        where: {
          id: cartItemIdsToDelete,
        },
      });
    }

    // Send email to the user after order creation
    const orderObject = {
      order_id: orderId,
      user_id: userId,
      eventId: eventId,
      trxnIde,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      adminfee: adminFee,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      couponCode: code,
      discountType: discount_type,
      RRN: paymentIntentId,
      OrderIdentifier: paymentIntentId,
      actualamount: totalActualAmount,
      paymentOption: selectedPaymentOption,
      event_id: eventId,
      donationfee: 0,
      discountAmount: discount_amount,
      total_tax_amount: totalTax,
      total_due_amount: halfAccommodation,
      OrderIdentifier: clientsecret || null,
      accommodationQr: accomadationBook?.qr_code_image,
      finalPrice,
      accommodation_nightlyRate,
      accommodation_basePriceHousing,
      total_night_stay,
      totalAccommodationAmount,
      totalAccommodationTax,
      accommodationPerDaysPropertyOwnerAmount
    };

    // const isEmailSend = sendOrderEmailWithAccommodation(userInfo, orderObject, cartData, parsedPropertyDetails, userId);

    const orderInfo = await MyOrders.findOne({ where: { RRN: payment_intent } });
    let accommodationData;
    // Check if orderInfo exists and merge both data
    if (orderInfo) {
      accommodationData = await AccommodationBookingInfo.findOne({
        where: { order_id: orderInfo.id },
        include: [
          {
            model: Housing,
            attributes: ["id", "Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "Pool", "ImageURL", "location"],
            include: [{ model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }]
          }
        ]
      });

      return {
        success: true,
        message: "Payment Completed Successfully !!",
        data: {
          ...orderInfo.toJSON(), // Convert orderInfo to a plain object
          accommodationInfo: accommodationData,
          email: paymentData.email, // Extract specific fields from paymentData
          name: paymentData.name,
        },
      };
    }

    return {
      success: false,
      message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",

    };

  } catch (error) {
    console.error("Error Order Creating createOrderForAccommodation :", error);

    return {
      success: false,
      status: 404,
      message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",
    };
  }
}

export async function createOrder({ paymentIntentId, eventId, customerId }) {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    const paymentInfo = await Payment.findOne({
      where: { payment_intent: paymentIntentId },
      transaction,
    });

    if (!paymentInfo) {
      // Rollback if paymentInfo is not found
      await transaction.rollback();
      return {
        success: false,
        status: 200,
        message: "Invalid payment intent",
      };
    }

    // Update paymentInfo status to succeeded
    await paymentInfo.update({ paymentstatus: "succeeded" }, { transaction });
    // await InvitationEvent.update(
    //   { Status: 2 },
    //   { where: { UserID: paymentInfo.user_id, EventID: paymentInfo.event_id } }
    // );

    const userId = customerId || paymentInfo.user_id;
    const userInfo = await User.findOne({ where: { id: userId }, transaction });
    const userFullName = `${userInfo.FirstName} ${userInfo.LastName}`;
    const userEmail = userInfo.Email;
    const totalCartAmt = paymentInfo.amount;
    const discount_type = paymentInfo?.discountType || null;
    const discount_value = paymentInfo?.discountValue || 0;
    const discount_amount = paymentInfo?.discountAmount || 0;
    const code = paymentInfo?.couponCode || null;
    const adminFee = paymentInfo?.adminfee ?? 0;
    const event_id_dynamic =
      eventId || (paymentInfo && paymentInfo.event_id) || null;




    const invitationWhereClause = { UserID: userId, EventID: event_id_dynamic };

    // Try to find an existing invitation
    let invitation = await InvitationEvent.findOne({ where: invitationWhereClause });

    if (invitation) {
      // Update both fields in one query
      await InvitationEvent.update(
        { Status: 2, expire_status: 'purchased' },
        { where: { id: invitation.id } }
      );
    } else {
      // Create a new invitation
      invitation = await InvitationEvent.create({
        UserID: userId,
        EventID: eventId,
        Status: 2,
        expire_status: 'purchased',
      });
    }

    // Get Cart Data
    const cartData = await CartModel.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: EventTicketType,
          attributes: ["title", "price", "count"],
          required: false,
        },
        {
          model: Addons,
          attributes: ["name", "price", "count"],
          required: false,
        },
      ],
      transaction,
    });

    // Initialize totals
    let totalTicketCount = 0;
    let totalAddonCount = 0;
    let totalActualAmount = 0;

    // Calculate totals
    for (const cartItem of cartData) {
      // Handle ticket type items
      if (cartItem.ticket_type == "ticket" && cartItem.EventTicketType) {
        const ticketPrice = cartItem.EventTicketType.price || 0;
        const ticketCount = cartItem.no_tickets || 0;
        totalTicketCount += ticketCount;
        totalActualAmount += ticketPrice * ticketCount;
      } else if (cartItem.ticket_type == "addon" && cartItem.Addon) {
        const addonPrice = cartItem.Addon.price || 0;
        const addonCount = cartItem.no_tickets || 0;
        totalAddonCount += addonCount;
        totalActualAmount += addonPrice * addonCount;
      }
    }

    // Create order
    const orderResponse = await Order.create(
      {
        user_id: userId,
        Approved: "succeeded",
        TransactionType: "Online",
        paymenttype: "Online",
        event_id: event_id_dynamic,
        adminfee: adminFee,
        total_amount: totalCartAmt,
        discountValue: discount_value,
        discountAmount: discount_amount,
        couponCode: code,
        discountType: discount_type,
        RRN: paymentInfo.payment_intent,
        OrderIdentifier: paymentInfo.clientsecret,
        actualamount: totalActualAmount,
      },
      { transaction }
    );

    // Generate the transaction identifier
    const trxnIde = `M-${userId}-${orderResponse.id}`;
    await orderResponse.update(
      { OriginalTrxnIdentifier: trxnIde },
      { transaction }
    );

    const orderId = orderResponse.id;
    const cartItemIdsToDelete = []; // Collect IDs for bulk delete

    let orderObject = {
      order_id: orderId,
      user_id: userId,
      eventId: event_id_dynamic,
      trxnIde,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      adminfee: adminFee,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      couponCode: code,
      discountType: discount_type,
      RRN: paymentInfo.payment_intent,
      OrderIdentifier: paymentInfo.clientsecret,
      actualamount: totalActualAmount,
    };

    for (const cartItem of cartData) {
      // Handle ticket type items
      if (cartItem.ticket_type == "ticket" && cartItem.EventTicketType) {
        const ticketPrice = cartItem.EventTicketType.price || 0;
        const ticketCount = cartItem.no_tickets || 0;

        // Loop for each ticket being purchased
        for (let index = 1; index <= ticketCount; index++) {
          const ticketBook = await BookTicket.create(
            {
              order_id: orderId,
              event_id: paymentInfo.event_id,
              event_ticket_id: cartItem.ticket_id,
              cust_id: userId,
              ticket_buy: 1,
              amount: ticketPrice,
              mobile: userInfo.PhoneNumber,
              adminfee: adminFee,
            },
            { transaction }
          );

          const ticketId = ticketBook.id;
          const ticketNum = `T${ticketId}`;
          const ticketDetail = await TicketDetail.create(
            {
              tid: ticketId,
              ticket_num: `T${ticketId}`,
              generated_id: ticketNum,
              user_id: userId,
              status: "0",
            },
            { transaction }
          );
          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: ticketDetail.id,
            ticketType: "ticket",
          });
          if (qrCodeImage.success) {
            await ticketDetail.update(
              { qrcode: qrCodeImage.filePath },
              { transaction }
            );
          }
          // Collect cart item ID for deletion
          cartItemIdsToDelete.push(cartItem.id);
        }
      } else if (cartItem.ticket_type == "addon" && cartItem.Addon) {
        // Handle addon items similarly to tickets
        const addonPrice = cartItem.Addon.price || 0;
        const addonCount = cartItem.no_tickets || 0;

        for (let index = 1; index <= addonCount; index++) {
          // Create a record in AddonsBook
          const addonBook = await AddonBook.create(
            {
              addons_id: cartItem.addons_id,
              event_id: paymentInfo.event_id,
              order_id: orderId,
              user_id: userId,
              price: addonPrice,
            },
            { transaction }
          );

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: addonBook.id,
            ticketType: "addon",
          });
          if (qrCodeImage.success) {
            await addonBook.update(
              { addon_qrcode: qrCodeImage.filePath },
              { transaction }
            );
          }
          // Collect cart item ID for deletion
          cartItemIdsToDelete.push(cartItem.id);
        }
      }
    }

    // Bulk delete cart items
    if (cartItemIdsToDelete.length > 0) {
      await CartModel.destroy({
        where: {
          id: {
            [Op.in]: cartItemIdsToDelete,
          },
        },
        transaction,
      });
    }

    // Commit the transaction if all operations succeed
    await transaction.commit();
    const isEmailSend = sendOrderEmailToUser(userInfo, orderObject, cartData);

    return {
      success: true,
      status: 200,
      data: paymentInfo,
      message: "Payment details updated successfully.",
    };
  } catch (error) {
    // Only rollback if transaction is still active
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }
    return {
      success: false,
      status: 404,
      message: "Error Order Creating " + error.message,
    };
    // logErrorToFile(error);
    throw new Error("Error Order Creating", error.message);
  }
}

export async function generateFreeTicket(request, response) {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    const encryptedData = request.body.data;
    const secretKey = process.env.DATA_ENCODE_SECRET_KEY;
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const { cart, couponDetails, adminFees } = decryptedData;

    if (cart.length == 0) {
      // Rollback if paymentInfo is not found
      await transaction.rollback();
      return {
        success: false,
        status: 200,
        message: "No items in cart",
      };
    }

    const { totalPrice, finalPriceAfterDiscount, taxes } = calculateTotals(
      cart,
      couponDetails?.discountAmt,
      adminFees
    );

    // console.log('>>>>>totalPrice',totalPrice);
    // console.log('>>>>>finalPriceAfterDiscount',finalPriceAfterDiscount);
    // console.log('>>>>>taxes',taxes);
    // return false

    const userId = cart[0].user_id;
    const getEventId = cart[0].event_id;
    const userInfo = await User.findOne({ where: { id: userId }, transaction });
    const userFullName = `${userInfo.FirstName} ${userInfo.LastName}`;
    const userEmail = userInfo.Email;

    const totalCartAmt = totalPrice;

    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || null;
    const code = couponDetails?.code || null;
    const adminFee = adminFees ?? 0;

    // Initialize totals
    let totalTicketCount = 0;
    let totalAddonCount = 0;
    let totalActualAmount = 0;

    // Calculate totals
    for (const cartItem of cart) {
      // Handle ticket type items
      if (cartItem.ticket_type == "ticket" && cartItem.EventTicketType) {
        const ticketPrice = cartItem.EventTicketType.price || 0;
        const ticketCount = cartItem.no_tickets || 0;
        totalTicketCount += ticketCount;
        totalActualAmount += ticketPrice * ticketCount;
      } else if (cartItem.ticket_type == "addon" && cartItem.Addon) {
        const addonPrice = cartItem.Addon.price || 0;
        const addonCount = cartItem.no_tickets || 0;
        totalAddonCount += addonCount;
        totalActualAmount += addonPrice * addonCount;
      }
    }

    // Create order
    const orderResponse = await Order.create(
      {
        user_id: userId,
        Approved: "succeeded",
        TransactionType: "Online",
        paymenttype: "Online",
        adminfee: adminFee,
        total_amount: finalPriceAfterDiscount,
        discountValue: discount_value,
        couponCode: code,
        discountType: discount_type,
        RRN: null,
        is_free: 1,
        event_id: getEventId,
        OrderIdentifier: null,
        actualamount: totalActualAmount,
      },
      { transaction }
    );

    // Generate the transaction identifier
    const trxnIde = `M-${userId}-${orderResponse.id}`;
    await orderResponse.update(
      { OriginalTrxnIdentifier: trxnIde },
      { transaction }
    );

    const orderId = orderResponse.id;
    const cartItemIdsToDelete = []; // Collect IDs for bulk delete

    let orderObject = {
      order_id: orderId,
      user_id: userId,
      trxnIde,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      adminfee: adminFee,
      total_amount: finalPriceAfterDiscount,
      discountValue: discount_value,
      couponCode: code,
      discountType: discount_type,
      RRN: null,
      OrderIdentifier: null,
      actualamount: totalActualAmount,
    };

    for (const cartItem of cart) {
      // Handle ticket type items
      if (cartItem.ticket_type == "ticket" && cartItem.EventTicketType) {
        const ticketPrice = cartItem.EventTicketType.price || 0;
        const ticketCount = cartItem.no_tickets || 0;

        // Loop for each ticket being purchased
        for (let index = 1; index <= ticketCount; index++) {
          const ticketBook = await BookTicket.create(
            {
              order_id: orderId,
              event_id: cartItem.event_id,
              event_ticket_id: cartItem.ticket_id,
              cust_id: userId,
              ticket_buy: 1,
              amount: ticketPrice,
              mobile: userInfo.PhoneNumber,
              adminfee: adminFee,
            },
            { transaction }
          );

          const ticketId = ticketBook.id;
          const ticketNum = `T${ticketId}`;
          const ticketDetail = await TicketDetail.create(
            {
              tid: ticketId,
              ticket_num: `T${ticketId}`,
              generated_id: ticketNum,
              user_id: userId,
              status: "0",
            },
            { transaction }
          );
          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: ticketDetail.id,
            ticketType: "ticket",
          });
          if (qrCodeImage.success) {
            await ticketDetail.update(
              { qrcode: qrCodeImage.filePath },
              { transaction }
            );
          }
          // Collect cart item ID for deletion
          cartItemIdsToDelete.push(cartItem.id);
        }
      } else if (cartItem.ticket_type == "addon" && cartItem.Addon) {
        // Handle addon items similarly to tickets
        const addonPrice = cartItem.Addon.price || 0;
        const addonCount = cartItem.no_tickets || 0;

        for (let index = 1; index <= addonCount; index++) {
          // Create a record in AddonsBook
          const addonBook = await AddonBook.create(
            {
              addons_id: cartItem.addons_id,
              event_id: cartItem.event_id,
              order_id: orderId,
              user_id: userId,
              price: addonPrice,
            },
            { transaction }
          );

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: addonBook.id,
            ticketType: "addon",
          });
          if (qrCodeImage.success) {
            await addonBook.update(
              { addon_qrcode: qrCodeImage.filePath },
              { transaction }
            );
          }
          // Collect cart item ID for deletion
          cartItemIdsToDelete.push(cartItem.id);
        }
      }
    }

    // Bulk delete cart items
    if (cartItemIdsToDelete.length > 0) {
      await CartModel.destroy({
        where: {
          id: {
            [Op.in]: cartItemIdsToDelete,
          },
        },
        transaction,
      });
    }

    // Commit the transaction if all operations succeed
    await transaction.commit();
    const isEmailSend = sendOrderEmailToUser(userInfo, orderObject, cart);

    return {
      success: true,
      status: 200,
      message: "Payment details updated successfully.",
    };
  } catch (error) {
    // Only rollback if transaction is still active
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }

    return {
      success: false,
      status: 404,
      message: "Error Order Creating " + error.message,
    };

    // logErrorToFile(error);
    throw new Error("Error Order Creating :" + error.message);
  }
}

export async function generateFreeTicketV3(req, res) {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    const encryptedData = req.body.data;
    const secretKey = process.env.DATA_ENCODE_SECRET_KEY;

    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const { cart, couponDetails, adminFees } = decryptedData;

    if (!cart || cart.length === 0) {
      await transaction.rollback();
      return res.json({
        success: false,
        status: 200,
        message: "No items in cart",
      });
    }

    const { totalPrice, finalPriceAfterDiscount, taxes } = calculateTotals(
      cart,
      couponDetails?.discountAmt,
      adminFees
    );

    const userId = cart[0].user_id;
    const getEventId = cart[0].event_id;
    const userInfo = await User.findOne({ where: { id: userId }, transaction });

    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || null;
    const code = couponDetails?.code || null;
    const adminFee = adminFees ?? 0;

    // Check if free order already exists
    let existingOrder = await Order.findOne({
      where: { user_id: userId, event_id: getEventId, is_free: 1 },
      order: [["id", "DESC"]],
      transaction
    });

    let orderResponse;
    let tickets = [];
    let addons = [];
    let isNewOrder = false;

    if (!existingOrder) {
      // Create new order
      orderResponse = await Order.create(
        {
          user_id: userId,
          Approved: "succeeded",
          TransactionType: "Online",
          paymenttype: "Online",
          adminfee: adminFee,
          total_amount: finalPriceAfterDiscount,
          discountValue: discount_value,
          couponCode: code,
          discountType: discount_type,
          RRN: null,
          is_free: 1,
          event_id: getEventId,
          OrderIdentifier: null,
          actualamount: totalPrice,
        },
        { transaction }
      );

      const trxnIde = `M-${userId}-${orderResponse.id}`;
      await orderResponse.update({ OriginalTrxnIdentifier: trxnIde }, { transaction });
      isNewOrder = true;

      // Process tickets & addons
      for (const cartItem of cart) {
        if (cartItem.ticket_type === "ticket" && cartItem.EventTicketType) {
          const ticketPrice = cartItem.EventTicketType.price || 0;
          const ticketCount = cartItem.no_tickets || 0;

          for (let i = 1; i <= ticketCount; i++) {
            const ticketBook = await BookTicket.create(
              {
                order_id: orderResponse.id,
                event_id: cartItem.event_id,
                event_ticket_id: cartItem.ticket_id,
                cust_id: userId,
                ticket_buy: 1,
                amount: ticketPrice,
                mobile: userInfo.PhoneNumber,
                adminfee: adminFee,
              },
              { transaction }
            );

            const ticketDetail = await TicketDetail.create(
              {
                tid: ticketBook.id,
                ticket_num: `T${ticketBook.id}`,
                generated_id: `T${ticketBook.id}`,
                user_id: userId,
                status: "0",
              },
              { transaction }
            );

            const qrCodeImage = await generateTicketQrToS3({
              userId,
              orderId: orderResponse.id,
              ticketId: ticketDetail.id,
              ticketType: "ticket",
            });

            if (qrCodeImage.success) {
              await ticketDetail.update({ qrcode: qrCodeImage.filePath }, { transaction });
            }

            tickets.push(ticketDetail);
          }
        } else if (cartItem.ticket_type === "addon" && cartItem.Addon) {
          const addonPrice = cartItem.Addon.price || 0;
          const addonCount = cartItem.no_tickets || 0;

          for (let i = 1; i <= addonCount; i++) {
            const addonBook = await AddonBook.create(
              {
                addons_id: cartItem.addons_id,
                event_id: cartItem.event_id,
                order_id: orderResponse.id,
                user_id: userId,
                price: addonPrice,
              },
              { transaction }
            );

            const qrCodeImage = await generateTicketQrToS3({
              userId,
              orderId: orderResponse.id,
              ticketId: addonBook.id,
              ticketType: "addon",
            });

            if (qrCodeImage.success) {
              await addonBook.update({ addon_qrcode: qrCodeImage.filePath }, { transaction });
            }

            addons.push(addonBook);
          }
        }
      }
    } else {
      orderResponse = existingOrder;

      // Fetch tickets and addons for existing order
      tickets = await TicketDetail.findAll({ where: { user_id: userId }, transaction });
      addons = await AddonBook.findAll({ where: { user_id: userId, order_id: orderResponse.id }, transaction });
    }

    await transaction.commit();

    return res.json({
      success: true,
      status: 200,
      data: {
        order: orderResponse,
        tickets,
        addons,
        isNewOrder,
        paymentData: null,
      },
      message: isNewOrder ? "Free order created successfully." : "Existing free order retrieved.",
    });
  } catch (error) {
    if (transaction.finished !== "commit") await transaction.rollback();

    console.error("Error generating free ticket:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Error generating free ticket: " + error.message,
    });
  }
}


const sendOrderEmailToUserV2 = async (userInfo, orderObj, cartData, userId) => {
  const eventIds = orderObj.eventId;
  const createdOrderId = orderObj.order_id;
  // Define common style for table rows
  const rowStyle = `font-family: Arial, Helvetica, sans-serif;font-size: min(max(9px, 2vw), 16px);text-transform: uppercase;`;
  let emailTemplateHtml = ``
  const findAllTicketsData = await BookTicket.findAll({
    where: { order_id: orderObj.order_id },
    raw: true,
  });

  for (const ticket of findAllTicketsData) {
    const ticketDataId = ticket.id;
    const findAllTicketsqrcode = await TicketDetail.findOne({
      where: { tid: ticketDataId },
      raw: true,
    });

    const findTicketName = await BookTicket.findOne({
      include: {
        model: EventTicketType, // Ensure this is properly associated in your Sequelize models
        attributes: ["title", "ticket_image"], // Specify the columns you want to retrieve from EventTicketType
        // where: { eventid: eventIds }, // add 04-02-2025(multiple event send email kamal)
      },
      where: { order_id: orderObj.order_id },
      raw: true,
    });
    const ticketName =
      findTicketName["EventTicketType.title"] || "Unnamed Ticket";
    const ticketImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${findTicketName["EventTicketType.ticket_image"] || "Unnamed "
      }`;
    const ticketqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${findAllTicketsqrcode.qrcode}`;
    emailTemplateHtml += `           
                      <tr>
                          <td style="height: 20px;"></td>
                      </tr>

                      <tr>
                          <td>
                              <div style="max-width: 500px; background-color: #ef9c7c; border-radius: 30px; border: 1px solid #ef9c7c; margin: auto; overflow: hidden;">
                                  <div
                                      style="
                                          background-image: url('${ticketImage}');
                                          height: 220px;
                                          background-position: center;
                                          background-size: cover;
                                          border-radius: 30px;
                                          overflow: hidden;
                                          background-repeat: no-repeat;
                                          display: flex;
                                          justify-content: center;
                                          align-items: center;
                                      "
                                  >
                                      <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                          <div style="text-align: center; margin: auto;">
                                              <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                  O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                              </h2>
                                              <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                  Nov 6 - 9, 2025
                                              </p>
                                          </div>
                                      </div>
                                  </div>

                                  <div style="padding: 30px 20px;">
                                      <table style="width: 100%; color: black; font-family: Arial, Helvetica, sans-serif;">
                                          <tr style="color:rgb(255, 255, 255); text-transform: uppercase; font-size: 14px;">
                                              <td>Last Name</td>
                                              <td>First Name</td>
                                              <td>Order#</td>
                                          </tr>
                                          <tr style="text-transform: uppercase; font-size: 14px;">
                                              <td>${userInfo.LastName}</td>
                                              <td>${userInfo.FirstName}</td>
                                              <td>${orderObj.trxnIde}</td>
                                          </tr>
                                          <tr>
                                              <td colspan="3" style="height: 60px; border-bottom: 1px solid #ffffff;"></td>
                                          </tr>

                                          <tr>
                                              <td colspan="3" style="height: 15px;"></td>
                                          </tr>

                                          <tr style="color: #ffffff; text-transform: uppercase; font-size: 14px;">
                                              <td colspan="3">TICKETS</td>
                                          </tr>

                                          <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                              <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>
                                              <td style="color: #ffffff; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td>
                                          </tr>

                                          <tr>
                                              <td colspan="3" style="height: 30px;"></td>
                                          </tr>

                                          <tr style="color: black; font-size: 12px;">
                                              <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 6:</b> Los Danzantes | 9pm to 4am | Zyanya</td>
                                          </tr>
                                          <tr style="color: black; font-size: 12px;">
                                              <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 7:</b>The Cloud People | 10pm to 6am | Polo Fields</td>
                                          </tr>
                                          <tr style="color: black; font-size: 12px;">
                                              <td colspan="3" style="padding-bottom: 20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 8:</b> The Zapotec Gods | 11pm to 7am | Cabeza del Indio</td>
                                          </tr>
                                      </table>

                                      <div style="margin: 60px 0;">
                                          <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                              <img style="width: 100%;" src="${ticketqrcode}" alt="" />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      `;
  }

  const findAlladdonsData = await AddonBook.findAll({
    include: {
      model: Addons, // Ensure this is properly associated in your Sequelize models
      attributes: [
        "id",
        "name",
        "addon_location",
        "addon_time",
        "addon_day",
        "addon_image",
        "sortName",
        "sort_day",
        "addon_type",
      ], // Specify the columns you want to retrieve from EventTicketType
      // where: { event_id: eventIds }, // add 04-02-2025(multiple event send email kamal)
    },
    where: { order_id: orderObj.order_id },
    raw: true,
  });

  findAlladdonsData.forEach((addonsticket) => {
    //  const addonqrcode =`/qrcode/${addonsticket.addon_qrcode}`;
    const addonname = addonsticket["Addon.name"] || ""; // Default value in case it's missing
    const addonSortName = addonsticket["Addon.sortName"] || ""; // Default value in case it's missing
    let addonLocation = addonsticket["Addon.addon_location"] || ""; // Default value in case it's missing
    let addonTime = addonsticket["Addon.addon_time"] || ""; // Default value in case it's missing
    const addonDay = addonsticket["Addon.sort_day"] || " "; // Default value in case it's missing
    // const addonImage = addonsticket["Addon.addon_image"] || "Unnamed "; // Default
    const addonImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${addonsticket["Addon.addon_image"] || ""
      }`;
    const addonqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${addonsticket.addon_qrcode}`;

    const backgroundColor =
      addonsticket["Addon.addon_type"] === "Special" ? "#e6dfd5" : "#e6dfd5";

    emailTemplateHtml += `<tr>
                              <td style="height: 30px;"></td>
                          </tr>
                          <tr>
                              <td>
                                  <div style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #e6dfd5; margin: auto; overflow: hidden; ">
                                      <div
                                          style="
                                              background-image: url('${addonImage}');
                                              height: 220px;
                                              background-size: cover;
                                              border-radius: 30px;
                                              overflow: hidden;
                                              background-position: center;
                                              background-repeat: no-repeat;
                                              display: flex;
                                              justify-content: center;
                                              align-items: center;
                                          "
                                      >
                                          <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                              <div style="text-align: center; margin: auto;">
                                                  <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                      O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                                  </h2>
                                                  <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                      Nov 6 - 9, 2025
                                                  </p>
                                              </div>
                                          </div>
                                      </div>
                                      <div style="padding: 30px 20px;">
                                          <table style="width: 100%; color: #000000; font-family: Arial, Helvetica, sans-serif;">
                                              <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                  <td>Last Name</td>
                                                  <td>First Name</td>
                                                  <td>Order#</td>
                                              </tr>
                                              <tr style="text-transform: uppercase; font-size: 14px;">
                                                  <td>${userInfo.LastName}</td>
                                                  <td>${userInfo.FirstName}</td>
                                                  <td>${orderObj.trxnIde}</td>
                                              </tr>
                                              <tr>
                                                  <td colspan="3" style="height: 60px; border-bottom: 1px solid #fca3bb;"></td>
                                              </tr>

                                              <tr>
                                                  <td colspan="3" style="height: 15px;"></td>
                                              </tr>

                                              <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                  <td colspan="3">TICKETS</td>
                                              </tr>

                                              <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                        <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                                        <td style="color: #fca3bb; text-transform: uppercase; font-size: 14px; text-align: right;">3 DAYS</td>
                                    </tr>

                                              <tr>
                                                  <td colspan="3" style="height: 30px;"></td>
                                              </tr>

                                              <tr style="color: black; font-size: 12px;">
                                                  <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;">
                                                      <b>   <b>Transportation is valid inside Careyes and to and from 
                                                    official Ondalinda events only.</b></b>
                                                  </td>
                                              </tr>
                                          </table>

                                          <div style="margin: 60px 0;">
                                              <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                                  <img style="width: 100%;" src="${addonqrcode}" alt="" />
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </td>
                          </tr>
                          <tr>
                              <td style="height: 50px;"></td>
                          </tr>`;
  });

  const emailtempleate = await Emailtemplet.findOne({
    where: {
      eventId: eventIds,
      templateId: 2,
    },
  });
  const EventPageUrl = `${SITE_URL}user/my-event/`;
  // mail champ template name
  const mailChampTemplateName = emailtempleate.mandril_template;
  const subject = emailtempleate.subject;
  const sanitizedTemplate = emailtempleate.description;
  // let processedTemplate = orderTemplate({
  let processedTemplate = orderTicketsTemplate({
    // userName: userInfo.FirstName,
    // OrderID: orderObj.trxnIde,
    // UserEmail: userInfo.Email,
    MyEventPageURL: EventPageUrl,
    OrderSummary: emailTemplateHtml,
    html: sanitizedTemplate,
  });
  let extractedTemplate = processedTemplate.html;
  const templateName = mailChampTemplateName; //template name dynamic for mail champ
  const mergeVars = { ALLDATA: extractedTemplate };
  const toEmail = userInfo.Email;
  // change kamal(18-06-2025)/hello@ondalinda.com added
  // if (userId == 10315 || userId == 11492 || userId == 10272) {
  //   await sendEmailWithBCC(toEmail, [], mergeVars, templateName, subject);
  // } else {
  const orderConfirmationEmailSent = await sendEmailWithBCC(toEmail, [], mergeVars, templateName, subject);
  // ✅ If sent successfully, update in DB
  if (orderConfirmationEmailSent) {
    await MyOrders.update(
      { orderConfirmationEmailSent: "Y" },
      { where: { id: createdOrderId } }
    );
  }
  return;
  // }
  console.log(`>>>>>>> Order has been created successfully`);
};

export async function generateStaffTicket(request, response) {
  const transaction = await sequelize.transaction(); // Start a transaction
  const { email, token } = request;
  try {
    const findStaff = await EventStaffMember.findOne({
      where: { Email: decodeURIComponent(email), token, EventID: 110 },
      transaction,
    });

    if (!findStaff) {
      await transaction.rollback();
      return {
        success: false,
        status: 200,
        message: "Invalid staff",
      };
    }
    const userId = findStaff.id;
    // Helper function to capitalize the first letter
    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    // Applying the function to FirstName and LastName
    const FirstName = capitalizeFirstLetter(findStaff.FirstName);
    const LastName = capitalizeFirstLetter(findStaff.LastName);
    const USERNAME = `${capitalizeFirstLetter(
      findStaff.FirstName
    )} ${capitalizeFirstLetter(findStaff.LastName)}`;

    const userEmail = findStaff.Email;
    const EventId = findStaff.EventID;
    const department = findStaff.Department;

    const findFirstTicket = await EventTicketType.findOne({
      where: {
        eventid: EventId,
        hidden: "N",
      },
      attributes: ["title", "id", "price"],
      order: [["id", "DESC"]],
    });
    // await transaction.commit();
    // return  true;

    // Create order
    const orderResponse = await Order.create(
      {
        user_id: userId,
        Approved: "succeeded",
        TransactionType: "Online",
        paymenttype: "Online",
        total_amount: 0,
        discountValue: 0,
        couponCode: null,
        discountType: null,
        RRN: null,
        is_free: 1,
        event_id: 110,
        OrderIdentifier: null,
        actualamount: 0,
      },
      { transaction }
    );

    // Generate the transaction identifier
    const trxnIde = `M-${userId}-${orderResponse.id}`;
    await orderResponse.update(
      { OriginalTrxnIdentifier: trxnIde },
      { transaction }
    );

    const orderId = orderResponse.id;

    const ticketBook = await BookTicket.create(
      {
        order_id: orderId,
        event_id: EventId,
        event_ticket_id: findFirstTicket?.id ?? 0,
        cust_id: userId,
        ticket_buy: 1,
        amount: findFirstTicket?.price ?? 0,
        mobile: userId,
      },
      { transaction }
    );
    const ticketId = ticketBook.id;
    const ticketNum = `T${ticketId}`;
    const ticketDetail = await TicketDetail.create(
      {
        tid: ticketId,
        ticket_num: `T${ticketId}`,
        generated_id: ticketNum,
        user_id: userId,
        status: "0",
      },
      { transaction }
    );
    const qrCodeImage = await generateTicketQrToS3({
      userId,
      orderId,
      ticketId: ticketDetail.id,
      ticketType: department,
    });

    let qrCodeImageName;
    if (qrCodeImage.success) {
      qrCodeImageName = qrCodeImage.filePath;
      await ticketDetail.update(
        { qrcode: qrCodeImage.filePath },
        { transaction }
      );
    }

    let qrUrl = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${qrCodeImageName}`;

    const [findTemplate, findTemplate1, findTemplate2] = await Promise.all([
      Emailtemplet.findOne({ where: { eventId: 110, templateId: 19 } }),
      Emailtemplet.findOne({ where: { eventId: 110, templateId: 20 } }),
      Emailtemplet.findOne({ where: { eventId: 110, templateId: 21 } }),
    ]);
    // Extract template details
    const templates = {
      default: { name: findTemplate?.dataValues.mandril_template, description: findTemplate?.dataValues.description, subject: findTemplate?.dataValues.subject },
      COMP: { name: findTemplate1?.dataValues.mandril_template, description: findTemplate1?.dataValues.description, subject: findTemplate1?.dataValues.subject },
      "PRESS/DJS": { name: findTemplate1?.dataValues.mandril_template, description: findTemplate1?.dataValues.description, subject: findTemplate1?.dataValues.subject },
      CORE: { name: findTemplate2?.dataValues.mandril_template, description: findTemplate2?.dataValues.description, subject: findTemplate2?.dataValues.subject },
    };
    // Get template based on department (default fallback)
    const selectedTemplate = templates[department?.toUpperCase()] || templates.default;
    // Generate email template with placeholders replaced
    const emailContent = staffTicketTemplate({
      USERNAME: USERNAME,
      LNAME: LastName,
      FNAME: FirstName,
      QRCODE: qrUrl,
      html: selectedTemplate.description,
    });

    // Prepare merge variables for email sending
    const mergeVars = { ALLDATA: emailContent.html };
    const toEmail = userEmail;
    const templateName = selectedTemplate.name;
    const subject = selectedTemplate.subject;
    // Send email using Mandrill
    await sendEmail(toEmail, mergeVars, templateName, subject);

    // let template;
    // if (department == "CORE" || department == "Core") {
    //   template = "OxCareyes 2024 Staff ticket CORE";
    // } else if (department == "COMP" || department == "Comp") {
    //   template = "OxCareyes 2024 Staff ticket COMP";
    // } else if (department == "PRESS/DJS" || department == "Press/Djs") {
    //   template = "OxCareyes 2024 Staff ticket COMP";
    // } else {
    //   template = "oxcareyes-2024-staff-ticket";
    // }
    // const mergeVars = {
    //   USERNAME: USERNAME,
    //   LNAME: LastName,
    //   FNAME: FirstName,
    //   QRCODE: qrUrl,
    // };
    // const toEmail = userEmail;
    // await sendEmail(toEmail, mergeVars, template);

    await findStaff.update(
      {
        token: null,
        WaiverFlag: 1,
        DateWaiverSigned: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    return {
      success: true,
      status: 200,
      message: "Email send successfully.",
    };
  } catch (error) {
    // Only rollback if transaction is still active
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }

    return {
      success: false,
      status: 404,
      message: "Error Order Creating " + error.message,
    };
    // logErrorToFile(error);
    throw new Error("Error Order Creating :" + error.message);
  }
}

// Resend Order Email to members multiple orders Email send ticket (Kamal)

export async function resendOrderEmailToMember(req, res) {
  try {
    const existOrderId = req.body.orderId;
    if (existOrderId.length == 1) {
      // const { orderId } = req.body;
      const order = await Order.findOne({
        where: { id: existOrderId[0] },
        include: {
          model: User,
          attributes: ["Email", "FirstName", "LastName"],
        },
      });
      if (order) {
        let ticketArray = [];
        let ticketMap = {};
        const findAllTickets = await BookTicket.findAll({
          where: { order_id: order.id },
          include: [{ model: EventTicketType, attributes: ["title", "price"] }],
          raw: true,
        });

        findAllTickets.forEach((ticket) => {
          const eventTicketId = ticket.event_ticket_id;

          if (ticketMap[eventTicketId]) {
            ticketMap[eventTicketId].total_ticket_count += 1;
          } else {
            ticketMap[eventTicketId] = {
              event_ticket_id: eventTicketId,
              title: ticket["EventTicketType.title"],
              price: ticket["EventTicketType.price"],
              total_ticket_count: 1,
              ticket_type: "ticket",
            };
          }
        });

        let addonMap = {};

        const findAllAddons = await AddonBook.findAll({
          where: { order_id: order.id },
          include: [{ model: Addons, attributes: ["name", "price"] }],
          raw: true,
        });

        findAllAddons.forEach((addon) => {
          const addonId = addon.addons_id;

          if (addonMap[addonId]) {
            addonMap[addonId].total_addon_count += 1;
          } else {
            addonMap[addonId] = {
              addons_id: addonId,
              name: addon["Addon.name"],
              price: addon["Addon.price"],
              total_addon_count: 1,
              ticket_type: "addon",
            };
          }
        });

        ticketArray.push(...Object.values(ticketMap));
        ticketArray.push(...Object.values(addonMap));
        // console.log(ticketArray);

        // return res
        //   .status(200)
        //   .json({ success: true, message: "Email sent successfully" });

        let emailTemplateHtml = `  <tr>
        <td colspan="2">
            <br>
            <h6 style="font-family: Arial, Helvetica, sans-serif; font-size: 16px !important; margin:0px; text-transform: uppercase;">
                ORDER SUMMARY:</h6>
            <br>
        </td>
    </tr>`;
        // Loop over each ticket and append rows dynamically
        ticketArray.forEach((ticket) => {
          const ticketPrice = ticket.price || 0;
          const ticketCount =
            ticket.ticket_type === "ticket"
              ? ticket.total_ticket_count
              : ticket.total_addon_count || 0;
          const ticketName =
            ticket.ticket_type === "ticket"
              ? ticket.title
              : ticket.name || "Unnamed Item";

          // Add ticket or addon details to the email template
          emailTemplateHtml += `
          <tr>
            <td style="width: 70%; padding: 5px 0;">
              <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); text-transform: uppercase;"> 
                ${ticketCount} x ${ticketName}
              </p>                    
            </td>
            <td style="width: 30%; text-align: right; padding: 5px 0;">
              <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">
                ${formatPrice(ticketPrice * ticketCount)}
              </p>
            </td>
          </tr>`;
        });
        // discount logic
        if (order.couponCode) {
          let discountDisplay =
            order.discountType === "percentage"
              ? `${parseFloat(order.discountValue) % 1 === 0
                ? parseInt(order.discountValue) // Display as integer if no decimals
                : parseFloat(order.discountValue).toFixed(2)
              }%`
              : `- $${parseFloat(order.discountValue).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }
              )}`;

          emailTemplateHtml += `
      <tr>
        <td style="width: 70%; padding: 10px 0;">
          <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: 600;">STAFF ID</p>
        </td>
        <td style="width: 30%; text-align: right; padding: 5px 0;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">
            <b>${discountDisplay}</b>
          </p> 
        </td>
      </tr>`;
        }

        // Add a closing summary and the footer
        emailTemplateHtml += `
          <tr>
            <td style="width: 70%; padding: 10px 0;">
              <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: 600;">Total (including fees)</p>
            </td>
            <td style="width: 30%; text-align: right; padding: 5px 0;">
                    <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">
                <b>${formatPrice(order.total_amount)}</b>
              </p>
            </td>
          </tr>`;

        emailTemplateHtml += `</table>
                    </div>				 
                    </td>
                    </tr>

            <tr>
            <td>
            <table style="text-align: center; margin: auto; width: 95%; margin-bottom: 30px;">
                <tr>
                  <td style="border-bottom: 1px solid #000">
                <br/> 
              <p style="font-family: Arial, Helvetica, sans-serif;   font-size: min(max(16px, 2vw), 20px); font-weight: 600; font-style: italic; text-align: center; margin:0px;">All payments are final, there are no refunds or returns.</p>
              <br/> 
              </td>
              </tr>
            </table>
            </td>
            </tr>
           `;

        const emailtempleate = await Emailtemplet.findOne({
          where: {
            // eventId: 110,
            eventId: 111,
            templateId: 2,
          },
        });

        // mail champ template name
        const mailChampTemplateName =
          emailtempleate.dataValues.mandril_template;
        const sanitizedTemplate = emailtempleate.dataValues.description;
        const subject = emailtempleate.dataValues.subject;
        let processedTemplate = orderTemplate({
          userName: order.User.FirstName,
          OrderID: order.OriginalTrxnIdentifier,
          UserEmail: order.User.Email,
          OrderSummary: emailTemplateHtml,
          html: sanitizedTemplate,
        });
        // / Extract the HTML content from the processedTemplate object
        let extractedTemplate = processedTemplate.html;
        const templateName = mailChampTemplateName; //template name dynamic for mail champ
        const mergeVars = { ALLDATA: extractedTemplate };
        const toEmail = order.User.Email;
        await sendEmail(toEmail, mergeVars, templateName, subject);

        // const templateName = "CAREYES 2025 Event Ticket Confirmation";
        // const mergeVars = { ALLDATA: emailTemplateHtml };
        // const toEmail = order.User.Email;
        // await sendEmail(toEmail, mergeVars, templateName);
        // await resendOrderEmailToMemberSecond(existOrderId);

        return res
          .status(200)
          .json({ success: true, message: "Email sent successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
    }
    // else condition multiple email send
    else if (existOrderId.length > 1) {
      const sendEmailPromises = existOrderId.map(async (item) => {
        const order = await Order.findOne({
          where: {
            id: item,
            ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
          },
          include: {
            model: User,
            attributes: ["Email", "FirstName", "LastName"],
          },
        });
        if (order) {
          let emailTemplateHtml = `
              <div style=" max-width: 900px; background-color: #f6f1e9; border-radius: 30px; border: 1px solid #bfbab2; margin: auto;">
                    <table style="width: 100%;">
                    <tr>
                      <td style="padding: 15px 0  20px 0; ">
                        <img src="https://www.ondalinda.com/assets/img/brand/black-logo.png" style="text-align: center; display: block; max-width: 170px; width: 100% !important; margin: auto;">
                      </td>
                    </tr>
                    <tr>
                      <td >
                        <div style="background-image: url(https://staging.ondalinda.com/assets/img/mail-templet/careyes-tickct-bg-new.png); padding: 115px 0;  width: 100%; background-size: cover; background-position: center;">
                          
                        </div>
                      </td>

                    </tr>

                    <tr>
                    <td> 
                      <table style="text-align: left; margin: auto; width: 90%; border-bottom: 1px solid #000; padding: 45px 0;">
                        <tr>
                          <td style="">
                            <p style="font-family: Arial, Helvetica, sans-serif;   font-size: min(max(18px, 2vw), 23px); margin: 0px;">Hi ${order.User.FirstName}, </p>
                            <br/> 
                          </td>
                        </tr>

                       
                        <tr>
                            <td style="">
                                <p style="font-family: Arial, Helvetica, sans-serif;   font-size: 16px; margin: 0px;">
                                    We are delighted that you’ll be joining us for Ondalinda x CAREYES 2025! </p>
                                <br />
                            </td>
                        </tr>





                        <tr>
                            <td style="">
                                <p style="font-family: Arial, Helvetica, sans-serif;  line-height: 30px; font-size: 16px; margin:0px;">
                                    Your ticket(s) are included in this email, you can also access them anytime through
                                    your
                                    <a target="_blank" href="https://ondalinda.com/user/my-profile/" style="color: #15c;">
                                        Ondalinda Member Profile.</a>
                                    Each ticket contains a QR code that will be scanned at registration, allowing you to
                                    receive your wristband.
                                </p>
                                <br />

                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p
                                    style=" text-align: left; font-family: Arial, Helvetica, sans-serif;   font-size: 16px; font-weight: 600;">
                                    <span style="text-decoration: underline;">YOUR TICKET(S):</span>
                                </p>
                                <ul style="font-family: Arial, Helvetica, sans-serif; line-height: 30px;  font-size: 16px; margin: 0px; text-align: left;">
                                    <li> Be sure to download, screenshot, or print your ticket beforehand, as cell
                                        service can be spotty.</li>
                                    <li> In order to receive your wristband, please bring your ticket and a photo ID.
                                    </li>
                                    <li> Your tickets are personal and non-refundable.</li>
                                    <li> Your wristband MUST be worn at ALL times during the festival, it is required
                                        for your safety and to access all venues.</li>
                                    <li> Do not remove your wristband for any reason, replacements will not be given.
                                    </li>


                                </ul>

                                <br />
                            </td>
                        </tr>




                       <tr>
                            <td>
                                <p
                                    style=" text-align: left; font-family: Arial, Helvetica, sans-serif;   font-size: 16px; font-weight: 600;">
                                    <span style="text-decoration: underline;">YOUR ONDALINDA TICKET EXPERIENCE INCLUDES:
                                    </span>
                                </p>
                                <ul style="font-family: Arial, Helvetica, sans-serif;  line-height: 30px; font-size: 16px; margin: 0px; text-align: left;">
                                    <li>
                                    <span style="font-weight: 600;"> Thursday, July 3, 2025: </span>
                                     10pm to 4am: The Explorer's Quest
                                    </li>

                                    <li>
                                    <span style="font-weight: 600;"> Friday, July 4, 2025 :</span>
                                     10pm to 4am: Queen Teuta's Vessel 
                                    </li>

                                    <li>
                                    <span style="font-weight: 600;"> Saturday, July 5, 2025 :</span>
                                     10pm to 6am: Treasures of the Sea
                                    </li>

                                   
                                 

                                </ul>


                                
                                <br />
                            </td>
                        </tr>
 
                        
                       
                        <tr>
                            <td>
                                <p style="font-family: Arial, Helvetica, sans-serif;  line-height: 30px; font-size: 16px; margin:0px;">
                                    All announcements about the event, program, line-up and any add-on experiences will
                                    be sent to you via email or on our<a
                                        href="https://chat.whatsapp.com/DHTCYgmHAu83VmX7lEe4gf" style="color: #15c;">
                                        WhatsApp group.</a>
                                </p>
                                <br />
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <p style="font-family: Arial, Helvetica, sans-serif;   font-size: 16px; margin:0px;">
                                    Best Regards,<br>The Ondalinda Team. </p>
                                <br />
                            </td>
                        </tr>
                      </table>
                    </td>
                    </tr>     
          </tr>
          <tr>
                  <td style="height: 20px;"></td>
              </tr>`;
          emailTemplateHtml += `
              <tr>
              <td
                  style="font-size: 30px; font-family: Arial, Helvetica, sans-serif; font-weight: bold; text-align: center;">
                  My Tickets
              </td>
              </tr>`;
          const findAllTicketsData = await BookTicket.findAll({
            where: {
              order_id: order.id,
              transfer_user_id: { [Op.is]: null }, // condition for transfer_user_id being null
              ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
            },
            include: { model: EventTicketType },
            raw: true,
          });

          // Only proceed if there are tickets or addons found

          for (const ticket of findAllTicketsData) {
            const ticketDataId = ticket.id;
            const findAllTicketsqrcode = await TicketDetail.findOne({
              where: {
                tid: ticketDataId,
                transfer_user_id: { [Op.is]: null }, // Condition to check if transfer_user_id is null
              },
              raw: true,
            });
            const firstname =
              findAllTicketsqrcode?.fname || order.User.FirstName;
            const lastName = findAllTicketsqrcode?.lname || order.User.LastName;
            const ticketqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${findAllTicketsqrcode.qrcode}`;

            const ticketName =
              ticket["EventTicketType.title"] || "Unnamed Ticket";
            const ticketImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${ticket["EventTicketType.ticket_image"] || "Unnamed "
              }`;

            emailTemplateHtml += `<!-- ticket design start here  -->

              <tr>
                  <td style="height: 20px;"></td>
              </tr>

              <!-- tickets -->
              <tr>
                <td>
                <div
                style=" max-width: 500px; background-color: #000; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
                <div
                    style="background-image: url('${ticketImage}'); height: 220px; background-position: center; background-size: cover; border-radius: 30px; overflow: hidden; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                    <div style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; margin:auto;">
                        <h2
                                            style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                            O<span
                                                style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;"> x </span>CAREYES
                                        </h2>
                                        <p
                                            style=" color: white;
                                        font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style:normal; margin: 0;">
                                            Nov 6 - 9, 2025</p>
                    </div>
                    </div>
                </div>
    
                        <div style="padding: 30px 20px;">
                            <table style="width: 100%; color: white; font-family: Arial, Helvetica, sans-serif;">
                                <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
                                    <td>Last Name</td>
                                    <td>First Name</td>
                                    <td>Order#</td>
                                </tr>
                                <tr style="text-transform: uppercase; font-size: 14px; ">
                                    <td>${lastName}</td>
                                    <td>${firstname}</td>
                                    <td>${order.OriginalTrxnIdentifier}</td>
                                </tr>
                               <tr>
                                            <td colspan="3" style="height: 60px; border-bottom: 1px solid #57B6B2;"></td>
                                        </tr>

                                        <tr>
                                            <td colspan="3" style="height: 15px; "></td>
                                        </tr>

    
                                <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
                                    <td colspan="3">TICKETS</td>
                                </tr>

                                 <tr
                                            style="color: white; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                            <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>  <td style="color: #57B6B2; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td> 
                                        </tr>

    
                             <tr>
                                            <td colspan="3" style="height: 30px; "></td>
                                        </tr>

                                
                                 <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 6:</b> The Explorer’s Quest | 10pm to 4am | Movida
                                            </td>
                                        </tr>
                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 7:</b>  Azure Riviera | 2pm to 9pm | Ribarsko Selo
                                            </td>
                                        </tr>
                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style=" padding-bottom:20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 8:</b> Queen Teuta’s Vessel | 10pm to 4am | Kanli Kula
                                            </td>
                                        </tr>
                            </table>
    
                            <div style="margin: 60px 0;">
                                <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                    <img style="width: 100%;"
                                        src="${ticketqrcode}" alt="">
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>`;
          }
          const findAlladdonsData = await AddonBook.findAll({
            where: {
              order_id: order.id,
              transfer_user_id: { [Op.is]: null }, // Condition to check if transfer_user_id is null
              ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
            },
            include: { model: Addons },
            raw: true,
          });
          findAlladdonsData.forEach((addonsticket) => {
            //  const addonqrcode =`/qrcode/${addonsticket.addon_qrcode}`;
            const firstnameaddon = addonsticket?.fname || order.User.FirstName;
            const lastNameaddon = addonsticket?.lname || order.User.LastName;
            const addonqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${addonsticket.addon_qrcode}`;

            const addonname = addonsticket["Addon.name"] || ""; // Default value in case it's missing
            const addonSortName = addonsticket["Addon.sortName"] || ""; // Default value in case it's missing
            let addonLocation = addonsticket["Addon.addon_location"] || ""; // Default value in case it's missing
            let addonTime = addonsticket["Addon.addon_time"] || ""; // Default value in case it's missing
            const addonDay = addonsticket["Addon.sort_day"] || " "; // Default value in case it's missing
            // const addonImage = addonsticket["Addon.addon_image"] || "Unnamed "; // Default
            const addonImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${addonsticket["Addon.addon_image"] || ""
              }`;
            const backgroundColor =
              addonsticket["Addon.addon_type"] === "Special"
                ? "#DF8EA3"
                : "#499A96";

            emailTemplateHtml += `<tr>
                  <td style="height: 30px;"></td>
              </tr>

              <!-- addons -->

               <tr>
                <td>
                <div
                style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
                <div
                    style="background-image: url('${addonImage}');; height: 220px; background-size: cover;  border-radius: 30px; overflow: hidden; background-position: center; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                     <div
                                    style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; margin:auto;">
                          <h2
                                            style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                            O<span
                                                style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;"> x </span>CAREYES
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
                                <tr style="color: #000; text-transform: uppercase; font-size: 14px;">
                                    <td>Last Name</td>
                                    <td>First Name</td>
                                    <td>Order#</td>
                                </tr>
                                <tr style="text-transform: uppercase;  font-size: 14px; ">
                                    <td>${lastNameaddon}</td>
                                    <td>${firstnameaddon}</td>
                                    <td>${order.OriginalTrxnIdentifier}</td>
                                </tr>
                                 <tr>
                                            <td colspan="3" style="height: 60px; border-bottom: 1px solid #000;"></td>
                                        </tr>

                                        <tr>
                                            <td colspan="3" style="height: 15px; "></td>
                                        </tr>

                                <tr style="color: #000; text-transform: uppercase; font-size: 14px;">
                                    <td colspan="3">TICKETS</td>
                                </tr>
    
                                  <tr
                                            style="color: white; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                            <td colspan="3">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>   
                                        </tr>


                               
                                <tr>
                                            <td colspan="3" style="height: 30px; "></td>
                                        </tr>


                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                 <b>${addonDay}:</b> ${addonname} ${addonTime ? `| ${addonTime}` : ""
              } ${addonLocation ? `| ${addonLocation}` : ""}
                                            </td>
                                        </tr>



                               
                            </table>
    
                            <div style="margin: 60px 0;">
                                <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                    <img style="width: 100%;"
                                        src="${addonqrcode}" alt="">
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
          <td style="height:50px;"></td>
          </tr>
              <!-- ticket design end here  -->
              `;
          });
          emailTemplateHtml += `<tr>
              <td>
                <table style="text-align: center; margin: auto; border-top: 1px solid; padding: 35px 0; width: 90%;">
                  <tr>
                    <td>
                      <a href="https://www.facebook.com/ondalindafestival/"><img src="https://staging.eboxtickets.com/images/ondalinda/facebook.png" style="border-radius: 50%; width: 36px;" alt="facebook-icon"></a>
                      <a href="https://soundcloud.com/user-524758910" style="padding: 0 40px;"><img src="https://staging.eboxtickets.com/images/ondalinda/sound-claud.png" style="border-radius: 50%; width: 36px;" alt="sound-claud-icon"></a>
                      <a href="https://www.instagram.com/ondalinda_/"><img src="https://staging.eboxtickets.com/images/ondalinda/instagram.png" style="border-radius: 50%; width: 36px;" alt="instagram-icon"></a>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <br/> 
                      <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin:0px; font-style: italic;">©Ondalinda Productions LLC 2025 • All rights reserved</p>
                    </td>
                  </tr>
                </table>
              </td>
              </tr>

          </table>
          </div>
          `;
          const templateName = "Montenegro 2025 Event Ticket Confirmation";
          const mergeVars = { ALLDATA: emailTemplateHtml };
          const toEmail = order.User.Email;
          if (findAllTicketsData.length > 0 || findAlladdonsData.length > 0) {
            await sendEmail(toEmail, mergeVars, templateName);
          }
          return res
            .status(200)
            .json({ success: true, message: "Email sent successfully" });
        }
        // else {
        //   return res
        //     .status(404)
        //     .json({ success: false, message: "Order not found" });
        // }
      });
      await Promise.all(sendEmailPromises);
      await resendOrderEmailToMemberSecond(existOrderId);
      return res
        .status(200)
        .json({ success: true, message: "Email sent successfully" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error Resending Order Email :" + error.message,
    });
  }
}

export async function resendOrderEmailToMemberV3(req, res) {
  try {
    const existOrderId = req.body.orderId;

    if (existOrderId.length === 0) {
      return res.status(400).json({ success: false, message: "No order IDs provided" });
    }

    const ordersData = await Promise.all(
      existOrderId.map(async (orderId) => {
        const order = await Order.findOne({
          where: { id: orderId },
          include: { model: User, attributes: ["Email", "FirstName", "LastName"] },
          raw: true,
        });

        if (!order) return null;

        // Tickets
        const findAllTickets = await BookTicket.findAll({
          where: { order_id: order.id },
          include: [{ model: EventTicketType, attributes: ["title", "price"] }],
          raw: true,
        });

        const ticketArray = [];
        const ticketMap = {};
        findAllTickets.forEach((ticket) => {
          const eventTicketId = ticket.event_ticket_id;
          if (ticketMap[eventTicketId]) {
            ticketMap[eventTicketId].total_ticket_count += 1;
          } else {
            ticketMap[eventTicketId] = {
              event_ticket_id: eventTicketId,
              title: ticket["EventTicketType.title"],
              price: ticket["EventTicketType.price"],
              total_ticket_count: 1,
              ticket_type: "ticket",
            };
          }
        });

        // Addons
        const findAllAddons = await AddonBook.findAll({
          where: { order_id: order.id },
          include: [{ model: Addons, attributes: ["name", "price"] }],
          raw: true,
        });

        const addonMap = {};
        findAllAddons.forEach((addon) => {
          const addonId = addon.addons_id;
          if (addonMap[addonId]) {
            addonMap[addonId].total_addon_count += 1;
          } else {
            addonMap[addonId] = {
              addons_id: addonId,
              name: addon["Addon.name"],
              price: addon["Addon.price"],
              total_addon_count: 1,
              ticket_type: "addon",
            };
          }
        });

        ticketArray.push(...Object.values(ticketMap));
        ticketArray.push(...Object.values(addonMap));

        return {
          orderId: order.id,
          user: {
            firstName: order["User.FirstName"],
            lastName: order["User.LastName"],
            email: order["User.Email"],
          },
          originalTransactionId: order.OriginalTrxnIdentifier,
          couponCode: order.couponCode,
          discountType: order.discountType,
          discountValue: order.discountValue,
          totalAmount: order.total_amount,
          ticketsAndAddons: ticketArray,
        };
      })
    );

    const filteredOrdersData = ordersData.filter((o) => o !== null);

    if (filteredOrdersData.length === 0) {
      return res.status(404).json({ success: false, message: "No valid orders found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order data retrieved successfully",
      data: filteredOrdersData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving order data: " + error.message,
    });
  }
}

export async function resendOrderEmailToMemberSecond(existOrderId) {
  const sendEmailPromises = existOrderId.map(async (item) => {
    const order = await Order.findOne({
      where: { id: item },
      include: { model: User, attributes: ["Email", "FirstName", "LastName"] },
      ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
    });

    // find All tickets to transfer users
    const findAllTransferTickets = await BookTicket.findOne({
      where: {
        order_id: order.id,
        transfer_user_id: { [Op.ne]: null }, // Condition to check if transfer_user_id is not  null
        ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
      },
      // raw: true,
    });
    // find All tickets to transfer users

    if (order) {
      let emailTemplateHtml = ` `;
      const findAllTicketsDatacomplete = await BookTicket.findAll({
        where: {
          order_id: order.id,
          transfer_user_id: { [Op.ne]: null }, // Condition to check if transfer_user_id is not  null
        },
        raw: true,
      });

      //const transferUserIds = []; // Initialize an empty array

      for (const ticket of findAllTicketsDatacomplete) {
        const transferUserId = ticket.transfer_user_id; // Get transfer_user_id from the ticket

        const findAllTransferUsers = await User.findOne({
          where: {
            id: transferUserId,
          },
          // raw: true,
        });

        const ticketDataId = ticket.id;
        const findAllTicketsqrcode = await TicketDetail.findOne({
          where: {
            tid: ticketDataId,
            transfer_user_id: transferUserId, // Condition to check if transfer_user_id is not  null
            ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
          },
          include: { model: EventTicketType },
          raw: true,
        });

        const firstname =
          findAllTicketsqrcode?.fname || findAllTransferUsers.FirstName;
        const lastName =
          findAllTicketsqrcode?.lname || findAllTransferUsers.LastName;
        const ticketqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${findAllTicketsqrcode.qrcode}`;

        const ticketName = ticket["EventTicketType.title"] || "Unnamed Ticket";
        const ticketImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${ticket["EventTicketType.ticket_image"] || "Unnamed "
          }`;

        emailTemplateHtml = "";
        emailTemplateHtml += `<div style=" max-width: 900px; background-color: #f6f1e9; border-radius: 30px; border: 1px solid #bfbab2; margin: auto;">
        <table style="width: 100%;">
        <tr>
          <td style="padding: 15px 0  20px 0; ">
            <img src="https://www.ondalinda.com/assets/img/brand/black-logo.png" style="text-align: center; display: block; max-width: 170px; width: 100% !important; margin: auto;">
          </td>
        </tr>
        <tr>
          <td >
            <div style="background-image: url(https://staging.ondalinda.com/assets/img/mail-templet/careyes-tickct-bg-new.png); padding: 115px 0;  width: 100%; background-size: cover; background-position: center;">
            </div>
          </td>

        </tr>

        <tr>
        <td> 
          <table style="text-align: left; margin: auto; width: 90%; border-bottom: 1px solid #000; padding: 45px 0;">
            <tr>
              <td style="">
                <p style="font-family: Arial, Helvetica, sans-serif;   font-size: min(max(18px, 2vw), 23px); margin: 0px;">Hi ${findAllTransferUsers.FirstName}, </p>
                <br/> 
              </td>
            </tr>

           
            <tr>
                <td style="">
                    <p style="font-family: Arial, Helvetica, sans-serif;   font-size: 16px; margin: 0px;">
                        We are delighted that you’ll be joining us for Ondalinda x CAREYES 2025! </p>
                    <br />
                </td>
            </tr>
            <tr>
                <td style="">
                    <p style="font-family: Arial, Helvetica, sans-serif;  line-height: 30px; font-size: 16px; margin:0px;">
                        Your ticket(s) are included in this email, you can also access them anytime through
                        your
                        <a target="_blank" href="https://ondalinda.com/user/my-profile/" style="color: #15c;">
                            Ondalinda Member Profile.</a>
                        Each ticket contains a QR code that will be scanned at registration, allowing you to
                        receive your wristband.
                    </p>
                    <br />

                </td>
            </tr>
            <tr>
                <td>
                    <p
                        style=" text-align: left; font-family: Arial, Helvetica, sans-serif;   font-size: 16px; font-weight: 600;">
                        <span style="text-decoration: underline;">YOUR TICKET(S):</span>
                    </p>
                    <ul style="font-family: Arial, Helvetica, sans-serif; line-height: 30px;  font-size: 16px; margin: 0px; text-align: left;">
                        <li> Be sure to download, screenshot, or print your ticket beforehand, as cell
                            service can be spotty.</li>
                        <li> In order to receive your wristband, please bring your ticket and a photo ID.
                        </li>
                        <li> Your tickets are personal and non-refundable.</li>
                        <li> Your wristband MUST be worn at ALL times during the festival, it is required
                            for your safety and to access all venues.</li>
                        <li> Do not remove your wristband for any reason, replacements will not be given.
                        </li>
                    </ul>
                    <br />
                </td>
            </tr>
           <tr>
                <td>
                    <p
                        style=" text-align: left; font-family: Arial, Helvetica, sans-serif;   font-size: 16px; font-weight: 600;">
                        <span style="text-decoration: underline;">YOUR ONDALINDA TICKET EXPERIENCE INCLUDES:
                        </span>
                    </p>
                    <ul style="font-family: Arial, Helvetica, sans-serif;  line-height: 30px; font-size: 16px; margin: 0px; text-align: left;">
                        <li> 
                        <span style="font-weight: 600;"> Thursday, July 3, 2025 :</span> 10pm to 4am: The Explorer's Quest
                         </li>
                        
                         <li> 
                        <span style="font-weight: 600;"> Friday, July 4, 2025 :</span> 10pm to 4am: Queen Teuta's Vessel
                         </li>

                         <li> 
                        <span style="font-weight: 600;"> Saturday, July 5, 2025 :</span> 10pm to 6am: Treasures of the Sea
                         </li>

                    </ul>
                    
                    <br />
                </td>
            </tr>

            
            <tr>
                <td>
                    <p style="font-family: Arial, Helvetica, sans-serif;  line-height: 30px; font-size: 16px; margin:0px;">
                        All announcements about the event, program, line-up and any add-on experiences will
                        be sent to you via email or on our<a
                            href="https://chat.whatsapp.com/DHTCYgmHAu83VmX7lEe4gf" style="color: #15c;">
                            WhatsApp group.</a>
                    </p>
                    <br />
                </td>
            </tr>

            <tr>
                <td>
                    <p style="font-family: Arial, Helvetica, sans-serif;   font-size: 16px; margin:0px;">
                        Best Regards,<br>The Ondalinda Team. </p>
                    <br />
                </td>
            </tr>
          </table>
        </td>
        </tr>     
</tr>
<tr>
      <td style="height: 20px;"></td>
  </tr>

        <tr>
           <td style="font-size:30px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;text-align:center">My Tickets</td>
           </tr>
         <tr>
           <td style="height: 20px;"></td>
         </tr>
         <!-- tickets -->
        <tr>
                <td>
                <div
                style=" max-width: 500px; background-color: #000; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
                <div
                    style="background-image: url('${ticketImage}'); height: 220px; background-position: center; background-size: cover; border-radius: 30px; overflow: hidden; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                    <div style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; margin:auto;">
                        <h2
                                            style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                            O<span
                                                style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;"> x </span>CAREYES
                                        </h2>
                                        <p
                                            style=" color: white;
                                        font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style:normal; margin: 0;">
                                            Nov 6 - 9, 2025</p>
                    </div>
                    </div>
                </div>
    
                        <div style="padding: 30px 20px;">
                            <table style="width: 100%; color: white; font-family: Arial, Helvetica, sans-serif;">
                                <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
                                    <td>Last Name</td>
                                    <td>First Name</td>
                                    <td>Order#</td>
                                </tr>
                                <tr style="text-transform: uppercase; font-size: 14px; ">
                                    <td>${lastName}</td>
                                    <td>${firstname}</td>
                                    <td>${order.OriginalTrxnIdentifier}</td>
                                </tr>
                               <tr>
                                            <td colspan="3" style="height: 60px; border-bottom: 1px solid #57B6B2;"></td>
                                        </tr>

                                        <tr>
                                            <td colspan="3" style="height: 15px; "></td>
                                        </tr>

    
                                <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
                                    <td colspan="3">TICKETS</td>
                                </tr>

                                 <tr
                                            style="color: white; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                            <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>  <td style="color: #57B6B2; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td> 
                                        </tr>

    
                             <tr>
                                            <td colspan="3" style="height: 30px; "></td>
                                        </tr>

                                
                                 <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 6:</b> The Explorer’s Quest | 10pm to 4am | Movida
                                            </td>
                                        </tr>
                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 7:</b>  Queen Teuta’s Vessel | 10pm to 4am | Kanli Kula
                                            </td>
                                        </tr>
                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style=" padding-bottom:20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 8:</b> Treasures of the Sea | 10pm to 6am | Arza
                                            </td>
                                        </tr>
                            </table>
    
                            <div style="margin: 60px 0;">
                                <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                    <img style="width: 100%;"
                                        src="${ticketqrcode}" alt="">
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>`;

        const findAlladdonsData = await AddonBook.findAll({
          where: {
            order_id: order.id,
            ticket_id: findAllTicketsqrcode.tid, // Condition to check if transfer_user_id is not  null
            ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
          },
          include: { model: Addons },
          raw: true,
        });
        findAlladdonsData.forEach((addonsticket) => {
          //  const addonqrcode =`/qrcode/${addonsticket.addon_qrcode}`;
          const firstnameaddon =
            addonsticket?.fname || findAllTransferUsers.FirstName;
          const lastNameaddon =
            addonsticket?.lname || findAllTransferUsers.LastName;
          const addonqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${addonsticket.addon_qrcode}`;

          const addonname = addonsticket["Addon.name"] || ""; // Default value in case it's missing
          const addonSortName = addonsticket["Addon.sortName"] || ""; // Default value in case it's missing
          let addonLocation = addonsticket["Addon.addon_location"] || ""; // Default value in case it's missing
          let addonTime = addonsticket["Addon.addon_time"] || ""; // Default value in case it's missing
          const addonDay = addonsticket["Addon.sort_day"] || " "; // Default value in case it's missing
          // const addonImage = addonsticket["Addon.addon_image"] || "Unnamed "; // Default
          const addonImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${addonsticket["Addon.addon_image"] || ""
            }`;
          const backgroundColor =
            addonsticket["Addon.addon_type"] === "Special"
              ? "#DF8EA3"
              : "#499A96";

          emailTemplateHtml += `<tr>
        <td style="height: 30px;"></td>
    </tr>
    <!-- addons -->
   <tr>
                <td>
                <div
                style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
                <div
                    style="background-image: url('${addonImage}');; height: 220px; background-size: cover;  border-radius: 30px; overflow: hidden; background-position: center; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                     <div
                                    style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; margin:auto;">
                          <h2
                                            style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                            O<span
                                                style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;"> x </span>CAREYES
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
                                <tr style="color: #000; text-transform: uppercase; font-size: 14px;">
                                    <td>Last Name</td>
                                    <td>First Name</td>
                                    <td>Order#</td>
                                </tr>
                                <tr style="text-transform: uppercase;  font-size: 14px; ">
                                    <td>${lastNameaddon}</td>
                                    <td>${firstnameaddon}</td>
                                    <td>${order.OriginalTrxnIdentifier}</td>
                                </tr>
                                 <tr>
                                            <td colspan="3" style="height: 60px; border-bottom: 1px solid #000;"></td>
                                        </tr>

                                        <tr>
                                            <td colspan="3" style="height: 15px; "></td>
                                        </tr>

                                <tr style="color: #000; text-transform: uppercase; font-size: 14px;">
                                    <td colspan="3">TICKETS</td>
                                </tr>
    
                                  <tr
                                            style="color: white; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                            <td colspan="3">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>   
                                        </tr>


                               
                                <tr>
                                            <td colspan="3" style="height: 30px; "></td>
                                        </tr>


                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                 <b>${addonDay}:</b> ${addonname} ${addonTime ? `| ${addonTime}` : ""
            } ${addonLocation ? `| ${addonLocation}` : ""}
                                            </td>
                                        </tr>



                               
                            </table>
    
                            <div style="margin: 60px 0;">
                                <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                    <img style="width: 100%;"
                                        src="${addonqrcode}" alt="">
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
          <td style="height:50px;"></td>
          </tr>
    <!-- ticket design end here  -->
    `;
        });
        emailTemplateHtml += `<tr>
    <td>
      <table style="text-align: center; margin: auto; border-top: 1px solid; padding: 35px 0; width: 90%;">
        <tr>
          <td>
            <a href="https://www.facebook.com/ondalindafestival/"><img src="https://staging.eboxtickets.com/images/ondalinda/facebook.png" style="border-radius: 50%; width: 36px;" alt="facebook-icon"></a>
            <a href="https://soundcloud.com/user-524758910" style="padding: 0 40px;"><img src="https://staging.eboxtickets.com/images/ondalinda/sound-claud.png" style="border-radius: 50%; width: 36px;" alt="sound-claud-icon"></a>
            <a href="https://www.instagram.com/ondalinda_/"><img src="https://staging.eboxtickets.com/images/ondalinda/instagram.png" style="border-radius: 50%; width: 36px;" alt="instagram-icon"></a>
          </td>
        </tr>

        <tr>
          <td>
            <br/> 
            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin:0px; font-style: italic;">©Ondalinda Productions LLC 2025 • All rights reserved</p>
          </td>
        </tr>
      </table>
    </td>
    </tr>

</table>
</div> `;

        const templateName = "Montenegro 2025 Event Ticket Confirmation";
        // const templateName = "Careyes 2024 Event Ticket Confirmation";
        const mergeVars = { ALLDATA: emailTemplateHtml };
        const toEmail = findAllTransferUsers.Email;
        await sendEmail(toEmail, mergeVars, templateName);
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
  });
  await Promise.all(sendEmailPromises);
}

const calculateTotals = (cart, discountAmt, adminFees) => {
  // Calculate total price before discount
  const totalPrice = cart.reduce((total, item) => {
    const price =
      item.ticket_type === "ticket"
        ? item.EventTicketType?.price || 0
        : item.Addon?.price || 0;
    return total + price * item.no_tickets;
  }, 0);

  // Apply discount if it exists
  const finalPriceAfterDiscount = totalPrice - (discountAmt || 0);

  // Calculate taxes
  const taxes = finalPriceAfterDiscount * (adminFees / 100); // 17.5

  // Return totals
  return {
    totalPrice,
    finalPriceAfterDiscount,
    taxes,
  };
};

// Function to get cart data for a specific user
export async function getOrderDetails({ payment_intent, getPaymentMetaInfo }) {
  try {
    // Fetch payment information based on payment_intent
    const paymentInfo = await Payment.findOne({
      where: { payment_intent: payment_intent },
    });

    if (paymentInfo) {
      const orderInfo = await MyOrders.findOne({ where: { RRN: payment_intent } });
      let accommodationData;
      if (orderInfo) {
        accommodationData = await AccommodationBookingInfo.findOne({
          where: { order_id: orderInfo.id },
          include: [
            {
              model: Housing,
              attributes: ["id", "Name", "Neighborhood", "MaxOccupancy", "NumBedrooms", "Pool", "ImageURL", "location"],
              include: [{ model: HousingNeighborhood, attributes: ["name"] }, { model: HousingTypes, attributes: ["name"] }]
            }
          ]
        });

        return {
          success: true,
          message: "Payment Completed Successfully !!",
          data: {
            ...orderInfo.toJSON(), // Convert orderInfo to a plain object
            accommodationInfo: accommodationData,
            email: paymentInfo.email, // Extract specific fields from paymentInfo
            name: paymentInfo.name,
          },
        };
      } else {
        // console.log('>>>>>>>>>>', paymentInfo);
        // const data = await createOrderIfWebhookFails(payment_intent, getPaymentMetaInfo);
        // return data
        return {
          success: false,
          message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",
        };
      }
    } else {
      return {
        success: false,
        message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",
      };
    }
  } catch (error) {
    console.error("Error fetching order and payment data:", error);
    return {
      success: false,
      message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",
    };
  }

}

async function createOrderIfWebhookFails(payment_intent, metadata = {}) {
  try {

    const {
      eventId = null,
      cartData = [],
      couponDetails = {},
      userId = null,
      amount = 0,
      adminFees = 0,
      donationFees = 0,
      totalTax = 0,
      propertyDetailsObj = {},
      finalPrice = 0,
      selectedPaymentOption = "full"
    } = metadata;

    // return metadata;

    const totalCartAmt = amount;
    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || 0;
    const discount_amount = couponDetails?.discount_amount || 0;
    const code = couponDetails?.coupon_code || null;
    const adminFee = adminFees ?? 0;
    const donationFee = donationFees ?? 0;

    // // Update paymentInfo status to succeeded
    const paymentData = await Payment.findOne({
      where: { payment_intent: payment_intent },
    });

    if (paymentData) {
      await paymentData.update({ paymentstatus: "succeeded", totalTaxes: totalTax });
    }

    const existingOrder = await MyOrders.findOne({ where: { RRN: payment_intent } });
    if (existingOrder) {
      return existingOrder; // Already exists
    }

    // Check safely if propertyId exists for accommodation booking
    if (metadata?.propertyDetailsObj?.propertyId) {
      const createOrderRes = await createOrderForAccommodationFallbackWebhook({ payment_intent, metadata });
      console.log('Creating accommodation order...');
      return createOrderRes;
    }

    // Destructure the required fee fields from paymentData
    const {
      ticketBankFee = 0,
      ticketPlatformFee = 0,
      ticketProcessingFee = 0,
      ticketStripeFee = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      totalCartAmount = 0,
      totalAddonAmount = 0,
      totalAddonTax = 0,
      totalTicketAmount = 0,
      totalTicketTax = 0,
      clientsecret = null
    } = paymentData || {};

    // Define the lookup condition once
    const invitationWhereClause = { UserID: userId, EventID: eventId };
    let invitation = await InvitationEvent.findOne({ where: invitationWhereClause });
    if (invitation) {
      // Update both fields in one query
      await InvitationEvent.update(
        { Status: 2 },
        { where: { id: invitation.id } }
      );
    } else {
      // Create a new invitation
      invitation = await InvitationEvent.create({
        UserID: userId,
        EventID: eventId,
        Status: 2
      });
    }

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"],
    });

    // Initialize totals
    let totalTicketCount = 0;
    let totalAddonCount = 0;
    let totalActualAmount = 0;

    // Calculate totals from cartData
    for (const cartItem of cartData) {
      if (cartItem.ticketType == "ticket") {
        totalTicketCount += cartItem.noTickets;
        totalActualAmount += cartItem.price * cartItem.noTickets;
      } else if (cartItem.ticketType == "addon") {
        totalAddonCount += cartItem.noTickets;
        totalActualAmount += cartItem.price * cartItem.noTickets;
      }
    }

    // Create order
    const orderResponse = await Order.create({
      user_id: userId,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      event_id: eventId,
      adminfee: adminFee,
      donationfee: donationFee,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      discountAmount: discount_amount,
      totalCartAmount: totalCartAmount,
      couponCode: code,
      discountType: discount_type,
      actualamount: totalActualAmount,
      RRN: payment_intent,
      total_tax_amount: totalTax,
      OrderIdentifier: clientsecret,

      totalAddonAmount,
      totalAddonTax,
      totalTicketAmount,
      totalTicketTax,

      ticketBankFee,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketStripeFee,

      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage
    });
    // Generate the transaction identifier
    const orderId = orderResponse.id;
    const trxnIde = `M-${userId}-${orderId}`;
    await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });
    // return true;

    const cartItemIdsToDelete = []; // Collect IDs for bulk delete

    for (const cartItem of cartData) {

      if (cartItem.ticketType == "ticket" && cartItem.ticketId) {
        const ticketPrice = cartItem.price || 0;
        const ticketCount = cartItem.noTickets || 0;

        for (let index = 1; index <= ticketCount; index++) {
          const ticketBook = await BookTicket.create({
            order_id: orderId,
            event_id: eventId,
            event_ticket_id: cartItem.ticketId,
            cust_id: userId,
            ticket_buy: 1,
            amount: ticketPrice,
            mobile: userInfo.PhoneNumber,
            adminfee: adminFee,
            // is_buy_addons_ids: addonIdsString,  // new functionality 08-04-2025
          });

          const ticketId = ticketBook.id;
          const ticketNum = `T${ticketId}`;
          const ticketDetail = await TicketDetail.create({
            tid: ticketId,
            ticket_num: `T${ticketId}`,
            generated_id: ticketNum,
            user_id: userId,
            status: "0",
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: ticketDetail.id,
            ticketType: "ticket",
          });
          if (qrCodeImage.success) {
            await ticketDetail.update({ qrcode: qrCodeImage.filePath });
          }

          cartItemIdsToDelete.push(cartItem.cartId); // Collect cart item ID for deletion
        }
      } else if (cartItem.ticketType == "addon" && cartItem.ticketId) {
        const addonPrice = cartItem.price || 0;
        const addonCount = cartItem.noTickets || 0;

        for (let index = 1; index <= addonCount; index++) {
          const addonBook = await AddonBook.create({
            addons_id: cartItem.ticketId,
            event_id: eventId,
            order_id: orderId,
            user_id: userId,
            price: addonPrice,
          });

          const qrCodeImage = await generateTicketQrToS3({
            userId,
            orderId,
            ticketId: addonBook.id,
            ticketType: "addon",
          });
          if (qrCodeImage.success) {
            await addonBook.update({ addon_qrcode: qrCodeImage.filePath });
          }

          cartItemIdsToDelete.push(cartItem.cartId); // Collect cart item ID for deletion
        }
      }
    }

    // Delete the cart items after processing
    await CartModel.destroy({
      where: {
        id: cartItemIdsToDelete,
      },
    });

    // Send email to the user after order creation
    const orderObject = {
      order_id: orderId,
      user_id: userId,
      eventId: eventId,
      trxnIde,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      adminfee: adminFee,
      donationFee: donationFee,
      total_amount: totalCartAmt,
      discountValue: discount_value,
      couponCode: code,
      discountType: discount_type,
      RRN: payment_intent,
      actualamount: totalActualAmount,
    };

    const isEmailSend = sendOrderEmailToUserV2(userInfo, orderObject, cartData, userId);
    console.log("✅ Fallback order created:", paymentData);
    const orderInfo = await MyOrders.findOne({ where: { RRN: payment_intent } });
    // Check if orderInfo exists and merge both data
    if (orderInfo) {
      return {
        success: true,
        message: "Payment Completed Successfully !!",
        data: {
          ...orderInfo.toJSON(), // Convert orderInfo to a plain object
          email: paymentData.email, // Extract specific fields from paymentData
          name: paymentData.name,
        },
      };
    }

    return {
      success: false,
      message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",
    };
    // return metadata;
  } catch (error) {
    console.error("Error creating order manually:", error);
    return {
      success: false,
      message: "Your payment was successful, but the order wasn’t created. Please check 'My Orders' or contact support.",
    };
  }
}

export async function getPaymentInfo(req, res) {
  try {
    const { payment_intent } = req.query;

    // Fetch payment information based on payment_intent
    const paymentInfo = await Payment.findOne({
      where: { payment_intent: payment_intent },
    });
    if (paymentInfo) {
      return {
        success: true,
        message: "Payment Information Retrieved Successfully !!",
        data: paymentInfo.toJSON(),
      };
    } else {
      return {
        success: false,
        message: "Payment not found",
      };
    }


  } catch (error) {
    console.error("Error fetching payment info:", error);
    return {
      success: false,
      message: "An error occurred while fetching payment details :" + error.message,
    };
  }
}

const sendOrderEmailToUser = async (userInfo, orderObj, cartData) => {
  const eventIds = cartData.map((cartItem) => cartItem.dataValues.event_id);
  let emailTemplateHtml = `<tr>
                            <td colspan="2">
                                <br>
                                <h6 style="font-family: Arial, Helvetica, sans-serif; font-size: 16px !important; margin:0px; text-transform: uppercase;">
                                    ORDER SUMMARY:</h6>
                                <br>
                            </td>
                        </tr>`;

  // Loop over each ticket and append rows dynamically
  cartData.forEach((ticket) => {
    if (ticket.ticket_type == "ticket" && ticket.EventTicketType) {
      // Extract ticket details
      const ticketPrice = ticket.EventTicketType.price || 0;
      const ticketCount = ticket.no_tickets || 0;
      const ticketName = ticket.EventTicketType.title || "Unnamed Ticket";

      // Add ticket details to the email template
      emailTemplateHtml += `
            <tr>
              <td style="width: 70%;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); text-transform: uppercase;"> ${ticketCount} x ${ticketName}</p>                    
              </td>

              <td style="width: 30%; text-align: right; padding: 5px 0;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">${formatPrice(
        ticketPrice * ticketCount
      )}
                </p>
              </td>
            </tr>`;
    } else if (ticket.ticket_type == "addon" && ticket.Addon) {
      // Handle addon items
      const addonPrice = ticket.Addon.price || 0;
      const addonCount = ticket.no_tickets || 0;
      const addonName = ticket.Addon.name || "Unnamed Addon";

      // Add addon details to the email template
      emailTemplateHtml += `
            <tr>
              <td style="width: 70%;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); text-transform: uppercase;"> ${addonCount} x ${addonName}</p>                    
              </td>
              <td style="width: 30%; text-align: right; padding: 5px 0;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">${formatPrice(
        addonPrice * addonCount
      )}</p>
              </td>
            </tr>`;
    }
  });

  // discount logic
  if (orderObj.couponCode) {
    let discountDisplay =
      orderObj.discountType == "percentage"
        ? `${parseFloat(orderObj.discountValue) % 1 === 0
          ? parseInt(orderObj.discountValue) // Display as integer if no decimals
          : parseFloat(orderObj.discountValue).toFixed(2)
        }%`
        : `- $${parseFloat(orderObj.discountValue).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`;

    emailTemplateHtml += `
    <tr>
      <td style="width: 70%;">
        <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: 600;">STAFF ID</p>
      </td>
      <td style="width: 30%; text-align: right; padding: 5px 0;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">${discountDisplay}</b>
        </p> 
      </td>
    </tr>`;
  }

  // Add a closing summary and the footer
  emailTemplateHtml += `
     <tr>
          <td style="width: 70%;">
            <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: 600;">Total (Including taxes & fees)</p>
          </td>
          <td style="width: 30%; text-align: right; padding: 5px 0;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;"><b>${formatPrice(
    orderObj.total_amount
  )}</b>
                </p>
          </td>
    </tr> 

    </table>
						 </div>				 
						 </td>
						</tr>
					
						<tr>
						 <td>
						 <table style="text-align: center; margin: auto; width: 95%; margin-bottom: 30px;">
								 <tr>
									 <td style="border-bottom: 1px solid #000">
								 <br/> 
							 <p style="font-family: Arial, Helvetica, sans-serif;   font-size: min(max(16px, 2vw), 20px); font-weight: 600; font-style: italic; text-align: center; margin:0px;">All payments are final, there are no refunds or returns.</p>
							 <br/> 
							 </td>
							 </tr>
						 </table>
						 </td>
						</tr> 
            <tr>
            <td
                style="font-size: 30px; font-family: Arial, Helvetica, sans-serif; font-weight: bold; text-align: center;">
               MY TICKETS
            </td>
            </tr>`;

  const findAllTicketsData = await BookTicket.findAll({
    where: { order_id: orderObj.order_id },
    raw: true,
  });

  for (const ticket of findAllTicketsData) {
    const ticketDataId = ticket.id;
    const findAllTicketsqrcode = await TicketDetail.findOne({
      where: { tid: ticketDataId },
      raw: true,
    });
    // Extract ticket details
    // const ticketName = ticket.EventTicketType.title || "Unnamed Ticket";

    const findTicketName = await BookTicket.findOne({
      include: {
        model: EventTicketType, // Ensure this is properly associated in your Sequelize models
        attributes: ["title", "ticket_image"], // Specify the columns you want to retrieve from EventTicketType
      },
      where: { order_id: orderObj.order_id },
      raw: true,
    });
    const ticketName =
      findTicketName["EventTicketType.title"] || "Unnamed Ticket";
    const ticketImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${findTicketName["EventTicketType.ticket_image"] || "Unnamed "
      }`;
    const ticketqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${findAllTicketsqrcode.qrcode}`;
    emailTemplateHtml += `           
            <tr>
                <td style="height: 20px;"></td>
            </tr>
    
            <!-- tickets -->
            <tr>
                <td>
                <div
                style=" max-width: 500px; background-color: #000; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
                <div
                    style="background-image: url('${ticketImage}'); height: 220px; background-position: center; background-size: cover; border-radius: 30px; overflow: hidden; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                    <div style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; margin:auto;">
                        <h2
                                            style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                            O<span
                                                style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;"> x </span>CAREYES
                                        </h2>
                                        <p
                                            style=" color: white;
                                        font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style:normal; margin: 0;">
                                            Nov 6 - 9, 2025</p>
                    </div>
                    </div>
                </div>
    
                        <div style="padding: 30px 20px;">
                            <table style="width: 100%; color: white; font-family: Arial, Helvetica, sans-serif;">
                                <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
                                    <td>Last Name</td>
                                    <td>First Name</td>
                                    <td>Order#</td>
                                </tr>
                                <tr style="text-transform: uppercase; font-size: 14px; ">
                                    <td>${userInfo.LastName}</td>
                                    <td>${userInfo.FirstName}</td>
                                    <td>${orderObj.trxnIde}</td>
                                </tr>
                               <tr>
                                            <td colspan="3" style="height: 60px; border-bottom: 1px solid #57B6B2;"></td>
                                        </tr>

                                        <tr>
                                            <td colspan="3" style="height: 15px; "></td>
                                        </tr>

    
                                <tr style="color: #57b6b2; text-transform: uppercase; font-size: 14px;">
                                    <td colspan="3">TICKETS</td>
                                </tr>

                                 <tr
                                            style="color: white; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                            <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>  <td style="color: #57B6B2; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td> 
                                        </tr>

    
                             <tr>
                                            <td colspan="3" style="height: 30px; "></td>
                                        </tr>

                                
                                 <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 6:</b> The Explorer’s Quest | 10pm to 4am | Movida
                                            </td>
                                        </tr>
                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 7:</b>  Azure Riviera | 2pm to 9pm | Ribarsko Selo
                                            </td>
                                        </tr>
                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style=" padding-bottom:20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                <b>Nov 8:</b> Queen Teuta’s Vessel | 10pm to 4am | Kanli Kula
                                            </td>
                                        </tr>
                            </table>
    
                            <div style="margin: 60px 0;">
                                <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                    <img style="width: 100%;"
                                        src="${ticketqrcode}" alt="">
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>`;
  }
  const findAlladdonsData = await AddonBook.findAll({
    include: {
      model: Addons, // Ensure this is properly associated in your Sequelize models
      attributes: [
        "id",
        "name",
        "addon_location",
        "addon_time",
        "addon_day",
        "addon_image",
        "sortName",
        "sort_day",
        "addon_type",
      ], // Specify the columns you want to retrieve from EventTicketType
    },
    where: { order_id: orderObj.order_id },
    raw: true,
  });

  findAlladdonsData.forEach((addonsticket) => {
    //  const addonqrcode =`/qrcode/${addonsticket.addon_qrcode}`;
    const addonname = addonsticket["Addon.name"] || ""; // Default value in case it's missing
    const addonSortName = addonsticket["Addon.sortName"] || ""; // Default value in case it's missing
    let addonLocation = addonsticket["Addon.addon_location"] || ""; // Default value in case it's missing
    let addonTime = addonsticket["Addon.addon_time"] || ""; // Default value in case it's missing
    const addonDay = addonsticket["Addon.sort_day"] || " "; // Default value in case it's missing
    // const addonImage = addonsticket["Addon.addon_image"] || "Unnamed "; // Default
    const addonImage = `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${addonsticket["Addon.addon_image"] || ""
      }`;
    const addonqrcode = `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/${addonsticket.addon_qrcode}`;

    // Condition to remove addonTime and addonLocation when Addon.id is 6
    // if (addonsticket["Addon.addon_type"] === "Special") {
    //   addonTime = ""; // Empty string to hide data
    //   addonLocation = ""; // Empty string to hide data
    // }
    const backgroundColor =
      addonsticket["Addon.addon_type"] === "Special" ? "#DF8EA3" : "#499A96";

    emailTemplateHtml += `<tr>
                <td style="height: 30px;"></td>
            </tr>
            <!-- addons -->
            <tr>
                <td>
                <div
                style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #bfbab2; margin: auto; overflow: hidden; ">
                <div
                    style="background-image: url('${addonImage}');; height: 220px; background-size: cover;  border-radius: 30px; overflow: hidden; background-position: center; background-repeat: no-repeat; display: flex; justify-content: center; align-items: center;">
                     <div
                                    style="width: 100%; height:100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; margin:auto;">
                          <h2
                                            style=" margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px);  font-weight: 100; color: white;">
                                            O<span
                                                style="color: #57b6b2; font-family: Arial, Helvetica, sans-serif; font-style:normal;"> x </span>CAREYES
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
                                <tr style="color: #000; text-transform: uppercase; font-size: 14px;">
                                    <td>Last Name</td>
                                    <td>First Name</td>
                                    <td>Order#</td>
                                </tr>
                                <tr style="text-transform: uppercase;  font-size: 14px; ">
                                    <td>${userInfo.LastName}</td>
                                    <td>${userInfo.FirstName}</td>
                                    <td>${orderObj.trxnIde}</td>
                                </tr>
                                 <tr>
                                            <td colspan="3" style="height: 60px; border-bottom: 1px solid #000;"></td>
                                        </tr>

                                        <tr>
                                            <td colspan="3" style="height: 15px; "></td>
                                        </tr>

                                <tr style="color: #000; text-transform: uppercase; font-size: 14px;">
                                    <td colspan="3">TICKETS</td>
                                </tr>
    
                                  <tr
                                            style="color: white; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                            <td colspan="3">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>   
                                        </tr>


                               
                                <tr>
                                            <td colspan="3" style="height: 30px; "></td>
                                        </tr>


                                        <tr style="color: white; font-size: 12px;">
                                            <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif;
font-weight: 300;">
                                                 <b>${addonDay}:</b> ${addonname} ${addonTime ? `| ${addonTime}` : ""
      } ${addonLocation ? `| ${addonLocation}` : ""}
                                            </td>
                                        </tr>



                               
                            </table>
    
                            <div style="margin: 60px 0;">
                                <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                    <img style="width: 100%;"
                                        src="${addonqrcode}" alt="">
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
          <td style="height:50px;"></td>
          </tr>
            <!-- ticket design end here  -->
            `;
  });

  // Footer reamove(28-11-2024)
  // emailTemplateHtml += `<tr>
  // 					 <td>
  // 						 <table style="text-align: center; margin: auto;  padding: 35px 0; width: 90%;">
  // 							 <tr>
  // 								 <td>
  // 									 <a href="https://www.facebook.com/ondalindafestival/"><img src="https://staging.eboxtickets.com/images/ondalinda/facebook.png" style="border-radius: 50%; width: 36px;" alt="facebook-icon"></a>
  // 									 <a href="https://soundcloud.com/user-524758910" style="padding: 0 40px;"><img src="https://staging.eboxtickets.com/images/ondalinda/sound-claud.png" style="border-radius: 50%; width: 36px;" alt="sound-claud-icon"></a>
  // 									 <a href="https://www.instagram.com/ondalinda_/"><img src="https://staging.eboxtickets.com/images/ondalinda/instagram.png" style="border-radius: 50%; width: 36px;" alt="instagram-icon"></a>
  // 								 </td>
  // 							 </tr>

  // 							 <tr>
  // 								 <td>
  // 									 <br/>
  // 									 <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin:0px; font-style: italic;">©Ondalinda Productions LLC 2025 • All rights reserved</p>
  // 								 </td>
  // 							 </tr>
  // 						 </table>
  // 					 </td>
  // 					</tr>

  //   </table>
  //   </div>
  // `;

  const emailtempleate = await Emailtemplet.findOne({
    where: {
      eventId: eventIds,
      templateId: 2,
    },
  });

  // mail champ template name
  const mailChampTemplateName = emailtempleate.dataValues.mandril_template;
  const subject = emailtempleate.dataValues.subject;

  const sanitizedTemplate = emailtempleate.dataValues.description;
  let processedTemplate = orderTemplate({
    userName: userInfo.FirstName,
    OrderID: orderObj.trxnIde,
    UserEmail: userInfo.Email,
    OrderSummary: emailTemplateHtml,
    html: sanitizedTemplate,
  });
  // / Extract the HTML content from the processedTemplate object
  let extractedTemplate = processedTemplate.html;
  // const templateName = "CAREYES 2025 Cancel Ticket"; //template name dynamic after successfully send email  pending
  const templateName = mailChampTemplateName; //template name dynamic for mail champ
  const mergeVars = { ALLDATA: extractedTemplate };
  const toEmail = userInfo.Email;
  await sendEmail(toEmail, mergeVars, templateName, subject);

  // const templateName = "CAREYES 2025 Event Ticket Confirmation";
  // const mergeVars = { ALLDATA: emailTemplateHtml };
  // const toEmail = userInfo.Email;
  // await sendEmail(toEmail, mergeVars, templateName);

  // let template = sendOrderEmail({
  //   fromUser: "Ondalinda",
  //   fromEmail: "rupam@doomshell.com",
  //   toEmail: userInfo.Email,
  //   subject: "Tech Team Testing",
  //   html: emailTemplateHtml,
  // });

  // await sendEmails(template);
};

function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Decryption failed, resulting string is empty.");
    }

    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error.message);
  }
}

// Formatting function for price
const formatPrice = (price) => {
  const roundedPrice = Number(price.toFixed(2));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(roundedPrice);
};


const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

function logErrorToFile(error) {
  const logDir = path.join(process.cwd(), "logs"); // Logs directory
  const logFile = path.join(logDir, "error-log.txt"); // Log file path
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const errorMessage = `${new Date().toISOString()} - ${error.message
    }\nStack Trace:\n${error.stack}\n\n`;
  fs.appendFileSync(logFile, errorMessage, "utf8");
}


// Cancel order for Admin
export async function cancelOrder(req, res, { refund = null }) {
  try {
    const orderId = req.body.orderId;
    const tickctCancelId = req.body.requested_by;
    const cancel_reason = req.body.refund_details;

    // Find the order
    const orderInfo = await Order.findOne({
      where: { id: orderId },
    });
    const firstEventId = orderInfo.event_id;
    const emailtempleate = await Emailtemplet.findOne({
      where: {
        eventId: firstEventId,
        templateId: 17,
      },
    });

    const userInfo = await User.findOne({
      where: { id: orderInfo.user_id },
      attributes: ["id", "Email", "FirstName"],
    });
    const userFirstName = userInfo.FirstName;
    const toEmail = userInfo.Email;
    // const userID = userInfo.id

    if (!orderInfo) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Extract data from the refund object
    const refundId = refund?.id || null;
    const refundBalanceTransaction = refund?.balance_transaction || null;
    const refundReason = cancel_reason || null;
    // const refundStatus = refund?.object || null;

    // Update the Order table
    await Order.update(
      {
        ticket_status: "cancel",
        // Approved: refundStatus,
        ticket_cancel_id: tickctCancelId,
        order_cancel_id: refundId, // Refund ID
        refund_balance_transaction: refundBalanceTransaction, // Balance transaction ID
        refund_reason: refundReason, // Reason for the refund
        cancel_date: new Date(),
      },
      { where: { id: orderId } }
    );

    // Find all tickets in BookTicket table
    const findAllTickets = await BookTicket.findAll({
      where: { order_id: orderId },
    });

    // Get the first event_id from the array
    const findAllAddons = await AddonBook.findAll({
      where: { order_id: orderId },
    });
    const ticketIds = findAllTickets.map((ticket) => ticket.id);
    const addonIds = findAllAddons.map((addon) => addon.id);
    await BookTicket.update(
      {
        ticket_status: "cancel",
        ticket_cancel_id: tickctCancelId,
        cancel_date: new Date(),
      },
      { where: { id: ticketIds } }
    );
    await TicketDetail.update(
      {
        ticket_status: "cancel",
        ticket_cancel_id: tickctCancelId,
        cancel_date: new Date(),
      },
      { where: { tid: ticketIds } }
    );
    await AddonBook.update(
      {
        ticket_status: "cancel",
        ticket_cancel_id: tickctCancelId,
        cancel_date: new Date(),
      },
      { where: { id: addonIds } }
    );

    // Update event inviatation table
    await InvitationEvent.update(
      { Status: 1 },
      { where: { UserID: orderInfo.user_id } }
    );

    // mail champ template name
    const replacements = {
      userName: userFirstName,
      orderNumber: orderInfo.OriginalTrxnIdentifier,
    };

    const processedTemplate = createTemplate(
      emailtempleate.description,
      replacements
    );
    // return processedTemplate
    const subject = emailtempleate.subject;
    const templateName = emailtempleate.mandril_template;
    const mergeVars = { ALLDATA: processedTemplate };

    await sendEmail(toEmail, mergeVars, templateName, subject);

    res.status(200).json({
      message: "Order and tickets cancelled successfully.",
      success: true,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" + err.message });
  }
}

export async function cancelOrderV3(req, res, { refund = null }) {
  try {
    const orderId = req.body.orderId;
    const tickctCancelId = req.body.requested_by;
    const cancel_reason = req.body.refund_details;

    // Find the order
    const orderInfo = await Order.findOne({
      where: { id: orderId },
    });

    if (!orderInfo) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const firstEventId = orderInfo.event_id;

    const userInfo = await User.findOne({
      where: { id: orderInfo.user_id },
      attributes: ["id", "Email", "FirstName"],
    });

    // Extract data from refund
    const refundId = refund?.id || null;
    const refundBalanceTransaction = refund?.balance_transaction || null;
    const refundReason = cancel_reason || null;

    // Update the Order table
    await Order.update(
      {
        ticket_status: "cancel",
        ticket_cancel_id: tickctCancelId,
        order_cancel_id: refundId,
        refund_balance_transaction: refundBalanceTransaction,
        refund_reason: refundReason,
        cancel_date: new Date(),
      },
      { where: { id: orderId } }
    );

    // Update tickets, ticket details, addons
    const findAllTickets = await BookTicket.findAll({ where: { order_id: orderId } });
    const findAllAddons = await AddonBook.findAll({ where: { order_id: orderId } });
    const ticketIds = findAllTickets.map((t) => t.id);
    const addonIds = findAllAddons.map((a) => a.id);

    await BookTicket.update(
      { ticket_status: "cancel", ticket_cancel_id: tickctCancelId, cancel_date: new Date() },
      { where: { id: ticketIds } }
    );

    await TicketDetail.update(
      { ticket_status: "cancel", ticket_cancel_id: tickctCancelId, cancel_date: new Date() },
      { where: { tid: ticketIds } }
    );

    await AddonBook.update(
      { ticket_status: "cancel", ticket_cancel_id: tickctCancelId, cancel_date: new Date() },
      { where: { id: addonIds } }
    );

    await InvitationEvent.update(
      { Status: 1 },
      { where: { UserID: orderInfo.user_id } }
    );

    return res.status(200).json({
      message: "Order and tickets cancelled successfully.",
      success: true,
      orderId: orderInfo.id,
      user: { id: userInfo.id, firstName: userInfo.FirstName, email: userInfo.Email },
      emailData,
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ success: false, error: "Internal Server Error: " + err.message });
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

// cancel tickets
export async function cancelTicket(req, res) {
  try {
    const { ticketId, ticket_cancel_id } = req.body;

    // Find the ticket in the BookTicket table
    const findTicket = await BookTicket.findOne({
      where: { id: ticketId },
      attributes: ["id", "ticket_status", "order_id", "cust_id", "event_id"],
    });

    if (!findTicket) {
      return res
        .status(404)
        .json({ message: "Ticket not found", success: false });
    }

    // Check if the ticket is already canceled
    if (findTicket.ticket_status == "cancel") {
      return res
        .status(400)
        .json({ message: "This ticket is already canceled", success: false });
    }

    const emailTemplate = await Emailtemplet.findOne({
      where: {
        eventId: findTicket.event_id,
        templateId: 1,
      },
    });

    if (!emailTemplate) {
      return res.status(400).json({
        message: "Email template with the specified ID was not found",
        success: false,
      });
    }

    const orderId = findTicket.order_id;
    const orderInfo = await Order.findOne({
      where: { id: orderId },
    });
    const userInfo = await User.findOne({
      where: { id: findTicket.cust_id },
      attributes: ["id", "Email", "FirstName"],
    });
    const userFirstName = userInfo.FirstName;
    const toEmail = userInfo.Email;

    // Find the corresponding ticket detail
    const findTicketDetail = await TicketDetail.findOne({
      where: { tid: ticketId },
    });

    // Update ticket status in BookTicket and TicketDetail
    await BookTicket.update(
      { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
      { where: { id: ticketId } }
    );

    if (findTicketDetail) {
      await TicketDetail.update(
        { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
        { where: { tid: ticketId } }
      );
    }

    // Count remaining active tickets and addons for the order
    const remainingTickets = await BookTicket.count({
      where: {
        order_id: orderId,
        ticket_status: { [Op.is]: null },
      },
    });

    const remainingAddons = await AddonBook.count({
      where: {
        order_id: orderId,
        ticket_status: { [Op.is]: null },
      },
    });

    // Cancel the order if no tickets and no addons remain
    if (remainingTickets == 0 && remainingAddons == 0) {
      await Order.update(
        { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
        { where: { id: orderId } }
      );

      // Update InvitationEvent table if all tickets are canceled
      await InvitationEvent.update(
        { Status: 1 },
        { where: { UserID: findTicket.cust_id } }
      );
    }

    // mail champ template name
    const replacements = {
      userFirstName: userFirstName,
      orderNumber: orderInfo.OriginalTrxnIdentifier,
    };
    const processedTemplate = createTemplate(
      emailTemplate.description,
      replacements
    );
    // return processedTemplate
    const subject = emailTemplate.subject;
    const templateName = emailTemplate.mandril_template; //template name dynamic for mail champ
    const mergeVars = { ALLDATA: processedTemplate };

    await sendEmail(toEmail, mergeVars, templateName, subject);

    return res
      .status(200)
      .json({ message: "Ticket canceled successfully", success: true });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal server error", success: false });
  }
}

export async function cancelTicketV3(req, res) {
  try {
    const { ticketId, ticket_cancel_id } = req.body;

    // Find the ticket
    const findTicket = await BookTicket.findOne({
      where: { id: ticketId },
      attributes: ["id", "ticket_status", "order_id", "cust_id", "event_id"],
    });

    if (!findTicket) {
      return res.status(404).json({ message: "Ticket not found", success: false });
    }

    // Check if already canceled
    if (findTicket.ticket_status == "cancel") {
      return res.status(400).json({ message: "This ticket is already canceled", success: false });
    }

    const orderId = findTicket.order_id;
    const orderInfo = await Order.findOne({ where: { id: orderId } });
    const userInfo = await User.findOne({
      where: { id: findTicket.cust_id },
      attributes: ["id", "Email", "FirstName"],
    });

    // Update ticket status in BookTicket
    await BookTicket.update(
      { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
      { where: { id: ticketId } }
    );

    // Update ticket detail if exists
    const findTicketDetail = await TicketDetail.findOne({ where: { tid: ticketId } });
    if (findTicketDetail) {
      await TicketDetail.update(
        { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
        { where: { tid: ticketId } }
      );
    }

    // Count remaining active tickets and addons
    const remainingTickets = await BookTicket.count({
      where: { order_id: orderId, ticket_status: { [Op.is]: null } },
    });

    const remainingAddons = await AddonBook.count({
      where: { order_id: orderId, ticket_status: { [Op.is]: null } },
    });

    // Cancel the order if no active tickets/addons remain
    if (remainingTickets === 0 && remainingAddons === 0) {
      await Order.update(
        { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
        { where: { id: orderId } }
      );

      await InvitationEvent.update(
        { Status: 1 },
        { where: { UserID: findTicket.cust_id } }
      );
    }

    return res.status(200).json({
      message: "Ticket canceled successfully",
      success: true,
      ticketId,
      orderId,
      orderInfo,
      user: { id: userInfo.id, firstName: userInfo.FirstName, email: userInfo.Email },
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
}

// Cancel Addon
export async function cancelAddon(req, res) {
  try {
    const { addonId, ticket_cancel_id } = req.body;
    // Find the order
    const addonInfo = await AddonBook.findOne({
      where: { id: addonId },
    });

    if (!addonInfo) {
      return res.status(404).json({ message: "Invalid addon", success: false });
    }

    const emailTemplate = await Emailtemplet.findOne({
      where: {
        eventId: addonInfo.event_id,
        templateId: 16,
      },
    });

    if (!emailTemplate) {
      return res.status(400).json({
        message: "Email template with the specified ID was not found",
        success: false,
      });
    }

    // find userinfo
    const userInfo = await User.findOne({
      where: { id: addonInfo.user_id },
      attributes: ["id", "Email", "FirstName"],
    });

    const userFirstName = userInfo.FirstName;
    const toEmail = userInfo.Email;
    // const toEmail = "rupam@doomshell.com";

    // Update Addons table
    await AddonBook.update(
      {
        ticket_status: "cancel",
        ticket_cancel_id: ticket_cancel_id,
        cancel_date: new Date(),
      },
      { where: { id: addonId } }
    );

    // Count remaining active tickets and addons for the order
    const remainingTickets = await BookTicket.count({
      where: {
        order_id: addonInfo.order_id,
        ticket_status: { [Op.is]: null },
      },
    });

    const remainingAddons = await AddonBook.count({
      where: {
        order_id: addonInfo.order_id,
        ticket_status: { [Op.is]: null },
      },
    });

    // Cancel the order if no tickets and no addons remain
    if (remainingTickets == 0 && remainingAddons == 0) {
      await Order.update(
        { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
        { where: { id: addonInfo.order_id } }
      );
    }
    // Find the order
    const orderInfo = await Order.findOne({
      where: { id: addonInfo.order_id },
    });
    // mail champ template name
    const replacements = {
      userFirstName: userFirstName,
      orderNumber: orderInfo.OriginalTrxnIdentifier,
    };
    const processedTemplate = createTemplate(
      emailTemplate.description,
      replacements
    );
    // return processedTemplate
    const subject = emailTemplate.subject;
    const templateName = emailTemplate.mandril_template; //template name dynamic for mail champ
    const mergeVars = { ALLDATA: processedTemplate };

    await sendEmail(toEmail, mergeVars, templateName, subject);

    res.status(200).json({
      message: "Addon Cancelled Successfully!!",
      success: true,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function cancelAddonV3(req, res) {
  try {
    const { addonId, ticket_cancel_id } = req.body;

    // Find the addon
    const addonInfo = await AddonBook.findOne({ where: { id: addonId } });

    if (!addonInfo) {
      return res.status(404).json({ message: "Invalid addon", success: false });
    }

    // Find user info
    const userInfo = await User.findOne({
      where: { id: addonInfo.user_id },
      attributes: ["id", "Email", "FirstName"],
    });

    // Update Addon status
    await AddonBook.update(
      {
        ticket_status: "cancel",
        ticket_cancel_id,
        cancel_date: new Date(),
      },
      { where: { id: addonId } }
    );

    // Count remaining active tickets and addons
    const remainingTickets = await BookTicket.count({
      where: { order_id: addonInfo.order_id, ticket_status: { [Op.is]: null } },
    });

    const remainingAddons = await AddonBook.count({
      where: { order_id: addonInfo.order_id, ticket_status: { [Op.is]: null } },
    });

    // Cancel the order if no tickets and addons remain
    if (remainingTickets == 0 && remainingAddons == 0) {
      await Order.update(
        { ticket_status: "cancel", ticket_cancel_id, cancel_date: new Date() },
        { where: { id: addonInfo.order_id } }
      );
    }

    const orderInfo = await Order.findOne({ where: { id: addonInfo.order_id } });


    return res.status(200).json({
      message: "Addon cancelled successfully",
      success: true,
      addonId,
      orderInfo,
      orderId: addonInfo.order_id,
      user: { id: userInfo.id, firstName: userInfo.FirstName, email: userInfo.Email },
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
}

// new order email
export async function OrderEmailTest(req, res) {
  try {
    const existOrderId = req.body.orderId;
    // const { orderId } = req.body;
    const order = await Order.findOne({
      where: { id: existOrderId },
      include: {
        model: User,
        attributes: ["Email", "FirstName", "LastName"],
      },
    });

    if (order) {
      let ticketArray = [];
      let ticketMap = {};
      const findAllTickets = await BookTicket.findAll({
        where: { order_id: order.id },
        include: [{ model: EventTicketType, attributes: ["title", "price"] }],
        raw: true,
      });

      findAllTickets.forEach((ticket) => {
        const eventTicketId = ticket.event_ticket_id;

        if (ticketMap[eventTicketId]) {
          ticketMap[eventTicketId].total_ticket_count += 1;
        } else {
          ticketMap[eventTicketId] = {
            event_ticket_id: eventTicketId,
            title: ticket["EventTicketType.title"],
            price: ticket["EventTicketType.price"],
            total_ticket_count: 1,
            ticket_type: "ticket",
          };
        }
      });

      let addonMap = {};

      const findAllAddons = await AddonBook.findAll({
        where: { order_id: order.id },
        include: [{ model: Addons, attributes: ["name", "price"] }],
        raw: true,
      });

      findAllAddons.forEach((addon) => {
        const addonId = addon.addons_id;

        if (addonMap[addonId]) {
          addonMap[addonId].total_addon_count += 1;
        } else {
          addonMap[addonId] = {
            addons_id: addonId,
            name: addon["Addon.name"],
            price: addon["Addon.price"],
            total_addon_count: 1,
            ticket_type: "addon",
          };
        }
      });

      ticketArray.push(...Object.values(ticketMap));
      ticketArray.push(...Object.values(addonMap));

      //... This Code remove After send email dynamic
      let OrderSummaryData = ``;
      // Loop over each ticket and append rows dynamically
      // Loop over each ticket and append rows dynamically

      ticketArray.forEach((ticket) => {
        const ticketPrice = ticket.price || 0;
        const ticketCount =
          ticket.ticket_type === "ticket"
            ? ticket.total_ticket_count
            : ticket.total_addon_count || 0;
        const ticketName =
          ticket.ticket_type === "ticket"
            ? ticket.title
            : ticket.name || "Unnamed Item";

        // Add ticket or addon details to the email template
        OrderSummaryData += `
          <tr>
            <td style="width: 70%; padding: 5px 0;">
              <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); text-transform: uppercase;"> 
                ${ticketCount} x ${ticketName}
              </p>                    
            </td>
            <td style="width: 30%; text-align: right; padding: 5px 0;">
              <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">
                ${formatPrice(ticketPrice * ticketCount)}
              </p>
            </td>
          </tr>`;
      });
      // discount logic
      if (order.couponCode) {
        let discountDisplay =
          order.discountType === "percentage"
            ? `${parseFloat(order.discountValue) % 1 === 0
              ? parseInt(order.discountValue) // Display as integer if no decimals
              : parseFloat(order.discountValue).toFixed(2)
            }%`
            : `- $${parseFloat(order.discountValue).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}`;

        OrderSummaryData += `
        <tr>
          <td style="width: 70%; padding: 10px 0;">
            <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: 600;">STAFF ID</p>
          </td>
          <td style="width: 30%; text-align: right; padding: 5px 0;">
                  <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">
              <b>${discountDisplay}</b>
            </p> 
          </td>
        </tr>`;
      }

      // Add a closing summary and the footer
      OrderSummaryData += `
          <tr>
            <td style="width: 70%; padding: 10px 0;">
              <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: 600;">Total (including fees)</p>
            </td>
            <td style="width: 30%; text-align: right; padding: 5px 0;">
                    <p style="font-family: Arial, Helvetica, sans-serif; font-size: min(max(9px, 2vw), 16px); font-weight: bold; color: #333;">
                <b>${formatPrice(order.total_amount)}</b>
              </p>
            </td>
          </tr>`;

      OrderSummaryData += `</table>
                    </div>				 
                    </td>
                    </tr>

            <tr>
            <td>
            <table style="text-align: center; margin: auto; width: 95%; margin-bottom: 30px;">
                <tr>
                  <td style="border-bottom: 1px solid #000">
                <br/> 
              <p style="font-family: Arial, Helvetica, sans-serif;   font-size: min(max(16px, 2vw), 20px); font-weight: 600; font-style: italic; text-align: center; margin:0px;">All payments are final, there are no refunds or returns.</p>
              <br/> 
              </td>
              </tr>
            </table>
            </td>
            </tr>
           `;
      // OrderSummaryData += `<tr>
      //       <td>
      //         <table style="text-align: center; margin: auto; border-top: 1px solid; padding: 35px 0; width: 90%;">
      //           <tr>
      //             <td>
      //               <a href="https://www.facebook.com/ondalindafestival/"><img src="https://staging.eboxtickets.com/images/ondalinda/facebook.png" style="border-radius: 50%; width: 36px;" alt="facebook-icon"></a>
      //               <a href="https://soundcloud.com/user-524758910" style="padding: 0 40px;"><img src="https://staging.eboxtickets.com/images/ondalinda/sound-claud.png" style="border-radius: 50%; width: 36px;" alt="sound-claud-icon"></a>
      //               <a href="https://www.instagram.com/ondalinda_/"><img src="https://staging.eboxtickets.com/images/ondalinda/instagram.png" style="border-radius: 50%; width: 36px;" alt="instagram-icon"></a>
      //             </td>
      //           </tr>

      //           <tr>
      //             <td>
      //               <br/>
      //               <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin:0px; font-style: italic;">©Ondalinda Productions LLC 2024 • All rights reserved</p>
      //             </td>
      //           </tr>
      //         </table>
      //       </td>
      //       </tr>
      //   </table>
      //   </div>
      //   `;

      const emailtempleate = await Emailtemplet.findOne({
        where: {
          // eventId: 110,
          eventId: 111,
          templateId: 2,
        },
      });

      // mail champ template name
      const mailChampTemplateName = emailtempleate.dataValues.mandril_template;

      const sanitizedTemplate = emailtempleate.dataValues.description;
      let processedTemplate = orderTemplate({
        userName: order.User.FirstName,
        OrderID: order.OriginalTrxnIdentifier,
        UserEmail: order.User.Email,
        OrderSummary: OrderSummaryData,
        html: sanitizedTemplate,
      });
      // / Extract the HTML content from the processedTemplate object
      let extractedTemplate = processedTemplate.html;
      // const templateName = "Montenegro 2025 Cancel Ticket"; //template name dynamic after successfully send email  pending
      const templateName = mailChampTemplateName; //template name dynamic for mail champ
      const mergeVars = { ALLDATA: extractedTemplate };
      const toEmail = order.User.Email;
      await sendEmail(toEmail, mergeVars, templateName);

      // const templateName = "Montenegro 2025 Event Ticket Confirmation";
      // const mergeVars = { ALLDATA: emailTemplateHtml };
      // const toEmail = order.User.Email;
      // await sendEmail(toEmail, mergeVars, templateName);

      return res
        .status(200)
        .json({ success: true, message: "Email sent successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error Resending Order Email :" + error.message,
    });
  }
}

export async function OrderEmailTestV3(req, res) {
  try {
    const existOrderId = req.body.orderId;

    const order = await Order.findOne({
      where: { id: existOrderId },
      include: {
        model: User,
        attributes: ["id", "Email", "FirstName", "LastName"],
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Fetch tickets
    const findAllTickets = await BookTicket.findAll({
      where: { order_id: order.id },
      include: [{ model: EventTicketType, attributes: ["title", "price"] }],
      raw: true,
    });

    const tickets = findAllTickets.map((ticket) => ({
      id: ticket.id,
      event_ticket_id: ticket.event_ticket_id,
      title: ticket["EventTicketType.title"],
      price: ticket["EventTicketType.price"],
      status: ticket.ticket_status,
      count: 1, // assuming each row is 1 ticket
    }));

    // Fetch addons
    const findAllAddons = await AddonBook.findAll({
      where: { order_id: order.id },
      include: [{ model: Addons, attributes: ["name", "price"] }],
      raw: true,
    });

    const addons = findAllAddons.map((addon) => ({
      id: addon.id,
      addons_id: addon.addons_id,
      name: addon["Addon.name"],
      price: addon["Addon.price"],
      status: addon.ticket_status,
      count: 1, // assuming each row is 1 addon
    }));

    // Return only order details, tickets, and addons
    return res.status(200).json({
      success: true,
      data: {
        order,
        tickets,
        addons,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching order details: " + error.message,
    });
  }
}


// extend date for accommodation
export async function extendAccommodationDate(req, res) {
  console.log('----------------------------extendAccommodationDate ---------------------------');

  const {
    paymentIntentId,
    eventId,
    userId,
    amount,
    adminFees,
    propertyDetailsObj,
    totalTax,
    finalPrice,
    selectedPaymentOption
  } = req.body;

  try {
    const parsedPropertyDetails = typeof propertyDetailsObj == 'string'
      ? JSON.parse(propertyDetailsObj)
      : propertyDetailsObj;

    const propertyId = parsedPropertyDetails?.propertyId;
    const totalNight = parsedPropertyDetails?.totalNight || 0;
    const arrivalDate = parsedPropertyDetails?.arrivalDate;
    const departureDate = parsedPropertyDetails?.departureDate;
    const propertyName = parsedPropertyDetails?.fullPropertyName || "";
    const eventHousingId = parsedPropertyDetails?.eventHousingId;

    // Get Housing Info
    const getHousingInfo = await HousingInfo.findOne({
      where: { id: propertyId },
      attributes: ["ID", "OwnerName", "ManagerName", "OwnerEmail", "ManagerEmail"],
      include: [{
        model: EventHousing,
        where: { EventID: eventId },
        attributes: ["ID", "OwnerAmount"],
        separate: true,
        limit: 1,
        order: [['ID', 'DESC']]
      }]
    });

    // Get Previous Booking Info
    const getPrevious = await AccommodationBookingInfo.findOne({
      where: {
        event_id: eventId,
        accommodation_id: propertyId,
        user_id: userId
      },
      attributes: ['id', 'check_in_date', 'check_out_date'],
      order: [['ID', 'DESC']]
    });

    const formatDate = (date) => moment(date).format("MMM DD, YYYY");
    const previousBookingDates = getPrevious?.check_in_date && getPrevious?.check_out_date
      ? `${formatDate(getPrevious.check_in_date)} to ${formatDate(getPrevious.check_out_date)}`
      : "";

    const currentBookinDates = arrivalDate && departureDate
      ? `${formatDate(arrivalDate)} to ${formatDate(departureDate)}`
      : "";

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"]
    });

    const findEvent = await Event.findOne({
      where: {
        id: eventId
      },
      attributes: ["id", "Name"],
      include: [
        {
          model: Currency,
          attributes: ["Currency_symbol", "Currency", "conversion_rate"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const currencySymbol = findEvent?.Currency?.Currency_symbol || '';
    const currencyName = findEvent?.Currency?.Currency || '';

    const housingData = getHousingInfo?.EventHousings?.[0] || {};
    const owner = getHousingInfo?.OwnerName?.trim() || "";
    const manager = getHousingInfo?.ManagerName?.trim() || "";
    const OwnerManagerName = [owner, manager].filter(Boolean).join(" / ") || "house owner / house manager";
    const homeowner = getHousingInfo?.OwnerEmail?.trim() || "";
    const houseManager = getHousingInfo?.ManagerEmail?.trim() || "";
    const perNightOwnerAmt = housingData?.OwnerAmount || 0;
    const totalHouseOwnerToPayout = `${currencySymbol}${formatSmartWithRoundPrice(perNightOwnerAmt * totalNight)} ${currencyName}`;
    const adminFee = adminFees ?? 0;

    let paymentData = await Payment.findOne({ where: { payment_intent: paymentIntentId } });
    if (paymentData) {
      await paymentData.update({ paymentstatus: "succeeded" });
    }

    const {
      totalAccommodationAmount = 0,
      totalAccommodationTax = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      clientsecret = null,
      accommodationAmount = 0,
      paymentOption,
      accommodation_nightlyRate = 0,
      accommodation_basePriceHousing = 0,
      total_night_stay = 0,
      id: paymentId,
      accommodationBankFee = 0,
      accommodationProcessingFee = 0,
      accommodationStripeFee = 0,
      accommodation_nightlyPerDaysRate = 0,
      accommodation_basePerDaysPriceHousing = 0,
      accommodationPerDaysPropertyOwnerAmount = 0,
      accommodationPerDaysServiceFeeAmount = 0,
      accommodationPerDaysMexicanVATAmount = 0,
      accommodationPerDaysTaxAmount = 0,
      accommodationOndalindaPerDaysFeeAmount = 0,
      accommodationOndalindaPerDaysTotalAfterTaxes = 0
    } = paymentData || {};

    const orderResponse = await Order.create({
      user_id: userId,
      Approved: "succeeded",
      TransactionType: "Online",
      paymenttype: "Online",
      order_context: "extension",
      event_id: eventId,
      adminfee: adminFee,
      total_amount: amount,
      actualamount: amount,
      totalCartAmount: amount,
      paymentOption: selectedPaymentOption,
      total_tax_amount: totalTax,
      RRN: paymentIntentId,
      OrderIdentifier: clientsecret,
      book_accommodation_id: propertyId,
      accommodation_nightlyRate,
      accommodation_basePriceHousing,
      total_night_stay,
      totalAccommodationAmount,
      totalAccommodationTax,
      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage,
      accommodationBankFee,
      accommodationProcessingFee,
      accommodationStripeFee,
      accommodation_nightlyPerDaysRate,
      accommodation_basePerDaysPriceHousing,
      accommodationPerDaysPropertyOwnerAmount,
      accommodationPerDaysServiceFeeAmount,
      accommodationPerDaysMexicanVATAmount,
      accommodationPerDaysTaxAmount,
      accommodationOndalindaPerDaysFeeAmount,
      accommodationOndalindaPerDaysTotalAfterTaxes
    });

    const orderId = orderResponse.id;
    const trxnIde = `M-${userId}-${orderId}`;
    await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });

    if (eventHousingId) {
      await EventHousing.update(
        { isDateExtensionRequestedSent: 'B' },
        { where: { id: eventHousingId } }
      );
    }

    let accomadationExtensionBook = null;
    if (propertyId) {
      accomadationExtensionBook = await AccommodationExtension.create({
        user_id: userId,
        event_id: eventId,
        transaction_id: paymentIntentId,
        order_id: orderId,
        payment_id: paymentId || 0,
        first_name: userInfo?.FirstName || '',
        last_name: userInfo?.LastName || '',
        email: userInfo?.Email || '',
        accommodation_id: propertyId,
        total_night_stay: totalNight,
        check_in_date: arrivalDate,
        check_out_date: departureDate,
        total_amount: totalAccommodationAmount,
        qr_code_image: parsedPropertyDetails?.qr_code_image || null
      });

      await orderResponse.update({
        accommodation_bookings_info_id: accomadationExtensionBook?.id || null
      });

      const qrResponse = await generateAccommodationQrToS3({
        user_id: userId,
        event_id: eventId,
        accommodation_id: propertyId,
        check_in_date: arrivalDate,
        check_out_date: departureDate,
        order_id: orderId
      });

      if (qrResponse.success) {
        await accomadationExtensionBook.update({ qr_code_image: qrResponse.filePath });
      }
    }

    // Email to user
    const getTemplateHtml = await Emailtemplet.findOne({
      where: { eventId: eventId, templateId: 42 }
    });

    if (!getTemplateHtml) throw new Error("Email template not found");

    const processedTemplate = createTemplate(getTemplateHtml.description, {
      FirstName: userInfo.FirstName,
      PropertyName: propertyName,
      additionalNights: totalNight,
      CheckOutDate: formatDate(departureDate)
    });
    // lucrecia@ondalinda.com
    await sendEmailWithBCC(userInfo?.Email || '', ['lucrecia@ondalinda.com'], { ALLDATA: processedTemplate }, getTemplateHtml.mandril_template, getTemplateHtml.subject);

    // Email to property owner
    const getTemplateHtmlToHouseOwner = await Emailtemplet.findOne({
      where: { eventId: eventId, templateId: 44 }
    });

    const processedTemplate1 = createTemplate(getTemplateHtmlToHouseOwner.description, {
      UserName: OwnerManagerName,
      propertyName: propertyName,
      PreviousAccommodationBookingDates: previousBookingDates,
      ExtendedAccommodationBookingDates: currentBookinDates,
      ExtensionTotalNights: totalNight,
      amountWithCurrency: totalHouseOwnerToPayout
    });

    const mergeVars1 = { ALLDATA: processedTemplate1 };
    const recipientEmail = houseManager || homeowner;
    const bccEmails = houseManager && homeowner ? [homeowner] : [];

    const isDevUser = [10315, 11492, 10272].includes(userId);
    const houseOwnerEmailSent = isDevUser
      ? await sendEmailWithBCC("kamalrajora123@gmail.com", [], mergeVars1, getTemplateHtmlToHouseOwner.mandril_template, getTemplateHtmlToHouseOwner.subject)
      : recipientEmail && await sendEmailWithBCC(recipientEmail, bccEmails, mergeVars1, getTemplateHtmlToHouseOwner.mandril_template, getTemplateHtmlToHouseOwner.subject);

    if (houseOwnerEmailSent) {
      await accomadationExtensionBook.update({ is_received_property_owner_mail: "Y" });
    }

    return {
      success: true,
      status: 200,
      data: orderId,
      message: "Payment details updated successfully."
    };

  } catch (error) {
    console.error("Error Order Creating createOrderForAccommodation :", error);

    return {
      success: false,
      status: 404,
      message: `Error Order Creating createOrderForAccommodation : ${error.message}`
    };
  }
}

export async function extendAccommodationDateV3(req, res) {
  console.log('----------------------------extendAccommodationDate ---------------------------');

  const {
    paymentIntentId,
    eventId,
    userId,
    amount,
    adminFees,
    propertyDetailsObj,
    totalTax,
    finalPrice,
    selectedPaymentOption
  } = req.body;

  // console.log('req.body', req.body);
  // return false


  try {
    const parsedPropertyDetails = typeof propertyDetailsObj == 'string'
      ? JSON.parse(propertyDetailsObj)
      : propertyDetailsObj;

    const propertyId = parsedPropertyDetails?.propertyId;
    const totalNight = parsedPropertyDetails?.totalNight || 0;
    const arrivalDate = parsedPropertyDetails?.arrivalDate;
    const departureDate = parsedPropertyDetails?.departureDate;
    const propertyName = parsedPropertyDetails?.fullPropertyName || "";

    const getHousingInfo = await HousingInfo.findOne({
      where: { id: propertyId },
      attributes: ["ID", "OwnerName", "ManagerName", "OwnerEmail", "ManagerEmail"],
      include: [{
        model: EventHousing,
        where: { EventID: eventId },
        attributes: ["ID", "OwnerAmount"],
        separate: true,
        limit: 1,
        order: [['ID', 'DESC']]
      }]
    });

    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["PhoneNumber", "LastName", "FirstName", "Email", "ID"]
    });

    let paymentData = await Payment.findOne({ where: { payment_intent: paymentIntentId } });
    if (paymentData) await paymentData.update({ paymentstatus: "succeeded" });

    const {
      totalAccommodationAmount = 0,
      totalAccommodationTax = 0,
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0,
      clientsecret = null,
      accommodationAmount = 0,
      paymentOption,
      accommodation_nightlyRate = 0,
      accommodation_basePriceHousing = 0,
      total_night_stay = 0,
      id: paymentId,
      accommodationBankFee = 0,
      accommodationProcessingFee = 0,
      accommodationStripeFee = 0,
      accommodation_nightlyPerDaysRate = 0,
      accommodation_basePerDaysPriceHousing = 0,
      accommodationPerDaysPropertyOwnerAmount = 0,
      accommodationPerDaysServiceFeeAmount = 0,
      accommodationPerDaysMexicanVATAmount = 0,
      accommodationPerDaysTaxAmount = 0,
      accommodationOndalindaPerDaysFeeAmount = 0,
      accommodationOndalindaPerDaysTotalAfterTaxes = 0
    } = paymentData || {};

    // Check if order already exists
    const existingOrder = await Order.findOne({
      where: {
        user_id: userId,
        event_id: eventId,
        book_accommodation_id: propertyId,
        order_context: "extension"
      },
      order: [["id", "DESC"]]
    });

    let orderResponse = existingOrder;
    let accommodationExtensionBook = null;
    let isNewOrder = false;

    if (!existingOrder) {
      // Create new order
      orderResponse = await Order.create({
        user_id: userId,
        Approved: "succeeded",
        TransactionType: "Online",
        paymenttype: "Online",
        order_context: "extension",
        event_id: eventId,
        adminfee: adminFees ?? 0,
        total_amount: amount,
        actualamount: amount,
        totalCartAmount: amount,
        paymentOption: selectedPaymentOption,
        total_tax_amount: totalTax,
        RRN: paymentIntentId,
        OrderIdentifier: null,
        book_accommodation_id: propertyId,
        totalAccommodationTax,
        ticket_platform_fee_percentage,
        ticket_stripe_fee_percentage,
        ticket_bank_fee_percentage,
        ticket_processing_fee_percentage,
        accommodation_nightlyRate,
        accommodation_basePriceHousing,
        total_night_stay,
        totalAccommodationAmount,
        accommodationBankFee,
        accommodationProcessingFee,
        accommodationStripeFee,
        accommodation_nightlyPerDaysRate,
        accommodation_basePerDaysPriceHousing,
        accommodationPerDaysPropertyOwnerAmount,
        accommodationPerDaysServiceFeeAmount,
        accommodationPerDaysMexicanVATAmount,
        accommodationPerDaysTaxAmount,
        accommodationOndalindaPerDaysFeeAmount,
        accommodationOndalindaPerDaysTotalAfterTaxes
      });

      const trxnIde = `M-${userId}-${orderResponse.id}`;
      await orderResponse.update({ OriginalTrxnIdentifier: trxnIde });
      isNewOrder = true;

      // Create AccommodationExtension
      accommodationExtensionBook = await AccommodationExtension.create({
        user_id: userId,
        event_id: eventId,
        transaction_id: paymentIntentId,
        order_id: orderResponse.id,
        payment_id: paymentId || 0,
        first_name: userInfo?.FirstName || '',
        last_name: userInfo?.LastName || '',
        email: userInfo?.Email || '',
        accommodation_id: propertyId,
        total_night_stay: totalNight,
        check_in_date: arrivalDate,
        check_out_date: departureDate,
        total_amount: totalAccommodationAmount,
        qr_code_image: parsedPropertyDetails?.qr_code_image || null
      });

      await orderResponse.update({
        accommodation_bookings_info_id: accommodationExtensionBook?.id || null
      });

      // Generate QR
      try {
        const qrResponse = await generateAccommodationQrToS3({
          user_id: userId,
          event_id: eventId,
          accommodation_id: propertyId,
          check_in_date: arrivalDate,
          check_out_date: departureDate,
          order_id: orderResponse.id
        });

        if (qrResponse?.success) {
          await accommodationExtensionBook.update({ qr_code_image: qrResponse.filePath });
        }
      } catch (err) {
        console.warn("QR generation failed:", err.message);
      }
    }

    return res.json({
      success: true,
      status: 200,
      data: {
        order: orderResponse,
        parsedPropertyDetails,
        isNewOrder,
        paymentData
      },
      message: isNewOrder
        ? "New order created successfully."
        : "Existing order found."
    });

  } catch (error) {
    console.error("Error in extendAccommodationDateV3:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: `Error in extendAccommodationDateV3: ${error.message}`
    });
  }
}
