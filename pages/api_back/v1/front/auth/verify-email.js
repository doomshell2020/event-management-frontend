import jwt from "jsonwebtoken";
import { User } from "@/database/models";

const JWT_SECRET =
    process.env.JWT_SECRET || "3TWRswLQVQYPBE5kTwIJTKKFYGHDSOGERER";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }

    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification link.",
            });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const { email } = decoded;

        // ✅ Find user
        const user = await User.findOne({
            where: { Email: email },
            attributes: ["id", "Email", "Password", "FirstName", "LastName"]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.IsVerified) {
            return res.status(200).json({
                success: true,
                message: "Email already verified.",
            });
        }

        // ✅ Update user verification
        user.IsVerified = true;
        user.VerificationToken = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(400).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
}
