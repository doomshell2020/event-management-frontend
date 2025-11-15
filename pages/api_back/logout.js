// pages/api/logout.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  
  const { role } = req.body; // role can be "admin" or "user"
  let cookieName = "userAuthToken";
  if (role == "admin") {
    cookieName = "authToken"; // your admin cookie name
  }

  res.setHeader("Set-Cookie", [
    `${cookieName}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict; Secure`,
  ]);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}


// // /pages/api/logout.js
// import { serialize } from 'cookie';

// export default function handler(req, res) {
//     const expiredCookie = serialize('authToken', '', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         path: '/',
//         expires: new Date(0), // Immediately expire
//     });
    

//     res.setHeader('Set-Cookie', expiredCookie);
//     res.status(200).json({ message: 'Logout successful' });
// }
