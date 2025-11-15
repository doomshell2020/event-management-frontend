import {
    CartModel,
    Payment,
    Addons,
    AddonBook,
    User,
    EventTicketType,
    BookTicket,
    TicketDetail,
    Event,
    Order,
    Orders,
    MyOrders,
    Currency,
    EventStaffMember,
    InvitationEvent,
    Emailtemplet,
    AccommodationBookingInfo,
    AccommodationExtension,
    HousingNeighborhood,
    HousingTypes,
    EventHousing,
    Housing, HousingInfo
} from "@/database/models";
import { Op } from "sequelize";
import { sendEmail, sendEmailWithBCC } from "@/utils_back/sendEmail"; // send mail via mandril
import { resendTicketTemplate, } from "@/utils_back/email-templates";
import { createTemplate } from "@/utils_back/templateHelper";
let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
let NEXT_S3_URL = process.env.NEXT_PUBLIC_S3_URL;


// Resend ticket to priticular users
export async function resendTicketToMember(req, res) {
    try {
        const existOrderId = req.body.orderId;
        const sendEmailPromises = existOrderId.map(async (item) => {
            const order = await MyOrders.findOne({
                where: {
                    id: item,
                },
                include: {
                    model: User,
                    attributes: ["Email", "FirstName", "LastName"],
                },
                attributes: ['id', 'user_id', "book_accommodation_id", 'OriginalTrxnIdentifier']
            });
            if (order) {
                let emailTemplateHtml = ``
                const findAllTicketsData = await BookTicket.findAll({
                    where: {
                        order_id: order.id,
                        transfer_user_id: { [Op.is]: null }, // condition for transfer_user_id being null
                        ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
                    },
                    include: { model: EventTicketType },
                    raw: true,
                });
                // Only proceed if there are tickets or addons found
                for (const ticket of findAllTicketsData) {
                    const ticketDataId = ticket.id;
                    const findAllTicketsQrCode = await TicketDetail.findOne({
                        where: {
                            tid: ticketDataId,
                            transfer_user_id: { [Op.is]: null }, // Condition to check if transfer_user_id is null
                        },
                        raw: true,
                    });
                    const firstName = findAllTicketsQrCode?.fname || order.User.FirstName;
                    const lastName = findAllTicketsQrCode?.lname || order.User.LastName;
                    const ticketQrCode = `${NEXT_S3_URL}/qrCodes/${findAllTicketsQrCode.qrcode}`;
                    const ticketName = ticket["EventTicketType.title"] || "Unnamed Ticket";
                    const ticketImage = `${NEXT_S3_URL}/uploads/profiles/${ticket["EventTicketType.ticket_image"] || "Unnamed "
                        }`;
                    emailTemplateHtml += `           
                <tr>
                    <td style="height: 20px;"></td>
                </tr>

                <tr>
                    <td>
                        <div style="max-width: 500px; background-color: #ef9c7c; border-radius: 30px; border: 1px solid #ef9c7c; margin: auto; overflow: hidden;">
                            <div
                                style="
                                    background-image: url('${ticketImage}');
                                    height: 220px;
                                    background-position: center;
                                    background-size: cover;
                                    border-radius: 30px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                "
                            >
                                <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                    <div style="text-align: center; margin: auto;">
                                        <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                            O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                        </h2>
                                        <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                            Nov 6 - 9, 2025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style="padding: 30px 20px;">
                                <table style="width: 100%; color: black; font-family: Arial, Helvetica, sans-serif;">
                                    <tr style="color:rgb(255, 255, 255); text-transform: uppercase; font-size: 14px;">
                                        <td>Last Name</td>
                                        <td>First Name</td>
                                        <td>Order#</td>
                                    </tr>
                                    <tr style="text-transform: uppercase; font-size: 14px;">
                                        <td>${lastName}</td>
                                        <td>${firstName}</td>
                                        <td>${order.OriginalTrxnIdentifier}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="height: 60px; border-bottom: 1px solid #ffffff;"></td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 15px;"></td>
                                    </tr>

                                    <tr style="color: #ffffff; text-transform: uppercase; font-size: 14px;">
                                        <td colspan="3">TICKETS</td>
                                    </tr>

                                    <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                        <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>
                                        <td style="color: #ffffff; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 30px;"></td>
                                    </tr>

                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 6:</b> Los Danzantes | 9pm to 4am | Zyanya</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 7:</b> The Cloud People | 4:30pm to 6am | Polo Fields</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="padding-bottom: 20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 8:</b> The Zapotec Gods | 11pm to 7am | Cabeza del Indio</td>
                                    </tr>
                                </table>

                                <div style="margin: 60px 0;">
                                    <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                        <img style="width: 100%;" src="${ticketQrCode}" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
    `;
                }
                const findAllAddonsData = await AddonBook.findAll({
                    where: {
                        order_id: order.id,
                        transfer_user_id: { [Op.is]: null }, // Condition to check if transfer_user_id is null
                        ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
                    },
                    include: { model: Addons },
                    raw: true,
                });

                findAllAddonsData.forEach((addonsTicket) => {
                    const FirstName = addonsTicket?.fname || order.User.FirstName;
                    const LastName = addonsTicket?.lname || order.User.LastName;
                    const addonQrCode = `${NEXT_S3_URL}/qrCodes/${addonsTicket.addon_qrcode}`;
                    const addonSortName = addonsTicket["Addon.sortName"] || ""; // Default value in case it's missing
                    const addonImage = `${NEXT_S3_URL}/uploads/profiles/${addonsTicket["Addon.addon_image"] || ""
                        }`;
                    const backgroundColor = addonsTicket["Addon.addon_type"] === "Special" ? "#e6dfd5" : "#e6dfd5";
                    emailTemplateHtml += `<tr>
                            <td style="height: 30px;"></td>
                        </tr>
                        <tr>
                            <td>
                                <div style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #e6dfd5; margin: auto; overflow: hidden; ">
                                    <div
                                        style="
                                            background-image: url('${addonImage}');
                                            height: 220px;
                                            background-size: cover;
                                            border-radius: 30px;
                                            overflow: hidden;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        "
                                    >
                                        <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                            <div style="text-align: center; margin: auto;">
                                                <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                    O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                                </h2>
                                                <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                    Nov 6 - 9, 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="padding: 30px 20px;">
                                        <table style="width: 100%; color: #000000; font-family: Arial, Helvetica, sans-serif;">
                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td>Last Name</td>
                                                <td>First Name</td>
                                                <td>Order#</td>
                                            </tr>
                                            <tr style="text-transform: uppercase; font-size: 14px;">
                                                <td>${LastName}</td>
                                                <td>${FirstName}</td>
                                                <td>${order.OriginalTrxnIdentifier}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 60px; border-bottom: 1px solid #fca3bb;"></td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 15px;"></td>
                                            </tr>

                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td colspan="3">TICKETS</td>
                                            </tr>                                            

                                            <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                                <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                                                <td style="color: #fca3bb; text-transform: uppercase; font-size: 14px; text-align: right;">3 DAYS</td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 30px;"></td>
                                            </tr>

                                            <tr style="color: black; font-size: 12px;">
                                                <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;">
                                                    <b>Transportation is valid inside Careyes and to and from 
                                                    official Ondalinda events only.</b>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="margin: 60px 0;">
                                            <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                                <img style="width: 100%;" src="${addonQrCode}" alt="AddonImg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 50px;"></td>
                        </tr>
              `;
                });
                const emailTemplate = await Emailtemplet.findOne({
                    where: { eventId: 111, templateId: 14 },
                });
                // mail champ template name
                const mailChampTemplateName = emailTemplate.dataValues.mandril_template;
                const subject = emailTemplate.dataValues.subject;
                const sanitizedTemplate = emailTemplate.dataValues.description;
                const MyEventPageURL = `${SITE_URL}user/my-event`;
                const html = sanitizedTemplate;
                const filledHtml = createTemplate(html, {
                    MyEventPageURL: MyEventPageURL, OrderSummary: emailTemplateHtml
                });

                // / Extract the HTML content from the processedTemplate object
                // let extractedTemplate = processedTemplate.html;
                const templateName = mailChampTemplateName; //template name dynamic for mail champ
                const mergeVars = { ALLDATA: filledHtml };
                const toEmail = order.User.Email;

                if (findAllTicketsData.length > 0 || findAllAddonsData.length > 0) {
                    await sendEmail(toEmail, mergeVars, templateName, subject);
                }
                return res
                    .status(200)
                    .json({ success: true, message: "Email sent successfully" });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "Order not found" });
            }
        });
        await Promise.all(sendEmailPromises);
        await resendTicketToMemberSecond(existOrderId);
        return res
            .status(200)
            .json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error Resending Order Email :" + error.message,
        });
    }
}
// Resend ticket second section for transfer tickets send email for users (Kamal)
export async function resendTicketToMemberSecond(existOrderId) {
    const sendEmailPromises = existOrderId.map(async (item) => {
        const order = await MyOrders.findOne({
            where: { id: item },
            include: { model: User, attributes: ["Email", "FirstName", "LastName"] },
            attributes: ["id", "user_id", "book_accommodation_id", "OriginalTrxnIdentifier"]
        });

        if (!order) return;  // Skip if no order

        let emailTemplateHtml = ``;
        let transferUser = null;

        const findAllTicketsDataComplete = await BookTicket.findAll({
            where: {
                order_id: order.id,
                transfer_user_id: { [Op.ne]: null },
                ticket_status: { [Op.is]: null }
            },
            include: { model: EventTicketType },
            raw: true
        });

        for (const ticket of findAllTicketsDataComplete) {
            const transferUserId = ticket.transfer_user_id;

            if (!transferUser) {
                transferUser = await User.findOne({ where: { id: transferUserId } });
            }

            const ticketDataId = ticket.id;
            const findAllTicketsQrCode = await TicketDetail.findOne({
                where: { tid: ticketDataId, transfer_user_id: transferUserId },
                raw: true
            });

            const firstName = findAllTicketsQrCode?.fname || transferUser?.FirstName || "";
            const lastName = findAllTicketsQrCode?.lname || transferUser?.LastName || "";
            const ticketQrCode = `${NEXT_S3_URL}/qrCodes/${findAllTicketsQrCode.qrcode}`;
            const ticketName = ticket["EventTicketType.title"] || "Unnamed Ticket";
            const ticketImage = `${NEXT_S3_URL}/uploads/profiles/${ticket["EventTicketType.ticket_image"] || ""}`;

            emailTemplateHtml += `
         <tr>
                    <td style="height: 20px;"></td>
                </tr>

                <tr>
                    <td>
                        <div style="max-width: 500px; background-color: #ef9c7c; border-radius: 30px; border: 1px solid #ef9c7c; margin: auto; overflow: hidden;">
                            <div
                                style="
                                    background-image: url('${ticketImage}');
                                    height: 220px;
                                    background-position: center;
                                    background-size: cover;
                                    border-radius: 30px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                "
                            >
                                <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                    <div style="text-align: center; margin: auto;">
                                        <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                            O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                        </h2>
                                        <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                            Nov 6 - 9, 2025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style="padding: 30px 20px;">
                                <table style="width: 100%; color: black; font-family: Arial, Helvetica, sans-serif;">
                                    <tr style="color:rgb(255, 255, 255); text-transform: uppercase; font-size: 14px;">
                                        <td>Last Name</td>
                                        <td>First Name</td>
                                        <td>Order#</td>
                                    </tr>
                                    <tr style="text-transform: uppercase; font-size: 14px;">
                                        <td>${lastName}</td>
                                        <td>${firstName}</td>
                                        <td>${order.OriginalTrxnIdentifier}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="height: 60px; border-bottom: 1px solid #ffffff;"></td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 15px;"></td>
                                    </tr>

                                    <tr style="color: #ffffff; text-transform: uppercase; font-size: 14px;">
                                        <td colspan="3">TICKETS</td>
                                    </tr>

                                    <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                        <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>
                                        <td style="color: #ffffff; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 30px;"></td>
                                    </tr>

                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 6:</b> Los Danzantes | 9pm to 4am | Zyanya</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 7:</b> The Cloud People | 4:30pm to 6am | Polo Fields</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="padding-bottom: 20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 8:</b> The Zapotec Gods | 11pm to 7am | Cabeza del Indio</td>
                                    </tr>
                                </table>

                                <div style="margin: 60px 0;">
                                    <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                        <img style="width: 100%;" src="${ticketQrCode}" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
      `;
        }

        // ✅ Fetch addons once for the whole order (not inside ticket loop)
        const findAllAddonsData = await AddonBook.findAll({
            where: { order_id: order.id },
            include: [{ model: Addons }],
            raw: true
        });

        for (const addon of findAllAddonsData) {
                    const findAllTransferUsers = await User.findOne({
                    where: {
                        id: addon.transfer_user_id,
                    },
                    attributes:['FirstName','LastName']
                    // raw: true,
                });
            const firstNameAddon = findAllTransferUsers.FirstName;
            const lastNameAddon = findAllTransferUsers.LastName
            const addonQrCode = `${NEXT_S3_URL}/qrCodes/${addon.addon_qrcode}`;
            const addonSortName = addon["Addon.sortName"] || "";
            const addonImage = `${NEXT_S3_URL}/uploads/profiles/${addon["Addon.addon_image"] || ""}`;
            const backgroundColor = "#e6dfd5"
            emailTemplateHtml += `
                              <tr>
                            <td style="height: 30px;"></td>
                        </tr>
                        <tr>
                            <td>
                                <div style="max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #e6dfd5; margin: auto; overflow: hidden; ">
                                    <div
                                        style="
                                            background-image: url('${addonImage}');
                                            height: 220px;
                                            background-size: cover;
                                            border-radius: 30px;
                                            overflow: hidden;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        "
                                    >
                                        <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                            <div style="text-align: center; margin: auto;">
                                                <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                    O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                                </h2>
                                                <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                    Nov 6 - 9, 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="padding: 30px 20px;">
                                        <table style="width: 100%; color: #000000; font-family: Arial, Helvetica, sans-serif;">
                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td>Last Name</td>
                                                <td>First Name</td>
                                                <td>Order#</td>
                                            </tr>
                                            <tr style="text-transform: uppercase; font-size: 14px;">
                                                <td>${lastNameAddon}</td>
                                                <td>${firstNameAddon}</td>
                                                <td>${order.OriginalTrxnIdentifier}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 60px; border-bottom: 1px solid #fca3bb;"></td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 15px;"></td>
                                            </tr>

                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td colspan="3">TICKETS</td>
                                            </tr>                                            

                                            <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                                <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                                                <td style="color: #fca3bb; text-transform: uppercase; font-size: 14px; text-align: right;">3 DAYS</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 30px;"></td>
                                            </tr>
                                            <tr style="color: black; font-size: 12px;">
                                                <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;">
                                                    <b>Transportation is valid inside Careyes and to and from 
                                                    official Ondalinda events only.</b>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="margin: 60px 0;">
                                            <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                                <img style="width: 100%;" src="${addonQrCode}" alt="AddonImg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 50px;"></td>
                        </tr>
      `;
        }

        if (emailTemplateHtml && transferUser) {
            const emailTemplate = await Emailtemplet.findOne({
                where: { eventId: 111, templateId: 14 }
            });

            const MyEventPageURL = `${SITE_URL}user/my-event`;
            const html = emailTemplate.dataValues.description;
            const filledHtml = createTemplate(html, {
                MyEventPageURL,
                OrderSummary: emailTemplateHtml
            });

            const templateName = emailTemplate.dataValues.mandril_template;
            const subject = emailTemplate.dataValues.subject;
            const mergeVars = { ALLDATA: filledHtml };
            const toEmail = transferUser.Email;

            await sendEmail(toEmail, mergeVars, templateName, subject);
        }
    });

    await Promise.all(sendEmailPromises);
}




