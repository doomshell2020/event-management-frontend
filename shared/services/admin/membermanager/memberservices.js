import { User, DeleteUserData, UserInterest, InvitationEvent, Emailtemplet, Event, Invitation, Orders } from "@/database/models"
// import UserInterest from "../../../../database/models/userinterest"
import { StatusCodes } from 'http-status-codes';
import responseManagement from "@/utils_back/responsemanagement"
import { sendEmails } from "@/utils_back/email"
import { sendEmail } from "@/utils_back/sendEmail"
import { deleteFromS3 } from '@/utils_back/s3Delete';

import {
    RejectedEmailTemplate, pendingApprovalTemplate, ApproveTemplate, updateProfileTemplate, AdminMemberAddedTemplate, NewRegistrationTemplate, AdminMemberRejectedTemplate, AdminMemberDeniedTemplate, AdminMemberBlockedTemplate
} from "@/utils_back/email-templates";
const bcrypt = require('bcryptjs');
import axios from 'axios';
// import { isEmpty } from "lodash";


// Members Added for Admin
export async function Member_Add({ FirstName, LastName, Email, Password, PhoneNumber, Gender, dob, AddressLine1,
    CompanyName,
    CompanyTitle,
    City,
    State,
    PostalCode,
    Country,
    AddressLine2,
    InternalNotes,
    WebsiteURL,
    InstagramURL,
    TwitterURL,
    LinkedInURL,
    AssistantName,
    MembershipLevel,
    AssistantEmail,
    AssistantPhoneNumber,
    ClubhouseURL,
    DiscordURL,
    PhoneCountry,
    FounderFlag,
    CareyesHomeownerFlag,
    FilippoReferralFlag,
    CompedFlag,
    ArtistType,
    city_country_birth,
    city_country_live,
    social_media_platform,
    are_you_member,
    attended_festival_before,
    not_attendedfestival,
    offer_ticket_packages,
    most_interested_festival,
    favourite_music,
    sustainable_planet,
    advocate_for_harmony,
    core_values,
    appreciate_your_honesty,
    handles,
    tier,
    party_people,
    comments,
    linkdin_profile_link,
    instagram_handle,
    facebook_profile_link,
    link_tree_link,
    planet_buy_back,
    country_group,
    refference1_first_name,
    refference1_last_name,
    refference1_email,
    refference2_first_name,
    refference2_last_name,
    refference2_email,
    mythical_and_mystical,
    Status,
    recently_approved,
    admin_notes,
    MembershipTypes,
    States,
    most_interested_other,
    sustainable_planet_other,
    attended_festival_before_other,
    are_you_member_other,
}, filename, res) {
    // const randomstring = Number(Math.random().toString().substring(2, 8));
    const randomstring = Math.random().toString().substring(2, 8);

    const email = Email;
    try {
        const docheck = await User.findOne({
            where: { Email: email, }
        });

        if (docheck) {
            return {
                statusCode: 404,
                success: false,
                message: 'User already exists. Please login instead or use a different email.',
            };
        } else {
            const hashedPassword = await bcrypt.hash(randomstring, 10);
            // const hashedPassword = bcrypt.hash(randomstring, 10);
            // return false;
            const users = await User.create({
                FirstName: FirstName,
                LastName: LastName,
                Email: email,
                Password: hashedPassword,
                PhoneNumber: PhoneNumber,
                Gender: Gender,
                dob: dob,
                AddressLine1: AddressLine1,
                CompanyName: CompanyName,
                CompanyTitle: CompanyTitle,
                ImageURL: filename,
                City: City,
                State: State,
                PostalCode: PostalCode,
                Country: Country,
                AddressLine2: AddressLine2,
                InternalNotes: InternalNotes,
                WebsiteURL: WebsiteURL,
                InstagramURL: InstagramURL,
                TwitterURL: TwitterURL,
                LinkedInURL: LinkedInURL,
                AssistantName: AssistantName,
                MembershipLevel: MembershipLevel,
                AssistantEmail: AssistantEmail,
                AssistantPhoneNumber: AssistantPhoneNumber,
                ClubhouseURL: ClubhouseURL,
                DiscordURL: DiscordURL,
                PhoneCountry: PhoneCountry,
                FounderFlag: FounderFlag,
                CareyesHomeownerFlag: CareyesHomeownerFlag,
                FilippoReferralFlag: FilippoReferralFlag,
                CompedFlag: CompedFlag,
                ArtistType: ArtistType,
                city_country_birth: city_country_birth,
                city_country_live: city_country_live,
                social_media_platform: social_media_platform,
                are_you_member: are_you_member,
                attended_festival_before: attended_festival_before,
                not_attendedfestival: not_attendedfestival,
                offer_ticket_packages: offer_ticket_packages,
                most_interested_festival: most_interested_festival,
                favourite_music: favourite_music,
                sustainable_planet: sustainable_planet,
                advocate_for_harmony: advocate_for_harmony,
                core_values: core_values,
                appreciate_your_honesty: appreciate_your_honesty,
                handles: handles,
                tier: tier,
                party_people: party_people,
                comments: comments,
                linkdin_profile_link: linkdin_profile_link,
                instagram_handle: instagram_handle,
                facebook_profile_link: facebook_profile_link,
                link_tree_link: link_tree_link,
                planet_buy_back: planet_buy_back,
                country_group: country_group,
                refference1_first_name: refference1_first_name,
                refference1_last_name: refference1_last_name,
                refference1_email: refference1_email,
                refference2_first_name: refference2_first_name,
                refference2_last_name: refference2_last_name,
                refference2_email: refference2_email,
                mythical_and_mystical: mythical_and_mystical,
                Status: Status,
                isMailSent: 1,
                recently_approved: recently_approved,
                admin_notes: admin_notes,
                MembershipTypes: MembershipTypes,
                States: States,
                most_interested_other: most_interested_other,
                sustainable_planet_other: sustainable_planet_other,
                attended_festival_before_other: attended_festival_before_other,
                are_you_member_other: are_you_member_other,
            });


            // content our database and email send mail-champ--
            const ApprovedTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 5 } }); // Rejected
            const sanitizedTemplate = ApprovedTemplate.dataValues.description;
            const subject = ApprovedTemplate.dataValues.subject;

            // mail champ template name
            const mailChampTemplateName = ApprovedTemplate.dataValues.mandril_template
            let template = ApproveTemplate({
                UserName: FirstName,
                UserEmail: email,
                Password: randomstring,
                html: sanitizedTemplate,
            });
            let extractedTemplate = template.html;
            const templateName = mailChampTemplateName;
            const mergeVars = { ALLDATA: extractedTemplate };
            await sendEmail(email, mergeVars, templateName, subject);


            // send mail champ email and content start....
            // const templatename = 'Montenegro 2024 Welcome to Ondalinda';
            // const mergeVars = { USERNAME: FirstName, USEREMAIL: email, USERPASSWORD: randomstring, OTHER_PARAM: 'Other Value' };
            // await sendEmail(email, mergeVars, templatename);
            // End....

            return {
                statusCode: 200,
                id: users.id,
                Password: randomstring,
                success: true,
                message: 'Member added successfully',
            };

        }
    } catch (error) {
        console.log(error, "error");
        responseManagement.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "internal_server_error");
    }
}

