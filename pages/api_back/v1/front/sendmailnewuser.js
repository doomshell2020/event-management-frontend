import { sendInvitationEmailNewEmail,viewUserProfileByEmail } from "../../../../shared/services/front/userservices"
import { imageUpload } from "../../../../utils_back/fileUpload";
export const config = {
    api: {
        bodyParser: false
    }
};

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                try {
                    imageUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.log("🚀 ~ imageUpload.single ~ err:", err)
                            return res.status(400).json({ error: err.message });
                        }
                        const sendMailNewUser = await sendInvitationEmailNewEmail(req, res);
                        res.status(200).json({ sendMailNewUser });
                    });
                } catch (error) {
                    console.error('Error processing POST request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case "GET": {
                const Viewprofile = await viewUserProfileByEmail(req);
                res.status(200).json(Viewprofile);
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