import { viewAllCountries } from "@/shared/services/front/countries_service"

const handler = async (req, res) => {
    try {
        const { method } = req;
        switch (method) {
            case "POST": {
                // const search_data = await viewAllCountries(req);
                // res.status(200).json(search_data);
                // break;
            }
            case "GET": {
                const AllCountriesView = await viewAllCountries(res);
                res.json(AllCountriesView);
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