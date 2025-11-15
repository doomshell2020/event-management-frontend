const multer = require("multer");
const path = require("path");

// Configuration for profile image upload
const imageStorage = multer.diskStorage({
  destination: "public/uploads/profiles", // Adjust the destination folder as needed
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB (adjust as needed)
  },
  fileFilter(req, file, cb) {
    // console.log('>>>>>>>>>>>',req);    
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a Valid Image"));
    }
    cb(null, true);
  },
});

// Configuration for housing image upload
const housingImageStorage = multer.diskStorage({
  destination: "public/uploads/housing", // Folder for housing images
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const housingImageUpload = multer({
  storage: housingImageStorage,
  limits: {
    // fileSize: 10 * 1024 * 1024, // Limit file size to 10MB (adjust as needed)
     fileSize: 20 * 1024 * 1024, // Limit file size to 20MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a Valid Image"));
    }
    cb(null, true);
  },
});

// Configuration for slider image upload
const sliderImageStorage = multer.diskStorage({
  destination: "public/uploads/sliders", // Folder for slider images
  filename: (req, file, cb) => {
    const hrTime = process.hrtime(); // Get high-resolution time
    const uniqueSuffix = `${hrTime[0]}${hrTime[1]}${Math.floor(
      Math.random() * 1000
    )}`;
    cb(
      null,
      file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const sliderImageUpload = multer({
  storage: sliderImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB (adjust as needed)
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a valid image (png, jpg, jpeg)"));
    }
    cb(null, true);
  },
});

module.exports = { imageUpload, housingImageUpload, sliderImageUpload };
// module.exports = { imageUpload };