// User Interested Added
export async function Member_Interest({ Interest, }, User_ID, res) {
    var arrcheck_list = Interest.split(",");
    for (const checkdata of arrcheck_list) {
        await UserInterest.create({
            UserID: User_ID,
            Interest: checkdata
        });
    }
    return {
        statusCode: 200,
        success: true,
        message: 'Member interest added successfully!',
    };

}

// Members View with pagination data
export async function View_Members(params, res) {

    const { fname, lname, member_email, mobile, member_id, membership_level, membership_status, careyes_homeowner, past_event_attended, member_interest, member_location, search_recently_approved, artist_type, currentPage, invited } = params;
    // Initialize conditional object
    let conditionalObject = {};

    if (member_email) {
        conditionalObject.Email = { [Op.like]: `%${member_email.trim()}%` };
    } else {
        conditionalObject.Email = { [Op.not]: '' };
    }

    if (member_id) {
        conditionalObject.ID = { [Op.like]: `%${member_id}%` };
    }

    if (fname) {
        conditionalObject.FirstName = { [Op.like]: `%${fname.trim()}%` };
    }

    if (lname) {
        conditionalObject.LastName = { [Op.like]: `%${lname.trim()}%` };
    }
    if (mobile) {
        const cleanedMobile = mobile.replace(/\D/g, ''); // Remove all non-numeric characters
        conditionalObject.PhoneNumber = Sequelize.where(
            Sequelize.fn('REPLACE',
                Sequelize.fn('REPLACE',
                    Sequelize.fn('REPLACE',
                        Sequelize.fn('REPLACE', Sequelize.col('PhoneNumber'), ' ', ''),
                        '(', ''),
                    ')', ''),
                '-', ''),
            'LIKE', `%${cleanedMobile}%`
        );
    }
    if (membership_level) {
        conditionalObject.MembershipLevel = { [Op.like]: `%${membership_level}%` };
    }
    if (membership_status) {
        conditionalObject.Status = membership_status;
    }
    if (careyes_homeowner) {
        conditionalObject.CareyesHomeownerFlag = careyes_homeowner;
    }
    if (artist_type === '1' || artist_type === '0') {
        conditionalObject.ArtistType = {
            [artist_type === '1' ? Op.not : Op.is]: null,
        };
    }

    // if (past_event_attended === '1' || past_event_attended === '0') {
    //     conditionalObject.attended_festival_before = {
    //         [past_event_attended === '1' ? Op.not : Op.is]: null,
    //     };
    // }
    // new
    if (past_event_attended) {
        if (past_event_attended === "0") {
            // Exact match for "0"
            conditionalObject.attended_festival_before = {
                [Op.eq]: "0", // Use Op.eq for exact match instead of Op.like
            };
        } else if (past_event_attended === 'ANY') {
            // Exclude specific event and "0"
            conditionalObject.attended_festival_before = {
                [Op.and]: [
                    { [Op.ne]: "0" }, // Not equal to "0"
                    { [Op.notLike]: '%108%' }, // Exclude this event
                ],
            };
        } else {
            // Dynamic condition for other event names
            conditionalObject.attended_festival_before = {
                [Op.like]: `%${past_event_attended}%`,
            };
        }
    }


    // old 
    // else if (past_event_attended === 'ONDALINDA x MONTENEGRO 2024') {
    //     conditionalObject.attended_festival_before = {
    //         [Op.like]: '%ONDALINDA x MONTENEGRO 2024%'
    //     };
    // } else if (past_event_attended === 'O x CAREYES 2024') {
    //     conditionalObject.attended_festival_before = {
    //         [Op.like]: '%O x CAREYES 2024%'
    //     };
    // }
    // }
    if (member_location) {
        let countryArray = member_location.split(',').map((e) => e.trim());
        if (Array.isArray(countryArray) && countryArray.length > 0 && countryArray[0] !== '') {
            conditionalObject.country_group = { [Op.in]: countryArray };
        }
    }
    // Most interested festival

    if (member_interest) {
        let interestArray = member_interest.split(',').map(e => e.trim());
        if (Array.isArray(interestArray) && interestArray.length > 0) {
            conditionalObject.most_interested_festival = {
                [Op.or]: interestArray.map(interest => ({
                    [Op.like]: `%${interest.replace(/\*/g, '%')}%` // Replacing * with %
                }))
            };
        }
    }




    // Add condition for invited
    // if (invited === '0') {
    //     conditionalObject.isinvited = false; // Find members where isinvited is false
    // } else if (invited === '1') {
    //     conditionalObject.isinvited = true; // Find members where isinvited is true
    // }


    // Exclude users with Role === 3 (kamal-04-11-2024)

    conditionalObject.Role = {
        [Op.or]: [
            { [Op.ne]: 3 },
            { [Op.is]: null }
        ]
    };


    const invitedValue = invited || 'defaultEvent,defaultStatus';
    const [eventId, invitationStatus] = invitedValue.split(',');
    // Log the separated variables
    const InvitationData = await Invitation.findAll({
        where: { EventID: eventId },
        attributes: ["id", "EventID", "UserID"]
    })

    // Extracting UserIDs
    const userIds = InvitationData.map(invitation => invitation.dataValues.UserID);
    if (invited) {
        if (invitationStatus == "Invited") {
            conditionalObject['$User.id$'] = { [Op.in]: userIds };
            // For 'invited' equal to 0, use the 'not in' condition
        } else {
            // For other cases, use the 'in' condition
            conditionalObject['$User.id$'] = { [Op.notIn]: userIds };
        }
    }


    // Handle invited condition using Interested model
    // if (invited) {
    //     if (invited == 0) {
    //         // conditionalObject['$Invitations.EventID$'] = { [Op.ne]: 110 };
    //         conditionalObject['$User.id$'] = { [Op.is]: null };
    //     } else {
    //         conditionalObject['$User.id$'] = invited; // Match specific EventID
    //     }
    // }
    // if (invited) {
    //     conditionalObject['$Invitations.EventID$'] = invited;
    // }else{

    // }



    // Merge conditional object with whereClause
    const whereClause = {
        ...conditionalObject,
        // FirstName: { [Op.not]: '' } // Add default condition
    };

    let orderCriteria;
    if (search_recently_approved === '1') {
        orderCriteria = [['recently_approved', 'DESC']]; // Order by recently_approved DESC
    } else if (search_recently_approved === '0') {
        orderCriteria = [['recently_approved', 'ASC']]; // Order by recently_approved ASC
    } else {
        orderCriteria = [["ID", "DESC"]]; // Order by LastName ASC
    }

    const findOptions = {
        order: orderCriteria,
        where: whereClause,
        include: [{
            model: Invitation, required: false, // Ensures users without invitations are included
        },
        ],
    };
    const { count, rows } = await User.findAndCountAll(findOptions);

    if (count === 0) {
        const error = new Error("No records found");
        error.StatusCodes = 200;
        throw error;
    }

    return {
        data: rows,
        message: "Members view successfully",
    };
}

