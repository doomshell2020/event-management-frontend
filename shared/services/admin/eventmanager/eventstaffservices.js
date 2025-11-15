import {
  EventStaff,
  Event,
  Emailtemplet,
  Orders,
  BookTicket,
  EventTicketType,
  TicketDetail,
  EventTicketBook,
  User,
} from "../../../../database/models";
//  Ticket, Event, Users
import { StatusCodes } from "http-status-codes";
import {
  staffInvitationTemplate,
  sendInvitationEmailStaffUser,
  sendStaffTickets,
} from "../../../../utils_back/email-templates";
import { sendEmails } from "../../../../utils_back/email";
import { sendEmail } from "../../../../utils_back/sendEmail"; // send mail via mandril
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const encryptionKey = "yourEncryptionKey";

const CryptoJS = require("crypto-js");
// Add Staff
export async function addEventStaff(
  {
    title,
    EventID,
    FirstName,
    LastName,
    Email,
    Department,
    WaiverFlag,
    Wristband,
  },
  res
) {
  const email = Email;
  try {
    const doCheck = await EventStaff.findOne({
      where: { Email: email, EventID: EventID },
    });
    if (doCheck) {
      return {
        statusCode: 404,
        success: false,
        message: "This user already exists.",
      };
    } else {
      const eventStaff = await EventStaff.create({
        EventID,
        FirstName,
        LastName,
        Email: email,
        Department,
        WaiverFlag,
        Wristband,
      });

      return {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User added & email sent successfully",
        id: eventStaff.id,
      };
    }
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
    };
  }
}

// View staff for events
// export async function view_EventStaffByid({ eventId }, res) {
//   try {
//     const data = await EventStaff.findAll({
//       where: {
//         EventID: eventId,
//       },
//       include: [{ model: TicketDetail },
//         // {
//         //   model: Event,
//         //   attributes: ["Name"],
//         // },
//       ],
//     });

//     let totalstafftickets = 0;
//     let totalscaneedstaff = 0;

//     for (const totalstaff of data) {
//       const ticketDetail = totalstaff.TicketDetails?.[0];
//       // console.log(ticketDetail.qrcode, 'ddddddddddddddd')
//       totalstafftickets++;
//       if (totalstaff.status == 1) {
//         totalscaneedstaff++;
//       }
//     }


//     // CORE staff

//     // CORE staff
//     const CoreStaff = await EventStaff.findAll({
//       where: {
//         EventID: eventId,
//         Department: "CORE"
//       },
//       attributes: ['id'],
//     })
//     // STAFF
//     const STAFF = await EventStaff.findAll({
//       where: {
//         EventID: eventId,
//         Department: "STAFF"
//       },
//       attributes: ['id'],
//     })
//     // COMP
//     const Comp = await EventStaff.findAll({
//       where: {
//         EventID: eventId,
//         Department: "COMP"
//       },
//       attributes: ['id'],
//     })

//     if (!data) {
//       return {
//         message: "No staff members in this events",
//         status: false,
//         data: [],
//       };
//     }
//     return {
//       message: "Event user view successfully",
//       status: true,
//       data: data,
//       staffInfo: {
//         CORE: CoreStaff.length,
//         STAFF: STAFF.length,
//         Comp: Comp.length,
//         totalstafftickets: totalstafftickets,
//         totalscannedtickets: totalscaneedstaff
//       }
//     };
//   } catch (error) {
//     return {
//       message: "Error On staff Error :" + error.message,
//       status: false,
//     };
//   }
// }

