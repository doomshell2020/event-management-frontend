import { User, Emailtemplet, ErrorLogsModel } from "@/database/models";
import { createTemplate } from "@/utils_back/templateHelper";
import { sendEmail } from "@/utils_back/sendEmail";
import { deleteFromS3 } from '@/utils_back/s3Delete';
const bcrypt = require("bcryptjs");
import jwt from "jsonwebtoken";

export const User_Registration = async (payload) => {
    try {
        const {
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
            ImageURL,
            ImageFilename,
            States
        } = payload;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return {
                success: false,
                message: "Email already exists",
            };
        }

        const passwordToHash = Password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // Insert user into database
        const newUser = await User.create({
            FirstName,
            LastName,
            Email,
            Password: hashedPassword,
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
            ImageURL: ImageFilename,
            States,
        });

        let isMailSent = false;

        // 4. Try sending welcome email using template
        const template = await Emailtemplet.findOne({
            attributes: ['description', 'mandril_template', 'subject'],
            where: { eventId: 110, templateId: 11 },
        });

        if (template) {
            const { description, mandril_template, subject } = template;
            const sanitizedTemplate = description;
            const capitalizedName = FirstName.trim().charAt(0).toUpperCase() + FirstName.trim().slice(1);
            const filledHtml = createTemplate(sanitizedTemplate, {
                UserName: capitalizedName,
            });
            const mergeVars = { ALLDATA: filledHtml };
            isMailSent = await sendEmail(Email, mergeVars, mandril_template, subject);
            // Update user record with email status
            await User.update({ isMailSent }, { where: { id: newUser.id } });
        }

        return {
            success: true,
            message: "Your request has been submitted and our team will revert to you shortly.",
        };
    } catch (error) {
        console.error("User_Registration error:", error);

        await ErrorLogsModel.create({
            error_message: error.message || "Unknown error",
            error_stack: error.stack || "No stack trace",
            error_location: "User_Registration function",
            request_data: JSON.stringify(payload || {}),
        });

        return {
            success: false,
            message: "Registration failed. Error: " + error.message,
            error,
        };
    }
};


export const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ 1. Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }

        // ✅ 2. Find user by email
        const user = await User.findOne({ where: { Email:email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // ✅ 3. Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // ✅ 4. Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.Email,
                firstName: user.FirstName,
                lastName: user.LastName,
            },
            process.env.JWT_SECRET || "default_secret", // use strong secret in .env
            { expiresIn: "7d" } // token valid for 7 days
        );

        // ✅ 5. Return response
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                PhoneNumber: user.PhoneNumber,
            },
        });
    } catch (error) {
        console.error("UserLogin error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed. Error: " + error.message,
        });
    }
};

export const updateUserProfile = async (userId, updatedData) => {
    try {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return { success: false, message: "User not found." };
        }

        const oldImageFilename = user.ImageURL;
        const newImageFilename = updatedData.ImageFilename; // this is the uploaded image

        // Fields allowed to update
        const allowedFields = [
            "FirstName", "LastName", "PhoneNumber", "Gender", "dob",
            "AddressLine1", "CompanyName", "CompanyTitle", "AddressLine2", "Country",
            "PhoneCountry", "city_country_birth", "city_country_live", "linkdin_profile_link",
            "instagram_handle", "facebook_profile_link", "link_tree_link", "core_values",
            "not_attendedfestival", "favourite_music", "appreciate_your_honesty", "City",
            "PostalCode", "AssistantName", "AssistantEmail", "AssistantPhoneNumber",
            "WebsiteURL", "InstagramURL", "TwitterURL", "LinkedInURL", "ClubhouseURL",
            "DiscordURL", "attended_festival_before", "most_interested_festival",
            "sustainable_planet", "are_you_member", "InternalNotes", "ArtistType",
            "FilippoReferralFlag", "CompedFlag", "CareyesHomeownerFlag", "FounderFlag",
            "MembershipLevel", "State", "country_group",
            "refference1_first_name", "refference1_last_name", "refference1_email",
            "refference2_first_name", "refference2_last_name", "refference2_email",
            "mythical_and_mystical", "most_interested_other", "sustainable_planet_other",
            "attended_festival_before_other", "are_you_member_other", "States"
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (field in updatedData) {
                updateData[field] = updatedData[field];
            }
        }

        if (newImageFilename) {
            updateData.ImageURL = newImageFilename;

            if (oldImageFilename && oldImageFilename !== newImageFilename) {
                const folder = "profiles";
                await deleteFromS3(folder, oldImageFilename);
            }
        }

        // Perform the update and check result
        const [affectedRows] = await User.update(updateData, { where: { id: userId } });

        if (affectedRows > 0) {
            return {
                success: true,
                statusCode: 200,
                message: "Your profile has been successfully updated. Thank you for keeping your information current.",
                data: updateData
            };
        } else {
            return {
                success: false,
                statusCode: 400,
                message: "No changes were made to your profile, or user not found.",
            };
        }

    } catch (error) {
        console.error("updateUserProfile error:", error);

        await ErrorLogsModel.create({
            error_message: error.message || "Unknown error",
            error_stack: error.stack || "No stack trace",
            error_location: "updateUserProfile function",
            request_data: JSON.stringify({ userId, updatedData }),
        });

        return {
            success: false,
            message: "Profile update failed. Error: " + error.message,
        };
    }
};