// Members View with pagination data
// export async function View_Members({ page, pageSize }, res) {
//     const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
//     const { count, rows } = await User.findAndCountAll({
//         // order: [["LastName", "ASC"]],
//         order: [["ID", "DESC"]],
//         where: {
//             LastName: { [Op.not]: '' }
//         },
//         offset: offset,
//         limit: parseInt(pageSize, 10),
//     });

//     if (count === 0) {
//         const error = new Error("No records found");
//         error.StatusCodes = 404;
//         throw error;
//     }

//     const totalPages = Math.ceil(count / parseInt(pageSize, 10));

//     return {
//         data: rows,
//         pagination: {
//             totalRecords: count,
//             totalPages: totalPages,
//             currentPage: parseInt(page, 10),
//             pageSize: parseInt(pageSize, 10),
//         },
//         message: "Members view successfully",
//     };
// }

// view member for invited
export async function View_Invitedmember({ eventid, isInterested }, res) {
    try {
        // new added find active event base on status Y
        const activeEvent = await Event.findOne(
            {
                where: { status: "Y" },
                order: [["createdAt", "DESC"]],
            }
        );
        let Conditions = { EventID: activeEvent.id };


        // let Conditions = { EventID: eventid };

        if (isInterested == true) {
            // Conditions.Status >= 1;
            Conditions.Status = { [Sequelize.Op.gte]: 1 };

        } else {
            Conditions.Status = 0;
        }

        const Invited = await InvitationEvent.findAll(
            {
                where: Conditions,
                attributes: ['UserID']
            }
        );
        // Set on one array
        const UserIDs = Invited.map(invite => invite.UserID);
        if (Invited.length == 0) {
            return {
                success: false,
                message: "ID not found",
            };
        }
        return {
            statusCode: 200,
            success: true,
            message: "View member for invited successfully",
            data: UserIDs,
        }
    } catch (error) {
        return error;
    }
}

