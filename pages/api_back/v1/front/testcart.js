import {
    addToCart,
    getCartByUserIdTest,
    deleteCartItem,
} from "@/shared/services/front/cart/cartservices";

const handler = async (req, res) => {
    try {
        const { method, query } = req;

        switch (method) {
            // POST request to add an item to the cart
            case "POST": {
                try {
                    const { userId, ticketId, ticket_type, symbol, eventId } = req.body;

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
                    const updatedCart = await getCartByUserIdTest(userId, eventId);

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
                    const { action, cartId, userId, event_id } = query;
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
                        return res.status(400).json({ error: "Missing userId in query" });
                    }

                    // Fetch the cart data for the user
                    const cartData = await getCartByUserIdTest(userId, event_id);

                    // If the cart is empty
                    if (!cartData || cartData.length === 0) {
                        return res.status(200).json({
                            success: false,
                            message: "No cart data found for the user",
                            data: [],
                        });
                    }

                    // Return the cart data
                    res.status(200).json({
                        success: true,
                        message: "Cart data retrieved successfully",
                        data: cartData,
                    });
                } catch (error) {
                    console.error("Error retrieving cart data:", error);
                    res.status(500).json({ error: "Internal Server Error" });
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