// View staff for events
export async function view_EventStaffByid({ eventId }, res) {
  try {
    // Fetch EventStaff data along with associated TicketDetails
    const data = await EventStaff.findAll({
      where: {
        EventID: eventId,
      },
      include: [{ model: TicketDetail }],
    });

    // Initialize counters
    let totalstafftickets = 0;
    let totalscaneedstaff = 0;

    // Loop through each EventStaff record and count tickets and scanned tickets
    for (const totalstaff of data) {
      // const ticketDetail = totalstaff.TicketDetails?.[0];
      const ticketDetail = totalstaff.TicketDetails?.[0];
      totalstafftickets++;

      if (ticketDetail && ticketDetail.dataValues && ticketDetail.dataValues.status === '1') {
        totalscaneedstaff++; // Increment the count for scanned staff
      }
    }

    // Fetch the count of CORE, STAFF, and COMP departments
    const [CoreStaff, STAFF, Comp, PressDJs] = await Promise.all([
      EventStaff.findAll({ where: { EventID: eventId, Department: "CORE" }, attributes: ['id'] }),
      EventStaff.findAll({ where: { EventID: eventId, Department: "STAFF" }, attributes: ['id'] }),
      EventStaff.findAll({ where: { EventID: eventId, Department: "COMP" }, attributes: ['id'] }),
      EventStaff.findAll({ where: { EventID: eventId, Department: "PRESS/DJS" }, attributes: ['id'] })
    ]);

    // Extract scanner_ids from TicketDetail records
    const scannerIds = data.flatMap(eventStaff =>
      eventStaff.TicketDetails.map(ticket => ticket.scanner_id)
    );

    // Fetch users based on scanner_ids
    const users = await User.findAll({
      where: {
        id: scannerIds,
      },
      attributes: ['id', 'FirstName', 'LastName']
    });

    // Attach the users to the TicketDetails in the original data
    const result = data.map(eventStaff => ({
      ...eventStaff.toJSON(),
      TicketDetails: eventStaff.TicketDetails.map(ticket => ({
        ...ticket.toJSON(),
        user: users.find(user => user.id === ticket.scanner_id) || null,
      })),
    }));

    // Return response
    return {
      message: "Event user view successfully",
      status: true,
      data: result,
      staffInfo: {
        CORE: CoreStaff.length,
        STAFF: STAFF.length,
        Comp: Comp.length,
        PressDJs: PressDJs.length,
        totalstafftickets,
        totalscannedtickets: totalscaneedstaff,
      }
    };
  } catch (error) {
    return {
      message: "Error On staff Error :" + error.message,
      status: false,
    };
  }
}




// View eventname for id
export async function view_EventByid({ EventID }, res) {
  try {
    const data = await Event.findOne({
      where: {
        id: EventID,
      },
    });
    if (!data) {
      const error = new Error("ID not found");
      error.StatusCodes = 404; // You can set an appropriate status code
      throw error;
    }
    return {
      message: "Event View Successfully",
      status: true,
      data: data,
    };
  } catch (error) {
    return error;
  }
}

// View Staff for id
export async function view_StaffByid({ StaffId }, res) {
  try {
    const data = await EventStaff.findOne({
      where: {
        id: StaffId,
      },
    });
    if (!data) {
      const error = new Error("ID not found");
      error.StatusCodes = 404; // You can set an appropriate status code
      throw error;
    }
    return {
      message: "View user successfully",
      status: true,
      data: data,
    };
  } catch (error) {
    return error;
  }
}

// edit Staff
export async function UpdateStaff(
  { FirstName, LastName, Email, Department, WaiverFlag, Wristband },
  staffid,
  res
) {
  try {
    const staffEdit = await EventStaff.update(
      {
        staffid,
        FirstName,
        LastName,
        Email,
        Department,
        WaiverFlag,
        Wristband,
      },
      {
        where: {
          id: staffid,
        },
      }
    );
    if (staffEdit == 1) {
      return {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User Update successfully",
      };
    } else {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "data not found",
      };
    }
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
}

