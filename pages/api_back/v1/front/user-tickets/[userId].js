import { viewTickets, viewAllTickets } from "@/shared/services/front/userOrderService";

const handler = async (req, res) => {
    try {
        switch (req.method) {
            case "POST": {
                // Add your POST logic here if needed
                return res.status(405).json({ message: "POST Not Implemented" });
            }
            case "GET": {
                // const { userId, eventId } = req.query;
                // if (userId) {
                //     const orders = await viewTickets(userId, eventId);
                //     res.status(200).json(orders);
                // }
                const { userId } = req.query;
                if (userId) {
                    const orders = await viewTickets(userId);
                    res.status(200).json(orders);
                }
                return res.status(400).json({ message: "Missing or invalid userId" });
            }
            default:
                return res.status(405).json({ message: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message || error,
        });
    }
};

export default handler;