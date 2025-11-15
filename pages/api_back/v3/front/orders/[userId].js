import { getOrdersByUser, getTotalOrders } from "@/shared/services/front/userOrderService";
import { checkApiKey } from '@/middleware/checkApiKey';

const handler = async (req, res) => {
    return checkApiKey(req, res, async () => {
        try {
            switch (req.method) {
                case "POST": {
                    // Add your POST logic here if needed
                    return res.status(405).json({ message: "POST Not Implemented" });
                }
                case "GET": {
                    const { userId } = req.query;
                    if (userId) {
                        const orders1 = await getTotalOrders({ userId }, res);
                        console.log('>>>>>>>>>>>>>', orders1);
                        res.json(orders1);
                    }
                    return res.status(400).json({ success: false, message: "Missing or invalid userId" });
                }
                default:
                    return res.status(405).json({ success: false, message: "Method Not Allowed" });
            }
        } catch (error) {
            console.error("API Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error",
                error: error.message || error,
            });
        }
    });
};

export default handler;
