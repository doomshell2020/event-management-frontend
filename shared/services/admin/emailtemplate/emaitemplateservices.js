import { StatusCodes } from 'http-status-codes';
import { Emailtemplet, TicketTemplate, Event, TemplateVersion, User } from "../../../../database/models";
import { sendEmail } from "../../../../utils_back/sendEmail";

export async function AddEmailTemplate({ title,
    subject,
    type,
    description, mandril_template, eventId, templateId }, res) {
    try {
        const EmailTemplatedata = await Emailtemplet.create({
            title,
            subject,
            type,
            description,
            mandril_template, eventId, templateId
        });
        return {
            statusCode: StatusCodes.OK,
            status: true,
            success: true,
            message: "Email Template added Successfully",
            id: EmailTemplatedata.id,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        };
    }
}

export async function emailTemplate_ViewAll(req) {
    try {
        const StaticPagedata = await Emailtemplet.findAll({
            // order: [["DisplayPriority", "ASC"]],
            order: [["id", "DESC"]],
            include: { model: Event }

        });
        return {
            statusCode: StatusCodes.OK,
            status: true,
            success: true,
            message: "EmailTemplate viewAll Successfully",
            data: StaticPagedata,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}

export async function UpdateEmailTemplate({ title, subject, type, description, status, mandril_template, eventId, templateId }, id, res) {
    try {
        const EmailTemplatedata = await Emailtemplet.update({
            id, title,
            subject,
            type,
            description, status, mandril_template, eventId, templateId
        },
            {
                where: {
                    id: id,
                },
            },

        );
        if (EmailTemplatedata == 1) {
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Email Template Update Successfully"
            };
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "data not found"

            };
        }

    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };

    }
}

export async function DeleteEmailTemplate({ id }, res) {
    try {
        const EmailTemplatedata = await Emailtemplet.destroy({
            where: {
                id: id,
            },
        });
        if (EmailTemplatedata == 1) {
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Email Template  Delete Successfully"
            };
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "data not found"

            };
        }
    } catch (error) {
        return error;
    }
}

export async function emailTemplatebyid(id, res) {
    try {
        const Userdata = await Emailtemplet.findOne({
            where: { id: id },
        });
        if (Userdata) {
            return {
                statusCode: StatusCodes.OK,
                status: true,
                message: "ViewAll emailtemplate details Successfully",
                data: Userdata,
            }
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                status: true,
                message: "data not found",
            }
        }

    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}

export async function byEventIdGetInvitationTemplate({ eventId }, res) {
    try {
        const getEmailTemplate = await Emailtemplet.findOne({
            where: { eventId },
        });

        if (!getEmailTemplate) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                status: false,
                message: "Email template not found for the specified event",
            };
        }

        return {
            statusCode: StatusCodes.OK,
            status: true,
            message: "Email template retrieved successfully",
            // data: getEmailTemplate,
        };
    } catch (error) {
        console.error('Error fetching email template:', error);
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Internal server error while fetching email template",
            error: error.message,
        };
    }
}

// search Email templates
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
export async function searchTemplates({ eventId, title }) {
    try {
        let newObject = {};
        if (eventId) {
            newObject.eventId = { [Op.like]: `%${eventId}%` }
        }
        if (title) {
            newObject.title = { [Op.like]: `%${title}%` }
        }
        const searchResults = await Emailtemplet.findAll({
            where: newObject,
            include: { model: Event },
            order: [["id", "DESC"]],
        });
        return {
            statusCode: 200,
            success: true,
            message: 'Search Templates Successfully!',
            searchResults
        };
    } catch (error) {
        console.log("error")
        // res.status(500).json({ error: 'Internal Server Error' });
    }
}



// Ticket templates Api Start
export async function AddTicketTemplate({ title,
    subject,
    type,
    description, }, res) {
    try {
        const EmailData = await TicketTemplate.create({
            title,
            subject,
            type,
            description,
        });
        return {
            statusCode: StatusCodes.OK,
            status: true,
            message: "Ticket Template added Successfully",
            id: EmailData.id,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        };
    }
}


export async function ticketTemplateView(req) {
    try {
        const StaticPagedata = await TicketTemplate.findAll({
            order: [["id", "DESC"]],

        });
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Ticket Template viewAll Successfully!",
            data: StaticPagedata,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}

export async function updateTicketTemplate({ title, subject, type, description, status }, id, res) {
    try {
        const data = await TicketTemplate.update({
            id, title,
            subject,
            type,
            description, status
        },
            {
                where: {
                    id: id,
                },
            },
        );
        if (data == 1) {
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Ticket Template Update Successfully"
            };
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "data not found"

            };
        }

    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };

    }
}

export async function deleteTicketTemplate({ id }, res) {
    try {
        const data = await TicketTemplate.destroy({
            where: {
                id: id,
            },
        });
        if (data == 1) {
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Ticket Template  Delete Successfully!"
            };
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                success: false,
                message: "data not found"

            };
        }
    } catch (error) {
        return error;
    }
}

export async function TemplateFindById(template_id, res) {
    try {
        const templateData = await TicketTemplate.findOne({
            where: { id: template_id },
        });
        if (templateData) {
            return {
                statusCode: StatusCodes.OK,
                status: true,
                message: "ViewAll template details Successfully",
                data: templateData,
            }
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                status: true,
                message: "data not found",
            }
        }

    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}




