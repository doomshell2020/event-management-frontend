import {
    Book_Accommodation, Find_Event_Housing, Find_User, findPropertyDetails, findPropertyImages,
    userDetails, eventDetails, findHousingAssignedUsersForEvent, viewBookedProperty, findPropertyDetailsForCart
} from "@/shared/services/front/bookaccommodation/bookaccommodationservices"

const handler = async (req, res) => {
    try {
        const { method, query, } = req;
        switch (method) {
            case "POST": {
                if (req.body.key == "Find_Event_Housing") {
                    const eventHousing = await Find_Event_Housing(req.body);
                    res.json(eventHousing);
                    break;
                } else if (req.body.key == "Accommodation_Book") {
                    const add = await Book_Accommodation(req.body);
                    res.json(add);
                    break;
                } else if (req.body.key == "housing_assigned") {
                    const add = await findHousingAssignedUsersForEvent(req.body);
                    res.json(add);
                    break;
                }
                else {
                    break;
                }
            }
            case "GET": {
                const { property_id, propertyId, UserID, EventID, UserEmail, accommodation_id, key } = query; // Extract 'id' from query parameters
                if (key == 'info' && property_id && EventID) {
                    const propertyDetails = await findPropertyDetailsForCart({property_id, EventID});
                    res.json(propertyDetails);
                    break;
                } else if (property_id) {
                    const data = await findPropertyDetails({ property_id });
                    return res.json(data);
                } else if (propertyId) {
                    const data = await findPropertyImages({ propertyId });
                    return res.json(data);
                } else if (accommodation_id) {
                    const data = await viewBookedProperty({ accommodation_id });
                    return res.json(data);
                }
                else if (UserID) {
                    const data = await userDetails({ UserID });
                    return res.json(data);
                } else if (EventID) {
                    const EventData = await eventDetails({ EventID });
                    return res.json(EventData);
                } if (UserEmail) {
                    const user_find = await Find_User({ UserEmail });
                    res.json(user_find);
                    break;
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
            error_code: "Book_Accommodation",
            message: err.message,
        });
    }
};

export default handler;