import { uploadToS3 } from '@/utils_back/s3Uploader';
import { s3FileUpload } from "@/utils_back/s3FileUpload";
import { deleteFromS3 } from '@/utils_back/s3Delete';

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req, res) => {
    try {
        // console.log('>>>>>>>>>>',req);
        const { method } = req;

        switch (method) {
            case "POST": {
                try {
                    s3FileUpload.single('ImageURL')(req, res, async (err) => {

                        if (err) {
                            console.error("Multer Error:", err);
                            return res.status(400).json({ success: false, error: err.message });
                        }

                        if (!req.file) {
                            return res.status(400).json({ success: false, message: 'No image file uploaded' });
                        }

                        const bucketFolderName = req.body.folderName || 'cms_img_update';

                        const fileForS3 = {
                            originalFilename: req.file.originalname,
                            mimetype: req.file.mimetype,
                            filepath: req.file.path,
                        };

                        const uploaded = await uploadToS3(fileForS3, bucketFolderName);
                        const imageFilename = uploaded?.[0]?.filename;
                        const imageLocation = uploaded?.[0]?.url; // <-- get full URL from S3 response

                        if (!imageFilename || !imageLocation) {
                            return res.status(500).json({ success: false, message: 'Image upload to S3 failed' });
                        }

                        return res.status(200).json({
                            success: true,
                            message: 'Image uploaded to S3 successfully',
                            filename: imageFilename,
                            url: imageLocation, // <-- send full URL in response
                        });

                    });
                } catch (error) {
                    console.error('Error uploading image:', error);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                }
                break;
            }

            default:
                res.setHeader("Allow", ["POST"]);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    } catch (err) {
        console.error('Outer Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export default handler;