// updated APi for past event attended event name is dynamic(16-01-2025)
// export async function View_MembersByid({ id }, res) {
//     try {
//         const data = await User.findOne({
//             include: [{ model: UserInterest }],
//             where: {
//                 id: id,
//             },
//         });
//         if (!data) {
//             const error = new Error("ID not found");
//             error.StatusCodes = 404; // You can set an appropriate status code
//             throw error;
//         }
//         return {
//             data: data,
//             message: "Member view successfully"
//         }
//     } catch (error) {
//         return error;
//     }
// }

// successfully working after event name dynamic event attended (16-01-2025)
export async function View_MembersByid({ id }, res) {
    try {
        // Fetch user with the `attended_festival_before` column
        const userData = await User.findOne({
            include: [{ model: UserInterest }],
            where: {
                id: id,
            },
        });

        if (!userData) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // Set an appropriate status code
            throw error;
        }

        // Extract the comma-separated `attended_festival_before` values
        const attendedFestivalValues = userData.attended_festival_before
            ? userData.attended_festival_before.split(',')
            : [];

        // Handle case where `attended_festival_before` contains `-1`
        if (attendedFestivalValues.includes('0')) {
            return {
                data: {
                    ...userData.toJSON(),
                    attended_festival_before: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT",
                    attended_festival_ids: [0], // Include `0` as the ID
                },
                message: "Member view successfully with attended festivals",
            };
        }

        if (attendedFestivalValues.length === 0) {
            return {
                data: {
                    ...userData.toJSON(),
                    attended_festival_before: null,
                    attended_festival_ids: null,
                },
                message: "No attended festivals found for the member",
            };
        }

        // Separate numeric IDs and non-ID strings
        const attendedFestivalIds = attendedFestivalValues
            .filter(value => !isNaN(value)) // Only numeric values
            .map(Number);

        const attendedFestivalNames = attendedFestivalValues.filter(value => isNaN(value)); // Non-numeric values

        // Fetch event names from the Event table that match the IDs
        const matchedEvents = await Event.findAll({
            where: {
                id: attendedFestivalIds, // Match the IDs
            },
            attributes: ['Name'], // Only fetch event_name
        });

        // Extract event names and combine with non-ID strings
        const eventNames = matchedEvents.map(event => event.Name);
        const allEventNames = [...eventNames, ...attendedFestivalNames].join(',');

        // Prepare the response with a new key for IDs
        return {
            data: {
                ...userData.toJSON(), // Convert Sequelize model to plain JSON
                attended_festival_before: allEventNames, // Updated with event names
                attended_festival_ids: attendedFestivalIds, // Separate key for IDs
            },
            message: "Member view successfully with attended festivals",
        };
    } catch (error) {
        return error;
    }
}







