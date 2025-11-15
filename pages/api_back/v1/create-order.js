// pages/api/create-order.js
import {
  createOrder,
  createOrderV2,
  createOrderForAccommodation,
  getOrderDetails,
  getPaymentInfo,
  generateFreeTicket,
  resendOrderEmailToMember,
  cancelOrder,
  cancelTicket,
  cancelAddon,
  OrderEmailTest,
  updateDueAmount,
  extendAccommodationDate
} from "@/shared/services/front/order_service";
import fs from "fs";
import path from "path";
import Stripe from "stripe";


export default async function handler(req, res) {
  if (req.method == "POST") {
    try {
      // Extract necessary fields from the request body
      const { key, paymentIntentId, eventId, userId, propertyDetailsObj, totalTax, finalPrice, selectedPaymentOption, paymentBreakDown, isExtension } = req.body;



      let parsedPropertyDetails = null;
      parsedPropertyDetails = typeof propertyDetailsObj == 'string'
        ? JSON.parse(propertyDetailsObj)
        : propertyDetailsObj ?? null;

      if (isExtension == true || isExtension == 'true') {
        console.log('>>>>>>>>>>>>>>>>function called with isExtension true');

        const response = await extendAccommodationDate(req, res);
        return res.json(response);
      } else if (key == "free_ticket") {
        const freeTicket = await generateFreeTicket(req, res);
        res.status(200).json(freeTicket);
      } else if (key == "resend_order") {
        const resendOrderEmail = await resendOrderEmailToMember(req, res);
        res.status(200).json(resendOrderEmail);
      }
      //  else if (key == "resend_tickets") {
      //   const resendTicketEmail = await resendTicketToMember(req, res);
      //   res.status(200).json(resendTicketEmail);
      // }
      else if (key == "cancel_orders") {
        const cancelOrders = await cancelOrder(req, res);
        res.status(200).json(cancelOrders);
      } else if (key == "cancel_ticket") {
        const cancelTickets = await cancelTicket(req, res);
        res.status(200).json(cancelTickets);
      } else if (key == "cancel_addon") {
        const cancelAddons = await cancelAddon(req, res);
        res.status(200).json(cancelAddons);
      } else if (key == "test_orderEmail") {
        const testOrderEmail = await OrderEmailTest(req, res);
        res.status(200).json(testOrderEmail);
      }

      // Ensure all required fields are provided
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Missing required fields paymentIntentId" });
      }

      let newOrder = null;
      if (selectedPaymentOption == 'due') {
        newOrder = await updateDueAmount(req, res);

      } else if (parsedPropertyDetails && parsedPropertyDetails.propertyId) {
        newOrder = await createOrderForAccommodation(req, res);
      } else {
        newOrder = await createOrderV2(req, res);
      }

      return res.json(newOrder);

    } catch (error) {
      // logErrorToFile(error);
      console.log(
        "Error In createOrder Function =>>>>>>>>>>>>>>>>:" + error.message
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  } else if (req.method == "GET") {

    const { payment_intent, payment_intent_client_secret, action, userId } = req.query;

    if (!payment_intent) {
      return res.status(400).json({ success: false, message: "Missing payment_intent" });
    }
    const isDevUser = [10315, 11492, 10272].includes(Number(userId));
    const stripe = new Stripe(
      (process.env.NODE_ENV == 'development' || isDevUser)
        ? process.env.STRIPE_DEV_SECRET_KEY
        : process.env.STRIPE_SECRET_KEY
    );


    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
      // console.log('>>>>>>>>>>>>>>>>>>>>>>', paymentIntent.status);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: "Payment not successful" });
      }

      // If 'action' is 'partial', return limited data
      if (action == 'partial') {
        const data = await getPaymentInfo(req, res);
        return res.status(200).json(data);
      }

      // ✅ Safely parse metadata
      const metadata = parseStripeMetadata(paymentIntent.metadata);
      const orderData = await getOrderDetails({ payment_intent, getPaymentMetaInfo: metadata });
      return res.status(200).json(orderData);

    } catch (error) {
      console.error("Stripe error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    // Handle other HTTP methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


// ✅ Utility to safely parse all metadata values
function parseStripeMetadata(metadata) {
  const parsed = {};

  for (const [key, value] of Object.entries(metadata)) {
    try {
      parsed[key] = JSON.parse(value);
    } catch {
      // Convert numeric strings to numbers, otherwise keep as string
      parsed[key] = /^\d+(\.\d+)?$/.test(value) ? Number(value) : value;
    }
  }

  return parsed;
}


function logErrorToFile(error) {
  const logDir = path.join(process.cwd(), "logs"); // Logs directory
  console.log(">>>>>>>>>>>>>>>>Log>>>>>>>>>>>>>>>>>", logDir);

  const logFile = path.join(logDir, "error-log.txt"); // Log file path
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const errorMessage = `${new Date().toISOString()} - ${error.message
    }\nStack Trace:\n${error.stack}\n\n`;
  fs.appendFileSync(logFile, errorMessage, "utf8");
}
