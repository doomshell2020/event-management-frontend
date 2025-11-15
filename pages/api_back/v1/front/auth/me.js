import jwt from "jsonwebtoken";
import { User } from "@/database/models";

const JWT_SECRET = process.env.JWT_SECRET || "3TWRswLQVQYPBE5kTwIJTKKFYGHDSOGERER";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    // ✅ Extract token (from cookie OR Authorization header)
    let token = null;

    if (req.headers.cookie) {
      const cookie = req.headers.cookie
        .split("; ")
        .find((c) => c.startsWith("userAuthToken="));
      if (cookie) token = cookie.split("=")[1];
    }

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Fetch user from DB
    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: [
        "id",
        "Email",
        "PhoneNumber",
        "FirstName",
        "LastName",
        "dob",
        "Gender",
        "IsVerified",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.Email,
        mobile: user.PhoneNumber,
        firstName: user.FirstName,
        lastName: user.LastName,
        dob: user.DateOfBirth,
        gender: user.Gender,
        isVerified: user.IsVerified,
        name: `${user.FirstName?.trim() || ""} ${user.LastName?.trim() || ""}`.trim(),
      },
    });
  } catch (error) {
    console.error("User Info Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
