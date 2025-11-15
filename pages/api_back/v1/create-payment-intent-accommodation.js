// pages/api/create-payment-intent.js
import Stripe from "stripe";
import { createPaymentIndentation } from "@/shared/services/front/accommodation_payment_service";
// import { generateQR } from "../../../utils/qrGenerator";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        userId,
        eventId,
        firstName,
        lastName,
        email,
        currency,
        selectedPaymentOption,
        adminFees,
        finalPrice,
        amount,
        totalTax,
        couponDetails,
        roundedAccomoTotalAmount,
        donationFees,
        bookingDates,
        cart,
        propertyDetails,
        nights,
        breakdown
      } = req.body;

      let stripe;
      if (userId && userId == 10272 || userId == 10315 || userId == 11492) {
        stripe = new Stripe(process.env.STRIPE_DEV_SECRET_KEY);
      } else {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      }

      let cardDataString = null;
      if (cart.length > 0) {
        const cardData = cart.map((item) => ({
          cartId: item.id,
          ticketType: item.ticket_type,
          noTickets: item.no_tickets,
          ticketId:
            item.ticket_type == "ticket" ? item.ticket_id : item.addons_id,
          price:
            item.ticket_type == "ticket"
              ? item.EventTicketType.price
              : item.Addon.price,
        }));
        cardDataString = JSON.stringify(cardData);
      }

      let order_items_serialize = req.body;
      let couponData = {
        coupon_code: couponDetails.code,
        discount_type: couponDetails.discount_type,
        discount_value: couponDetails.discount_value,
        discount_amount: couponDetails.discountAmt,
        applicable_for: couponDetails.applicable_for,
      };
      // Accommodation pricing
      const basePriceHousing = Number(breakdown?.basePriceHousing || 0);
      const nightlyRate = Number(breakdown?.nightlyRate || 0);
      const propertyOwnerAmount = Number(breakdown?.propertyOwnerAmount || 0);

      let propertyDetailsObj = {
        propertyId: propertyDetails.id,
        no_of_bedrooms: propertyDetails.NumBedrooms,
        totalAccommodationAmount: roundedAccomoTotalAmount,
        arrivalDate: bookingDates.arrivalDate,
        departureDate: bookingDates.departureDate,
        totalNight: nights,
        perNightOwnerAmount: propertyOwnerAmount,
        nightlyPrice: nightlyRate,
        basePriceHousing
      }

      const customer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        email: email,
      });
      // Create a PaymentIntent with the customer ID
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: currency,
        payment_method_types: ["card"],
        // automatic_payment_methods: {
        //   enabled: true,
        // },
        customer: customer.id,
        metadata: {
          eventId: String(eventId),
          userId: String(userId),
          selectedPaymentOption: String(selectedPaymentOption),
          amount: String(amount),
          finalPrice: String(finalPrice),
          totalTax: String(totalTax),
          adminFees: String(adminFees),
          donationFees: String(donationFees),
          cartData: cardDataString,
          // paymentBreakDown: JSON.stringify(breakdown),
          couponDetails: JSON.stringify(couponData),
          propertyDetailsObj: JSON.stringify(propertyDetailsObj),
        },
      });

      const response = await createPaymentIndentation({
        userId,
        eventId,
        amount,
        finalPrice,
        totalTax,
        breakdown,
        roundedAccomoTotalAmount,
        currency,
        name: firstName + ' ' + lastName,
        email,
        couponDetails,
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent.id,
        adminFees,
        selectedPaymentOption,
        order_items_serialize,
        propertyDetailsObj
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
