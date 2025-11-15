import { Add_Count, View_Count, Fetch_Invitation } from "../../../../../shared/services/front/event/interestedeventservices"

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                const add_eventcount = await Add_Count(req.body);
                res.status(200).json(add_eventcount);
                break;
            }
            case "GET": {
                const { UserID } = query;
                if (UserID) {
                    const Viewcount = await View_Count(UserID, res);
                    res.status(200).json(Viewcount);
                } else {
                    const Invaationfetch = await Fetch_Invitation(req);
                    res.status(200).json(Invaationfetch);
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