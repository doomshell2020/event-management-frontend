import Stripe from "stripe";
import { cancelOrder } from "@/shared/services/front/order_service";

// API handler
export default async function handler(req, res) {
  if (req.method == "POST") {
    const {
      action,
      paymentIntentId,
      userId,
      orderId,
      requested_by,
      refund_reason,
      refund_details,
    } = req.body;

    // Initialize Stripe based on user ID
    const stripe = new Stripe(
      userId && userId == 10272
        ? process.env.STRIPE_DEV_SECRET_KEY
        : process.env.STRIPE_SECRET_KEY
    );

    try {
      if (action == "refund" && paymentIntentId) {
        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        // Check if the payment intent has succeeded
        if (
          paymentIntent.status == "succeeded" &&
          paymentIntent.latest_charge
        ) {
          const chargeId = paymentIntent.latest_charge;

          // Handle refund reason
          const validReasons = [
            "duplicate",
            "fraudulent",
            "requested_by_customer",
          ];
          const reasonToUse =
            refund_reason == "other"
              ? refund_details || "Other reason not provided"
              : validReasons.includes(refund_reason)
              ? refund_reason
              : "requested_by_customer"; // Default fallback

          // Create refund
          const refund = await stripe.refunds.create({
            charge: chargeId,
            reason: validReasons.includes(refund_reason)
              ? refund_reason
              : undefined,
            metadata: {
              refund_reason: refund_reason,
              refund_details: refund_details,
              requested_by: requested_by,
            },
          });

          // Cancel the order
          const cancelOrders = await cancelOrder(req, res, { refund });

          return res.status(200).json({
            success: true,
            message: "Payment refunded successfully.",
            data: cancelOrders,
          });
        } else {
          // If payment has not been captured, cancel the payment intent
          const canceledPaymentIntent = await stripe.paymentIntents.cancel(
            paymentIntentId
          );
          return res.status(200).json({
            success: true,
            message: "Payment intent canceled successfully.",
            data: canceledPaymentIntent,
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: "Invalid request. Missing action or parameters.",
      });
    } catch (error) {
      console.error("Error in canceling/refunding:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing the request: " + error.message,
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }
}
