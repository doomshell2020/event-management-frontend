// pages/api/create-payment-intent.js
import Stripe from "stripe";
import { createPaymentIndentation, createPaymentIntentForExtendAccommodation } from "@/shared/services/front/accommodation_payment_service";
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
        roundedAccomoTotalAmount,
        extendDetails,
        nights,
        breakdown,
        fullPropertyName
      } = req.body;

      let stripe;
      if (userId && userId == 10272 || userId == 10315 || userId == 11492) {
        stripe = new Stripe(process.env.STRIPE_DEV_SECRET_KEY);
      } else {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      }

      let order_items_serialize = req.body;
      // Accommodation pricing
      const basePriceHousing = Number(breakdown?.basePriceHousing || 0);
      const nightlyRate = Number(breakdown?.nightlyRate || 0);
      const propertyOwnerAmount = Number(breakdown?.propertyOwnerAmount || 0);

      let propertyDetailsObj = {
        propertyId: extendDetails.HousingID,
        totalAccommodationAmount: roundedAccomoTotalAmount,
        arrivalDate: extendDetails.extensionCheckInDate,
        departureDate: extendDetails.extensionCheckOutDate,
        totalNight: nights,
        perNightOwnerAmount: propertyOwnerAmount,
        nightlyPrice: nightlyRate,
        basePriceHousing, fullPropertyName,
        eventHousingId: extendDetails.id
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
        customer: customer.id,
        metadata: {
          eventId: String(eventId),
          userId: String(userId),
          selectedPaymentOption: String(selectedPaymentOption),
          amount: String(amount),
          finalPrice: String(finalPrice),
          totalTax: String(totalTax),
          adminFees: String(adminFees),
          isExtension: "true", // 👈 clear and safe key name
          propertyDetailsObj: JSON.stringify(propertyDetailsObj),
        },
      });

      const response = await createPaymentIntentForExtendAccommodation({
        userId,
        eventId,
        amount,
        finalPrice,
        totalTax,
        breakdown,
        currency,
        name: firstName + ' ' + lastName,
        email,
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent.id,
        adminFees,
        selectedPaymentOption,
        propertyDetailsObj,
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
