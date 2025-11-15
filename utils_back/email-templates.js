
const SITE_URL = 'https://staging.ondalinda.com/';

// cancel tickets
const cancelTicketTemplate = ({ userName, html, }) => ({
    html: html.replace(/{userName}/g, userName).replace(/{html}/g, html),
});

// Order email - create order email template - tickets+ accommodations
const orderTemplate = ({ userName, UserEmail, OrderID, OrderSummary, HouseName, HousingNeighborhood, checkInDate, checkOutDate, MyEventPageURL, html, }) => ({
    html: html.replace(/{userName}/g, userName).replace(/{UserEmail}/g, UserEmail).replace(/{OrderID}/g, OrderID).replace(/{HouseName}/g, HouseName).replace(/{HousingNeighborhood}/g, HousingNeighborhood).replace(/{checkInDate}/g, checkInDate).replace(/{checkOutDate}/g, checkOutDate).replace(/{MyEventPageURL}/g, MyEventPageURL)
        .replace(/{OrderSummary}/g, OrderSummary)
        .replace(/{html}/g, html),
});


// Order email - create order email template - only  tickets 
const orderTicketsTemplate = ({ OrderSummary, MyEventPageURL, html, }) => ({
    html: html.replace(/{MyEventPageURL}/g, MyEventPageURL).replace(/{OrderSummary}/g, OrderSummary).replace(/{html}/g, html),
});



// Rejected Email - Member status
const RejectedEmailTemplate = ({ UserName, html, }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{html}/g, html),
});
// Pending Approval Email - Member status
const pendingApprovalTemplate = ({ UserName, html, }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{html}/g, html),
});

// Approval Email - Member status
const ApproveTemplate = ({ UserName, Password, UserEmail, html, }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{Password}/g, Password).replace(/{UserEmail}/g, UserEmail).replace(/{html}/g, html),
});

// invitation email template - Reminder for event
const invitationTemplate = ({ UserName, SiteUrl, html, }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{SiteUrl}/g, SiteUrl).replace(/{html}/g, html),
});



// rename ticket email template - Rename Ticket
const renameTicketTemplate = ({ UserName, LastName, FirstName, OrderID, QRCODE, html, }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{LastName}/g, LastName).replace(/{FirstName}/g, FirstName).
        replace(/{OrderID}/g, OrderID).replace(/{QRCODE}/g, QRCODE).replace(/{html}/g, html),
});

//rename Addon email template

// sort_day
// addon_name
// addon_time
// addon_location
const renameAddonTemplate = ({ UserName, LName, FName, OrderID, QRCODE, addonLocation, addon_time, addon_location, addonName, Time, backGround, addonImage, sort_day, addon_name, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{LName}/g, LName).replace(/{FName}/g, FName).replace(/{addonImage}/g, addonImage).
        replace(/{OrderID}/g, OrderID).replace(/{QRCODE}/g, QRCODE).replace(/{addonLocation}/g, addonLocation).replace(/{addonName}/g, addonName).replace(/{Time}/g, Time).replace(/{backGround}/g, backGround)
        .replace(/{addon_time}/g, addon_time).replace(/{addon_location}/g, addon_location).replace(/{sort_day}/g, sort_day).replace(/{addon_name}/g, addon_name).replace(/{html}/g, html),
});

// Ticket Transfer Confirmation email template
const ticketTransferTemplate = ({ ticketQR, TicketOrderID, fName, Lname, fromName, toName, AdoonData, TicketName, html }) => ({
    html: html.replace(/{fromName}/g, fromName).replace(/{Lname}/g, Lname).replace(/{fName}/g, fName).replace(/{TicketName}/g, TicketName)
        .replace(/{TicketOrderID}/g, TicketOrderID).replace(/{ticketQR}/g, ticketQR).replace(/{toName}/g, toName).replace(/{AdoonData}/g, AdoonData)
        .replace(/{html}/g, html),
});

// Reset Password
const resetPasswordTemplate = ({ UserName, Password, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{Password}/g, Password).replace(/{html}/g, html)
});

