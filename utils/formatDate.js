// utils/formatDate.js
// export const formatDateTime = (dateString, timezone = null, locale = "en-GB") => {
//     if (!dateString) return "";

//     try {
//         const date = new Date(dateString);

//         // Use Intl.DateTimeFormat for timezone-safe conversion
//         const formatter = new Intl.DateTimeFormat(locale, {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: true,
//             timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
//         });

//         return formatter.format(date);
//     } catch (error) {
//         console.error("Invalid date format:", dateString, error);
//         return "";
//     }
// };

import moment from "moment-timezone";

export const formatDateTime = (
    dateString,
    timezone = null,
    locale = "en-GB"
) => {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);

        const formatter = new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // AM/PM enabled
            timeZone:
                timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        return formatter.format(date);
    } catch (error) {
        console.error("Invalid date format:", dateString, error);
        return "";
    }
};

export const formatDateTimeShort = (dateString) => {
    if (!dateString) return "";

    try {
        const date = new Date(dateString.replace(" ", "T")); // handles "YYYY-MM-DD HH:mm:ss"

        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("en-GB", { month: "short" }); // e.g. "Nov"
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // convert to 12-hour format

        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    } catch (error) {
        console.error("Invalid date:", dateString);
        return "";
    }
};

// Use all where 
export const formatEventDateTime = (
    date,
    timezone,
    format = "ddd, DD MMM YYYY | hh:mm A"
) => {
    if (!date) return "N/A";

    return moment(date)
        .tz(timezone || "Asia/Kolkata")
        .format(format);
};


export const isEventExpired = (event) => {
    if (!event?.date_to?.utc || !event?.event_timezone) return false;

    try {
        const nowInEventTZ = moment().tz(event.event_timezone);
        const eventEndInTZ = moment
            .utc(event.date_to.utc)
            .tz(event.event_timezone);

        return nowInEventTZ.isAfter(eventEndInTZ);
    } catch (e) {
        console.error("Event expiry check failed:", e);
        return false;
    }
};
