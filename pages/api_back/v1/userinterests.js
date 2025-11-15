import { View_Interest } from "../../../shared/services/admin/userinterestservices"

const handler = async (req, res) => {
    try {
        const { method } = req;
        switch (method) {

            case "GET": {
                const ViewIntrest = await View_Interest(req);
                console.log("ViewIntrest", ViewIntrest)
                res.status(200).json(ViewIntrest);
                break;
            }
            default:
                res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    } catch (err) {
        res.status(400).json({
            error_code: "Api_Error",
            message: err.message,
        });
    }
};

export default handler;