import { isCouponEligible } from "@/shared/services/front/coupons_service";

const handler = async (req, res) => {
  try {
    const { method, query } = req;

    switch (method) {
      // POST request to add an item to the cart
      case "POST": {
        try {
          const { userId, ticketId, ticket_type, symbol } = req.body;

          // Validation for missing required fields
          if (!userId || !ticketId || !ticket_type || !symbol) {
            return res
              .status(400)
              .json({ success: true, message: "Missing required fields" });
          }

          // Call addToCart function from your service
          const cartResponse = await addToCart({
            userId,
            ticketId,
            ticket_type,
            symbol,
          });

          // Return the updated cart data
          const updatedCart = await getCartByUserId(userId);

          res.status(200).json({
            success: true,
            message: cartResponse.message, // Use the dynamic message
            data: updatedCart,
          });
        } catch (error) {
          console.error("Error adding item to cart:", error.message);
          res.status(500).json({ success: false, message: error.message });
        }
        break;
      }

      // GET request to retrieve the cart data for a user
      case "GET": {
        try {
          const { couponCode, action,userId,eventId } = req.query;

          if (action === "is_valid") {
            if (!couponCode || !userId || !eventId) {
              return res
                .status(400)
                .json({ success: false, message: "Missing params" });
            }

            const result = await isCouponEligible(couponCode,userId,eventId);

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
};

export default handler;
