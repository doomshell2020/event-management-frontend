import {
    emailTemplate_ViewAll, AddEmailTemplate, UpdateEmailTemplate, DeleteEmailTemplate, emailTemplatebyid,
    byEventIdGetInvitationTemplate, AddTicketTemplate, ticketTemplateView, updateTicketTemplate, deleteTicketTemplate,
    TemplateFindById, findEvents, findTemplateVersion, searchTemplates, sendTestEmail, cloneTemplatesForNewEvent, updateTemplateStatus
} from "../../../shared/services/admin/emailtemplate/emaitemplateservices";
import { validateCreateEmailTemplate, validateUpdateEmailTemplate } from '../../../shared/validation/emailTemplatevalidation'
const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                if (req.body.key === "AddTicketTemplate") {
                    const template = await AddTicketTemplate(req.body, res);
                    res.status(200).json(template);
                } else if (req.body.key === "searchTemplates") {
                    const template = await searchTemplates(req.body, res);
                    res.status(200).json(template)
                } else if (req.body.key === "sendTestEmail") {
                    const templateData = await sendTestEmail(req.body, res);
                    res.status(200).json(templateData)
                } else if (req.body.key === "CloneTemplate") {
                    const clone_template = await cloneTemplatesForNewEvent(req.body, res);
                    res.status(200).json(clone_template)
                } else if (req.body.key == "update_template_status") {
                    const update_status = await updateTemplateStatus(req.body, res);
                    res.json(update_status);
                }

                else {
                    const all_users = await AddEmailTemplate(req.body, res);
                    res.status(200).json(all_users);
                    break;
                }
            }
            case "GET": {
                const { key, eventId, id, template_id } = query;
                if (key == 'invitationtemplate') {
                    const getTemplate = await byEventIdGetInvitationTemplate({ eventId }, res);
                    res.status(200).json(getTemplate);
                    break;

                } else if (key == 'emailTemplatebyid') {
                    const all_users = await emailTemplatebyid(id, req);
                    res.status(200).json(all_users);
                    break;
                } else if (key == 'ticketTemplateView') {
                    const data = await ticketTemplateView(req);
                    res.status(200).json(data);
                    break;
                } else if (template_id) {
                    const data = await TemplateFindById(template_id, req);
                    res.status(200).json(data);
                    break;
                } else if (key === "findEvents") {
                    const data = await findEvents(req);
                    res.status(200).json(data);
                    break;
                } else if (key === "templateVersions") {
                    const data = await findTemplateVersion(req);
                    res.status(200).json(data);
                    break;
                }
                else {
                    const all_users = await emailTemplate_ViewAll(req);
                    res.status(200).json(all_users);
                    break;
                }

            }
            case "PUT": {
                const { id } = query
                // const validationResult = validateUpdateEmailTemplate(req.body);
                // if (validationResult.error) {
                //     res.status(400).json({
                //         error_code: "validation_error",
                //         message: validationResult.error.message,
                //     });
                //     return;
                // }
                const updatedata = await UpdateEmailTemplate(req.body, id, res);
                res.status(200).json(updatedata);
                break;
            }

            case "DELETE": {
                const { id } = query;
                const deletionResult = await DeleteEmailTemplate({ id }, res);
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