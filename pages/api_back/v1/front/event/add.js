import { imageUpload } from "@/utils_back/fileUpload";
import { addEvent } from "@/shared/services/front/event/eventservices"
import { verifyToken } from "@/utils_back/auth";
import next from "next";

export const config = {
    api: {
        bodyParser: false, // required for file uploads
    },
};

const handler = async (req, res) => {
    try {
        const { method } = req;
        const auth = verifyToken(req, res);
        // If verifyToken already returned an error response, stop execution
        if (!auth.success) return;

        switch (method) {
            case "POST": {
                try {
                    imageUpload.single("eventImage")(req, res, async (err) => {
                        if (err) {
                            console.error("Error uploading image:", err);
                            return res.status(400).json({
                                message: "Error uploading image",
                                error: err.message,
                            });
                        }
                        // console.log('>>>>>>>>>>',req.body);
                        // 🔹 Handle "add event"
                        const eventData = await addEvent(req, res); // custom function
                        return res.status(201).json(eventData);
                    });
                } catch (error) {
                    console.error("Error processing POST request:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
                break;
            }

            case "PUT": {
                try {
                    imageUpload.single("event_image")(req, res, async (err) => {
                        if (err) {
                            console.error("Error uploading image:", err);
                            return res.status(400).json({
                                message: "Error uploading image",
                                error: err.message,
                            });
                        }

                        // 🔹 Handle "edit event"
                        const filename = req.file ? req.file.filename : null;
                        const updatedEvent = await editEvent(req.body, filename); // custom function
                        return res.status(200).json(updatedEvent);
                    });
                } catch (error) {
                    console.error("Error processing PUT request:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
                break;
            }

            default:
                res.setHeader("Allow", ["POST", "PUT"]);
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
