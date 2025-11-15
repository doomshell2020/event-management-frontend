import { add_HousingImage } from "@/shared/services/admin/housing/housingservices"
import { housingImageUpload } from "@/utils_back/fileUpload";
import { uploadToS3 } from '@/utils_back/s3Uploader';
import { s3FileUpload } from "@/utils_back/s3FileUpload";
import { deleteFromS3 } from '@/utils_back/s3Delete';

import fs from 'fs';
export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                try {
                    housingImageUpload.array('URL')(req, res, async (err) => {
                        if (err) {
                            console.error('Error uploading image:', err.message);
                            return res.status(400).json({ message: 'Error uploading image', error: err.message });
                        }
                        if (req.files) {
                            const filenames = req.files.map(file => file.filename);
                            const addHousing = await add_HousingImage(req.body, filenames, res);
                            res.json(addHousing);
                        } else {
                            const addHousing = await add_HousingImage(req.body, '', res);
                            res.json(addHousing);
                        }
                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case "GET": {
            }
            case "PUT": {
                s3FileUpload.array('URL')(req, res, async (err) => {
                    if (err) {
                        console.error("Multer Error:", err);
                        return res.status(500).json({ success: false, message: "File upload failed: " + err.message });
                    }

                    const targetFolder = req.body.folder || 'housing';
                    let uploaded = [];

                    try {
                        if (!req.files || req.files.length === 0) {
                            return res.status(400).json({ success: false, message: "No files uploaded." });
                        }
                        const formattedFiles = req.files.map(file => ({
                            filepath: file.path,
                            originalFilename: file.originalname,
                            mimetype: file.mimetype
                        }));

                        uploaded = await uploadToS3(formattedFiles, targetFolder);
                        const filenames = uploaded.map(f => f.filename);
                        const result = await add_HousingImage(req.body, filenames, res);
                        return res.status(200).json(result);

                    } catch (error) {
                        console.error("Upload or DB error:", error);
                        if (uploaded.length > 0) {
                            for (const file of uploaded) {
                                try {
                                    await deleteFromS3(file.filename, targetFolder);
                                    console.log("Rolled back:", file.filename);
                                } catch (delErr) {
                                    console.warn("Failed to delete uploaded file from S3:", file.filename, delErr.message);
                                }
                            }
                        }

                        return res.status(500).json({
                            success: false,
                            message: "Internal Server Error: " + error.message
                        });
                    }
                });

                break;
            }

            case "DELETE": {

                break;
            }
            default:
                res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    } catch (err) {
        res.status(400).json({
            error_code: "api_one",
            message: err.message,
        });
    }
};

export default handler;