// Deleted Staff
export async function deleteStaff({ id }, res) {
  try {
    const findStaff = await EventStaff.findOne({
      where: {
        id: id,
        WaiverFlag: 0,
      },
    });
    if (findStaff) {
      const staffData = await EventStaff.destroy({
        where: {
          id: id,
        },
      });
      if (staffData == 1) {
        return {
          statusCode: StatusCodes.OK,
          success: true,
          message: "The user has been successfully deleted!",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message:
          "This user cannot be deleted because they have been sent an email or have accepted the terms and conditions.",
      };
    }
  } catch (error) {
    return error;
  }
}

// import CSV Data
// export async function ImportExcel(req, res) {
//     const excelusers = req.body.exceldata;
//     const eventID = req.body.eventID;

//     if (excelusers.length === 0) {
//         return res.status(StatusCodes.OK).json({
//             success: true,
//             message: "Selected One File",
//         });
//     }
//     try {
//         // Skip the first row for excel because the indexing 0 the header
//         const userPromises = excelusers.slice(1).map(async (e) => {
//             // Check if email already exists in the database
//             const existingUser = await EventStaff.findOne({ where: { Email: e.Email } });
//             if (!existingUser) {
//                 // If email does not exist, create new user
//                 await EventStaff.create({
//                     FirstName: e.FirstName,
//                     LastName: e.LastName,
//                     Email: e.Email,
//                     Department: e.Department,
//                     // Waiver: e.Waiver,
//                     EventID: eventID,

//                 });
//             }
//         });
//         // Await all the promises to ensure all users are processed
//         await Promise.all(userPromises);

//         return res.status(StatusCodes.OK).json({
//             success: true,
//             message: "CSV file imported successfully",
//         });
//     } catch (error) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }

// export async function ImportExcel(req, res) {
//     const excelusers = req.body.exceldata;
//     const eventID = req.body.eventID;

//     if (excelusers.length === 0) {
//         return res.status(StatusCodes.OK).json({
//             success: true,
//             message: "Selected One File",
//         });
//     }
//     try {
//         // Skip the first row for excel because the indexing 0 the header
//         for (let i = 1; i < excelusers.length; i++) {
//             const e = excelusers[i];
//             if (!e.FirstName || !e.LastName || !e.Email || !e.Department) {
//                 return {
//                     success: false,
//                     message: `Invalid file format. Please upload a valid CSV file to update the staff information.`,
//                 }
//             }
//         }
//         const userPromises = excelusers.slice(1).map(async (e) => {
//             // Check if email already exists in the database
//             const existingUser = await EventStaff.findOne({ where: { Email: e.Email } });
//             if (!existingUser) {
//                 // If email does not exist, create new user
//                 await EventStaff.create({
//                     FirstName: e.FirstName,
//                     LastName: e.LastName,
//                     Email: e.Email,
//                     Department: e.Department,
//                     // Waiver: e.Waiver,
//                     EventID: eventID,
//                 });
//             }
//         });
//         // Await all the promises to ensure all users are processed
//         await Promise.all(userPromises);

//         return res.status(StatusCodes.OK).json({
//             success: true,
//             message: "CSV file imported successfully",
//         });
//     } catch (error) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }

export async function ImportExcel(req, res) {
  const excelusers = req.body.exceldata;
  const eventID = req.body.eventID;

  if (excelusers.length === 0) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Selected One File",
    });
  }

  try {
    // Skip the first row for excel because the indexing starts at 0 (it's the header)
    for (let i = 1; i < excelusers.length; i++) {
      const e = excelusers[i];

      // Check if required fields are missing
      if (!e.FirstName || !e.LastName || !e.Email || !e.Department) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Invalid file format. Please upload a valid CSV file to update the staff information.`,
        });
      }

      // Check if Department is not one of the allowed values
      if (!["COMP", "STAFF", "CORE", "PRESS/DJS"].includes(e.Department)) {
        continue; // Skip inserting this record
      }

      // Check if email already exists in the database
      const existingUser = await EventStaff.findOne({
        where: { Email: e.Email, EventID: eventID },
      });

      if (!existingUser) {
        // If email does not exist, create new user
        await EventStaff.create({
          FirstName: e.FirstName,
          LastName: e.LastName,
          Email: e.Email,
          Department: e.Department,
          EventID: eventID,
        });
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "CSV file imported successfully",
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}




// Send Email for staffs functionality
export async function sendInvitationEmailStaff(req, res) {
  try {
    const { Op } = require("sequelize");

    const currentDate = new Date();
    const existUserEmail = req.body.Email;

    // Staff Id Encrypt
    function encryptData(data) {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        encryptionKey
      ).toString();
    }

    // for single user
    if (existUserEmail.length == 1) {
      const emailExit = await EventStaff.findOne({
        where: {
          Email: existUserEmail[0],
          WaiverFlag: {
            [Op.ne]: 1,
          },
        },
      });

      if (emailExit) {
        const encryptedStaffID = encryptData(emailExit.dataValues.id);
        const encryptedUserName = encryptData(emailExit.dataValues.FirstName);
        const encryptedUserEmail = encryptData(emailExit.dataValues.Email);
        const token = Math.floor(10000000 + Math.random() * 90000000);

        await EventStaff.update(
          {
            token,
            updatedAt: currentDate,
          },
          {
            where: { id: emailExit.dataValues.id },
          }
        );

        const userName =
          emailExit.dataValues.FirstName + " " + emailExit.dataValues.LastName;
        // send-email mandrial but content our data base(24-03-2025)
        const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 22 } });
        const sanitizedTemplate = findTemplate.dataValues.description;
        const mailChampTemplateName = findTemplate.dataValues.mandril_template
        const subject = findTemplate.dataValues.subject

        let templateName;
        if (emailExit.dataValues.WaiverFlag == 0) {
          if (req.body.EventID == 108) {
            templateName = "Montenegro 2024 Staff invitation";
          } else if (req.body.EventID == 109) {
            templateName = "Careyes 2024 Staff invitation";
          } else if (req.body.EventID == 110) {
            // templateName = "Careyes 2024 Staff invitation";
            templateName = mailChampTemplateName;
          }
        } else {
          if (req.body.EventID == 108) {
            templateName = "Montenegro 2024 Staff Resend invitation";
          } else if (req.body.EventID == 109) {
            templateName = "Careyes 2024 Staff Resend invitation";
          } else if (req.body.EventID == 110) {
            // templateName = "Careyes 2024 Staff Resend invitation";
            templateName = mailChampTemplateName;
          }
        }

        let template = staffInvitationTemplate({
          USERNAME: userName,
          URLLINK: `${SITE_URL}staff-terms-and-conditions-montenegro/?staffid=${encryptedStaffID}&name=${encryptedUserName}&email=${encryptedUserEmail}&token=${token}`,
          html: sanitizedTemplate,
        });
        // const mergeVars = {
        //   USERNAME: userName,
        //   URLLINK: `${SITE_URL}staff-terms-and-conditions/?staffid=${encryptedStaffID}&name=${encryptedUserName}&email=${encryptedUserEmail}&token=${token}`,
        // };
        let extractedTemplate = template.html;
        const mergeVars = { ALLDATA: extractedTemplate };
        await sendEmail(emailExit.dataValues.Email, mergeVars, templateName, subject);

        // await sendEmail(emailExit.dataValues.Email, mergeVars, templateName);

        await EventStaff.update(
          { DateWaiverSent: currentDate, WaiverFlag: 2 },
          { where: { id: emailExit.dataValues.id } }
        );
        return {
          statusCode: 200,
          success: true,
          message: "Invitation email sent successfully.",
        };
      }
    } else if (existUserEmail.length > 1) {
      const sendEmailPromises = existUserEmail.map(async (item) => {
        const emailExit = await EventStaff.findOne({
          where: {
            Email: item,
            WaiverFlag: {
              [Op.ne]: 1,
            },
          },
        });

        if (emailExit) {
          const encryptedStaffID = encryptData(emailExit.dataValues.id);
          const encryptedUserName = encryptData(emailExit.dataValues.FirstName);
          const encryptedUserEmail = encryptData(emailExit.dataValues.Email);
          const token = Math.floor(10000000 + Math.random() * 90000000);

          await EventStaff.update(
            {
              token,
              updatedAt: currentDate,
            },
            {
              where: { id: emailExit.dataValues.id },
            }
          );

          // send-email mandrial but content our data base(24-03-2025)
          const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 22 } });
          const sanitizedTemplate = findTemplate.dataValues.description;
          const mailChampTemplateName = findTemplate.dataValues.mandril_template
          const subject = findTemplate.dataValues.subject


          let templateName;
          if (emailExit.dataValues.WaiverFlag == 0) {
            // templateName = 'Montenegro 2024 Staff invitation';
            if (req.body.EventID == 108) {
              templateName = "Montenegro 2024 Staff invitation";
            } else if (req.body.EventID == 109) {
              templateName = "Careyes 2024 Staff invitation";
            } else if (req.body.EventID == 110) {
              // templateName = "Careyes 2024 Staff invitation";
              templateName = mailChampTemplateName;
            }
          } else {
            // templateName = 'Montenegro 2024 Staff Resend invitation';
            if (req.body.EventID == 108) {
              templateName = "Montenegro 2024 Staff Resend invitation";
            } else if (req.body.EventID == 109) {
              templateName = "Careyes 2024 Staff Resend invitation";
            } else if (req.body.EventID == 110) {
              // templateName = "Careyes 2024 Staff Resend invitation";
              templateName = mailChampTemplateName;
            }
          }

          const userName =
            emailExit.dataValues.FirstName +
            " " +
            emailExit.dataValues.LastName;
          // const mergeVars = {
          //   USERNAME: userName,
          //   URLLINK: `${SITE_URL}staff-terms-and-conditions/?staffid=${encryptedStaffID}&name=${encryptedUserName}&email=${encryptedUserEmail}&token=${token}`,
          // };
          // await sendEmail(emailExit.dataValues.Email, mergeVars, templateName);
          let template = staffInvitationTemplate({
            USERNAME: userName,
            URLLINK: `${SITE_URL}staff-terms-and-conditions-montenegro/?staffid=${encryptedStaffID}&name=${encryptedUserName}&email=${encryptedUserEmail}&token=${token}`,
            html: sanitizedTemplate,
          });
          let extractedTemplate = template.html;
          const mergeVars = { ALLDATA: extractedTemplate };
          await sendEmail(emailExit.dataValues.Email, mergeVars, templateName, subject);

          await EventStaff.update(
            { DateWaiverSent: currentDate, WaiverFlag: 2 },
            { where: { id: emailExit.dataValues.id } }
          );
        }
      });

      await Promise.all(sendEmailPromises);

      return {
        statusCode: 200,
        success: true,
        message: "Invitation email sent successfully.",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Internal server error.",
      error: error.message,
    };
  }
}

// search data get Department
const Sequelize = require("sequelize");
export async function viewStaffByEvent({ EventIDS }, res) {
  try {
    const staffProfile = await EventStaff.findAll({
      where: { EventID: EventIDS },
      // attributes: ['id', 'Department'],
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("Department")), "Department"],
      ],
      // include: [{ model: TicketDetail }],
    });
    if (staffProfile) {
      return {
        statusCode: 200,
        success: true,
        data: staffProfile,
        message: "Fetch User data.",
      };
    } else {
      return {
        statusCode: 500,
        success: false,
        message: "User not found.",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Failed to view profile",
      error: error.message,
    };
  }
}
// Search Staff
// const Op = Sequelize.Op;
// export async function search_Staff({ Department, WaiverFlag, EventID }, res) {
//     try {
//         let newobject = {};
//         if (Department) {
//             // newobject.Department = { [Op.like]: `%${Department.trim()}%` }
//             newobject.Department = Department.trim();
//         } if (WaiverFlag) {
//             newobject.WaiverFlag = { [Op.like]: `%${WaiverFlag.trim()}%` }
//         } if (EventID) {
//             newobject.EventID = { [Op.like]: `%${EventID.trim()}%` }
//         }
//         const searchResults = await EventStaff.findAll({
//             // order: [
//             //     ["id", "DESC"],
//             // ],
//             where: newobject,
//         });
//         return {
//             statusCode: 200,
//             success: true,
//             message: 'Search Staff Successfully!',
//             searchResults
//         };
//     } catch (error) {
//         console.log("error")
//     }
// }

// Search Staff - Rupam 10 jun
const Op = Sequelize.Op;

export async function search_Staff(
  { Department, WaiverFlag, EventID, FirstName, LastName, Email },
  res
) {
  try {
    let newobject = {};

    if (Department) {
      newobject.Department = Department.trim();
    }
    if (WaiverFlag) {
      newobject.WaiverFlag = WaiverFlag.trim();
    }
    if (EventID) {
      newobject.EventID = EventID.trim();
    }
    if (FirstName) {
      newobject.FirstName = { [Op.like]: `%${FirstName.trim()}%` };
    }
    if (LastName) {
      newobject.LastName = { [Op.like]: `%${LastName.trim()}%` };
    }
    if (Email) {
      newobject.Email = { [Op.like]: `%${Email.trim()}%` };
    }

    const searchResults = await EventStaff.findAll({
      where: newobject,
      include: [{ model: TicketDetail }],
    });

    // Extract scanner_ids from TicketDetail records
    const scannerIds = searchResults.flatMap(eventStaff =>
      eventStaff.TicketDetails.map(ticket => ticket.scanner_id)
    );

    // Fetch users based on scanner_ids
    const users = await User.findAll({
      where: {
        id: scannerIds,
      },
      attributes: ['id', 'FirstName', 'LastName']
    });

    // Attach the users to the TicketDetails in the original data
    const result = searchResults.map(eventStaff => ({
      ...eventStaff.toJSON(),
      TicketDetails: eventStaff.TicketDetails.map(ticket => ({
        ...ticket.toJSON(),
        user: users.find(user => user.id === ticket.scanner_id) || null,
      })),
    }));


    return {
      statusCode: 200,
      success: true,
      message: "Search Staff Successfully!",
      // searchResults,
      result
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      success: false,
      message: "Error in searching staff",
      error: error.message,
    };
  }
}






// Send ticket for the users
export async function sendTicketUser(req, res) {
  const { token, staffId } = req.body;

  try {
    const data = await EventStaff.findOne({
      where: {
        id: staffId,
        token,
      },
    });

    if (!data) {
      return {
        statusCode: 400,
        success: false,
        message: "Token expired or invalid member.",
      };
    }

    // Get the current date
    const currentDate = new Date();

    await EventStaff.update(
      {
        WaiverFlag: 1,
        token: "",
        DateWaiverSigned: currentDate, // Use the current date
      },
      {
        where: { id: staffId },
      }
    );
    return {
      statusCode: 200,
      success: true,
      message: "Your ticket will be sent to your email.",
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Internal server error.",
      error: error.message,
    };
  }
}



// Get Staff all get all staff ticket
export async function getAllStaffTicket(
  {
    eventName,
    eventId,
    firstName,
    lastName,
    email,
    orderId,
    mobile,
    scanned,
    startDate,
    endDate,
  },
  res
) {
  const isScanned = scanned ? 1 : 0;
  const orderStaffCondition = {};

  if (startDate) {
    orderStaffCondition.created = {
      $gte: new Date(startDate).toISOString().split("T")[0] + " 00:00:00",
    };
  }

  if (endDate) {
    orderStaffCondition.created = {
      $lte: new Date(endDate).toISOString().split("T")[0] + " 23:59:59",
    };
  }

  if (orderId) {
    orderStaffCondition.OriginalTrxnIdentifier = {
      $like: `%${orderId.trim().toUpperCase()}%`,
    };
  }

  if (email) {
    orderStaffCondition.Email = { $like: `%${email.trim().toUpperCase()}%` };
  }

  if (firstName) {
    orderStaffCondition.FirstName = {
      $like: `%${firstName.trim().toUpperCase()}%`,
    };
  }

  if (lastName) {
    orderStaffCondition.LastName = {
      $like: `%${lastName.trim().toUpperCase()}%`,
    };
  }

  try {
    const getAllStaffTicket = await Orders.findAll({
      include: [
        {
          model: EventStaff,
          attributes: ["FirstName", "LastName", "Email", "Department"],
        },
      ],
      group: ["user_id"],
    });

    if (!getAllStaffTicket.length) {
      return {
        success: true,
        message: "Data not available",
        data: [],
      };
    }

    // const findEvent = await Event.findAll({
    //     where: { name: { $like: `%${eventName.trim()}%` } },
    //     attributes: ['id']
    // });

    // const eventIds = findEvent.map(event => event.id);
    // const ticketCondition = eventIds.length ? { event_id: { $in: eventIds } } : null;

    const findStaffTickets = await BookTicket.findAll({
      include: [
        {
          model: TicketDetail,
          attributes: [
            "id",
            "qrcode",
            "status",
            "usedby",
            "usedate",
            "scanner_id",
          ],
        },
        {
          model: EventTicketType,
          attributes: ["title"],
        },
      ],
      where: { event_id: eventId },
      order: [["id", "desc"]],
    });

    const totalTickets = findStaffTickets.length;
    const totalScannedTickets = findStaffTickets.filter(
      (ticket) =>
        ticket.Ticketdetail &&
        ticket.Ticketdetail.length > 0 &&
        ticket.Ticketdetail[0]?.status === 1
    ).length;

    const departmentWiseTicketCount = {};

    for (let ticket of findStaffTickets) {
      if (ticket.cust_id) {
        const staffMember = await EventStaff.findOne({
          where: { id: ticket.cust_id },
        });
        if (staffMember) {
          const department = staffMember.Department;
          departmentWiseTicketCount[department] =
            (departmentWiseTicketCount[department] || 0) + 1;
        }
      }
    }

    const orderData = getAllStaffTicket.flatMap((orderDetails) => {
      const userTickets = findStaffTickets.filter(
        (ticket) => ticket.cust_id == orderDetails.user_id
      );

      return userTickets.map((ticket) => {
        const ticketDetail =
          ticket.TicketDetails && ticket.TicketDetails.length > 0
            ? ticket.TicketDetails[0]
            : null;
        return {
          orderId: orderDetails.OriginalTrxnIdentifier,
          orderDate: orderDetails.createdAt
            ? new Date(orderDetails.createdAt).toISOString().split("T")[0]
            : "N/A",
          ticketType: "ticket",
          ticketQR: ticketDetail ? `${ticketDetail.qrcode}` : "",
          ticketId: ticketDetail ? ticketDetail.id : "",
          ticketName: ticket.EventTicketType?.title || "N/A",
          memberFirstName: orderDetails.eventStaff?.FirstName || "N/A",
          memberLastName: orderDetails.eventStaff?.LastName || "N/A",
          memberEmail: orderDetails.eventStaff?.Email || "N/A",
          memberMobile: "N/A",
          membershipType: orderDetails.eventStaff?.Department || "N/A",
          isTransfer:
            ticketDetail && ticketDetail.transfer_reply ? "Yes" : "No",
          memberId: orderDetails.user_id,
          usedBy: ticketDetail?.usedby || "",
          usedDate: ticketDetail?.usedate
            ? new Date(ticketDetail.usedate).toISOString()
            : "",
          scannedBy: ticketDetail?.scanner_id
            ? `${ticketDetail.scannedBy?.name || ""} ${ticketDetail.scannedBy?.lname || ""
            }`
            : "",
        };
      });
    });

    return {
      success: true,
      message: "Data retrieved successfully",
      // data: orderData,
      ticketSaleInfo: {
        totalTicket: totalTickets,
        totalScannedTickets: totalScannedTickets,
        ticketScanned: departmentWiseTicketCount,
      },
    };
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
