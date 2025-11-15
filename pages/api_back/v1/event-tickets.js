import { console } from "inspector";
import {
    addTicketsAddons, findAllTicketsAndAddons, DeleteTicketAddon, viewTicketDetails, updateTicketsAddons,
    DeleteEvent, publishEvent, updateStatus
} from "@/shared/services/admin/eventmanager/eventservices";
import { imageUpload } from "@/utils_back/fileUpload";
import fs from "fs";
export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                try {
                    imageUpload.single("ticketImage")(req, res, async (err) => {
                        if (err) {
                            console.error("Error uploading image:", err);
                            return res.status(400).json({ message: "Error uploading image", error: err.message });
                        }
                        if (req.body.key == "add_ticket" || req.body.ticketType == 'addon') {
                            if (req.file) {
                                const { filename } = req.file;
                                const ticket_addons = await addTicketsAddons(req.body, filename, res);
                                res.status(200).json(ticket_addons);
                            } else {
                                const ticket_addons = await addTicketsAddons(req.body);
                                res.status(200).json(ticket_addons);
                            }
                        }
                        else if (req.body.key == "ticketAddonDeleted") {
                            const deletionResult = await DeleteTicketAddon(req.body);
                            res.json(deletionResult);
                        }
                        else if (req.body.key == "View_ticket_details") {
                            const ticket_data = await viewTicketDetails(req.body);
                            res.json(ticket_data);
                        }
                        else if (req.body.key == "Event_Deleted") {
                            const deleted_data = await DeleteEvent(req.body);
                            res.json(deleted_data);
                        } else if (req.body.key == "publish_event") {
                            const updated_data = await publishEvent(req.body);
                            res.json(updated_data);
                        } else if (req.body.key == "update_status") {
                            const status_update = await updateStatus(req.body);
                            res.json(status_update);
                        }
                    });
                } catch (error) {
                    console.error("Error processing request:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
                break;
            }
            case "GET": {
                const { eventId } = query; // Extract 'id' from query parameters
                if (eventId) {
                    const getResponse = await findAllTicketsAndAddons({ eventId }, req, res);
                    return res.status(200).json(getResponse);
                }
                break;
            }
            case "PUT": {
                try {
                    imageUpload.single("ticketImage")(req, res, async (err) => {
                        if (err) {
                            console.error("Error uploading image:", err);
                            return res
                                .status(400)
                                .json({ message: "Error uploading image", error: err.message });
                        }
                        if (req.file) {
                            const { filename } = req.file;
                            const update_data = await updateTicketsAddons(req.body, filename, res);
                            res.status(200).json({ update_data });
                        } else {
                            const update_data = await updateTicketsAddons(req.body);
                            res.status(200).json({ update_data });
                        }
                    });
                } catch (error) {
                    console.error("Error processing request:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
                break;
            }
            // case 'DELETE': {
            //     const deletionResult = await DeleteTicketAddon(req.body, res);
            //     res.json(deletionResult);
            //     break;
            // }
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
//   const saveFile = async (file) => {
//     const data = fs.readFileSync(file.path);
//     fs.writeFileSync(`./public/${file.name}`, data);
//     await fs.unlinkSync(file.path);
//   };
export default handler;