// find events.........
export async function findEvents() {
    try {
        const events = await Event.findAll({
            where: {
                StartDate: {
                    [Op.gte]: new Date("2024-01-01") // Only events starting in 2025 or later
                }
            },
            order: [["id", "DESC"]],
            attributes: ['id', 'Name', 'StartDate', 'event_menu_name']
        });
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "viewAll Events Successfully!!!",
            data: events,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}

// find template Versions.........
export async function findTemplateVersion(req) {
    try {
        const data = await TemplateVersion.findAll({
            order: [["id", "DESC"]],
        });
        return {
            statusCode: StatusCodes.OK,
            success: true,
            message: "ViewAll Template Version Successfully!",
            data: data,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error
        }
    }
}


// Send Test Email-old direct send via db email
// export async function sendTestEmail({ template_id }, res) {
//     try {
//         const templateInfo = await Emailtemplet.findOne({
//             where: { id: template_id },
//         });
//         // Find  User for Test Email
//         const userDetails = await User.findAll({
//             where: {
//                 test_email: {
//                     [Op.ne]: null,
//                     [Op.ne]: ''
//                 }
//             },
//             attributes: ['id', 'test_email']
//         })
//         const email = userDetails[0].test_email;
//         const mailChampTemplateName = templateInfo.dataValues.mandril_template
//         const sanitizedTemplate = templateInfo.dataValues.description;
//         const subject = templateInfo.dataValues.subject
//         const templateName = mailChampTemplateName; //template name dynamic for mail champ
//         const mergeVars = { ALLDATA: sanitizedTemplate };
//         const toEmail = email;
//         await sendEmail(toEmail, mergeVars, templateName, subject);
//         return {
//             statusCode: 200,
//             success: true,
//             message: "Test email sent successfully.",
//         };

//     } catch (error) {
//         return {
//             statusCode: 500,
//             success: false,
//             message: "Internal server error.",
//             error: error.message,
//         };
//     }
// }


// Send Test Email - new send email dynamic email_id(06-08-2025)
export async function sendTestEmail({ template_id, email }, res) {
    try {
        // Fetch the template by ID
        const template = await Emailtemplet.findOne({ where: { id: template_id } });
        if (!template) {
            return {
                statusCode: 404,
                success: false,
                message: "Email template not found.",
            };
        }
        const {
            mandril_template: templateName,
            description: sanitizedTemplate,
            subject,
        } = template.dataValues;
        const mergeVars = { ALLDATA: sanitizedTemplate };
        await sendEmail(email, mergeVars, templateName, subject);
        return {
            statusCode: 200,
            success: true,
            message: "Test email sent successfully.",
        };
    } catch (error) {
        console.error("Error in sendTestEmail:", error); // optional for debugging
        return {
            statusCode: 500,
            success: false,
            message: "Internal server error.",
            error: error.message,
        };
    }
}











// clone templates for new event

export async function cloneTemplatesForNewEvent({ EventID, Ids, template_ids }, res) {
  try {
    console.log("Event ID:", EventID, "--Ids--:", Ids, "Template IDs:", template_ids);

    // Validate input
    if (!Array.isArray(template_ids) || template_ids.length === 0 || !Array.isArray(Ids) || Ids.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Ids and Template IDs should be non-empty arrays.",
      });
    }

    const clonedTemplates = [];
    const skippedTemplates = [];

    for (let i = 0; i < Ids.length; i++) {
      const templateId = Ids[i];
      const templateIdField = template_ids[i]; // mapping template_ids[i] to templateId
      
      // Check if a template with the same eventId and templateId already exists
      const existingTemplate = await Emailtemplet.findOne({
        where: {
          eventId: EventID,
          templateId: templateIdField,
        },
      });
      
      if (existingTemplate) {
          skippedTemplates.push({
              templateId: templateIdField,
              reason: "Already exists for this event",
            });
            continue;
        }
        
      // Find the original template by its actual row ID
      const templateData = await Emailtemplet.findOne({ where: { id: templateId } });

      if (!templateData) {
        skippedTemplates.push({
          templateId: templateIdField,
          reason: `Original template with id ${templateId} not found`,
        });
        continue;
      }
      // Clone the template
      const clonedTemplate = await Emailtemplet.create({
        title: templateData.title,
        subject: templateData.subject,
        type: templateData.type,
        description: templateData.description,
        mandril_template: templateData.mandril_template,
        eventId: EventID,
        templateId: templateIdField, // save the reference to original templateId
      });
      clonedTemplates.push(clonedTemplate);
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Email Templates processed",
      clonedCount: clonedTemplates.length,
      skippedCount: skippedTemplates.length,
      clonedTemplates,
      skippedTemplates,
    });
  } catch (error) {
    console.error("Error cloning templates:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}


// change status ---
export async function updateTemplateStatus(req, res) {
  try {
    const { id } = req;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required.",
      });
    }
    const event = await Emailtemplet.findOne({ where: { id }, attributes: ['id', 'status'] });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }
    const newStatus = event.status === "Y" ? "N" : "Y";
    await event.update({ status: newStatus });
    return res.status(200).json({
      success: true,
      message: `Event status updated successfully.`,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the event status.",
      error: error.message,
    });
  }
}