// Registration-email template 
const registrationTemplate = ({ UserName, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{html}/g, html)
});

// Update Profile
const updateProfileTemplate = ({ FirstName, html }) => ({
    html: html.replace(/{FirstName}/g, FirstName).replace(/{html}/g,
        html)
});

// Join-Our Community template
const joinOurCommunityTemplate = ({ html, UserSend }) => ({
    html: html.replace(/{UserSend}/g, UserSend).replace(/{html}/g,
        html)
});


// resend-ticket template
const resendTicketTemplate = ({ ALLDATA, html }) => ({
    html: html.replace(/{ALLDATA}/g, ALLDATA).replace(/{html}/g, html)
});

// Transfer Addon--
const transferAddonTemplate = ({ UserName, LName, FName, OrderID, QRCODE, addonLocation, addon_time, addon_location, addonName, Time, backGround, addonImage, sort_day, addon_name, toName, fromName, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{LName}/g, LName).replace(/{FName}/g, FName).replace(/{addonImage}/g, addonImage).
        replace(/{OrderID}/g, OrderID).replace(/{QRCODE}/g, QRCODE).replace(/{addonLocation}/g, addonLocation).replace(/{addonName}/g, addonName).replace(/{Time}/g, Time).replace(/{backGround}/g, backGround)
        .replace(/{addon_time}/g, addon_time).replace(/{addon_location}/g, addon_location).replace(/{sort_day}/g, sort_day).replace(/{addon_name}/g, addon_name).replace(/{toName}/g, toName).replace(/{fromName}/g, fromName).replace(/{html}/g, html),
});


// donationTemplate Email template
const donationTemplate = ({ UserName, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{html}/g, html)
});

// Staff Invitation send Email --
// const staffInvitationTemplate = ({ html, UserSend }) => ({
const staffInvitationTemplate = ({ USERNAME, URLLINK, html }) => ({
    html: html.replace(/{USERNAME}/g, USERNAME).replace(/{URLLINK}/g, URLLINK).replace(/{html}/g, html)
});

// Staff Ticket
const staffTicketTemplate = ({ USERNAME, LNAME, FNAME, QRCODE, html }) => ({
    html: html.replace(/{USERNAME}/g, USERNAME).replace(/{LNAME}/g, LNAME).replace(/{FNAME}/g, FNAME).replace(/{QRCODE}/g, QRCODE).replace(/{html}/g, html)
});

// Staff ticket COMP
const staffTicketCompTemplate = ({ USERNAME, LNAME, FNAME, QRCODE, html }) => ({
    html: html.replace(/{USERNAME}/g, USERNAME).replace(/{LNAME}/g, LNAME).replace(/{FNAME}/g, FNAME).replace(/{QRCODE}/g, QRCODE).replace(/{html}/g, html)
});
// Staff ticket CORE
const staffTicketCoreTemplate = ({ USERNAME, LNAME, FNAME, QRCODE, html }) => ({
    html: html.replace(/{USERNAME}/g, USERNAME).replace(/{LNAME}/g, LNAME).replace(/{FNAME}/g, FNAME).replace(/{QRCODE}/g, QRCODE).replace(/{html}/g, html)
});


// gust received a 5+ bedroom villa
const guestReceivedVillaTemplate = ({ MemberName, html }) => ({
    html: html.replace(/{MemberName}/g, MemberName).replace(/{html}/g, html)
});

// book accommodation-working
const bookAccommodationTemplate = ({ ManagerName, UserName, UserEmail, PropertyName, EventDate, html }) => ({
    html: html
        .replace(/{ManagerName}/g, ManagerName)
        .replace(/{UserName}/g, UserName)
        .replace(/{UserEmail}/g, UserEmail)
        .replace(/{PropertyName}/g, PropertyName)
        .replace(/{EventDate}/g, EventDate)
        .replace(/{html}/g, html)
});



// Send Accommodations Email
const sendAccommodationTemplate = ({ UserName, URLLINK, propertyCount, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{URLLINK}/g, URLLINK).replace(/{propertyCount}/g, propertyCount).replace(/{html}/g, html)
});