//mail chimp templates
export async function mailchimp() {
    // const { Name } = req.body; // Assuming the search query parameter is "Name"

    try {
        const apiKey = 'md-fBnpwICjdGEa8H6aZOGOCw'; // Replace with your Mailchimp transactional API key
        const url = 'https://mandrillapp.com/api/1.0/templates/list.json'; // Transactional API endpoint for templates
        const response = await axios.post(
            url,
            {
                key: apiKey,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const allTemplates = response.data;

        // Example: Filter templates based on a specific label
        const label = 'Montenegro2023-Invitation';
        const filteredTemplates = allTemplates.filter((template) => template.labels.includes(label));
        // console.log(filteredTemplates);

        //  res.status(200).json({ success: true, templates });
    } catch (error) {
        console.log(error);
        console.error('Error fetching templates:', error.response.data);
        //   res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }


}

// Search Members
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// export async function Search_Members({ ID, Email, FirstName, LastName, MembershipLevel, Status, ArtistType, CareyesHomeownerFlag, attended_festival_before, Interest, Country, recently_approved }) {
//     // const { Name } = req.body; // Assuming the search query parameter is "Name"
//     // console.log(Interest);
//     // const Countrys = [Country]
//     // console.log("country", Countrys)
//     // const CountrySelectbox = Countrys.join(',')
//     // console.log("CountrySelectbox", CountrySelectbox)
//     try {
//         let newobject = {};
//         let newobjectinterest = {};

//         if (Email) {
//             newobject.Email = { [Op.like]: `%${Email.trim()}%` }
//         } if (ID) {
//             newobject.ID = { [Op.like]: `%${ID}%` }
//         } if (FirstName) {
//             newobject.FirstName = { [Op.like]: `%${FirstName.trim()}%` }
//         } if (LastName) {
//             newobject.LastName = { [Op.like]: `%${LastName.trim()}%` }
//         } if (MembershipLevel) {
//             newobject.MembershipLevel = { [Op.like]: `%${MembershipLevel}%` }
//         } if (Status) {
//             newobject.Status = Status;
//         } if (CareyesHomeownerFlag) {
//             newobject.CareyesHomeownerFlag = CareyesHomeownerFlag
//         }
//         if (recently_approved) {
//             newobject.recently_approved = recently_approved
//         }
//         // if (recently_approved) {
//         //     console.log("recently_approved", newobject.recently_approved = recently_approved ? { [Op.eq]: 1 } : { [Op.eq]: 0 })
//         //     newobject.recently_approved = recently_approved ? { [Op.eq]: 1 } : { [Op.eq]: 0 };
//         // }

//         if (ArtistType === '1') {
//             newobject.ArtistType = {
//                 [Op.not]: null,
//             };
//         }

//         if (ArtistType === '0') {
//             newobject.ArtistType = {
//                 [Op.is]: null,
//             };
//         }

//         if (attended_festival_before === '1') {
//             newobject.attended_festival_before = {
//                 [Op.not]: null,
//             };
//         }
//         if (attended_festival_before === '0') {
//             newobject.attended_festival_before = {
//                 [Op.is]: null,
//             };
//         }
//         const countryArray = Country.split(',').map((e) => e.trim());
//         if (Array.isArray(countryArray) && countryArray.length > 0 && countryArray[0] !== '') {
//             newobject.country_group = { [Op.in]: countryArray };
//         }
//         if (Interest) {
//             const valuesArray = Interest.split(',');
//             newobjectinterest.Interest = { [Op.in]: valuesArray };
//             const searchResultuserinterest = await UserInterest.findAll({
//                 where: newobjectinterest,
//             });
//             const usersinterestid = searchResultuserinterest.map((e) => {
//                 return e.UserID;
//             })
//             if (usersinterestid) {
//                 newobject.ID = { [Op.in]: usersinterestid };
//             }
//         }
//         const searchResults = await User.findAll({
//             include: [{ model: UserInterest }],
//             // order: recently_approved ? [["recently_approved", "DESC"]] : [["id", "DESC"], ["updatedAt", "DESC"]],
//             order: [
//                 ["id", "DESC"],
//                 ["updatedAt", "DESC"]
//             ],
//             where: newobject,
//         });


//         // console.log("userss", userss)
//         // const staticInterest = [Interest];
//         // console.log("Interest", staticInterest)
//         // const modifiedResults = searchResults.map((cur) => {
//         //     const userIntArr = cur.dataValues.Userinterests.map(e => e.Interest);
//         //     const hasIntersection = staticInterest.some(interest => userIntArr.includes(interest));
//         //     return {
//         //         ...cur.dataValues,
//         //         Userinterests: userIntArr,
//         //         hasIntersection,
//         //     };
//         // });



//         return {
//             statusCode: 200,
//             success: true,
//             message: 'Search Members Successfully!',
//             searchResults
//         };
//     } catch (error) {
//         console.log("error")
//         //   res.status(500).json({ error: 'Internal Server Error' });

//     }
// }


export async function Search_Members({ ID, Email, FirstName, LastName, MembershipLevel, Status, ArtistType, CareyesHomeownerFlag, attended_festival_before, Interest, Country, recently_approved }) {
    try {
        let newobject = {};
        let newobjectinterest = {};

        if (Email) {
            newobject.Email = { [Op.like]: `%${Email.trim()}%` }
        } if (ID) {
            newobject.ID = { [Op.like]: `%${ID}%` }
        } if (FirstName) {
            newobject.FirstName = { [Op.like]: `%${FirstName.trim()}%` }
        } if (LastName) {
            newobject.LastName = { [Op.like]: `%${LastName.trim()}%` }
        } if (MembershipLevel) {
            newobject.MembershipLevel = { [Op.like]: `%${MembershipLevel}%` }
        } if (Status) {
            newobject.Status = Status;
        } if (CareyesHomeownerFlag) {
            newobject.CareyesHomeownerFlag = CareyesHomeownerFlag
        }

        if (ArtistType === '1') {
            newobject.ArtistType = {
                [Op.not]: null,
            };
        }

        if (ArtistType === '0') {
            newobject.ArtistType = {
                [Op.is]: null,
            };
        }

        if (attended_festival_before === '1') {
            newobject.attended_festival_before = {
                [Op.not]: null,
            };
        }
        if (attended_festival_before === '0') {
            newobject.attended_festival_before = {
                [Op.is]: null,
            };
        }
        const countryArray = Country.split(',').map((e) => e.trim());
        if (Array.isArray(countryArray) && countryArray.length > 0 && countryArray[0] !== '') {
            newobject.country_group = { [Op.in]: countryArray };
        }
        if (Interest) {
            const valuesArray = Interest.split(',');
            newobjectinterest.Interest = { [Op.in]: valuesArray };
            const searchResultuserinterest = await UserInterest.findAll({
                where: newobjectinterest,
            });
            const usersinterestid = searchResultuserinterest.map((e) => {
                return e.UserID;
            })
            if (usersinterestid) {
                newobject.ID = { [Op.in]: usersinterestid };
            }
        }
        if (recently_approved === '1') {
            newobject.Status = 1;
            const orderCriteria = [['recently_approved', 'DESC',]]; // Order by recently_approved DESC
            return await fetchSearchResults(newobject, newobjectinterest, orderCriteria);
        } else if (recently_approved === '0') {
            newobject.Status = 1;
            const orderCriteria = [['recently_approved', 'ASC']]; // Order by recently_approved ASC
            return await fetchSearchResults(newobject, newobjectinterest, orderCriteria);
        } else {
            const orderCriteria = [['id', 'DESC'], ['updatedAt', 'DESC']]; // Default order criteria
            return await fetchSearchResults(newobject, newobjectinterest, orderCriteria);
        }

    } catch (error) {
        console.log("error")
    }
}

export async function fetchSearchResults(newobject, newobjectinterest, orderCriteria) {
    const searchResults = await User.findAll({
        include: [{ model: UserInterest }],
        order: orderCriteria,
        where: newobject,
    });
    return {
        statusCode: 200,
        success: true,
        message: 'Search members successfully!',
        searchResults
    };
}

// Update members 
export async function Edit_Member({ id, filename }, req) {

    const {
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        Gender,
        dob,
        AddressLine1,
        CompanyName,
        CompanyTitle,
        AddressLine2,
        Country,
        PhoneCountry,
        city_country_birth,
        city_country_live,
        linkdin_profile_link,
        instagram_handle,
        facebook_profile_link,
        link_tree_link,
        core_values,
        not_attendedfestival,
        favourite_music,
        appreciate_your_honesty,
        City,
        PostalCode,
        AssistantName,
        AssistantEmail,
        AssistantPhoneNumber,
        WebsiteURL,
        InstagramURL,
        TwitterURL,
        LinkedInURL,
        ClubhouseURL,
        DiscordURL,
        attended_festival_before,
        most_interested_festival,
        sustainable_planet,
        are_you_member,
        InternalNotes,
        ArtistType,
        FilippoReferralFlag,
        CompedFlag,
        CareyesHomeownerFlag,
        FounderFlag,
        MembershipLevel,
        Status,
        country_group,
        refference1_first_name,
        refference1_last_name,
        refference1_email,
        refference2_first_name,
        refference2_last_name,
        refference2_email,
        mythical_and_mystical,
        admin_notes,
        MembershipTypes,
        States,
        most_interested_other,
        sustainable_planet_other,
        attended_festival_before_other,
        are_you_member_other,
        ImageURL
    } = req.body

    const docheck = await User.findOne({
        where: {
            Email: Email,
            id: { [Op.ne]: id } // exclude current user's id
        }
    });

    if (docheck) {
        return {
            statusCode: 409, // Conflict (better than 404 for duplicate data)
            success: false,
            message: 'This email is already assigned to another user. Please use a different email.',
        };
    } else {

        const updateData = {
            FirstName,
            LastName,
            Email,
            PhoneNumber,
            Gender,
            dob,
            AddressLine1,
            CompanyName,
            CompanyTitle,
            AddressLine2,
            Country,
            PhoneCountry,
            city_country_birth,
            city_country_live,
            linkdin_profile_link,
            instagram_handle,
            facebook_profile_link,
            link_tree_link,
            core_values,
            not_attendedfestival,
            favourite_music,
            appreciate_your_honesty,
            City,
            PostalCode,
            AssistantName,
            AssistantEmail,
            AssistantPhoneNumber,
            WebsiteURL,
            InstagramURL,
            TwitterURL,
            LinkedInURL,
            ClubhouseURL,
            DiscordURL,
            attended_festival_before,
            most_interested_festival,
            sustainable_planet,
            are_you_member,
            InternalNotes,
            ArtistType,
            FilippoReferralFlag,
            CompedFlag,
            CareyesHomeownerFlag,
            FounderFlag,
            MembershipLevel,
            Status,
            country_group,
            refference1_first_name,
            refference1_last_name,
            refference1_email,
            refference2_first_name,
            refference2_last_name,
            refference2_email,
            mythical_and_mystical,
            admin_notes,
            MembershipTypes,
            States,
            most_interested_other,
            sustainable_planet_other,
            attended_festival_before_other,
            are_you_member_other,
            ImageURL: filename
        };
        
        const existingUser = await User.findOne({ where: { id } });
        const oldImageFilename = existingUser?.ImageURL;
        const UpdateMember = await User.update(updateData, { where: { id } });
        if (filename && oldImageFilename && oldImageFilename !== filename) {
            try {
                const folder = "profiles";
                await deleteFromS3(folder, oldImageFilename);
            } catch (err) {
                console.warn("⚠️ Failed to delete old image from S3:", err.message);
            }
        }
        return {
            statusCode: 200,
            success: true,
            message: 'Member update successfully!',
        };
    }
}

export async function Edit_Member_Interest({ id }, req) {
    const { Interest } = req.body
    const updateData = { Interest };
    const users = await UserInterest.destroy({
        where: {
            UserID: id,
        },
    });
    var arrcheck_list = Interest.split(",");
    for (const checkdata of arrcheck_list) {
        await UserInterest.create({
            UserID: id,
            Interest: checkdata
        });
        // console.log("UserInterest", UserInterest)
    }

    // const UpdateMemberInterest = await UserInterest.update(
    //     arrcheck_list,
    //     {
    //         where: { UserID: id },
    //     }
    // );

    return {
        statusCode: 200,
        success: true,
        message: 'Member interest update successfully!',
    };

}

// old status change
// export async function Update_Status({ userId, status }, req) {
//     const id = userId;

//     const randomstring = Math.random().toString().substring(2, 8);
//     try {

//         const existUser = await User.findOne({ where: { id } });
//         const UserName = existUser.dataValues.FirstName
//         const userEmail = existUser.dataValues.Email
//         const hashedPassword = await bcrypt.hash(randomstring, 10);
//         if (existUser) {
//             // const newStatus = (status == 1) ? 0 : 1;
//             const newStatus = (status == 1) ? 0 : 1;
//             await User.update(
//                 { Status: newStatus, Password: hashedPassword },
//                 { where: { id: id } }
//             );
//             // console.log("newStatus", newStatus);
//             const emailTemplates = await Emailtemplet.findOne({
//                 where: {
//                     id: 3
//                 },
//             });

//             if (newStatus == 1) {
//                 const currentDate = new Date();
//                 await User.update(
//                     { recently_approved: currentDate },
//                     {
//                         where: { id: id }
//                     }
//                 );
//                 let template = StatusUpdateUserTemplate({
//                     fromUser: "Ondalinda",
//                     fromEmail: "hello@ondalinda.com",
//                     toEmail: userEmail,
//                     userName: UserName,
//                     NewPassword: randomstring,
//                     userEmail: userEmail,
//                     html: emailTemplates.dataValues.description,
//                     subject: emailTemplates.dataValues.subject,
//                     ccEmail: ['tech@ashwalabs.com'],
//                 });
//                 await sendEmails(template);
//             }

//             return {
//                 statusCode: 200,
//                 success: true,
//                 message: 'Member status updated successfully!',
//             };
//         } else {
//             return {
//                 statusCode: 404,
//                 success: false,
//                 message: 'Member not found with the provided ID.',
//             };
//         }

//     } catch (error) {
//         return {
//             statusCode: 500,
//             success: false,
//             message: 'Internal server error.',
//             error: error.message,
//         };
//     }
// }

// New status update function  Rupam 18-04-2024
export async function Update_Status({ userId, status }, req) {

    const randomstring = Math.random().toString().substring(2, 8);
    try {

        const existUser = await User.findOne({ where: { id: userId } });
        const UserName = existUser.dataValues.FirstName
        const userEmail = existUser.dataValues.Email
        const hashedPassword = await bcrypt.hash(randomstring, 10);

        if (existUser) {

            const currentDate = new Date();

            await User.update(
                { Status: status, recently_approved: currentDate },
                { where: { id: userId } }
            );

            if (status == 0) {
                // Pending approval
                const pendingApproveTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 4 } }); // Rejected
                const sanitizedTemplate = pendingApproveTemplate.dataValues.description;
                const subject = pendingApproveTemplate.dataValues.subject
                // mail champ template name
                const mailChampTemplateName = pendingApproveTemplate.dataValues.mandril_template
                let template = pendingApprovalTemplate({
                    UserName: UserName,
                    userEmail: userEmail,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                const templatename = mailChampTemplateName;
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(userEmail, mergeVars, templatename, subject);


                // const templatename = 'Montenegro 2024 Application Approval Pending';
                // const mergeVars = { USERNAME: UserName, OTHER_PARAM: 'Other Value' };
                // await sendEmail(userEmail, mergeVars, templatename);

            } else if (status == 1) {

                await User.update(
                    { Status: status, Password: hashedPassword, recently_approved: currentDate },
                    { where: { id: userId } }
                );

                // Approved
                // content our database and email send mail-champ--
                const ApprovedTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 5 } }); // Rejected
                const sanitizedTemplate = ApprovedTemplate.dataValues.description;
                const subject = ApprovedTemplate.dataValues.subject
                // mail champ template name
                const mailChampTemplateName = ApprovedTemplate.dataValues.mandril_template
                let template = ApproveTemplate({
                    UserName: UserName,
                    UserEmail: userEmail,
                    Password: randomstring,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                const templatename = mailChampTemplateName;
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(userEmail, mergeVars, templatename, subject);



                // send Mandrial content ..start
                // const templatename = 'Montenegro 2024 Welcome to Ondalinda';
                // const mergeVars = { USERNAME: UserName, USEREMAIL: userEmail, USERPASSWORD: randomstring, OTHER_PARAM: 'Other Value' };
                // await sendEmail(userEmail, mergeVars, templatename);
                // .....End


            } else if (status == 2) {
                // Rejected
                const rejectedTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 3 } }); // Rejected
                const subject = rejectedTemplate.dataValues.subject
                const sanitizedTemplate = rejectedTemplate.dataValues.description;
                // mail champ template name
                const mailChampTemplateName = rejectedTemplate.dataValues.mandril_template
                let template = RejectedEmailTemplate({
                    UserName: UserName,
                    userEmail: userEmail,
                    html: sanitizedTemplate,
                });
                let extractedTemplate = template.html;
                // const templatename = 'Montenegro 2024 Event Application Rejected';
                const templatename = mailChampTemplateName;
                // const mergeVars = { USERNAME: UserName, OTHER_PARAM: 'Other Value' };
                const mergeVars = { ALLDATA: extractedTemplate };
                await sendEmail(userEmail, mergeVars, templatename, subject);
                // const mergeVars = { USERNAME: "lulu", OTHER_PARAM: 'Other Value' };
                // await sendEmail(" hello@ondalinda.com", mergeVars, templatename);
                // const rejectedTemplate = await Emailtemplet.findOne({ where: { id: 17 } }); // Rejected

                // await sendEmails(template);

            }

            return {
                statusCode: 200,
                success: true,
                message: 'Member status updated successfully!',
            };
        } else {
            return {
                statusCode: 404,
                success: false,
                message: 'Member not found with the provided ID.',
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: 'Internal server error.',
            error: error.message,
        };
    }
}

