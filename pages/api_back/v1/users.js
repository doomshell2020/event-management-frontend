
// import { Admin_Signup, Profile_View, AdminLogin, Edit_Profile } from "../../service/dbservice";
import { Admin_Registration, Profile_View, AdminLogin, Edit_Profile, updateDob, fetchProfileByToken, getAdminFees } from "@/shared/services/admin/userservices"
import { imageUpload } from "@/utils_back/fileUpload";

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
        const { method, query } = req;
        switch (method) {
            case "POST": {
                try {
                    imageUpload.single('ImageURL')(req, res, async (err) => {

                        if (req.body.key == "login") {
                            var login_admin = await AdminLogin(req.body, res);
                            res.status(200).json(login_admin);
                        } else if (req.body.key == "register") {
                            var Registration = await Admin_Registration(req.body, res);
                            res.status(200).json(Registration);
                        }
                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case "GET": {
                const { key } = query; // Extract 'id' from query parameters
                if (key == "admin_fee") {
                    const response = await getAdminFees({ userId: 1 });
                    res.json(response);
                    break;
                } else if (key == "Updatedob") {
                    const DobChange = await updateDob(req);
                    res.status(200).json(DobChange);
                    break;
                } else {
                    // const Viewprofile = await Profile_View(req);
                    // res.status(200).json(Viewprofile);

                    const getProfile = await fetchProfileByToken(req);
                    res.json(getProfile);
                    break;

                }

            }
            case "PUT": {
                try {
                    // imageUpload.single('ImageURL')(req, res, async (err) => {
                    s3FileUpload.single('ImageURL')(req, res, async (err) => {

                        if (err) {
                            console.error("Multer Error:", err);
                            return res.status(400).json({ success: false, error: err.message, message: "File upload failed: " + err.message });
                        }


                        let imageFilename = null;

                        if (req.file) {
                            const fileForS3 = {
                                originalFilename: req.file.originalname,
                                mimetype: req.file.mimetype,
                                filepath: req.file.path,
                            };

                            const uploaded = await uploadToS3(fileForS3, 'profiles');

                            imageFilename = uploaded?.[0]?.filename;

                            if (!imageFilename) {
                                return res.status(500).json({ success: false, message: 'Image upload to S3 failed' });
                            }
                        }

                        // Call your update profile function (pass only updatedData if preferred)
                        const result = await Edit_Profile({ filename: imageFilename }, req, res);
                        return res.status(200).json(result);

                        // if (req.file) {
                        //     const { filename } = req.file;
                        //     const Editadminprofile = await Edit_Profile({ filename }, req, res);
                        //     res.status(200).json(Editadminprofile);
                        //     // console.log("image upload")
                        // } else {
                        //     const Editadminprofile = await Edit_Profile('', req, res);
                        //     res.status(200).json(Editadminprofile);
                        // }
                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
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