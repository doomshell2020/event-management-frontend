// pages/api/create-order.js
import {
    handleCouponCreation
  } from "@/shared/services/front/coupons_service";

  
  export default async function handler(req, res) {
    if (req.method === "POST") {
      try {
        // Extract necessary fields from the request body
        const {key } = req.body;
        // console.log('>>>>>>>>',req.body);
        if (key == "create_coupon") {
          const createCoupon = await handleCouponCreation(req, res);
          res.status(200).json(createCoupon);
        } else if ((key == "resend_order")) {
        } else if ((key == "resend_tickets")) {
        }
  
      } catch (error) {
        console.log(
          "Error In createOrder Function =>>>>>>>>>>>>>>>>:" + error.message
        );
        return res.status(500).json({ error: error.message });
      }
    } else if (req.method === "GET") {
      try {
        const {  } = req.query;
        //   console.log('>>>>>>>>',req.query);
  
        return res.status(200).json({data:'sdfsd'});
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      // Handle other HTTP methods
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  
  