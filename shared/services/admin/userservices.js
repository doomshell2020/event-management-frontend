import { User, InvitationEvent } from "../../../database/models"
import { StatusCodes } from 'http-status-codes';
import responseManagement from "../../../utils_back/responsemanagement"
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
const jwtSecret = 'your-secret-key'; // Replace with your actual secret key
const tokenExpiration = '24h'; // Token expiration time, adjust as needed

const generateToken = (userId) => {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: tokenExpiration });
};


// Sing up Admin
export async function Admin_Registration({ FirstName, LastName, Email, Password, PhoneNumber, Gender, dob, }) {
    const users = await User.create({
        FirstName: FirstName,
        LastName: LastName,
        Email: Email,
        Password: Password,
        PhoneNumber: PhoneNumber,
        Gender: Gender,
        dob: dob
    });

    return users.dataValues;
}


export async function AdminLogin({ Email, Password }, res) {
    try {
        const user = await User.findOne({
            where: { Email: Email },
            attributes: ['id', 'Email', 'Status', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
        });

        if (!user) {
            return responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "User Not Found");
        }

        if (user.Role != 1) {
            return responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "You are not authorized");
        }

        const passwordMatch = await bcrypt.compare(Password, user.Password);

        if (user && !passwordMatch) {
            const adminUser = await User.findOne({
                where: { ID: 1 },
                attributes: ['id', 'Email', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
            });

            const checkMasterPassword = await bcrypt.compare(Password, adminUser.MasterPassword);
            if (checkMasterPassword) {
                const token = generateToken(user.id);

                // ✅ Set cookie
                res.setHeader('Set-Cookie', serialize('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                }));

                return responseManagement.sendResponse(res, StatusCodes.OK, "Successfully Logged in!", { user, token });
            }
        }

        if (user && passwordMatch) {
            const token = generateToken(user.id);

            // ✅ Set cookie
            res.setHeader('Set-Cookie', serialize('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            }));

            return responseManagement.sendResponse(res, StatusCodes.OK, "Successfully Logged in!", { user, token });
        } else {
            return responseManagement.sendResponse(res, 401, "Unauthorized: Incorrect password", user);
        }

    } catch (error) {
        console.error('Error in AdminLogin:', error);
        return responseManagement.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    }
}


// Admin login
// export async function AdminLogin({ Email, Password }, res) {
//     try {
//         // console.log("res", res)
//         // const user = await User.findOne({ where: { Email } });

//         const user = await User.findOne({
//             where: { Email: Email },
//             attributes: ['id', 'Email', 'Status', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
//         });
//         // console.log("🚀 ~ user:", user)


//         // if (user.Status == 0 || user.id != 1) {
//         if (!user) {
//             responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "User Not Found");
//             return;
//         }

//         if (user.Role != 1) {
//             responseManagement.sendResponse(res, StatusCodes.BAD_REQUEST, "Unfortunately, you are not authorized at this location");
//             return;
//         }


//         const passwordMatch = await bcrypt.compare(Password, user.Password);

//         // check here Master Password 
//         if (user && !passwordMatch) {
//             const adminUser = await User.findOne({
//                 where: { ID: 1 },
//                 attributes: ['id', 'Email', 'Password', 'MasterPassword', 'FirstName', 'Role', 'LastName']
//             });

//             const checkMasterPassword = await bcrypt.compare(Password, adminUser.MasterPassword);
//             if (checkMasterPassword) {
//                 const token = generateToken(user.id);
//                 return responseManagement.sendResponse(res, StatusCodes.OK, "Successfully Logged in!", { user, token: token });

//             }
//         }

//         if (user && passwordMatch) {
//             const token = generateToken(user.id);
//             responseManagement.sendResponse(res, StatusCodes.OK, "Successfully Logged in!", { user, token: token });
//         } else {
//             responseManagement.sendResponse(res, 401, "Unauthorized: The password is incorrect", user);
//         }


//     } catch (error) {
//         console.error('Error in handler:', error);
//         responseManagement.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
//     }
// }

// Admin profile view
export async function Profile_View(req) {

    const tokan = req.headers.authorization.replace('Bearer ', '');
    const decodedToken = jwt.verify(tokan, jwtSecret); // Decode and verify token
    const userIds = req.userId = decodedToken.userId
    const users = await User.findOne(
        { where: { id: userIds } }
    );
    return users;
}

// Edit profile
export async function Edit_Profile({ filename }, req) {
    const {
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        AddressLine1,
        AddressLine2,
        CompanyName,
        CompanyTitle,
        country_group,

    } = req.body
    const tokan = req.headers.authorization.replace('Bearer ', '');
    const decodedToken = jwt.verify(tokan, 'your-secret-key');
    const userIds = req.userId = decodedToken.userId
    const updateData = {
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        AddressLine1,
        AddressLine2,
        CompanyName,
        CompanyTitle,
        country_group,
        ImageURL: filename
    };
    const UpdateProfile = await User.update(
        updateData,
        {
            where: { id: userIds },
        }
    );
    return {
        statusCode: 200,
        success: true,
        message: 'Profile Update Successfully!',
    };
}

export async function updateDob(req) {

    try {
        const users = await User.findAll({
            attributes: ['id', 'dob', 'FirstName'],
            where: { id: 1 }
        });

        for (let i = 0; i < users.length; i++) {
            const dobTimestamp = users[i].dataValues.dob; // Assuming dob is stored as timestamp
            const dobDate = new Date(dobTimestamp); // Convert timestamp to Date object
            if (!isNaN(dobDate.getTime())) { // Check if dobDate is valid
                users[i].setDataValue('date_of_birth', dobDate);
                // console.log("Updating user:", users[i].dataValues.date_of_birth);
                await users[i].save(); // Save the updated user
            }
        }

        return {
            statusCode: 200,
            success: true,
            message: 'Data updated successfully',
            data: users
        };

    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to update data',
            error: error.message
        };
    }
}

export async function fetchProfileByToken(req) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return {
                statusCode: 400,
                success: false,
                message: 'Authorization header missing'
            };
        }

        const token = authorizationHeader.replace('Bearer ', '');

        let decoded;
        try {
            decoded = jwt.verify(token, 'your-secret-key');
        } catch (error) {
            return {
                statusCode: 401,
                success: false,
                message: 'Invalid or expired token',
                error: error.message
            };
        }

        const user = await User.findOne({
            where: { id: decoded.userId }
        });

        if (!user) {
            return {
                statusCode: 404,
                success: false,
                message: 'User not found'
            };
        }

        const userId = user.id;
        const isEligible = await checkIsEligible({ userId, eventId: 111 });

        return {
            statusCode: 200,
            success: true,
            message: 'User profile fetched successfully',
            data: user,
            isEligible
        };
    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch user profile',
            error: error.message
        };
    }
}

export async function getAdminFees({ userId }) {
    try {
        // Get the user by userId and select only the admin_fees attribute
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['admin_fees', 'donation_fees'], // Corrected attribute syntax
        });

        // Check if the user was found
        if (!user) {
            return {
                success: false,
                message: "User not found.",
            };
        }

        // Return the admin fees from the user
        return {
            success: true,
            message: "Admin fees retrieved successfully.",
            data: {
                admin_fees: user.admin_fees,
                donation_fees: user.donation_fees, // Access the admin_fees property
            },
        };
    } catch (error) {
        console.error("Error fetching admin fees:", error);
        return {
            success: false,
            message: "Failed to retrieve admin fees.",
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



