// pages/api/create-payment-intent.js
import Stripe from "stripe";
import { createPaymentIndentation } from "@/shared/services/front/payment_service";
// import { generateQR } from "../../../utils/qrGenerator";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        userId,
        eventId,
        amount,
        currency,
        name,
        email,
        couponDetails,
        adminFees,
        donationFees,
        cart,
        totalTax,
        breakdown
      } = req.body;

      let stripe;
      if (userId && userId == 10272) {
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
            item.ticket_type === "ticket" ? item.ticket_id : item.addons_id,
          price:
            item.ticket_type === "ticket"
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

      const customer = await stripe.customers.create({
        name: name,
        email: email,
      });
      // Create a PaymentIntent with the customer ID
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: currency,
        payment_method_types: ["card"],
        customer: customer.id,
        metadata: {
          eventId: eventId, // Include userId in metadata
          userId: userId, // Include userId in metadata
          cartData: cardDataString,
          adminFees,
          amount,
          totalTax: totalTax,
          donationFees,
          couponDetails: JSON.stringify(couponData),
          // paymentBreakDown: JSON.stringify(breakdown),

        },
      });

      const response = await createPaymentIndentation({
        userId,
        eventId,
        amount,
        totalTax,
        currency,
        name,
        email,
        couponDetails,
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent.id,
        adminFees,
        order_items_serialize,
        breakdown
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method == "GET") {

    if (req.method !== "GET") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const paymentIntentId = req.query.payment_intent;
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "Missing payment_intent" });
    }

    const isDev = process.env.NODE_ENV == 'development';
    const stripeSecret = isDev
      ? process.env.STRIPE_DEV_SECRET_KEY
      : process.env.STRIPE_SECRET_KEY;

    const stripe = new Stripe(stripeSecret);

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return res.json({
        success: paymentIntent.status == 'succeeded',
        message: paymentIntent.status == 'succeeded'
          ? 'Payment succeeded'
          : 'Payment not successful',
        status: paymentIntent.status
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
