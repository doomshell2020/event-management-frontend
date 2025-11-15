import aws from 'aws-sdk';

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

/**
 * Deletes a file from S3
 * @param {string} folder - The folder where file was uploaded (e.g. 'profiles')
 * @param {string} filename - The exact S3 filename (e.g. 'img_1751627897736_rupam.jpg')
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (folder, filename) => {
    if (!folder || !filename) {
        console.warn("🟡 deleteFromS3: Missing folder or filename");
        return;
    }

    const key = `${folder}/${filename}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    };

    try {
        await s3.deleteObject(params).promise();
        console.log(`🗑️ Deleted from S3: ${key}`);
    } catch (err) {
        console.error(`❌ Failed to delete ${key} from S3:`, err.message);
        // Optional: rethrow or handle silently
    }
};
