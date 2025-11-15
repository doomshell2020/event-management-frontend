import { generateQR } from "@/utils_back/qrGenerator";
import {
    Event,
    AddonBook,
    BookTicket,
    Orders,
    Order,
    User,
    EventTicketType,
    MyOrders,
    MyTicketBook
} from "@/database/models";
import { count } from "console";
const Sequelize = require("sequelize");
const { Op, fn, col } = Sequelize;
import { formidable } from 'formidable';
import { uploadToS3 } from '@/utils_back/s3Uploader';
import aws from 'aws-sdk';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Configure S3 client
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export default async function handler(req, res) {
    if (req.method === "POST") {
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ status: false, error: 'Failed to parse form' });
            }

            const targetFolder = fields.folder || 'profiles';
            const fileField = files.file || files.files;

            if (!fileField) {
                return res.status(400).json({ status: false, error: 'No file uploaded' });
            }

            try {
                const uploaded = await uploadToS3(fileField, targetFolder);
                return res.status(200).json({
                    status: true,
                    message: "File uploaded successfully",
                    data: uploaded,
                });
            } catch (error) {
                console.error('Upload error:', error);
                return res.status(500).json({
                    status: false,
                    error: 'Upload failed',
                    detail: error.message,
                });
            }
        });

    } else if (req.method === "DELETE") {
        try {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(buffers).toString());
            const key = body.key;

            if (!key) {
                return res.status(400).json({ status: false, error: "Missing 'key' in request body" });
            }

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
            };

            await s3.deleteObject(params).promise();

            return res.status(200).json({
                status: true,
                message: `File deleted: ${key}`,
            });
        } catch (error) {
            console.error("Delete error:", error);
            return res.status(500).json({
                status: false,
                error: 'Delete failed',
                detail: error.message,
            });
        }

    } else {
        return res.status(405).json({
            status: false,
            error: 'Method not allowed',
        });
    }
}