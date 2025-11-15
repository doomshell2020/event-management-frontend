import axios from "axios";

const sendEmail = async (recipientEmail, mergeVars, templatename, subject) => {
  // console.log("recipientEmail", recipientEmail)
  // const apiKey = "md-fBnpwICjdGEa8H6aZOGOCw";
  const apiKey = "md-ptmj1tCvdBJJSDP6sbMT8A";

  const templateName = templatename;

  const apiUrl = "https://mandrillapp.com/api/1.0/messages/send-template.json";
  const payload = {
    key: apiKey,
    template_name: templateName,
    template_content: [],
    message: {
      to: [{ email: recipientEmail }],
      bcc_address: "tech@ashwalabs.com",
      // bcc_address: "tech@ashwalabs.com,lulu@ondalinda.com",
      subject: subject, // Dynamic subject
      merge_vars: [
        {
          rcpt: recipientEmail,
          vars: Object.entries(mergeVars).map(([name, content]) => ({
            name,
            content,
          })),
        },
      ],
    },
  };

  try {
    const response = await axios.post(apiUrl, payload);
    console.log("Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.response.data);
    return false;
  }
};

// const sendMultipleEmails = async (recipientEmails, mergeVars, templateName) => {

//     // console.log('toRecipients', recipientEmails);
//     // console.log('mergeVars', mergeVars);
//     // console.log('templateName', templateName);
//     // return false

//     const apiKey = 'md-fBnpwICjdGEa8H6aZOGOCw';
//     const apiUrl = 'https://mandrillapp.com/api/1.0/messages/send-template.json';
//     // // Define the CC addresses
//     const ccRecipients = [
//         { email: 'lokesh@doomshell.com', type: 'cc' }
//     ];

//     // // Construct the 'to' field for multiple recipients
//     const toRecipients = recipientEmails.map(email => ({ email }));
//     console.log('toRecipients', toRecipients);

//     const payload = {
//         key: apiKey,
//         template_name: templateName,
//         template_content: [],
//         message: {
//             to: [...toRecipients, ...ccRecipients],
//             // cc: "lokesh@doomshell.com",
//             bcc_address: "tech@ashwalabs.com",
//             merge_vars: recipientEmails.map(email => ({
//                 rcpt: email,
//                 vars: Object.entries(mergeVars).map(([name, content]) => ({ name, content })),
//             })),
//         }
//     };

//     console.log(payload);

//     try {
//         // const response = await axios.post(apiUrl, payload);
//         // console.log('Email sent successfully:', response.data);
//         return true;
//     } catch (error) {
//         console.error('Error sending email:', error.response.data);
//         return false;
//     }
// };
const sendMultipleEmails = async (recipientEmails, mergeVars, templateName) => {
  const apiKey = "md-fBnpwICjdGEa8H6aZOGOCw";
  const apiUrl = "https://mandrillapp.com/api/1.0/messages/send-template.json";

  // Define the CC addresses
  const ccRecipients = [{ email: "hello@ondalinda.com", type: "cc" }];
  const bccRecipients = [{ email: "tech@ashwalabs.com", type: "bcc" }];

  // Construct the 'to' field for multiple recipients
  const toRecipients = recipientEmails.map((email) => ({ email }));

  // Construct merge vars for all recipients including CC and BCC
  const allRecipients = [
    ...recipientEmails,
    ...ccRecipients.map((cc) => cc.email),
    ...bccRecipients.map((bcc) => bcc.email),
  ];
  const mergeVarsForAllRecipients = allRecipients.map((email) => ({
    rcpt: email,
    vars: Object.entries(mergeVars).map(([name, content]) => ({
      name,
      content,
    })),
  }));

  const payload = {
    key: apiKey,
    template_name: templateName,
    template_content: [],
    message: {
      to: [...toRecipients, ...ccRecipients, ...bccRecipients],
      merge_vars: mergeVarsForAllRecipients,
    },
  };

  // console.log(payload);

  try {
    const response = await axios.post(apiUrl, payload);
    console.log("Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.response.data);
    return false;
  }
};

const sendEmailToOndalindaTeam = async (
  recipientEmails,
  mergeVars,
  templateName,
  UserEmail
) => {
  const apiKey = "md-fBnpwICjdGEa8H6aZOGOCw";
  const apiUrl = "https://mandrillapp.com/api/1.0/messages/send-template.json";

  // Define the CC addresses
  // const ccRecipients = [{ email: 'hello@ondalinda.com', type: 'cc' },{ email: 'kristen@ondalinda.com', type: 'cc' },{ email: 'mariana@ondalinda.com', type: 'cc' }];
  const ccRecipients = [
    { email: "kristen@ondalinda.com", type: "cc" },
    { email: "mariana@ondalinda.com", type: "cc" },
    { email: UserEmail, type: "cc" },
  ];
  const bccRecipients = [{ email: "tech@ashwalabs.com", type: "bcc" }];
  const toRecipients = recipientEmails.map((email) => ({ email }));
  const allRecipients = [
    ...recipientEmails,
    ...ccRecipients.map((cc) => cc.email),
    ...bccRecipients.map((bcc) => bcc.email),
  ];
  const mergeVarsForAllRecipients = allRecipients.map((email) => ({
    rcpt: email,
    vars: Object.entries(mergeVars).map(([name, content]) => ({
      name,
      content,
    })),
  }));

  const payload = {
    key: apiKey,
    template_name: templateName,
    template_content: [],
    message: {
      to: [...toRecipients, ...ccRecipients, ...bccRecipients],
      merge_vars: mergeVarsForAllRecipients,
    },
  };

  // console.log(payload);

  try {
    const response = await axios.post(apiUrl, payload);
    console.log("Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.response.data);
    return false;
  }
};


// Send Email with BCC users multiple
// const sendEmailWithBCC = async (recipientEmail, bccEmails, mergeVars, templatename, subject) => {
//   const apiKey = "md-ptmj1tCvdBJJSDP6sbMT8A";
//   const templateName = templatename;
//   const apiUrl = "https://mandrillapp.com/api/1.0/messages/send-template.json";

//   // ✅ Prepare the "to" list
//   const toList = [
//     { email: recipientEmail, type: "to" },
//     ...(
//       Array.isArray(bccEmails)
//         ? bccEmails.map(email => ({ email, type: "bcc" }))
//         : []
//     )
//   ];
//   // ✅ Prepare merge_vars for ALL recipients
//   const mergeVarsList = toList.map(r => ({
//     rcpt: r.email,
//     vars: Object.entries(mergeVars).map(([name, content]) => ({
//       name,
//       content
//     })),
//   }));

//   // ✅ Final payload
//   const payload = {
//     key: apiKey,
//     template_name: templateName,
//     template_content: [],
//     message: {
//       to: toList,
//       subject: subject,
//       merge_vars: mergeVarsList,
//     },
//   };

//   try {
//     const response = await axios.post(apiUrl, payload);
//     console.log("Email sent successfully:", response.data);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error.response?.data || error);
//     return false;
//   }
// };


// new function send email to hello@ondalinda.com()


const sendEmailWithBCC = async (recipientEmail, bccEmails, mergeVars, templatename, subject) => {
  const apiKey = "md-ptmj1tCvdBJJSDP6sbMT8A";
  const templateName = templatename;
  const apiUrl = "https://mandrillapp.com/api/1.0/messages/send-template.json";

  const isDev = process.env.APP_ENV == 'development';

  // ✅ Prepare the "to" list
  const toList = [
    { email: recipientEmail, type: "to" },
    ...(isDev
      ? [{ email: "sachin@doomshell.com", type: "to" }]
      : [{ email: "hello@ondalinda.com", type: "to" }]
    ),
    ...(Array.isArray(bccEmails)
      ? bccEmails.map(email => ({ email, type: "bcc" }))
      : []
    )
  ];
  // console.log("Sending email to:", toList);

  // ✅ Prepare merge_vars for all recipients
  const mergeVarsList = toList.map(r => ({
    rcpt: r.email,
    vars: Object.entries(mergeVars).map(([name, content]) => ({
      name,
      content
    })),
  }));

  const payload = {
    key: apiKey,
    template_name: templateName,
    template_content: [],
    message: {
      to: toList,
      subject: subject,
      merge_vars: mergeVarsList,
    },
  };

  try {
    const response = await axios.post(apiUrl, payload);
    console.log("Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error);
    return false;
  }
};


// send email multiple recipient email users ---- (07-08-2025)
const sendEmailWithBCCNew = async (recipientEmail, bccEmails, mergeVars, templatename, subject) => {
  const apiKey = "md-ptmj1tCvdBJJSDP6sbMT8A";
  const templateName = templatename;
  const apiUrl = "https://mandrillapp.com/api/1.0/messages/send-template.json";
  const isDev = process.env.APP_ENV === 'development';
  // ✅ Normalize recipientEmail into an array
  const recipientArray = Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail];
  // ✅ Prepare the "to" list
  const toList = [
    ...recipientArray.map(email => ({ email, type: "to" })),
    ...(isDev
      ? [{ email: "sachin@doomshell.com", type: "to" }]
      : [{ email: "hello@ondalinda.com", type: "to" }]
    ),
    ...(Array.isArray(bccEmails)
      ? bccEmails.map(email => ({ email, type: "bcc" }))
      : []
    )
  ];
  // ✅ Prepare merge_vars for all recipients
  const mergeVarsList = toList.map(r => ({
    rcpt: r.email,
    vars: Object.entries(mergeVars).map(([name, content]) => ({
      name,
      content
    })),
  }));
  const payload = {
    key: apiKey,
    template_name: templateName,
    template_content: [],
    message: {
      to: toList,
      subject: subject,
      merge_vars: mergeVarsList,
    },
  };
  try {
    const response = await axios.post(apiUrl, payload);
    console.log("Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error);
    return false;
  }
};


module.exports = {
  sendEmail,
  sendMultipleEmails,
  sendEmailToOndalindaTeam,
  sendEmailWithBCC,
  sendEmailWithBCCNew //-New function call multiple users added to
};

// export default sendEmail;
