import { View_Events } from "@/shared/services/v3/events/event_service";
import { checkApiKey } from '@/middleware/checkApiKey';

const handler = async (req, res) => {
    return checkApiKey(req, res, async () => {
        try {
            const { method, query } = req;
            const { action } = query;
            switch (method) {
                case "POST": {
                    try {
                        console.error('Outer Error:', error);
                        return res.status(200).json({ success: false, message: 'Internal Server Error: ' + error.message });
                    } catch (error) {
                        console.error('Outer Error:', error);
                        return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
                    }
                    break;
                }
                case "GET": {
                    const result = await View_Events(req, res);
                    return res.status(result.statusCode).json(result);
                }
                case "PUT": {
                    try {
                        console.error('Outer Error:', error);
                        return res.status(200).json({ success: true, message: 'Internal Server Error: ' + error.message });
                    } catch (error) {
                        console.error('Outer Error:', error);
                        return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
                    }
                    break;
                }
                case "DELETE": {
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
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
                success: false,
                message: err.message,
            });
        }
    });
};

export default handler;