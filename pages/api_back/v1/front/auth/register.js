import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/database/models";
import { sendEmails } from "@/utils_back/email";

const JWT_SECRET = process.env.JWT_SECRET || "3TWRswLQVQYPBE5kTwIJTKKFYGHDSOGERER";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }

    try {
        const { firstName, lastName, email, password, phoneNumber } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const existingUser = await User.findOne({
            where: {
                Email: email
            },
            attributes: ["id", "Email", "Password", "FirstName", "LastName"]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = jwt.sign({ email }, JWT_SECRET, {
            // expiresIn: "1d", // token valid for 1 day
        });


        const verifyUrl = `${process.env.SITE_URL}/verify-email?token=${verificationToken}`;
        const emailTemplate = `
        <h2>Welcome, ${firstName}!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `;

        // ✅ Save user in DB with "inactive" status
        const newUser = await User.create({
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            PhoneNumber: phoneNumber || null,
            Password: hashedPassword,
            IsVerified: false,
            VerificationToken: verificationToken,
        });

        const isSend = await sendEmails(emailTemplate);
        // console.log('>>>>>>', verifyUrl);
        if (!isSend) {
            return res.status(500).json({
                success: false,
                message: "Failed to send email.",
                verifyUrl: verifyUrl
            });
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please check your email to verify your account.",
            isSend
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}
