import { User, UserInterest, Emailtemplet, Event, ErrorLogsModel, InvitationEvent } from "@/database/models";
import { StatusCodes } from "http-status-codes";
import responseManagement from "@/utils_back/responsemanagement";
import { sendEmails } from "@/utils_back/email";
import { setCookie } from '@/utils_back/setCookie'; // adjust path as needed

import { resetPasswordTemplate, registrationTemplate, joinOurCommunityTemplate } from "@/utils_back/email-templates";
import {
  sendEmail,
  sendMultipleEmails,
  sendEmailToOndalindaTeam,
} from "@/utils_back/sendEmail";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const encryptionKey = "yourEncryptionKey";
const CryptoJS = require("crypto-js");

const bcrypt = require("bcryptjs");
import jwt from "jsonwebtoken";

const jwtSecret = "your-secret-key"; // Replace with your actual secret key
const tokenExpiration = "12h"; // Token expiration time, adjust as needed

const generateToken = (userId) => {
  // return jwt.sign({ userId }, jwtSecret, { expiresIn: tokenExpiration });
  return jwt.sign({ userId }, jwtSecret);
};

// Sing up User
export async function User_Registration(
  req,
  {
    FirstName,
    LastName,
    Email,
    Password,
    PhoneNumber,
    Gender,
    dob,
    AddressLine1,
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
    most_interested_other,
    sustainable_planet_other,
    attended_festival_before_other,
    are_you_member_other,
    States
  },
  filename,
  res
) {
  const randomString = Math.random().toString().substring(2, 8);
  const email = Email;

  try {
    const docheck = await User.findOne({
      where: { Email: email },
    });

    if (docheck) {
      return {
        statusCode: 404,
        success: false,
        message:
          "Email already exists. Please login instead or use a different email.",
      };
    } else {
      const hashedPassword = await bcrypt.hash(randomString, 10);

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
        most_interested_other: most_interested_other,
        sustainable_planet_other: sustainable_planet_other,
        attended_festival_before_other: attended_festival_before_other,
        are_you_member_other: are_you_member_other,
        States: States
      });

      // send-email mandrial but content our data base(30-11-2024)
      const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 11 } });   //Registration-password
      const sanitizedTemplate = findTemplate.dataValues.description;
      const mailChampTemplateName = findTemplate.dataValues.mandril_template
      const subject = findTemplate.dataValues.subject

      let template = registrationTemplate({
        UserName: FirstName.charAt(0).toUpperCase() + FirstName.slice(1),
        html: sanitizedTemplate,
      });
      let extractedTemplate = template.html;
      const templateName = mailChampTemplateName;
      const mergeVars = { ALLDATA: extractedTemplate };
      // await sendEmail(email, mergeVars, templateName, subject);
      const isSend = await sendEmail(email, mergeVars, templateName, subject);
      // const isSend = await sendEmails(template);
      await User.update(
        { isMailSent: isSend },
        {
          where: { id: users.id },
        }
      );


      return {
        statusCode: 200,
        id: users.id,
        Password: randomString,
        success: true,
        message:
          "Your request has been submitted and our team will revert to you shortly.",
      };
    }
  } catch (error) {
    console.error(">>>>>>>>>>>>>>>>>>>>> Error : ", error);
    // Extract request body from 'req'
    // Save error details in the database
    const requestData = JSON.stringify(req.body || {});
    await ErrorLogsModel.create({
      error_message: error.message || "Unknown error",
      error_stack: error.stack || "No stack trace",
      error_location: "Registration Process",
      request_data: requestData,  // Store request details
    });

    return {
      statusCode: 500,
      success: false,
      message: "Error in the registration process. Please contact the tech team.",
    };
  }

}

