// pages/api/resend-orders.js
import { resendTicketToMember, resendTicketAllMemberNotSelectedOrderID } from "@/shared/services/admin/ordermanager/resend-orders-services";


export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            if (req.body.key == "resend_tickets") {
                const resendTicketEmail = await resendTicketToMember(req, res);
                res.status(200).json(resendTicketEmail);
            }
            else if (req.body.key == "resend_tickets_all") {
                const resendTicketEmail = await resendTicketAllMemberNotSelectedOrderID(req, res);
                res.status(200).json(resendTicketEmail);
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    } else if (req.method === "GET") {
        try {
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        // Handle other HTTP methods
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