// Find member by email
export async function View_MembersEmail({ email }, res) {
    try {
        const data = await User.findOne({
            // include: [{ model: UserInterest }],
            where: {
                Email: email,
            },
        });
        if (!data) {
            return {
                statusCode: 404,
                success: false,
                message: 'This email not found.',
            };
        }
        return {
            success: true,
            message: "Member view successfully",
            data: data,
        }
    } catch (error) {
        return error;
    }
}


// Member deleted Api(members and invitation deleted )
export async function Delete_Member({ id }, res) {
    try {
        // Find the user by ID
        const user = await User.findOne({ where: { Id: id } });
        if (!user) {
            throw new Error("User not found");
        }
        // Check for associated orders
        const userOrderInfo = await Orders.findOne({
            where: { user_id: id },
            attributes: ["id", "user_id", "event_id"],
        });

        if (userOrderInfo) {
            return {
                success: false,
                message: "Member has associated orders and cannot be deleted.",
            };
        }
        // Log the data before deletion
        const userData = user.toJSON();
        // Create a backup of user data
        await DeleteUserData.create(userData);
        // Delete the user
        await Invitation.destroy({ where: { UserID: id } });
        await User.destroy({ where: { Id: id } });

        if (user?.ImageURL) {
            const folder = "profiles";
            const userProfileImage = user?.ImageURL;
            await deleteFromS3(folder, userProfileImage);
        }

        return { success: true, message: "Member Deleted Successfully!!" };
    } catch (error) {
        console.error("Error deleting member:", error.message);
        return { success: false, message: error.message || "Could not delete member" };
    }
}


