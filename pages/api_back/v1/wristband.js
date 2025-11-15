import {
  addColorCombinations,
  addClaspColors,
  addBothColorAndClasp,
  getEventColors,
} from "../../../shared/services/admin/eventmanager/wristbandservices";

const handler = async (req, res) => {
  try {
    const { method, query } = req;
    switch (method) {
      case "POST": {
        try {
          const colorAdd = await addBothColorAndClasp(req.body);
          res.status(200).json(colorAdd);
        } catch (error) {
          console.error("Error processing request:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        break;
      }
      case "GET": {
        const { event_id } = query; // Extract 'id' from query parameters
        if (event_id) {
          const ViewEventsbyid = await getEventColors({ event_id }, res);
          res.status(200).json(ViewEventsbyid);
        }
        break;
      }

      case "PUT": {
        try {
        } catch (error) {
          console.error("Error processing request:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        break;
      }

      default:
        res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (err) {}
};

export default handler;
