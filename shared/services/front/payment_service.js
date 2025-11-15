import {
  CartModel,
  Payment,
  Addons,
  User,
  EventTicketType,
} from "../../../database/models";
import { Op } from "sequelize";

export async function createPaymentIndentation({
  userId,
  eventId,
  amount,
  totalTax,
  currency,
  name,
  email,
  couponDetails,
  clientSecret,
  paymentIntent,
  adminFees,
  order_items_serialize,
  breakdown
}) {
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      ticketTotal = 0,
      addonTotal = 0,
      totalTicketAndAddonPrice = 0,
      discountAmount = 0,
      totalAfterDiscount = 0,
      ticketTax = 0,
      addonTax = 0,
      totalTax = 0,
      finalTotalAmount = 0,
      partialPayableAmount = 0,
      payableAmount = 0,
      ticketTaxBreakdown = {},
      ticketingFeeDetails = {}
    } = breakdown || {};

    const {
      ticketPlatformFee = 0,
      ticketStripeFee = 0,
      ticketBankFee = 0,
      ticketProcessingFee = 0
    } = ticketTaxBreakdown || {};

    const {
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0
    } = ticketingFeeDetails || {};



    // console.log('=>>>>>>>>>>>>>', ticketPlatformFee, ticketStripeFee, ticketBankFee, ticketProcessingFee);



    const discount_type = couponDetails?.discount_type || null;
    const discount_value = couponDetails?.discount_value || null;
    const discount_amount = couponDetails?.discountAmt || 0;
    const code = couponDetails?.code || null;

    const userFullName = `${user.FirstName} ${user.LastName}`;
    const userEmail = user.Email;
    // Get Cart Data
    const cartData = await CartModel.findAll({
      where: {
        user_id: userId,
      },
    });

    // Initialize totals
    let totalTicket = 0;
    let totalAddon = 0;

    // Calculate totals using reduce
    cartData.forEach((cartItem) => {
      if (cartItem.ticket_type === "ticket") {
        totalTicket += cartItem.no_tickets || 0; // Handle null count
      } else if (cartItem.ticket_type === "addon") {
        totalAddon += cartItem.no_tickets || 0; // Handle null count
      }
    });

    // Create payment record
    await Payment.create({
      user_id: userId,
      event_id: eventId,
      amount,
      totalCartAmount: payableAmount,
      totalTaxes: totalTax,
      name: userFullName,
      email: userEmail,
      totalticket: totalTicket,
      totaladdon: totalAddon,
      clientsecret: clientSecret,
      paymentstatus: "Pending",
      payment_intent: paymentIntent,
      discountType: discount_type,
      couponCode: code,
      discountValue: discount_value,
      discountAmount: discountAmount,
      adminfee: adminFees,
      order_items: JSON.stringify(order_items_serialize),
      totalAddonAmount: addonTotal,
      totalAddonTax: addonTax,
      totalTicketAmount: ticketTotal,
      totalTicketTax: ticketTax,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketBankFee,
      ticketStripeFee,
      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage

    });


    return {
      success: true,
      status: 200,
      message: "Payment indent has been created successfully.",
    };
  } catch (error) {
    console.error("Error :", error.message);
    throw new Error(error.message);
  }
}

// Function to get cart data for a specific user
export async function getCartByUserId(userId) {
  try {
    const cartData = await CartModel.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: EventTicketType,
          attributes: ["title", "price", "count"], // Fields from EventTicketType
          required: false, // Ensure the join still works if no ticket is present
        },
        {
          model: Addons,
          attributes: ["name", "price", "count"], // Fields from Addons
          required: false, // Ensure the join still works if no addon is present
        },
      ],
    });

    return cartData;
  } catch (error) {
    console.error("Error fetching cart data:", error);
    throw new Error("Failed to retrieve cart data");
  }
}
