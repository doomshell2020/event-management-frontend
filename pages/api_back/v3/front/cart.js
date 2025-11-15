import { addToCart, getCartByUserId, deleteCartItem, addTicketForAccommodation } from "@/shared/services/front/cart/cartservices";
import { createPaymentIndentation } from "@/shared/services/v3/front/create_payment_intent";
import { checkApiKey } from '@/middleware/checkApiKey';
import { findPropertyDetailsForCart } from "@/shared/services/front/bookaccommodation/bookaccommodationservices"

const handler = async (req, res) => {
  return checkApiKey(req, res, async () => {

    const { method, query } = req;

    try {
      switch (method) {
        // POST request to add an item to the cart
        case "POST": {
          try {
            const { userId, ticketId, ticket_type, symbol, eventId, action, noOfTick } = req.body;

            if (action == 'create_payment_intent') {
              const response = await createPaymentIndentation(req, res);
            }

            if (action == "accommodation") {
              // 2. Add new item to cart with noOfTick
              const cartResponse = await addTicketForAccommodation({
                userId,
                eventId,
                noOfTick // pass the quantity
              });
              res.status(200).json(cartResponse);
            }

            // Validation for missing required fields
            if (!userId || !ticketId || !ticket_type || !symbol || !eventId) {
              return res
                .status(400)
                .json({ success: true, message: "Missing required fields" });
            }

            // Call addToCart function from your service
            const cartResponse = await addToCart({
              userId,
              eventId,
              ticketId,
              ticket_type,
              symbol,
            });

            // Return the updated cart data
            const updatedCart = await getCartByUserId(userId);

            return res.status(200).json({
              success: true,
              message: cartResponse.message, // Use the dynamic message
              data: updatedCart,
            });
          } catch (error) {
            console.error("Error adding item to cart:", error.message);
            return res.status(500).json({ success: false, message: error.message });
          }
          break;
        }
        // GET request to retrieve the cart data for a user
        case "GET": {
          try {
            const { action, cartId, userId, key } = query;

            if (key == 'info') {
              const { property_id, EventID } = query;
              const propertyDetails = await findPropertyDetailsForCart({ property_id, EventID });
              // console.log('>>>>>>>>>>', propertyDetails.data);
              if (propertyDetails.data) {
                res.json(propertyDetails);
              } else {
                res.json({
                  success: false,
                  message: "Property not found or invalid property id"
                });
              }

              break;
            }

            if (action == "delete_cart_item") {
              if (!cartId) {
                return res
                  .status(400)
                  .json({ success: false, message: "Missing cartId" });
              }

              // Delete the cart item with the given cartId
              const deletedCart = await deleteCartItem(cartId);

              if (deletedCart) {
                return res.status(200).json({
                  success: true,
                  message: "Item deleted successfully",
                });
              } else {
                return res.status(404).json({
                  success: false,
                  message: "Failed to delete cart item",
                });
              }
            }

            // Validate if userId is provided
            if (!userId) {
              return res.status(400).json({ success: false, message: "Missing userId in query" });
            }

            // Fetch the cart data for the user
            const cartData = await getCartByUserId(userId);

            // If the cart is empty
            if (!cartData || cartData.length === 0) {
              return res.status(200).json({
                success: false,
                message: "No cart data found for the user",
                data: [],
              });
            }

            // Return the cart data
            return res.status(200).json({
              success: true,
              message: "Cart data retrieved successfully",
              data: cartData,
            });
          } catch (error) {
            console.error("Error retrieving cart data:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
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
      res.status(400).json({
        error_code: "api_one",
        success: false,
        message: err.message,
      });
    }
  });
};

export default handler;
