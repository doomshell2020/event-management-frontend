import { viewHousingId } from "../../../shared/services/admin/housing/housingservices";

const handler = async (req, res) => {
    try {
        const { method } = req;
        switch (method) {
            case "POST": {
                try {
                    const dataView = await viewHousingId(req.body, res);
                    res.status(200).json(dataView);
                } catch (error) {
                    console.error('Error processing POST request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            default:
                res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
        } catch (err) {
        console.error('Error:', err); // Debugging any unexpected error
        res.status(400).json({
            error_code: "api_error",
            message: err.message,
        });
    }
};

export default handler;
