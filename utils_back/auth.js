import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware-like function for API routes
export const verifyToken = (req, res) => {
  try {
    // Safely parse cookies
    const cookies = req.headers.cookie
      ? cookie.parse(req.headers.cookie)
      : {};

    const token = cookies.userAuthToken || null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No auth token found" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user data to request (for usage in your handler)
    req.authUser = decoded;

    // ✅ Instead of calling next(), just return decoded data
    return { success: true, user: decoded };
  } catch (err) {
    console.error("❌ Invalid or expired token:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
