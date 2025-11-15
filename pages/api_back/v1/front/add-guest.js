import { AddGuestInAccommodation } from "@/shared/services/front/userOrderService";

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                if (req.body.key == "add_guest") {
                    const added = await AddGuestInAccommodation(req.body);
                    res.status(200).json(added);
                }
                break;
            }
            case "GET": {
                const { UserID, key, Userid, loginUserId } = query;
                break;
            }
            default:
                res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    } catch (err) {
        res.status(400).json({
            error_code: "api_one",
            message: err.message,
        });
    }
};

export default handler;