// User Interested Added
export async function User_Interest({ Interest }, User_ID, res) {
  var arrcheck_list = Interest.split(",");
  for (const checkdata of arrcheck_list) {
    await UserInterest.create({
      UserID: User_ID,
      Interest: checkdata,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "User Interest Added Successfully!",
  };
}

// User login Mobile new
export async function UserLogin({ Email, Password }, res) {
  try {
    const user = await User.findOne({
      where: { Email: Email },
      // attributes: ['id', 'Email', 'Status', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
    });

    if (!user) {
      responseManagement.sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password."
      );
      return;
    }
    // Check if the user's Role is 3, otherwise return an unauthorized response
    if (user.Role != 3) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Access denied. This account does not have permission to log in.",
      }
      // responseManagement.sendResponse(
      //   res,
      //   StatusCodes.UNAUTHORIZED,
      //   "Access denied. This account does not have permission to log in."
      // );
      // return;
    }
    if (user.Status == 0) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is deactivated. Contact support for assistance."
      );
      return;
    }
    if (user.Status == 2) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is suspended. Contact support for assistance."
      );
      return;
    }
    if (user.Status == 3) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is underreview. Contact support for assistance."
      );
      return;
    }
    if (user.Status == 4) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is suspended. Contact support for assistance."
      );
      return;
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password);

    // check here Master Password
    if (user && !passwordMatch) {
      const adminUser = await User.findOne({
        where: { ID: 1 },
        // attributes: ['id', 'Email', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
      });

      const checkMasterPassword = await bcrypt.compare(
        Password,
        adminUser.MasterPassword
      );

      if (checkMasterPassword) {
        const token = generateToken(user.id);
        if (
          !user.FirstName ||
          !user.LastName ||
          !user.PhoneNumber ||
          !user.CompanyName ||
          !user.CompanyTitle ||
          !user.Country ||
          !user.AddressLine1 ||
          !user.City ||
          !user.country_group ||
          !user.refference1_first_name ||
          !user.refference1_last_name ||
          !user.refference1_email ||
          !user.refference2_first_name ||
          !user.refference2_last_name ||
          !user.refference2_email ||
          !user.LinkedInURL ||
          !user.facebook_profile_link ||
          !user.InstagramURL ||
          !user.link_tree_link ||
          !user.mythical_and_mystical
        ) {
          setCookie(res, 'user_id', user.id);
          return responseManagement.sendResponse(
            res,
            StatusCodes.OK,
            "Successfully logged in!",
            { user, token, noDataFilled: false }
          );
        }
        setCookie(res, 'user_id', user.id);
        return responseManagement.sendResponse(
          res,
          StatusCodes.OK,
          "Successfully logged in!",
          { user, token: token }
        );
      }
    }

    if (user && passwordMatch) {
      // Check if user has a first name, if not, return a specific key
      const token = generateToken(user.id);
      if (
        !user.FirstName ||
        !user.LastName ||
        !user.PhoneNumber ||
        !user.CompanyName ||
        !user.CompanyTitle ||
        !user.Country ||
        !user.AddressLine1 ||
        !user.City ||
        !user.country_group ||
        !user.refference1_first_name ||
        !user.refference1_last_name ||
        !user.refference1_email ||
        !user.refference2_first_name ||
        !user.refference2_last_name ||
        !user.refference2_email ||
        !user.LinkedInURL ||
        !user.facebook_profile_link ||
        !user.InstagramURL ||
        !user.link_tree_link ||
        !user.mythical_and_mystical
      ) {
        setCookie(res, 'user_id', user.id);
        return responseManagement.sendResponse(
          res,
          StatusCodes.OK,
          "Successfully logged in!",
          { user, token, noDataFilled: false }
        );
      }
      setCookie(res, 'user_id', user.id);

      responseManagement.sendResponse(
        res,
        StatusCodes.OK,
        "Successfully logged in!",
        { user, token }
      );
    } else {
      responseManagement.sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Incorrect email or password."
      );
    }
  } catch (error) {
    console.error("Error in handler:", error);
    responseManagement.sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "INTERNAL_SERVER_ERROR"
    );
  }
}

