import { UserLogin } from "@/shared/services/front/users_service";

const handler = async (req, res) => {
    try {
        switch (req.method) {
            case "POST": {
                const { action } = req.body;
                if (action == 'login') {
                    const userRes = await UserLogin(req, res);
                } else {
                    return res.json({
                        success: false,
                        message: "invalid action please send valid action"
                    })
                }

            }
            case "GET": {
                const { userId } = req.query;
                if (userId) {
                    const orders = await viewTickets(userId);
                    res.status(200).json(orders);
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
};

export default handler;