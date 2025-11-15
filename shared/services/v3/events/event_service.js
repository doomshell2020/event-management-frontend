import { Event, EventTicketType, Addons, Currency } from "@/database/models";

// Events View (list or single)
export async function View_Events(req, res) {
    try {
        const { id } = req.query; // <-- check if ID is passed

        let eventData;

        if (id) {
            // ✅ Fetch a single event by ID
            eventData = await Event.findByPk(id, {
                include: [
                    { model: Currency },
                    { model: EventTicketType },
                    { model: Addons },
                ],
            });

            if (!eventData) {
                return {
                    statusCode: 404,
                    success: false,
                    message: "Event not found",
                };
            }

            return {
                statusCode: 200,
                success: true,
                message: "Event fetched successfully!",
                data: eventData,
            };
        } else {
            // ✅ Fetch all events
            eventData = await Event.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: EventTicketType,
                        as: "ticketTypes",
                    },
                ],
            });


            return {
                statusCode: 200,
                success: true,
                message: "View Events Successfully!",
                data: eventData,
            };
        }
    } catch (error) {
        console.error("View_Events Error:", error);
        return {
            statusCode: 500,
            success: false,
            message: "Failed to fetch events",
            error: error.message,
        };
    }
}
