import { addEventStaff, view_EventStaffByid, view_EventByid, view_StaffByid, UpdateStaff, deleteStaff, ImportExcel, getAllStaffTicket, sendInvitationEmailStaff, viewStaffByEvent, search_Staff, sendTicketUser } from "../../../shared/services/admin/eventmanager/eventstaffservices";

import { generateStaffTicket } from "../../../shared/services/front/order_service";

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {

                if (req.body.key == 'sendEmail') {
                    const send_Ticket = await sendTicketUser(req, res);
                    res.status(200).json(send_Ticket);
                    break;
                }
                if (req.body.key == "importExcel") {
                    const staff_Import = await ImportExcel(req, res);
                    res.status(200).json(staff_Import);
                    break;
                } else if (req.body.key == "sendInvitation") {
                    const sendMailNewUser = await sendInvitationEmailStaff(req, res);
                    res.status(200).json(sendMailNewUser);
                    break;
                } else if (req.body.key == "SearchStaffDepartment") {
                    const searchStafff = await search_Staff(req.body);
                    res.status(200).json(searchStafff);
                    break;
                } else if (req.body.key == "getAllStaffTicket") {
                    // console.log("req.body", req.body);
                    const allTicket = await getAllStaffTicket(req.body);
                    res.json(allTicket);
                    break;
                } else if (req.body.key == "accept_condition") {
                    const accept = await generateStaffTicket(req.body);
                    res.json(accept);
                    break;
                } else {
                    const all_staff = await addEventStaff(req.body, res);
                    res.status(200).json(all_staff);
                    break;
                }
            }
            case "GET": {
                const { eventId, EventID, StaffId, EventIDS } = query;

                if (eventId) {
                    const vierStaff = await view_EventStaffByid({ eventId }, res);
                    res.status(200).json(vierStaff);
                    break;
                } else if (StaffId) {
                    const vierEvent = await view_StaffByid({ StaffId }, res);
                    res.status(200).json(vierEvent);
                    break;
                } else if (EventIDS) {
                    const viewStaff = await viewStaffByEvent({ EventIDS }, res);
                    res.status(200).json(viewStaff);
                    break;
                }
                else {
                    const vierEvent = await view_EventByid({ EventID }, res);
                    res.status(200).json(vierEvent);
                    break;
                }
            }

            case "PUT": {
                const { staffid } = query
                const updatedata = await UpdateStaff(req.body, staffid, res);
                res.status(200).json(updatedata);
                break;
            }

            case "DELETE": {
                const { id } = query;
                const deletionResult = await deleteStaff({ id }, res);
                res.status(200).json(deletionResult);
                break;
            }
            default:
                res.setHeader("Allow", ["POST", "GET", "DELETE", "PUT"]);
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