//  // Send Remaining Amount Email function multiple emails
const SendRemainingAmountEmailTemplate = ({ PaymentLink, UserName, DueAmount, TaxAmount, TaxPercent, TotalDueWithTax, CurrencySymbol, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{PaymentLink}/g, PaymentLink).replace(/{DueAmount}/g, DueAmount).replace(/{TaxAmount}/g, TaxAmount).replace(/{TaxPercent}/g, TaxPercent).replace(/{TotalDueWithTax}/g, TotalDueWithTax).replace(/{CurrencySymbol}/g, CurrencySymbol).replace(/{html}/g, html)
});

// Send Remaining Amount Email Payment confirmation
const PaymentConfirmationTemplate = ({ propertyName, Neighborhood, StayDates, MyEventsLink, html }) => ({
    html: html.replace(/{propertyName}/g, propertyName).replace(/{Neighborhood}/g, Neighborhood).replace(/{StayDates}/g, StayDates).replace(/{MyEventsLink}/g, MyEventsLink).replace(/{html}/g, html)
});


// send remainder 3 days and 30 days of 15 sep before 
// const sendRemainder3Days15SepTemplate = ({ UserName, html }) =>
const sendRemainderTemplates = ({ PaymentLink, UserName, TotalDueWithTax, CurrencySymbol, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{PaymentLink}/g, PaymentLink).replace(/{TotalDueWithTax}/g, TotalDueWithTax).replace(/{CurrencySymbol}/g, CurrencySymbol).replace(/{html}/g, html)
});

// Remainder send 15 sep 30 days before
const sendPartialPayment50Template = ({ UserName, propertyName, propertyAddress, amountWithCurrency, remainingWithCurrency, AccommodationBookingDates, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{propertyName}/g, propertyName).replace(/{propertyAddress}/g, propertyAddress).replace(/{amountWithCurrency}/g, amountWithCurrency).replace(/{remainingWithCurrency}/g, remainingWithCurrency).replace(/{AccommodationBookingDates}/g, AccommodationBookingDates).replace(/{html}/g, html)
});


const sendPartialPayment100Template = ({ UserName, propertyName, propertyAddress, amountWithCurrency, AccommodationBookingDates, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{propertyName}/g, propertyName).replace(/{propertyAddress}/g, propertyAddress).replace(/{amountWithCurrency}/g, amountWithCurrency).replace(/{AccommodationBookingDates}/g, AccommodationBookingDates).replace(/{html}/g, html)
});

const processTemplate = ({ html, ...data }) => {
    let processedHtml = html;

    for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{${key}}`, 'g');
        processedHtml = processedHtml.replace(placeholder, value);
    }
    return { html: processedHtml };
};


// Added guest Email template
const AddGuestInAccommodationTemplate = ({ UserName, PropertyName, StayDate, MyEventsLink, html }) => ({
    html: html.replace(/{UserName}/g, UserName).replace(/{PropertyName}/g, PropertyName).replace(/{StayDate}/g, StayDate).replace(/{MyEventsLink}/g, MyEventsLink).replace(/{html}/g, html)
});





module.exports = {
    processTemplate,
    cancelTicketTemplate,
    orderTemplate,
    RejectedEmailTemplate,
    pendingApprovalTemplate,
    ApproveTemplate,
    invitationTemplate,
    renameTicketTemplate,
    renameAddonTemplate,
    ticketTransferTemplate,
    resetPasswordTemplate,
    registrationTemplate,
    updateProfileTemplate,
    joinOurCommunityTemplate,
    resendTicketTemplate,
    transferAddonTemplate,
    donationTemplate,
    staffInvitationTemplate,
    staffTicketTemplate,
    staffTicketCompTemplate,
    staffTicketCoreTemplate,
    guestReceivedVillaTemplate,
    bookAccommodationTemplate,
    sendAccommodationTemplate,
    SendRemainingAmountEmailTemplate,
    PaymentConfirmationTemplate,
    sendRemainderTemplates,
    sendPartialPayment50Template,
    sendPartialPayment100Template,
    orderTicketsTemplate,
    AddGuestInAccommodationTemplate

};