// resend ticket all member not selected orderID
export async function resendTicketAllMemberNotSelectedOrderID( req,res) {
    try {
     const {
      email,
      startDate,
      endDate,
      eventName,
      name,
      lname,
      mobile,
      orderId,
      type,
      paymentOption,
      keyword,
    } = req.body;

    const orderConditions = {
      [Op.or]: [
        { is_free: { [Op.is]: null } },
        { couponCode: { [Op.not]: null } },
      ],
      ticket_status: { [Op.is]: null },
    };

    // Date filters
    if (startDate || endDate) {
      orderConditions.created = {};
      if (startDate) {
        orderConditions.created[Op.gte] = new Date(new Date(startDate).setHours(0, 0, 0));
      }
      if (endDate) {
        orderConditions.created[Op.lte] = new Date(new Date(endDate).setHours(23, 59, 59));
      }
    }

    if (orderId?.trim()) {
      orderConditions.OriginalTrxnIdentifier = {
        [Op.like]: `%${orderId.trim().toUpperCase()}%`,
      };
    }

    if (type === "free") {
      orderConditions.is_free = 1;
    }

    if (paymentOption?.trim()) {
      orderConditions.paymentOption = paymentOption.trim().toLowerCase();
    }

    if (keyword?.trim()) {
      const kw = `%${keyword.trim()}%`;
      orderConditions[Op.or] = [
        { "$User.FirstName$": { [Op.like]: kw } },
        { "$User.LastName$": { [Op.like]: kw } },
        { "$User.Email$": { [Op.like]: kw } },
        { "$User.PhoneNumber$": { [Op.like]: kw } },
      ];
    }

    if (email?.trim()) {
      orderConditions["$User.Email$"] = {
        [Op.like]: `%${email.trim().toUpperCase()}%`,
      };
    }

    if (mobile) {
      orderConditions["$User.PhoneNumber$"] = mobile;
    }

    if (name?.trim()) {
      orderConditions["$User.FirstName$"] = {
        [Op.like]: `%${name.trim().toUpperCase()}%`,
      };
    }

    if (lname?.trim()) {
      orderConditions["$User.LastName$"] = {
        [Op.like]: `%${lname.trim().toUpperCase()}%`,
      };
    }

    let eventId = null;
    if (eventName?.trim()) {
      const event = await Event.findOne({
        attributes: ["id"],
        where: {
          Name: { [Op.like]: `%${eventName.trim()}%` },
        },
      });
      if (event) {
        eventId = event.id;
        orderConditions.event_id = event.id;
      }
    }

    // ✅ Include User model so aliases like "$User.FirstName$" are valid
    const matchedOrders = await MyOrders.findAll({
      where: orderConditions,
      include: [
        {
          model: User,
          required: true,
          attributes: [], // no need to fetch user data here, just needed for filtering
        },
      ],
      attributes: ["id"],
      raw: true,
    });

    if (!matchedOrders.length) {
      return res.status(404).json({ success: false, message: "No matching orders found." });
    }

        // const existOrderId = req.body.orderId;
        const sendEmailPromises = matchedOrders.map(async (item) => {
            const order = await MyOrders.findOne({
                where: {
                    id: item.id,
                },
                include: {
                    model: User,
                    attributes: ["Email", "FirstName", "LastName"],
                },
                attributes: ['id', 'user_id', "book_accommodation_id", 'OriginalTrxnIdentifier']
            });
            if (order) {
                let emailTemplateHtml = ``
                const findAllTicketsData = await BookTicket.findAll({
                    where: {
                        order_id: order.id,
                        transfer_user_id: { [Op.is]: null }, // condition for transfer_user_id being null
                        ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
                    },
                    include: { model: EventTicketType },
                    raw: true,
                });
                // Only proceed if there are tickets or addons found
                for (const ticket of findAllTicketsData) {
                    const ticketDataId = ticket.id;
                    const findAllTicketsQrCode = await TicketDetail.findOne({
                        where: {
                            tid: ticketDataId,
                            transfer_user_id: { [Op.is]: null }, // Condition to check if transfer_user_id is null
                        },
                        raw: true,
                    });
                    const firstName = findAllTicketsQrCode?.fname || order.User.FirstName;
                    const lastName = findAllTicketsQrCode?.lname || order.User.LastName;
                    const ticketQrCode = `${NEXT_S3_URL}/qrCodes/${findAllTicketsQrCode.qrcode}`;
                    const ticketName = ticket["EventTicketType.title"] || "Unnamed Ticket";
                    const ticketImage = `${NEXT_S3_URL}/uploads/profiles/${ticket["EventTicketType.ticket_image"] || "Unnamed "
                        }`;
                    emailTemplateHtml += `           
                <tr>
                    <td style="height: 20px;"></td>
                </tr>

                <tr>
                    <td>
                        <div style="max-width: 500px; background-color: #ef9c7c; border-radius: 30px; border: 1px solid #ef9c7c; margin: auto; overflow: hidden;">
                            <div
                                style="
                                    background-image: url('${ticketImage}');
                                    height: 220px;
                                    background-position: center;
                                    background-size: cover;
                                    border-radius: 30px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                "
                            >
                                <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                    <div style="text-align: center; margin: auto;">
                                        <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                            O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                        </h2>
                                        <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                            Nov 6 - 9, 2025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style="padding: 30px 20px;">
                                <table style="width: 100%; color: black; font-family: Arial, Helvetica, sans-serif;">
                                    <tr style="color:rgb(255, 255, 255); text-transform: uppercase; font-size: 14px;">
                                        <td>Last Name</td>
                                        <td>First Name</td>
                                        <td>Order#</td>
                                    </tr>
                                    <tr style="text-transform: uppercase; font-size: 14px;">
                                        <td>${lastName}</td>
                                        <td>${firstName}</td>
                                        <td>${order.OriginalTrxnIdentifier}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="height: 60px; border-bottom: 1px solid #ffffff;"></td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 15px;"></td>
                                    </tr>

                                    <tr style="color: #ffffff; text-transform: uppercase; font-size: 14px;">
                                        <td colspan="3">TICKETS</td>
                                    </tr>

                                    <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                        <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>
                                        <td style="color: #ffffff; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 30px;"></td>
                                    </tr>

                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 6:</b> Los Danzantes | 9pm to 4am | Zyanya</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 7:</b> The Cloud People | 4:30pm to 6am | Polo Fields</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="padding-bottom: 20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 8:</b> The Zapotec Gods | 11pm to 7am | Cabeza del Indio</td>
                                    </tr>
                                </table>

                                <div style="margin: 60px 0;">
                                    <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                        <img style="width: 100%;" src="${ticketQrCode}" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
    `;
                }
                const findAllAddonsData = await AddonBook.findAll({
                    where: {
                        order_id: order.id,
                        transfer_user_id: { [Op.is]: null }, // Condition to check if transfer_user_id is null
                        ticket_status: { [Op.is]: null }, // Condition for ticket_status being null
                    },
                    include: { model: Addons },
                    raw: true,
                });

                findAllAddonsData.forEach((addonsTicket) => {
                    const FirstName = addonsTicket?.fname || order.User.FirstName;
                    const LastName = addonsTicket?.lname || order.User.LastName;
                    const addonQrCode = `${NEXT_S3_URL}/qrCodes/${addonsTicket.addon_qrcode}`;
                    const addonSortName = addonsTicket["Addon.sortName"] || ""; // Default value in case it's missing
                    const addonImage = `${NEXT_S3_URL}/uploads/profiles/${addonsTicket["Addon.addon_image"] || ""
                        }`;
                    const backgroundColor = addonsTicket["Addon.addon_type"] === "Special" ? "#e6dfd5" : "#e6dfd5";
                    emailTemplateHtml += `<tr>
                            <td style="height: 30px;"></td>
                        </tr>
                        <tr>
                            <td>
                                <div style=" max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #e6dfd5; margin: auto; overflow: hidden; ">
                                    <div
                                        style="
                                            background-image: url('${addonImage}');
                                            height: 220px;
                                            background-size: cover;
                                            border-radius: 30px;
                                            overflow: hidden;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        "
                                    >
                                        <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                            <div style="text-align: center; margin: auto;">
                                                <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                    O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                                </h2>
                                                <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                    Nov 6 - 9, 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="padding: 30px 20px;">
                                        <table style="width: 100%; color: #000000; font-family: Arial, Helvetica, sans-serif;">
                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td>Last Name</td>
                                                <td>First Name</td>
                                                <td>Order#</td>
                                            </tr>
                                            <tr style="text-transform: uppercase; font-size: 14px;">
                                                <td>${LastName}</td>
                                                <td>${FirstName}</td>
                                                <td>${order.OriginalTrxnIdentifier}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 60px; border-bottom: 1px solid #fca3bb;"></td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 15px;"></td>
                                            </tr>

                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td colspan="3">TICKETS</td>
                                            </tr>                                            

                                            <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                                <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                                                <td style="color: #fca3bb; text-transform: uppercase; font-size: 14px; text-align: right;">3 DAYS</td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 30px;"></td>
                                            </tr>

                                            <tr style="color: black; font-size: 12px;">
                                                <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;">
                                                    <b>Transportation is valid inside Careyes and to and from 
                                                    official Ondalinda events only.</b>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="margin: 60px 0;">
                                            <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                                <img style="width: 100%;" src="${addonQrCode}" alt="AddonImg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 50px;"></td>
                        </tr>
              `;
                });
                const emailTemplate = await Emailtemplet.findOne({
                    where: { eventId: 111, templateId: 14 },
                });
                // mail champ template name
                const mailChampTemplateName = emailTemplate.dataValues.mandril_template;
                const subject = emailTemplate.dataValues.subject;
                const sanitizedTemplate = emailTemplate.dataValues.description;
                const MyEventPageURL = `${SITE_URL}user/my-event`;
                const html = sanitizedTemplate;
                const filledHtml = createTemplate(html, {
                    MyEventPageURL: MyEventPageURL, OrderSummary: emailTemplateHtml
                });

                // / Extract the HTML content from the processedTemplate object
                // let extractedTemplate = processedTemplate.html;
                const templateName = mailChampTemplateName; //template name dynamic for mail champ
                const mergeVars = { ALLDATA: filledHtml };
                const toEmail = order.User.Email;

                if (findAllTicketsData.length > 0 || findAllAddonsData.length > 0) {
                    await sendEmail(toEmail, mergeVars, templateName, subject);
                }
                return res
                    .status(200)
                    .json({ success: true, message: "Email sent successfully" });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "Order not found" });
            }
        });
        await Promise.all(sendEmailPromises);
        await resendTicketToMemberSecond(matchedOrders);
        return res
            .status(200)
            .json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error Resending Order Email :" + error.message,
        });
    }
}
// Resend ticket second section for transfer tickets send email for users (Kamal)
export async function resendTicketAllMemberNotSelectedOrderIDSecond(existOrderId) {
    const sendEmailPromises = existOrderId.map(async (item) => {
        const order = await MyOrders.findOne({
            where: { id: item.id },
            include: { model: User, attributes: ["Email", "FirstName", "LastName"] },
            attributes: ["id", "user_id", "book_accommodation_id", "OriginalTrxnIdentifier"]
        });

        if (!order) return;  // Skip if no order

        let emailTemplateHtml = ``;
        let transferUser = null;

        const findAllTicketsDataComplete = await BookTicket.findAll({
            where: {
                order_id: order.id,
                transfer_user_id: { [Op.ne]: null },
                ticket_status: { [Op.is]: null }
            },
            include: { model: EventTicketType },
            raw: true
        });

        for (const ticket of findAllTicketsDataComplete) {
            const transferUserId = ticket.transfer_user_id;

            if (!transferUser) {
                transferUser = await User.findOne({ where: { id: transferUserId } });
            }

            const ticketDataId = ticket.id;
            const findAllTicketsQrCode = await TicketDetail.findOne({
                where: { tid: ticketDataId, transfer_user_id: transferUserId },
                raw: true
            });

            const firstName = findAllTicketsQrCode?.fname || transferUser?.FirstName || "";
            const lastName = findAllTicketsQrCode?.lname || transferUser?.LastName || "";
            const ticketQrCode = `${NEXT_S3_URL}/qrCodes/${findAllTicketsQrCode.qrcode}`;
            const ticketName = ticket["EventTicketType.title"] || "Unnamed Ticket";
            const ticketImage = `${NEXT_S3_URL}/uploads/profiles/${ticket["EventTicketType.ticket_image"] || ""}`;

            emailTemplateHtml += `
         <tr>
                    <td style="height: 20px;"></td>
                </tr>

                <tr>
                    <td>
                        <div style="max-width: 500px; background-color: #ef9c7c; border-radius: 30px; border: 1px solid #ef9c7c; margin: auto; overflow: hidden;">
                            <div
                                style="
                                    background-image: url('${ticketImage}');
                                    height: 220px;
                                    background-position: center;
                                    background-size: cover;
                                    border-radius: 30px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                "
                            >
                                <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                    <div style="text-align: center; margin: auto;">
                                        <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                            O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                        </h2>
                                        <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                            Nov 6 - 9, 2025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style="padding: 30px 20px;">
                                <table style="width: 100%; color: black; font-family: Arial, Helvetica, sans-serif;">
                                    <tr style="color:rgb(255, 255, 255); text-transform: uppercase; font-size: 14px;">
                                        <td>Last Name</td>
                                        <td>First Name</td>
                                        <td>Order#</td>
                                    </tr>
                                    <tr style="text-transform: uppercase; font-size: 14px;">
                                        <td>${lastName}</td>
                                        <td>${firstName}</td>
                                        <td>${order.OriginalTrxnIdentifier}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="height: 60px; border-bottom: 1px solid #ffffff;"></td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 15px;"></td>
                                    </tr>

                                    <tr style="color: #ffffff; text-transform: uppercase; font-size: 14px;">
                                        <td colspan="3">TICKETS</td>
                                    </tr>

                                    <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                        <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${ticketName}</td>
                                        <td style="color: #ffffff; text-transform: uppercase; font-size: 14px; text-align: right;">3 NIGHTS</td>
                                    </tr>

                                    <tr>
                                        <td colspan="3" style="height: 30px;"></td>
                                    </tr>

                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 6:</b> Los Danzantes | 9pm to 4am | Zyanya</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 7:</b> The Cloud People | 4:30pm to 6am | Polo Fields</td>
                                    </tr>
                                    <tr style="color: black; font-size: 12px;">
                                        <td colspan="3" style="padding-bottom: 20px; font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;"><b>Nov 8:</b> The Zapotec Gods | 11pm to 7am | Cabeza del Indio</td>
                                    </tr>
                                </table>

                                <div style="margin: 60px 0;">
                                    <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                        <img style="width: 100%;" src="${ticketQrCode}" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
      `;
        }

        // ✅ Fetch addons once for the whole order (not inside ticket loop)
        const findAllAddonsData = await AddonBook.findAll({
            where: { order_id: order.id },
            include: [{ model: Addons }],
            raw: true
        });

        for (const addon of findAllAddonsData) {
                    const findAllTransferUsers = await User.findOne({
                    where: {
                        id: addon.transfer_user_id,
                    },
                    attributes:['FirstName','LastName']
                    // raw: true,
                });
            const firstNameAddon = findAllTransferUsers.FirstName;
            const lastNameAddon = findAllTransferUsers.LastName
            const addonQrCode = `${NEXT_S3_URL}/qrCodes/${addon.addon_qrcode}`;
            const addonSortName = addon["Addon.sortName"] || "";
            const addonImage = `${NEXT_S3_URL}/uploads/profiles/${addon["Addon.addon_image"] || ""}`;
            const backgroundColor = "#e6dfd5"
            emailTemplateHtml += `
                              <tr>
                            <td style="height: 30px;"></td>
                        </tr>
                        <tr>
                            <td>
                                <div style="max-width: 500px; background-color: ${backgroundColor}; border-radius: 30px; border: 1px solid #e6dfd5; margin: auto; overflow: hidden; ">
                                    <div
                                        style="
                                            background-image: url('${addonImage}');
                                            height: 220px;
                                            background-size: cover;
                                            border-radius: 30px;
                                            overflow: hidden;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        "
                                    >
                                        <div style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.55); display: flex; justify-content: center; align-items: center;">
                                            <div style="text-align: center; margin: auto;">
                                                <h2 style="margin: 0px; font-family: none; font-style: italic; font-size: min(max(25px, 8.3vw), 35px); font-weight: 100; color: white;">
                                                    O<span style="color: #fca3bb; font-family: Arial, Helvetica, sans-serif; font-style: normal;"> x </span>CAREYES
                                                </h2>
                                                <p style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif; font-style: normal; margin: 0;">
                                                    Nov 6 - 9, 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="padding: 30px 20px;">
                                        <table style="width: 100%; color: #000000; font-family: Arial, Helvetica, sans-serif;">
                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td>Last Name</td>
                                                <td>First Name</td>
                                                <td>Order#</td>
                                            </tr>
                                            <tr style="text-transform: uppercase; font-size: 14px;">
                                                <td>${lastNameAddon}</td>
                                                <td>${firstNameAddon}</td>
                                                <td>${order.OriginalTrxnIdentifier}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 60px; border-bottom: 1px solid #fca3bb;"></td>
                                            </tr>

                                            <tr>
                                                <td colspan="3" style="height: 15px;"></td>
                                            </tr>

                                            <tr style="color: #fca3bb; text-transform: uppercase; font-size: 14px;">
                                                <td colspan="3">TICKETS</td>
                                            </tr>                                            

                                            <tr style="color: black; text-transform: uppercase; line-height: 30px; font-size: 14px;">
                                                <td colspan="2">1<span style="text-transform: lowercase;">x</span> ${addonSortName}</td>
                                                <td style="color: #fca3bb; text-transform: uppercase; font-size: 14px; text-align: right;">3 DAYS</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" style="height: 30px;"></td>
                                            </tr>
                                            <tr style="color: black; font-size: 12px;">
                                                <td colspan="3" style="font-family: 'Roboto', Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 300;">
                                                    <b>Transportation is valid inside Careyes and to and from 
                                                    official Ondalinda events only.</b>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="margin: 60px 0;">
                                            <div style="width: 130px; height: 130px; overflow: hidden; margin: auto;">
                                                <img style="width: 100%;" src="${addonQrCode}" alt="AddonImg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 50px;"></td>
                        </tr>
      `;
        }

        if (emailTemplateHtml && transferUser) {
            const emailTemplate = await Emailtemplet.findOne({
                where: { eventId: 111, templateId: 14 }
            });

            const MyEventPageURL = `${SITE_URL}user/my-event`;
            const html = emailTemplate.dataValues.description;
            const filledHtml = createTemplate(html, {
                MyEventPageURL,
                OrderSummary: emailTemplateHtml
            });

            const templateName = emailTemplate.dataValues.mandril_template;
            const subject = emailTemplate.dataValues.subject;
            const mergeVars = { ALLDATA: filledHtml };
            const toEmail = transferUser.Email;

            await sendEmail(toEmail, mergeVars, templateName, subject);
        }
    });

    await Promise.all(sendEmailPromises);
}