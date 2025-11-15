import { createHousingEnquiry, viewHousingEnquiry, searchHousingEnquiry } from "../../../../../shared/services/front/bookaccommodation/bookaccommodationservices"

const handler = async (req, res) => {
    try {
        switch (req.method) {
            case "POST": {
                const { key } = req.body;
                if (key === "create_housing") {
                    const housingEnquiry = await createHousingEnquiry(req.body);
                    return res.json(housingEnquiry);
                } else if (key === "search_enquiry") {
                    const searchEnquiry = await searchHousingEnquiry(req.body);
                    return res.json(searchEnquiry);
                }

            }
            case "GET": {
                const { id } = req.query;

                if (id) {
                    const data = await viewHousingEnquiry({ id });
                    return res.json(data);
                }

                return res.status(400).json({ message: "Invalid GET key" });
            }

            // case "PUT": {
            //     const { key } = req.body;

            //     if (key === "update_housing") {
            //         const updated = await updateHousingEnquiry(req.body);
            //         return res.json(updated);
            //     }

            //     return res.status(400).json({ message: "Invalid PUT key" });
            // }

            // case "DELETE": {
            //     const { key } = req.body;

            //     if (key === "delete_housing") {
            //         const deleted = await deleteHousingEnquiry(req.body);
            //         return res.json(deleted);
            //     }

            //     return res.status(400).json({ message: "Invalid DELETE key" });
            // }

            default:
                return res.status(405).json({ message: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message || error,
        });
    }
};

export default handler;