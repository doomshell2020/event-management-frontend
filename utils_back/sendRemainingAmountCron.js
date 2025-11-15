import { Order, User, Event, Currency, Emailtemplet } from "../database/models";
import { sendEmail } from "./sendEmail"; // send mail via mandril
import { sendRemainderTemplates } from "./email-templates"; // Email-template
import moment from "moment-timezone";
let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// send remaining amount email remainder for event start 15 days before and 3 days before
export async function sendRemainingAmountEmail(res) {
    try {
        const eventId = 111;
        const eventInfo = await Event.findOne({
            where: { id: eventId },
            include: { model: Currency, attributes: ['Currency_symbol'] },
            attributes: ['Name', 'reminder_date', 'EventTimeZone']
        });
        if (!eventInfo) {
            return { success: false, message: "Event not found." };
        }
        const { Currency: currency, reminder_date, EventTimeZone } = eventInfo;
        const timezone = EventTimeZone || moment.tz.guess();
        const ReminderDate = moment.tz(reminder_date, timezone);
        const today = moment().tz(timezone);
        // const daysDiff = eventStart.diff(today, 'days');
        // if (![15, 3].includes(daysDiff)) {
        //     return {
        //         success: false,
        //         message: "Today is not 15 or 3 days before the event. No emails sent.",
        //     };
        // }
        // const targetDate = moment.tz("2025-05-23", timezone); // 3 days from today (May 19)
        // const targetDate = moment.tz("2025-06-19", timezone); // 30 days from today (May 19)
        const daysDiff = ReminderDate.diff(today, 'days');
        if (![30, 3].includes(daysDiff)) {
            return {

                success: false,
                message: "Today is not 30 or 3 days before the target date. No emails sent.",
            };
        }

        let templateId;
        if (daysDiff === 30) {
            console.log("<<<<<<<<<<<<<<<<<object>>>>>>>>>>>>>>>>>")
            templateId = 36; // Replace with actual template ID for 30 days
        } else if (daysDiff === 3) {
            templateId = 35; // Replace with actual template ID for 3 days
        } else {
            return {
                success: false,
                message: "Today is not 30 or 3 days before the target date. No emails sent.",
            };
        }

        const orders = await Order.findAll({
            where: { paymentOption: "partial", event_id: eventId },
            include: {
                model: User,
                attributes: ["Email", "FirstName", "LastName"]
            },
            attributes: [
                "id",
                "user_id",
                "event_id",
                "total_amount",
                "total_due_amount",
                "OriginalTrxnIdentifier",
                "adminfee"
            ],
        });
        if (!orders?.length) {
            return { success: false, message: "No partial payment orders found." };
        }
        // const emailTemplate = await Emailtemplet.findOne({
        //     where: { eventId, templateId: 33 },
        // });

        const emailTemplate = await Emailtemplet.findOne({ where: { eventId, templateId } });

        if (!emailTemplate) {
            return { success: false, message: "Email template not found." };
        }
        const results = [];
        for (const order of orders) {
            const { total_due_amount, adminfee, User: user } = order;
            const adminFeeRate = parseFloat(adminfee);
            const adminFeeTax = (total_due_amount * adminFeeRate) / 100;
            const updatedDueAmount = total_due_amount + adminFeeTax;
            const EventPage = `${SITE_URL}user/my-event/`
            const processedTemplate = sendRemainderTemplates({
                PaymentLink: EventPage,
                UserName: `${user.FirstName} ${user.LastName}`,
                TotalDueWithTax: Math.round(updatedDueAmount).toLocaleString(),
                CurrencySymbol: currency.Currency_symbol,
                html: emailTemplate.description,
            });
            const mergeVars = { ALLDATA: processedTemplate.html };
            await sendEmail(user.Email, mergeVars, emailTemplate.mandril_template, emailTemplate.subject);
            results.push({
                id: order.id,
                success: true,
                message: "Remaining amount email sent successfully.",
            });
        }
        return {
            success: true,
            message: "All remaining amount emails sent successfully.",
            data: results,
        };
    } catch (error) {
        console.error("Error in sendRemainingAmountEmail:", error);
        return {
            success: false,
            message: "Internal server error.",
            error: error.message,
        };
    }
}
