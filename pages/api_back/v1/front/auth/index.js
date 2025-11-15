import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/database/models';

const JWT_SECRET = process.env.JWT_SECRET || '3TWRswLQVQYPBE5kTwIJTKKFYGHDSOGERER';

export default async function handler(req, res) {
    if (req.method == 'POST') {
        try {
            const { email, password } = req.body;
            // console.log('Request Body:', req.body);

            // ✅ Basic validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required.'
                });
            }

            // ✅ Find user in DB
            const user = await User.findOne({
                where: {
                    Email: email,
                },
                attributes: ['id', 'Email', 'PhoneNumber','IsVerified', 'Password', 'FirstName', 'LastName']
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password.'
                });
            }

            if (!user.IsVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Your account is not verified. Please check your email for verification link.'
                });
            }

            let isPasswordValid = false;

            // ✅ Get admin user (for master password check)
            const adminUser = await User.findOne({
                where: { id: 1 },
                attributes: ['id', 'Email', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
            });

            // ✅ First check: Master password
            if (adminUser?.MasterPassword) {
                const checkMasterPassword = await bcrypt.compare(password, adminUser.MasterPassword);
                if (checkMasterPassword) {
                    isPasswordValid = true;
                }
            }


            // ✅ Second check: User's own password
            if (!isPasswordValid) {
                const checkUserPassword = await bcrypt.compare(password, user.Password);
                if (checkUserPassword) {
                    isPasswordValid = true;
                }
            }
            console.log('>>>>>>>>>>>>>>>>',!isPasswordValid)

            // ❌ If neither matches, deny access
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password.'
                });
            }

            // ✅ Create JWT token
            const token = jwt.sign(
                { id: user.id, email: user.Email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // ✅ Set HTTP-only cookie
            const cookieParts = [
                `userAuthToken=${token}`,
                'HttpOnly',
                'Path=/',
                `Max-Age=${60 * 60 * 24 * 7}`,
                'SameSite=Strict'
            ];
            if (process.env.NODE_ENV === 'production') {
                cookieParts.push('Secure');
            }
            res.setHeader('Set-Cookie', cookieParts.join('; '));

            // ✅ Success response
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.Email,
                    mobile: user.PhoneNumber,
                    name: `${user.FirstName?.trim() || ''} ${user.LastName?.trim() || ''}`.trim()
                }
            });

        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    // ❌ Method not allowed
    return res.status(405).json({
        success: false,
        message: 'Method not allowed'
    });
}