export async function Search_LastName({ LastName }) {
    // const { Name } = req.body; // Assuming the search query parameter is "Name"
    try {
        let newobject = {};
        if (LastName) {
            newobject.LastName = { [Op.like]: `%${LastName}%` }
        }
        const searchResults = await User.findAll({
            where: newobject,
            // include: { model: User }
            attributes: ['id', 'FirstName', 'LastName', 'ImageURL', 'Email']
        });
        return {
            statusCode: 200,
            success: true,
            message: 'Search Last Name Data Successfully!',
            searchResults
        };
    } catch (error) {
        console.log("error")
        //   res.status(500).json({ error: 'Internal Server Error' });

    }
}

// send Email for update profile
export async function sendEmailUpdateProfile({ Email }, res) {
    try {
        const userEmail = Email;
        console.log("userEmail", userEmail)
        if (!userEmail) {
            return {
                statusCode: 400,
                success: false,
                message: 'Email is required.'
            };
        }
        const isExist = await User.findOne({
            where: { Email: userEmail }
        });
        // Define the template name and any merge variables needed for the email
        // const templatename = 'OxCareyes 2024 Update Your Profile';
        // const mergeVars = {
        //     FirstName: isExist.dataValues.FirstName.charAt(0).toUpperCase() + isExist.dataValues.FirstName.slice(1),
        //     OTHER_PARAM: 'Other Value' // Replace or add any other parameters as needed
        // };
        // // // Send the email
        // await sendEmail(userEmail, mergeVars, templatename);


        // send-email mandrial but content our data base(30-11-2024)
        const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 12 } });   //Registration-password
        const sanitizedTemplate = findTemplate.dataValues.description;
        const mailChampTemplateName = findTemplate.dataValues.mandril_template
        const subject = findTemplate.dataValues.subject

        let template = updateProfileTemplate({
            FirstName: isExist.dataValues.FirstName.charAt(0).toUpperCase() + isExist.dataValues.FirstName.slice(1),
            html: sanitizedTemplate,
        });
        let extractedTemplate = template.html;
        const templatename = mailChampTemplateName;
        const mergeVars = { ALLDATA: extractedTemplate };
        await sendEmail(userEmail, mergeVars, templatename, subject);



        return {
            statusCode: 200,
            success: true,
            message: 'Update profile email sent successfully.'
        };
    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: 'Internal server error.',
            error: error.message
        };
    }
}



// View Current and feature Events
export async function viewCurrentAndFeatureEvents(req, res) {
    try {
        const Events = await Event.findAll({
            where: { EndDate: { [Op.gte]: new Date() } },
            order: [["id", "DESC"]],
            attributes: ["id", 'Name']
        })
        return {
            success: true,
            message: 'Events retrieved successfully.',
            data: Events
        }
    } catch (err) {
        return {
            success: false,
            message: 'Internal server error.',
            error: err.message
        }

    }
}

// View Past Events
export async function viewPastEvents(req, res) {
    try {
        const Events = await Event.findAll({
            where: { EndDate: { [Op.lte]: new Date() } },
            order: [["id", "DESC"]],
            attributes: ["id", 'Name']
        })
        return {
            success: true,
            message: 'Events retrieved successfully.',
            data: Events
        }
    } catch (err) {
        return {
            success: false,
            message: 'Internal server error.',
            error: err.message
        }
    }
}











