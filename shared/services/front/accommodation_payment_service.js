import {
  CartModel,
  Payment,
  Addons,
  User,
  EventTicketType,
} from "@/database/models";
import { Op } from "sequelize";

export async function createPaymentIndentation({
  userId,
  eventId,
  amount,
  name,
  email,
  breakdown = {},
  couponDetails = {},
  clientSecret,
  paymentIntent,
  adminFees,
  finalPrice,
  totalTax,
  roundedAccomoTotalAmount,
  selectedPaymentOption,
  order_items_serialize,
  propertyDetailsObj
}) {
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    // Destructure values from breakdown
    const {
      ticketTotal = 0,
      addonTotal = 0,
      ticketTax = 0,
      addonTax = 0,
      halfAccommodation = 0,
      nightlyRate = 0,
      basePriceHousing = 0,
      nights = 0,
      accommodationTotal = 0,
      accommodationTax = 0,
      propertyOwnerAmount = 0,
      ticketTaxBreakdown = {},
      ticketingFeeDetails = {}
    } = breakdown;

    const {
      ticketPlatformFee = 0,
      ticketStripeFee = 0,
      ticketBankFee = 0,
      ticketProcessingFee = 0,
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
    } = ticketTaxBreakdown;

    const {
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0
    } = ticketingFeeDetails;

    const {
      discount_type = null,
      discount_value = null,
      discountAmt: discount_amount = 0,
      code: couponCode = null
    } = couponDetails;

    const userFullName = `${user.FirstName} ${user.LastName}`;
    const userEmail = user.Email;

    // Fetch cart items
    const cartData = await CartModel.findAll({
      where: { user_id: userId },
    });

    // Count tickets and addons
    let totalTicket = 0;
    let totalAddon = 0;

    cartData.forEach(({ ticket_type, no_tickets }) => {
      if (ticket_type === "ticket") totalTicket += no_tickets || 0;
      else if (ticket_type === "addon") totalAddon += no_tickets || 0;
    });

    // Create payment record
    await Payment.create({
      user_id: userId,
      event_id: eventId,
      amount,
      fee_details_json: JSON.stringify(breakdown),
      totalDueAmountWithTax: selectedPaymentOption == 'partial' ? halfAccommodation : null,
      totalCartAmount: finalPrice,
      totalTaxes: totalTax,
      name: userFullName,
      email: userEmail,
      totalticket: totalTicket,
      totaladdon: totalAddon,
      clientsecret: clientSecret,
      paymentstatus: "Pending",
      payment_intent: paymentIntent,
      discountType: discount_type,
      couponCode,
      discountValue: discount_value,
      discountAmount: discount_amount,
      adminfee: adminFees,
      order_items: JSON.stringify(order_items_serialize),
      accommodationAmount: roundedAccomoTotalAmount,
      isAccommodation: roundedAccomoTotalAmount > 0 ? 'Y' : 'N',
      paymentOption: selectedPaymentOption,
      totalAddonAmount: addonTotal,
      totalAddonTax: addonTax,
      totalTicketAmount: ticketTotal,
      totalTicketTax: ticketTax,
      totalAccommodationAmount: accommodationTotal,
      totalAccommodationTax: accommodationTax,
      ticketPlatformFee,
      ticketProcessingFee,
      ticketBankFee,
      ticketStripeFee,
      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage,
      total_night_stay: nights,

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
      accommodationOndalindaPerDaysTotalAfterTaxes,
    });

    return {
      success: true,
      status: 200,
      message: "Payment indent has been created successfully.",
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw new Error(error.message);
  }
}


export async function createPaymentIndentationPartial({
  userId,
  eventId,
  amount,
  currency,
  name,
  email,
  clientSecret,
  paymentIntent,
  adminFees,
  OriginalTrxnIdentifier,
  selectedPaymentOption
}) {
  try {


    // Create payment record
    const resss = await Payment.create({
      user_id: userId,
      event_id: eventId,
      amount: amount,
      totalCartAmount: 0,
      totalTaxes: 0,
      name: name,
      email: email,
      totalticket: 0,
      totaladdon: 0,
      clientsecret: clientSecret,
      paymentstatus: "Pending",
      payment_intent: paymentIntent,
      adminfee: adminFees,
      paymentOption: selectedPaymentOption
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


// function to create payment intent for extend date of accommodations 
export async function createPaymentIntentForExtendAccommodation({
  userId,
  eventId,
  amount,
  finalPrice,
  totalTax,
  breakdown = {},
  currency,
  name,
  email,
  clientSecret,
  paymentIntent,
  adminFees,
  selectedPaymentOption,
  propertyDetailsObj,
  roundedAccomoTotalAmount
}) {
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    const userFullName = `${user.FirstName} ${user.LastName}`;
    const userEmail = user.Email;

    // Extract accommodation-related fields from breakdown
    const {
      halfAccommodation = 0,
      nightlyRate = 0,
      basePriceHousing = 0,
      nights = 0,
      accommodationTotal = 0,
      accommodationTax = 0,
      propertyOwnerAmount = 0,
      ticketTaxBreakdown = {},
      ticketingFeeDetails = {}
    } = breakdown;

    const {
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
    } = ticketTaxBreakdown;

    const {
      ticket_platform_fee_percentage = 0,
      ticket_stripe_fee_percentage = 0,
      ticket_bank_fee_percentage = 0,
      ticket_processing_fee_percentage = 0
    } = ticketingFeeDetails;

    await Payment.create({
      user_id: userId,
      event_id: eventId,
      amount,
      totalDueAmountWithTax: 0,
      totalCartAmount: finalPrice,
      totalTaxes: totalTax,
      name: userFullName,
      email: userEmail,
      clientsecret: clientSecret,
      paymentstatus: "Pending",
      payment_intent: paymentIntent,
      adminfee: adminFees,
      accommodationAmount: accommodationTotal,
      isAccommodation: accommodationTotal > 0 ? 'Y' : 'N',
      paymentOption: selectedPaymentOption,
      totalAccommodationAmount: accommodationTotal,
      totalAccommodationTax: accommodationTax,
      total_night_stay: nights,

      ticket_platform_fee_percentage,
      ticket_stripe_fee_percentage,
      ticket_bank_fee_percentage,
      ticket_processing_fee_percentage,

      // Accommodation breakdowns
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
      accommodationOndalindaPerDaysTotalAfterTaxes,
    });

    return {
      success: true,
      status: 200,
      message: "Payment intent has been created successfully.",
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw new Error(error.message);
  }
}

