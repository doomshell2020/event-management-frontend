import { checkApiKey } from '@/middleware/checkApiKey';
import { getTotalOrders } from "@/shared/services/admin/eventmanager/eventservices";
import { searchOrderDetails } from "@/shared/services/admin/eventmanager/eventservices";
import fs from "fs";
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };
const handler = async (req, res) => {
    return checkApiKey(req, res, async () => {

        const { method, query } = req;
        const { key } = req.body;


        try {
            switch (method) {
                // POST request to add an item to the cart
                case "POST": {
                    if (key == "searchOrderDetails") {
                        return await searchOrderDetails(req.body, res);
                        break;
                    }
                    return await getTotalOrders(req.body, res);
                    break;
                }
                // GET request to retrieve the cart data for a user
                case "GET": {

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