// User login website
export async function UserLoginWeb({ Email, Password }, res) {
  try {
    const user = await User.findOne({
      where: { Email: Email },
      // attributes: ['id', 'Email', 'Status', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
    });

    if (!user) {
      responseManagement.sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password."
      );
      return;
    }

    if (user.Status == 0) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is deactivated. Contact support for assistance."
      );
      return;
    }
    if (user.Status == 2) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is suspended. Contact support for assistance."
      );
      return;
    }
    if (user.Status == 3) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is under review. Contact support for assistance."
      );
      return;
    }
    if (user.Status == 4) {
      // responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Your account is under review");
      responseManagement.sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Your account is suspended. Contact support for assistance."
      );
      return;
    }


    const userId = user.id;
    const isEligible = await checkIsEligible({ userId, eventId: 111 });
    const passwordMatch = await bcrypt.compare(Password, user.Password);

    // check here Master Password
    if (!passwordMatch) {
      const adminUser = await User.findOne({
        where: { ID: 1 },
        // attributes: ['id', 'Email', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
      });

      const checkMasterPassword = await bcrypt.compare(
        Password,
        adminUser.MasterPassword
      );

      if (checkMasterPassword) {
        const token = generateToken(user.id);
        if (
          !user.FirstName ||
          !user.LastName ||
          !user.PhoneNumber ||
          !user.CompanyName ||
          !user.CompanyTitle ||
          !user.Country ||
          !user.AddressLine1 ||
          !user.City ||
          !user.country_group ||
          !user.refference1_first_name ||
          !user.refference1_last_name ||
          !user.refference1_email ||
          !user.refference2_first_name ||
          !user.refference2_last_name ||
          !user.refference2_email ||
          !user.LinkedInURL ||
          !user.facebook_profile_link ||
          !user.InstagramURL ||
          !user.link_tree_link ||
          !user.mythical_and_mystical
        ) {
          setCookie(res, 'user_id', user.id);
          return responseManagement.sendResponse(
            res,
            StatusCodes.OK,
            "Successfully logged in!",
            { user, token, isEligible, noDataFilled: false }
          );
        }


        setCookie(res, 'user_id', user.id);
        return responseManagement.sendResponse(
          res,
          StatusCodes.OK,
          "Successfully logged in!",
          { user, token: token, isEligible }
        );
      }
    }

    if (user && passwordMatch) {
      // Check if user has a first name, if not, return a specific key
      const token = generateToken(user.id);
      if (
        !user.FirstName ||
        !user.LastName ||
        !user.PhoneNumber ||
        !user.CompanyName ||
        !user.CompanyTitle ||
        !user.Country ||
        !user.AddressLine1 ||
        !user.City ||
        !user.country_group ||
        !user.refference1_first_name ||
        !user.refference1_last_name ||
        !user.refference1_email ||
        !user.refference2_first_name ||
        !user.refference2_last_name ||
        !user.refference2_email ||
        !user.LinkedInURL ||
        !user.facebook_profile_link ||
        !user.InstagramURL ||
        !user.link_tree_link ||
        !user.mythical_and_mystical
      ) {
        setCookie(res, 'user_id', user.id);
        return responseManagement.sendResponse(
          res,
          StatusCodes.OK,
          "Successfully logged in!",
          { user, token, isEligible, noDataFilled: false }
        );
      }
      setCookie(res, 'user_id', user.id);
      responseManagement.sendResponse(
        res,
        StatusCodes.OK,
        "Successfully logged in!",
        { user, token, isEligible }
      );
    } else {
      responseManagement.sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Incorrect email or password."
      );
    }

  } catch (error) {
    console.error("Error in handler:", error);
    responseManagement.sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "INTERNAL_SERVER_ERROR"
    );
  }
}

