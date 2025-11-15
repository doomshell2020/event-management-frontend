import { User_Registration, updateUserProfile } from "@/shared/services/front/users_service";
// import { formidable } from 'formidable';
import { uploadToS3 } from '@/utils_back/s3Uploader';
import { s3FileUpload } from "@/utils_back/s3FileUpload";
import { deleteFromS3 } from '@/utils_back/s3Delete';
import jwt from "jsonwebtoken";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const { method } = req;

    try {
        switch (method) {

            case 'POST': {
                return s3FileUpload.single('ImageURL')(req, res, async (err) => {
                    
                    if (err) {
                        console.error("Multer Error:", err);
                        return res.status(500).json({ success: false, message: "File upload failed :" + err.message });
                    }

                    try {
                        const file = req.file;

                        if (!file) {
                            return res.status(400).json({ success: false, message: 'No file uploaded' });
                        }

                        const fileForS3 = {
                            originalFilename: file.originalname,
                            mimetype: file.mimetype,
                            filepath: file.path,
                        };
                        const targetFolder = String('profiles');
                        const uploaded = await uploadToS3(fileForS3, targetFolder);
                        const imageUrl = uploaded?.[0]?.url;
                        const imageFilename = uploaded?.[0]?.filename;

                        if (!imageFilename) {
                            return res.status(500).json({ success: false, message: 'Image upload failed' });
                        }

                        // ✅ Send all form fields + image URL
                        const userPayload = {
                            ...req.body,
                            ImageFilename: imageFilename,
                        };

                        const registrationResult = await User_Registration(userPayload);
                        // console.log('>>>>>>>',registrationResult);                       

                        if (registrationResult?.success) {
                            return res.status(201).json(registrationResult);
                        } else {
                            await deleteFromS3(targetFolder, imageFilename);
                            return res.status(400).json(registrationResult);
                        }
                    } catch (uploadErr) {
                        console.error('Upload/Register error:', uploadErr);

                        // ❌ Delete the file from S3 if an error occurred
                        if (imageFilename && targetFolder) {
                            await deleteFromS3(targetFolder, imageFilename);
                        }

                        return res.status(500).json({
                            success: false,
                            message: 'Internal error during registration :' + uploadErr.message,
                            detail: uploadErr.message,
                        });
                    }
                });
            }

            case 'GET': {
                // Example placeholder for GET
                return res.status(200).json({ success: true, message: 'GET not implemented yet' });
            }

            case 'PUT': {
                try {
                    s3FileUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.error("Multer Error:", err);
                            return res.status(500).json({ success: false, message: "File upload failed: " + err.message });
                        }

                        const authHeader = req.headers.authorization;
                        if (!authHeader) {
                            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
                        }
                        let token = authHeader;
                        if (authHeader.startsWith("Bearer ")) {
                            token = authHeader.slice(7);
                        }

                        let userId;
                        try {
                            const decoded = jwt.verify(token, "your-secret-key"); // Replace with your actual secret key
                            userId = decoded.userId;
                        } catch (err) {
                            return res.status(401).json({ success: false, message: "Invalid token" });
                        }

                        const file = req.file;
                        let imageFilename = null;

                        if (file) {
                            const fileForS3 = {
                                originalFilename: file.originalname,
                                mimetype: file.mimetype,
                                filepath: file.path,
                            };
                            const targetFolder = String('profiles');
                            const uploaded = await uploadToS3(fileForS3, targetFolder);
                            imageFilename = uploaded?.[0]?.filename;

                            if (!imageFilename) {
                                return res.status(500).json({ success: false, message: 'Image upload failed' });
                            }
                        }

                        const updatedData = {
                            ...req.body,
                            ...(imageFilename && { ImageFilename: imageFilename }),
                        };

                        const updateResult = await updateUserProfile(userId, updatedData);

                        if (updateResult?.success) {
                            return res.status(200).json(updateResult);
                        } else {
                            if (imageFilename) {
                                const folder = req.body.folder || 'profiles';
                                await deleteFromS3(folder, imageFilename);
                            }
                            return res.status(400).json(updateResult);
                        }
                    });
                } catch (error) {
                    return res.status(500).json({ success: false, message: 'Internal error during update: ' + error.message });
                }
                break;
            }

            default: {
                res.setHeader('Allow', ['POST', 'GET', 'PUT']);
                return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
            }
        }
    } catch (err) {
        console.error('Top-level error:', err);
        return res.status(500).json({ success: false, error: 'Unhandled server error', detail: err.message });
    }
}
