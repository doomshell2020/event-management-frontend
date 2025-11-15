import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

/**
 * Upload one or more files to S3 under a given folder
 * @param {Object|Object[]} files - file(s) from formidable
 * @param {string} folder - target folder in the bucket (e.g., 'profiles')
 * @returns {Promise<Array>} - uploaded files [{ filename, url }]
 */
export const uploadToS3 = async (files, folder = '') => {


    const fileArray = Array.isArray(files) ? files : [files];

    const uploads = fileArray.map(async (file) => {
        try {
            const fileContent = fs.readFileSync(file.filepath);
            const ext = path.extname(file.originalFilename || file.filepath); // e.g. .jpg
            const base = path.basename(file.originalFilename || file.filepath, ext)
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')       // clean special chars
                .slice(0, 20);
            const timestamp = Date.now();
            const randomStr = crypto.randomBytes(4).toString('hex'); // 8 char hex
            const fileName = `img_${timestamp}_${base}_${randomStr}${ext}`;
            // const fileName = `img_${timestamp}_${file.originalFilename}`;
            const s3Key = `${folder}/${fileName}`;

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ACL: 'public-read',
                ContentType: file.mimetype,
            };
            //   console.log("----------------Uploading with params:", params);
            const data = await s3.upload(params).promise();
            console.log("----------------Upload Success:", data);
            return {
                filename: fileName,
                url: data.Location,
            };
        } catch (err) {
            console.error("S3 Upload Error:", err.message);
            throw new Error(`Upload failed for ${file.originalFilename}: ${err.message}`);
        }
    });

    return Promise.all(uploads);
};