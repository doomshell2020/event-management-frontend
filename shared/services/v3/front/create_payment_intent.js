import {
  CartModel,
  Payment,
  Addons,
  User,
  EventTicketType,
} from "@/database/models";
import { Op } from "sequelize";

export async function createPaymentIndentation(req, res) {

    const { userId, eventId, amount, totalTax, currency, name, email, couponDetails, clientSecret, paymentIntent, adminFees, order_items_serialize, breakdown } = req.body;

    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
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
            if (cartItem.ticket_type == "ticket") {
                totalTicket += cartItem.no_tickets || 0; // Handle null count
            } else if (cartItem.ticket_type == "addon") {
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
            paymentstatus: "Pending",
            clientsecret: clientSecret,
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

        return res
            .status(200)
            .json({
                success: true,
                status: 200,
                message: "Payment indent has been created successfully.",
            });

        // return {
        //     success: true,
        //     status: 200,
        //     message: "Payment indent has been created successfully.",
        // };
    } catch (error) {
        console.error("Error :", error.message);
        throw new Error(error.message);
    }
}

export async function createNewPaymentIndentation(req, res) {
  const {
    userId,
    eventId,
    amount,
    totalTax,
    currency,
    name,
    email,
    couponDetails = {},
    clientSecret,
    paymentIntent,
    adminFees,
    order_items_serialize,
    breakdown = {},
    finalPrice,
    roundedAccomoTotalAmount,
    selectedPaymentOption,
    propertyDetailsObj,
  } = req.body;


  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- Destructure Ticket/Addon + Accommodation breakdown values ---
    const {
      ticketTotal = 0,
      addonTotal = 0,
      totalTicketAndAddonPrice = 0,
      discountAmount = 0,
      totalAfterDiscount = 0,
      ticketTax = 0,
      addonTax = 0,
      finalTotalAmount = 0,
      partialPayableAmount = 0,
      payableAmount = 0,
      ticketTaxBreakdown = {},
      ticketingFeeDetails = {},

      // accommodation-related fields
      halfAccommodation = 0,
      nightlyRate = 0,
      basePriceHousing = 0,
      nights = 0,
      accommodationTotal = 0,
      accommodationTax = 0,
      propertyOwnerAmount = 0,
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
      ticket_processing_fee_percentage = 0,
    } = ticketingFeeDetails;

    const {
      discount_type = null,
      discount_value = null,
      discountAmt: discount_amount = 0,
      code: couponCode = null,
    } = couponDetails;

    const userFullName = `${user.FirstName} ${user.LastName}`;
    const userEmail = user.Email;

    // --- Fetch cart items ---
    const cartData = await CartModel.findAll({
      where: { user_id: userId },
    });

    let totalTicket = 0;
    let totalAddon = 0;

    cartData.forEach(({ ticket_type, no_tickets }) => {
      if (ticket_type == "ticket") totalTicket += no_tickets || 0;
      else if (ticket_type == "addon") totalAddon += no_tickets || 0;
    });

    // --- Create Payment record ---
    await Payment.create({
      user_id: userId,
      event_id: eventId,
      amount,
      currency,
      name: name || userFullName,
      email: email || userEmail,

      // Common totals
      totalCartAmount: finalPrice || payableAmount,
      totalTaxes: totalTax,
      totalticket: totalTicket,
      totaladdon: totalAddon,
      paymentstatus: "Pending",
      clientsecret: clientSecret,
      payment_intent: paymentIntent,

      // Coupon
      discountType: discount_type,
      couponCode,
      discountValue: discount_value,
      discountAmount: discount_amount,

      // Fees
      adminfee: adminFees,

      // Save raw request
      order_items: JSON.stringify(order_items_serialize),
      fee_details_json: JSON.stringify(breakdown),

      // Ticket + Addon
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
      ticket_processing_fee_percentage,

      // Accommodation
      accommodationAmount: roundedAccomoTotalAmount,
      isAccommodation: roundedAccomoTotalAmount > 0 ? "Y" : "N",
      paymentOption: selectedPaymentOption,
      totalAccommodationAmount: accommodationTotal,
      totalAccommodationTax: accommodationTax,
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

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Payment indent has been created successfully.",
    });
  } catch (error) {
    console.error("Error :", error.message);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Failed to create payment intent: " + error.message,
    });
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

