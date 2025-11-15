import multer from 'multer';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const uploadDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // e.g., .jpg, .png
        const baseName = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20); // clean & trim

        const random = crypto.randomBytes(6).toString('hex'); // generates 12-char hex
        const timestamp = Date.now();

        const uniqueName = `${baseName}-${timestamp}-${random}${ext}`;
        cb(null, uniqueName);
    }
});

export const s3FileUpload = multer({ storage });
