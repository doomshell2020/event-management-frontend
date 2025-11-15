// pages/api/create-payment-intent.js
import Stripe from "stripe";
import { createPaymentIndentationPartial } from "@/shared/services/front/accommodation_payment_service";
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
        amount,
        adminFees,
        OriginalTrxnIdentifier
      } = req.body;

      let stripe;
      if (userId && userId == 10272 || userId == 10315 || userId == 11492) {
        stripe = new Stripe(process.env.STRIPE_DEV_SECRET_KEY);
      } else {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
          selectedPaymentOption: String('due'),
          amount: String(amount),
          email: email,
          OriginalTrxnIdentifier: String(OriginalTrxnIdentifier),
        },
      });

      const response = await createPaymentIndentationPartial({
        userId,
        eventId,
        currency,
        amount,
        name: firstName + ' ' + lastName,
        email,
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent.id,
        selectedPaymentOption: 'due',
        OriginalTrxnIdentifier, adminFees
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
