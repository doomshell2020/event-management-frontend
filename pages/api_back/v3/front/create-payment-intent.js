// pages/api/create-payment-intent.
import Stripe from "stripe";
import { createPaymentIndentation,createNewPaymentIndentation } from "@/shared/services/v3/front/create_payment_intent";
import { checkApiKey } from '@/middleware/checkApiKey';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handler = async (req, res) => {
  return checkApiKey(req, res, async () => {
    try {
      const { method, query } = req;

      if (method == "POST") {
        try {
          const response = await createNewPaymentIndentation(req, res);
        } catch (error) {
          res.status(500).json({ success: false,error: error.message });
        }
      } if (method == "GET") {

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
        return res.status(400).json({
          success: false,
          message: `Method ${req.method} Not Allowed`,
        });
      }
    } catch (err) {
      return res.status(400).json({
        error_code: "api_one",
        success: false,
        message: err.message,
      });
    }
  });
};

export default handler;