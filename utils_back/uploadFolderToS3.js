const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const pLimit = require("p-limit");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1",
});

const bucketName = process.env.S3_BUCKET_NAME || "ondalinda";
const localFolder = "/var/www/html/ondalinda/public/uploads/profiles";
const s3BasePath = "profile";

// Limit to 10 parallel uploads
const limit = pLimit(10);

let uploadCount = 0;
let errorCount = 0;

async function uploadFileToS3(localPath, s3Path) {
  try {
    const fileContent = fs.readFileSync(localPath);
    const params = {
      Bucket: bucketName,
      Key: s3Path,
      Body: fileContent,
      ACL: "public-read",
    };

    await s3.upload(params).promise();
    uploadCount++;
    console.log(`✅ Uploaded: ${s3Path}`);
  } catch (err) {
    errorCount++;
    console.error(`❌ Failed: ${s3Path}`, err.message);
  }
}

function getAllFiles(dirPath, basePath = "") {
  let results = [];
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(basePath, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relativePath));
    } else {
      results.push({ fullPath, relativePath });
    }
  });

  return results;
}

async function uploadFolderToS3() {
  console.log("🚀 Starting upload...");
  const allFiles = getAllFiles(localFolder);

  const uploadPromises = allFiles.map(({ fullPath, relativePath }) =>
    limit(() => uploadFileToS3(fullPath, `${s3BasePath}/${relativePath}`))
  );

  await Promise.all(uploadPromises);

  console.log("🎉 Upload complete");
  console.log(`✅ Uploaded files: ${uploadCount}`);
  console.log(`❌ Failed files: ${errorCount}`);
}

module.exports = {
  uploadFolderToS3,
};
