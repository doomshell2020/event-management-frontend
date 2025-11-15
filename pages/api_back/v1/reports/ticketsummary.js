import {
    getTicketSummary
} from "@/shared/services/admin/reports/ticketsummary_reports";

export const config = {
    api: {
        bodyParser: false, // Only enable if needed; remove if using JSON payloads
    },
};

const handler = async (req, res) => {
    const { method, query, body } = req;

    try {
        switch (method) {
            case "GET": {
                return getTicketSummary(req, res);
            }

            case "POST": {
                // const data = await createAccommodationReport(body);

                return res.status(201).json({
                    success: true,
                    // data,
                });
            }

            case "PUT": {
                // const data = await updateAccommodationReport(body);

                return res.status(200).json({
                    success: true,
                    // data,
                });
            }

            case "DELETE": {
                const { id } = query;

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required parameter: id",
                    });
                }

                // await deleteAccommodationReport(id);

                return res.status(200).json({
                    success: true,
                    message: "Report deleted successfully",
                });
            }

            default: {
                res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
                return res.status(405).json({
                    success: false,
                    message: `Method ${method} Not Allowed`,
                });
            }
        }
    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Something went wrong",
        });
    }
};

export default handler;
