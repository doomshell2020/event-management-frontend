import { buffer } from "micro";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Disable body parsing so we can get the raw body
  },
};

const handler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.created":
      const paymentIntentData = event.data.object;
      const paymentIntentId = paymentIntentData.id;
      console.log(">>>>>>>>>>> stripe-webhook-file Payment intent created : " + paymentIntentId);
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const { metadata } = paymentIntent;

      let {
        eventId,
        userId,
        adminFees,
        donationFees,
        propertyDetailsObj: rawPropertyDetailsObj = null,
        totalTax,
        finalPrice,
        isExtension,
        amount,
        selectedPaymentOption,
        cartData: rawCartData,
        couponDetails: rawCouponDetails,
        OriginalTrxnIdentifier,
      } = metadata;

      // console.log('------------------stripe webhook metadata--------------------', metadata);
      // console.log('------------------stripe webhook metadata--------------------', rawPropertyDetailsObj);

      // Convert string to numbers
      eventId = Number(eventId);
      userId = Number(userId);
      adminFees = Number(adminFees);
      donationFees = Number(donationFees);
      totalTax = Number(totalTax);
      finalPrice = Number(finalPrice);
      amount = Number(amount);

      // Validate essential fields
      if (!userId || !eventId) {
        console.log("❌ Missing required metadata fields: userId or eventId.");
        return res.status(400).json({
          success: false,
          message: "Missing required metadata fields: userId or eventId.",
        });
      }

      // ✅ Parse cartData safely
      let cartData = null;
      try {
        cartData = rawCartData ? JSON.parse(rawCartData) : null;
      } catch (error) {
        console.error("❌ Invalid cartData format");
        return res.status(400).json({
          success: false,
          message: "Invalid cartData format. It should be a JSON array.",
        });
      }

      // ✅ Parse couponDetails safely
      let couponDetails = null;
      try {
        couponDetails = rawCouponDetails ? JSON.parse(rawCouponDetails) : null;
      } catch (err) {
        console.warn("⚠️ Failed to parse couponDetails, setting to null.");
        couponDetails = null;
      }

      // ✅ Parse propertyDetailsObj safely
      let propertyDetailsObj = null;
      try {
        propertyDetailsObj = rawPropertyDetailsObj ? JSON.parse(rawPropertyDetailsObj) : null;
      } catch (err) {
        console.warn("⚠️ Failed to parse propertyDetailsObj, setting to null.");
        propertyDetailsObj = null;
      }

      // Validation: At least one must be valid
      const isCartDataValid = Array.isArray(cartData) && cartData.length > 0;
      const isPropertyObjValid =
        propertyDetailsObj &&
        typeof propertyDetailsObj === 'object' &&
        Object.keys(propertyDetailsObj).length > 0;

      const isDuePayment = selectedPaymentOption === "due" || !!OriginalTrxnIdentifier;

      if (!isDuePayment && !isCartDataValid && !isPropertyObjValid) {
        return res.status(400).json({
          success: false,
          message: "Either cartData or propertyDetailsObj must have valid data.",
        });
      }

      // ✅ Final payload
      const payload = {
        paymentIntentId: paymentIntent.id,
        amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        cartData,
        couponDetails,
        eventId,
        userId,
        adminFees,
        donationFees,
        propertyDetailsObj,
        totalTax,
        finalPrice,
        isExtension,
        selectedPaymentOption,
        OriginalTrxnIdentifier
      };


      // console.log('-----------------------------payload---------------------------------',payload);
      // console.log('-----------------------------propertyDetailsObj---------------------------------',propertyDetailsObj);
      // console.log('-----------------------------propertyDetailsObj---------------------------------',cartData);
      // return false;
      

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/v1/create-order`,
          payload
        );
        console.log("✅ Order created successfully.");
      } catch (err) {
        console.error("❌ Error creating order: ", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to create order: " + err.message,
        });
      }

      break;

    case "payment_intent.payment_failed":
      const paymentFailedIntent = event.data.object;
      console.log(`PaymentIntent failed: ${paymentFailedIntent.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

export default handler;