// new 13-02-2025 (user profile vide api)
export async function UserProfile_View(req) {
  try {
    // Extract token from headers
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return {
        success: false,
        message: "Authorization token is required",
      };
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "your-secret-key");
    } catch (error) {
      return {
        success: false,
        message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token",
      };
    }

    const userIds = decodedToken.userId;

    // Fetch user data with UserInterest association
    const users = await User.findOne({
      include: [{ model: UserInterest }],
      where: { id: userIds },
    });

    if (!users) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Normalize "attended_festival_before" column
    const attendedFestivals = users.attended_festival_before
      ? users.attended_festival_before
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) // Split by commas outside quotes
        .map((item) => item.trim().replace(/^"|"$/g, "")) // Remove surrounding quotes
      : [];

    let EventInfo = [];

    // Process attended festivals (IDs or names)
    if (attendedFestivals.length > 0) {
      const eventIds = [];
      const eventNames = [];

      attendedFestivals.forEach((festival) => {
        if (festival === "0") {
          EventInfo.push({ id: 0, Name: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT" });
        } else if (/^\d+$/.test(festival)) {
          eventIds.push(parseInt(festival, 10));
        } else if (festival === "I HAVE NEVER ATTENDED AN ONDALINDA EVENT") {
          EventInfo.push({ id: 0, Name: festival });
        } else {
          eventNames.push(festival);
        }
      });

      // Fetch events by IDs and Names
      const eventsById = await Event.findAll({
        attributes: ["id", "Name"],
        where: { id: eventIds },
      });

      const eventsByName = await Event.findAll({
        attributes: ["id", "Name"],
        where: { Name: eventNames },
      });

      EventInfo = [...EventInfo, ...eventsById, ...eventsByName];
    }

    return {
      success: true,
      message: "User Profile View successfully!!",
      data: users,
      events: EventInfo,
    };
  } catch (error) {
    console.error("Error in UserProfile_View:", error);
    return {
      success: false,
      message: "An error occurred while fetching user profile",
    };
  }
}

// Edit profile
export async function User_ProfileEdit({ id, filename }, req) {
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
    State,
    country_group,
    refference1_first_name,
    refference1_last_name,
    refference1_email,
    refference2_first_name,
    refference2_last_name,
    refference2_email,
    mythical_and_mystical,
    most_interested_other,
    sustainable_planet_other,
    attended_festival_before_other,
    are_you_member_other,
    States
  } = req.body;
  const tokan = req.headers.authorization.replace("Bearer ", "");
  const decodedToken = jwt.verify(tokan, "your-secret-key");
  const userIds = (req.userId = decodedToken.userId);
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
    State,
    country_group,
    refference1_first_name,
    refference1_last_name,
    refference1_email,
    refference2_first_name,
    refference2_last_name,
    refference2_email,
    mythical_and_mystical,
    most_interested_other,
    sustainable_planet_other,
    attended_festival_before_other,
    are_you_member_other,
    ImageURL: filename,
    States: States
  };
  const UpdateProfile = await User.update(updateData, {
    where: { id: userIds },
  });
  return {
    statusCode: 200,
    success: true,
    message: " User Profile Update Successfully!",
  };
}

export async function Edit_User_Interest({ id }, req) {
  // console.log("UserID", id)
  const { Interest } = req.body;
  const tokan = req.headers.authorization.replace("Bearer ", "");
  const decodedToken = jwt.verify(tokan, "your-secret-key");
  const userIds = (req.userId = decodedToken.userId);
  const updateData = { Interest };

  const users = await UserInterest.destroy({
    where: { UserID: userIds },
  });
  var arrcheck_list = Interest.split(",");
  for (const checkdata of arrcheck_list) {
    await UserInterest.create({
      UserID: userIds,
      Interest: checkdata,
    });
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
    message: "Member  Interest Update Successfully!",
  };
}

// Change Password
export async function Change_Password({ id }, req) {
  const { Password } = req.body;
  const tokan = req.headers.authorization.replace("Bearer ", "");
  const decodedToken = jwt.verify(tokan, "your-secret-key");
  const userIds = (req.userId = decodedToken.userId);
  // console.log("userIds", userIds)
  // Hash the password
  const hashedPassword = await bcrypt.hash(Password, 10); // 10 is the salt rounds
  const updateData = { Password: hashedPassword };
  try {
    const UpdateProfile = await User.update(updateData, {
      where: { id: userIds },
    });
    return {
      statusCode: 200,
      success: true,
      message: "Your password has been successfully updated.",
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update password",
      error: error.message,
    };
  }
}

