import { getInvitedMember, sendInvitationEmailsToFilteredUsers } from "../../../../shared/services/admin/eventmanager/invitationeventservices";

const handler = async (req, res) => {
  try {
    const { method } = req;
    switch (method) {
      case "GET": {
        // 👉 In GET, filters will come from req.query
        const search_data = await getInvitedMember(req.query);
        return res.status(200).json(search_data);
      }
      case "POST": {
        // If you no longer want POST, you can return a 405
        if (req.body.key === "Invitations-Event") {
          const result = await sendInvitationEmailsToFilteredUsers(req.body, res);
          return res.status(200).json(result);
        }
        return res.status(405).json({ message: "POST method not allowed" });
      }
      default:
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error("API Error:", err.message);
    return res.status(400).json({
      error_code: "InvitationEvent Error",
      message: err.message,
    });
  }
};

export default handler;
