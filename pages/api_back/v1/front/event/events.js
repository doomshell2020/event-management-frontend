import { View_Upcommingevents, getActiveEventList, View_Pastevents, Add_Interest, Fetch_Invitation, userExistInEvent, viewActiveEvents, viewAllEvents, viewLatestNewEvents, fetchTotalTicket } from "@/shared/services/front/event/eventservices";
import { View_Events } from "@/shared/services/v3/events/event_service";


import { Event, Currency } from "@/database/models";

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                if (req.body.key == "activeEvents") {
                    const activeEventsFetch = await viewActiveEvents(req.body);
                    // console.log("req.body", req.body)
                    res.status(200).json(activeEventsFetch);
                } else if (req.body.key == 'viewAllEvents') {
                    const allEvents = await viewAllEvents(req.body);
                    res.json(allEvents);
                } else if (req.body.key == 'newEvents') {
                    const newEvents = await viewLatestNewEvents(req.body);
                    res.json(newEvents);
                }
                else {
                    const add_eventcount = await Add_Interest(req.body);
                    res.status(200).json(add_eventcount);
                }
                break;
            }
            case "GET": {
                const { UserID, key, Userid, loginUserId } = query;

                if (key == "activeEvents") {
                    const activeEventsFetch = await getActiveEventList(req, res);
                }
                if (key == 'front_event_details') {
                    const response = await View_Events(req, res);
                    return res.json(response);
                    break;
                }
                if (key == 'event_details') {
                    const eventDetails = await Event.findOne({
                        where: { ID: query.eventId },
                        attributes: [
                            "ID",
                            "Name",
                            "StartDate",
                            "EndDate",
                            "payment_currency",
                            "ImageURL"
                        ],
                        include: [
                            {
                                model: Currency,
                                attributes: ["Currency_symbol", "Currency", "conversion_rate"]
                            }
                        ]
                    });

                    if (eventDetails) {
                        return res.status(200).json({
                            success: true,
                            data: eventDetails
                        });
                    } else {
                        return res.status(404).json({
                            success: false,
                            message: "Event not found"
                        });
                    }


                } else if (key == "total_ticket_count") {
                    const total_ticket_count = await fetchTotalTicket(req, res);
                    res.json(total_ticket_count);
                } else if (UserID) {
                    const ViewupcommingEvents = await View_Upcommingevents({ UserID }, res);
                    res.status(200).json(ViewupcommingEvents);
                }
                else if (Userid) {
                    const ViewPastEvent = await View_Pastevents({ Userid }, res);
                    res.status(200).json(ViewPastEvent);
                } else if (loginUserId) {
                    const userExist = await userExistInEvent(loginUserId);
                    res.status(200).json(userExist);
                }
                else {
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