// Forgot passwords
export async function Forgot_password({ Email }, res) {
  const email = Email;
  try {
    const docheck = await User.findOne({
      where: { Email: email },
      attributes: ['id', 'Status', 'FirstName', 'LastName', 'Email']
    });
    if (!docheck) {
      return {
        statusCode: 404,
        success: false,
        message:
          "User not found. Please verify your credentials and try again.",
      };
    }
    if (docheck.dataValues.Status !== 1) {
      return {
        statusCode: 403,
        success: false,
        message: "Your account is not approved. You cannot reset your password.",
      };
    }


    // else {
    const randomstring = ("" + Math.random()).substring(2, 8);
    const hashedPassword = await bcrypt.hash(randomstring, 10); // 10 is the salt rounds

    const UpdateProfile = await User.update(
      {
        Password: hashedPassword,
      },
      {
        where: { email },
      }
    );
    // send mail for mail chimp
    // const templatename = "Reset Password";
    // const mergeVars = {
    //   USERNAME: docheck.dataValues.FirstName,
    //   USERPASSWORD: randomstring,
    //   OTHER_PARAM: "Other Value",
    // };
    // await sendEmail(email, mergeVars, templatename);


    // send-email mandrial but content our data base(30-11-2024)
    const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 10 } });   //Reset-password
    const sanitizedTemplate = findTemplate.dataValues.description;
    const mailChampTemplateName = findTemplate.dataValues.mandril_template
    const subject = findTemplate.dataValues.subject

    let template = resetPasswordTemplate({
      UserName: docheck.dataValues.FirstName,
      Password: randomstring,
      html: sanitizedTemplate,
    });
    let extractedTemplate = template.html;
    const templateName = mailChampTemplateName;
    const mergeVars = { ALLDATA: extractedTemplate };
    await sendEmail(email, mergeVars, templateName, subject);

    return {
      statusCode: 200,
      success: true,
      message: "A password has been successfully sent to your email address.",
    };
    // }
  } catch (error) {
    console.log(error, "error");
    responseManagement.sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "internal_server_error"
    );
  }
}

