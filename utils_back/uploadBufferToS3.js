// utils/uploadBufferToS3.js
const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");

// Load credentials via environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const uploadBufferToS3 = async (buffer, key, mimetype) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key, // full path e.g. 'qrCodes/accommodation/file.png'
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read", // Make the image publicly accessible
  };

  try {
    const data = await s3.upload(params).promise();
    return {
      success: true,
      url: data.Location,
      key: data.Key,
    };
  } catch (err) {
    console.error("S3 Upload Error:", err);
    return {
      success: false,
      message: "S3 Upload failed",
    };
  }
};

module.exports = uploadBufferToS3;
