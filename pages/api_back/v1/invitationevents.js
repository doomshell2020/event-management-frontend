import {
    InvitationEvent_ViewAll, View_InvitationEventByid, Search_InvitedMember, Add_InvitationEvents,
    Search_TicketPurchaseduser, User_ticketPurchased, updateInvitationStatus, Add_Invitations, getInvitationInfo, getInvitationInfoForInvitedMember, isInvitedIntoEvent
} from "../../../shared/services/admin/eventmanager/invitationeventservices"

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {

            case "POST": {
                if (req.body.key == 'updateInvitationStatus') {
                    const fetchStatus = await updateInvitationStatus(req.body, res);
                    res.status(200).json(fetchStatus);
                }
                if (req.body.key == "Addinvitation") {
                    var Addinvitation = await Add_InvitationEvents(req.body, res);

                } else if (req.body.key == "TicketPurchased") {

                    const search = await Search_TicketPurchaseduser(req.body, res);
                    res.status(200).json(search);

                } else if (req.body.key == "invitationsAdded") {

                    const addInvitation = await Add_Invitations(req.body, res);
                    res.status(200).json(addInvitation);

                } else {
                    // console.log("req.body", req.body)
                    const search_data = await Search_InvitedMember(req.body);
                    res.json(search_data);
                }

                res.status(200).json(Addinvitation);
                break;
            }
            case "GET": {
                const { id, key, Eventid, invitationId, userId } = query;

                if (key == "is_invited") {
                    const isInvited = await isInvitedIntoEvent(req, res);
                    res.json(isInvited);
                } else if (id) {
                    const Viewinvitedmemberbyid = await View_InvitationEventByid(req.query, res);
                    res.status(200).json(Viewinvitedmemberbyid);
                } else if (Eventid) {
                    const user_purchasedtickets = await User_ticketPurchased({ Eventid }, res);
                    res.status(200).json(user_purchasedtickets);
                } else if (invitationId) {
                    const invitationDetails = await getInvitationInfoForInvitedMember(req.query, res);
                    res.json(invitationDetails);
                }
                else {
                    // If 'id' is not available, call the View_Members function
                    const ViewAllInvitation = await InvitationEvent_ViewAll(req);
                    res.status(200).json(ViewAllInvitation);
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
            error_code: "InvitationEvent Error",
            message: err.message,
        });
    }
};
export default handler;