//
export async function update_dob(res, req) {
  try {
    const user = await User.findOne({
      attributes: ["id", "dob", "dobs"],
    });

    if (user) {
      return {
        statusCode: 200,
        success: true,
        message: "data find",
      };
    } else {
      return {
        statusCode: 500,
        success: false,
        message: "Failed to find member",
        error: error.message,
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update password",
      error: error.message,
    };
  }
}

// Send Friend Registration invitation
export async function sendInvitationEmailNewEmail(req, res) {
  try {
    const newEmail = req.body.newEmail;
    const existUserEmail = req.body.existUserEmail;
    const isExist = await User.findOne({
      where: { Email: newEmail },
    });

    if (!isExist) {
      const userSend = await User.findOne({
        where: { Email: existUserEmail },
      });

      if (!userSend) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found with the provided ID.",
        };
      }
      // send Email for mail chimp
      // const templatename = "Invitation to Join Our Community";
      // const mergeVars = {
      //   USERNAME:
      //     userSend.FirstName.charAt(0).toUpperCase() +
      //     userSend.FirstName.slice(1),
      //   OTHER_PARAM: "Other Value",
      // };
      // await sendEmail(newEmail, mergeVars, templatename);

      // send-email mandrial but content our data base(30-11-2024)
      const findTemplate = await Emailtemplet.findOne({ where: { eventId: 110, templateId: 13 } });
      const sanitizedTemplate = findTemplate.dataValues.description;
      const mailChampTemplateName = findTemplate.dataValues.mandril_template
      const subject = findTemplate.dataValues.subject

      let template = joinOurCommunityTemplate({
        UserSend: userSend.FirstName.charAt(0).toUpperCase() + userSend.FirstName.slice(1),
        html: sanitizedTemplate,
      });
      let extractedTemplate = template.html;
      const templateName = mailChampTemplateName;
      const mergeVars = { ALLDATA: extractedTemplate };
      await sendEmail(newEmail, mergeVars, templateName, subject);



      return {
        statusCode: 200,
        success: true,
        message: "Invitation email sent successfully.",
      };
    } else {
      return {
        statusCode: 400,
        success: false,
        message: "Email address already exists.",
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

// User profile view
export async function viewUserProfileByEmail(req, res) {
  const { Email } = req.query;
  try {
    const userProfile = await User.findOne({
      where: { Email: Email },
      attributes: [
        "id",
        "Email",
        "Status",
        "member_status",
        "Password",
        "MasterPassword",
        "FirstName",
        "Role",
        "LastName",
      ],
    });

    if (userProfile) {
      return {
        statusCode: 200,
        success: true,
        data: userProfile,
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

// Find All users
export async function viewUser(req, res) {
  try {
    const userProfile = await User.findAll({
      attributes: [
        "id",
        "Email",
        "MembershipTypes",
        "FirstName",
        "LastName",
        "PhoneNumber",
      ],
    });
    if (userProfile) {
      return {
        statusCode: 200,
        success: true,
        message: "Fetch User data.",
        data: userProfile,
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

// save token & device id  in database(mobile app)
export async function fireBaseApi({ userId, token, device_Id }, req, res) {
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      responseManagement.sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "User not found"
      );
      return;
    } else {
      const users = await User.update(
        {
          token: token,
          device_Id: device_Id,
        },
        {
          where: {
            id: userId,
          },
        }
      );
      return {
        statusCode: StatusCodes.OK,
        status: true,
        message: "firebase has been updated successful!",
        data: users.id,
      };
    }
  } catch (error) {
    console.error("Error in handler:", error);
    responseManagement.sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "INTERNAL_SERVER_ERROR"
    );
  }
}

// ticket transfer accept terms& conditions
export async function sendEmailTicketAcceptTermsConditions(req, res) {
  try {
    const existUserEmail = req.body.email;
    const { ticket_id, status, tickettype, fromName } = req.body;
    // Staff Id Encrypt
    function encryptData(data) {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        encryptionKey
      ).toString();
    }

    const emailExit = await User.findOne({
      where: {
        Email: existUserEmail,
      },
    });
    if (emailExit) {
      const encryptedUserID = encryptData(emailExit.dataValues.id);
      const encryptedUserName = encryptData(emailExit.dataValues.FirstName);
      const encryptedUserLastName = encryptData(emailExit.dataValues.LastName);
      const encryptedUserEmail = encryptData(emailExit.dataValues.Email);
      const encryptedTicketID = encryptData(ticket_id);
      const encryptedFromName = encryptData(fromName);

      const userName =
        emailExit.dataValues.FirstName + " " + emailExit.dataValues.LastName;
      let templateName = "Transfer Ticket Accept T&C Careyes 2024";
      const mergeVars = {
        USERNAME: userName,
        URLLINK: `${SITE_URL}transfer-ticket-terms-and-conditions/?userid=${encryptedUserID}&name=${encryptedUserName}&lname=${encryptedUserLastName}&email=${encryptedUserEmail}&ticket_id=${encryptedTicketID}&status=${status}&tickettype=${tickettype}&fromName=${encryptedFromName}`,
      };
      await sendEmail(emailExit.dataValues.Email, mergeVars, templateName);
      return {
        statusCode: 200,
        success: true,
        message:
          "Ticket transfer acceptance terms & conditions email sent successfully.",
      };
    } else {
      return {
        statusCode: 200,
        success: false,
        message: "Invalid Email.",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Internal server error :" + error.message,
      error: error.message,
    };
  }
}

// find users for id
// export async function view_Users({ id }, res) {
//     console.log("id", id)
//     try {
//         const data = await User.findOne({
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
//             message: "User view successfully!",
//             success: true,
//             data: data,
//         }
//     } catch (error) {
//         return error;
//     }
// }

export async function view_Users({ id }, res) {
  try {
    if (!id) {
      return {
        message: "ID is undefined",
        success: false,
        data: null,
      };
    }
    const data = await User.findOne({
      where: {
        id: id,
      },
      attributes: ["id", "FirstName", "LastName", "Email"],
    });
    if (!data) {
      return {
        message: "ID not found",
        success: false,
        data: null,
      };
    }

    return {
      message: "User viewed successfully!",
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      message: error.message || "An error occurred",
      success: false,
      data: null,
    };
  }
}

//  Send email sendEmailCastleVillaOrHotels Preferences
export async function sendEmailCastleVillaOrHotels(req, res) {
  try {
    const existUserEmail = req.body.userName;
    const bedrooms = req.body.bedRooms;
    const key = req.body.key;
    const UserEmail = req.body.UserEmail;
    const userId = req.body.userId;

    // if (key == 'hotelRoom') {
    //     await User.update(
    //         { isoxcareyes: 1 },
    //         {
    //             where: { id: userId }
    //         }
    //     );

    //     let templateName = 'OxCareyes 2024 Housing Request Hotel';
    //     const mergeVars = { Name: existUserEmail, Bedroom: bedrooms, UserEmail: UserEmail };
    //     // await sendMultipleEmails(['raguilar@cuixmala.com', 'info@alamandas.com', 'maria@lasrosadas.com', 'reservations@careyes.net', 'reservations@careyes.com.mx','marco@pacificluxuryvillas.com'], mergeVars, templateName);
    //     const recipientEmails = ['rupam@doomshell.com'];
    //     await sendMultipleEmails(recipientEmails, mergeVars, templateName)

    // } else
    if (key == "castleVilla") {
      await User.update(
        { isoxcareyes: 1 },
        {
          where: { id: userId },
        }
      );

      if (bedrooms !== "No") {
        // let templateName = 'OxCareyes 2024 Housing Request Villa';
        // new comment
        // let templateName = "careyes-ondalinda-team-housing-interest";
        let templateName = "careyes ondalinda team housing interest";
        // const recipientEmails = ['hello@ondalinda.com','kristen@ondalinda.com','mariana@ondalinda.com','lulu@ondalinda.com'];
        const recipientEmails = ["hello@ondalinda.com"];
        const mergeVars = {
          Name: existUserEmail,
          Bedroom: bedrooms,
          UserEmail: UserEmail,
        };
        await sendEmailToOndalindaTeam(
          recipientEmails,
          mergeVars,
          templateName,
          UserEmail
        );
      }
      // await sendEmail('hello@ondalinda.com', mergeVars, templateName);
    } else {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid key",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message:
        "Thank you for submitting your preferences, we will be in touch with availability via email.",
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error.message,
    };
  }
}

// replace attended_festival_before_old to attended_festival_before(17-01--2025) Api create and successfully working
const { Op } = require("sequelize");
export async function ReplaceData(req, res) {
  try {
    // Fetch all users who have data in the "attended_festival_before_old" column
    const usersToUpdate = await User.findAll({
      where: {
        attended_festival_before_old: {
          [Op.ne]: null, // Find users where "attended_festival_before_old" is not null
        },
      },
      attributes: ['id', 'attended_festival_before_old'] // Only fetch necessary columns
    });


    if (usersToUpdate.length === 0) {
      return { message: "No users found with data in 'attended_festival_before_old' column." };
    }

    // Update each user's "attended_festival_before" column with data from "attended_festival_before_old"
    for (const user of usersToUpdate) {
      await User.update(
        { attended_festival_before: user.attended_festival_before_old }, // Set new value
        { where: { id: user.id } } // Update based on user ID
      );
    }

    // Fetch updated records for verification
    const updatedUsers = await User.findAll({
      where: {
        attended_festival_before: {
          [Op.ne]: null, // Verify users where "attended_festival_before" is now updated
        },
      },
      attributes: ['id', 'FirstName', 'LastName', 'email', 'attended_festival_before']
    });

    return {
      message: "Records updated successfully.",
      data: updatedUsers,
    };
  } catch (error) {
    return {
      error: "An error occurred while processing your request.",
      details: error.message,
    };
  }
}

async function checkIsEligible({ userId, eventId }) {
  try {
    const invitation = await InvitationEvent.findOne({
      where: {
        UserID: userId,
        EventID: eventId
      },
      attributes: ['id', 'UserID', 'EventID']
    });
    // const isEligible = !!invitation;
    return !!invitation

  } catch (error) {
    return false
  }
}