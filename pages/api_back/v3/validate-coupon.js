import { isCouponEligible } from "@/shared/services/front/coupons_service";
import { checkApiKey } from '@/middleware/checkApiKey';

const handler = async (req, res) => {
  return checkApiKey(req, res, async () => {
    try {
      const { method, query } = req;

      switch (method) {
        // GET request to retrieve the cart data for a user
        case "GET": {
          try {
            const { couponCode, action, userId, eventId } = req.query;

            if (action == "is_valid") {
              if (!couponCode || !userId || !eventId) {
                return res
                  .status(400)
                  .json({ success: false, message: "Missing params" });
              }

              const result = await isCouponEligible(couponCode, userId, eventId);

              return res.status(result.status).json({
                ...result
              });
            }

            return res.status(400).json({
              success: false,
              message: "Invalid action",
            });
          } catch (error) {
            console.error("Error handling request:", error);
            return res.status(500).json({
              success: false,
              message: "Internal Server Error",
            });
          }
          break;
        }

        // Handle other methods
        default:
          res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
          res.status(405).end(`Method ${method} Not Allowed`);
          break;
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(400).json({
        error_code: "api_error",
        message: err.message,
      });
    }
  });
};

export default handler;
