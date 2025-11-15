import { View_Events, getEventListByOrganizer } from "@/shared/services/admin/eventmanager/eventservices";

const handler = async (req, res) => {
    try {
        switch (req.method) {
            case "GET": {
                const { userId } = req.query;
                const orders = await getEventListByOrganizer(req, res);
                return res.status(200).json(orders);
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