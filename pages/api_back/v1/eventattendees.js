import { View_EventattendesByid } from "../../../shared/services/admin/eventmanager/eventattendeservices"

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            // case "POST": {
            //     const search_data = await Search_InvitedMember(req.body);
            //     res.status(200).json(search_data);
            //     break;
            // }
            case "GET": {
                const { id, key } = query;
                if (id) {
                    const Viewinvitedmemberbyid = await View_EventattendesByid({ id }, res);
                    res.status(200).json(Viewinvitedmemberbyid);
                }
                else {
                    // If 'id' is not available, call the View_Members function
                    // const ViewAllInvitation = await InvitationEvent_ViewAll(req);
                    // res.status(200).json(ViewAllInvitation);
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