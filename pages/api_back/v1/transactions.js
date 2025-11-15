import { View_Transaction, Search_Transactions } from "../../../shared/services/admin/transactionmanager/transactiondervices"

const handler = async (req, res) => {
    try {
        const { method } = req;
        switch (method) {
            case "POST": {
                const search_data = await Search_Transactions(req.body);
                res.status(200).json(search_data);
                break;
            }
            case "GET": {
                const ViewTransactions = await View_Transaction(req);
                res.status(200).json(ViewTransactions);
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