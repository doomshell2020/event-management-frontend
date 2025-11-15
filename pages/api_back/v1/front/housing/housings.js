import { view_Property, getAssignedHousing } from "../../../../../shared/services/front/housing/housingservices"


const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {

                const { userId, eventId, checkIn, checkOut, key } = req.body;

                if (key == "getOfferHousing") {

                    const responseData = await getAssignedHousing({ userId, eventId, checkIn, checkOut }, res);
                    res.status(200).json(responseData);
                    break;
                }
                // if (req.body.key == "activeEvents") {
                //     const activeEventsFetch = await viewActiveEvents(req.body);
                //     // console.log("req.body", req.body)
                //     res.status(200).json(activeEventsFetch);

                // } else {
                //     const add_eventcount = await Add_Interest(req.body);
                //     res.status(200).json(add_eventcount);
                // }
                // break;
            }
            case "GET": {
                const { OwnerID } = query;
                if (OwnerID) {
                    const viewProperty = await view_Property({ OwnerID }, res);
                    res.status(200).json(viewProperty);
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
