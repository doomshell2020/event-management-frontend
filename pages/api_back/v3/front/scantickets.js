import { scanTicketV3 } from "@/shared/services/admin/scanticketservices"

const handler = async (req, res) => {
    try {
        
        const { method, query } = req;
        switch (method) {
            case "POST": {
                
                if (req.body.key == "scanTickets") {
                    const scanTicketData = await scanTicketV3(req, res);
                    res.json(scanTicketData);
                    break;
                }
            }
            case "GET": {
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
            success: false
        });
    }
};

export default handler;