import { viewAllStates } from "@/shared/services/front/states_service"

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                // const search_data = await viewAllCountries(req);
                // res.status(200).json(search_data);
                // break;
            }
            case "GET": {
                const { country_id } = query;
                if (country_id) {
                    const ViewState = await viewAllStates({ country_id }, res);
                    res.status(200).json(ViewState);
                }
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