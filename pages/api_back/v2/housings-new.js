import {
    search_Housing, View_HousingNew, view_HousingByIdNew, View_HousingBedTypes, view_HouseDetail, addOrUpdateHousing, view_HousingImage, getHousingByStatus, View_HousingNeighborhood, View_HousingTypes,
    addUpdateHousing, getAssignedHousing, View_HousingAmenities
} from "@/shared/services/admin/housing/housingservices";
import { add_new_housing, updateHousingNew, deleteHousingImage, deleteHousing } from "@/shared/services/admin/housing/housing_services";
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
                    s3FileUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.error("Multer Error:", err);
                            return res.status(500).json({ success: false, message: "File upload failed: " + err.message });
                        }

                        try {
                            const key = req.body.key;

                            let filename = '';
                            if (req.file) {
                                const fileForS3 = {
                                    originalFilename: req.file.originalname,
                                    mimetype: req.file.mimetype,
                                    filepath: req.file.path,
                                };

                                const targetFolder = req.body.folder || 'housing';
                                const uploaded = await uploadToS3(fileForS3, targetFolder);
                                filename = uploaded?.[0]?.filename || '';

                                if (!filename) {
                                    return res.status(500).json({ success: false, message: 'Image upload to S3 failed' });
                                }
                            }

                            switch (key) {
                                case "searchHousing":
                                    const searchData = await search_Housing(req.body, res);
                                    return res.json(searchData);

                                case "eligibleHousing":
                                    const insertData = await addUpdateHousing(req, res);
                                    return res.json(insertData);

                                case "getAssignedHousing":
                                    const housingList = await getAssignedHousing(req, res);
                                    return res.json(housingList);

                                case "getHousingBedTypes":
                                    const bedList = await View_HousingBedTypes(req, res);
                                    return res.json(bedList);

                                case "getHousingNeighborhood":
                                    const neighborhoodList = await View_HousingNeighborhood(req, res);
                                    return res.json(neighborhoodList);

                                case "get_housingTypes":
                                    const housingTypeList = await View_HousingTypes(req, res);
                                    return res.json(housingTypeList);

                                case "amenities":
                                    const amenitiesList = await View_HousingAmenities(req, res);
                                    return res.json(amenitiesList);

                                case "add_update_housing":
                                    const result = await addOrUpdateHousing(req.body);
                                    return res.json(result);

                                default:
                                    const housingAdd = await add_new_housing(req.body, filename, res);
                                    return res.status(200).json(housingAdd);
                            }
                        } catch (innerErr) {
                            console.error('Handler Error:', innerErr);

                            if (req.file) {
                                try {
                                    const targetFolder = req.body.folder || 'housing';
                                    const filename = req.file.filename;
                                    await deleteFromS3(targetFolder, filename);
                                } catch (delErr) {
                                    console.warn("Failed to delete file from S3 after error:", delErr.message);
                                }
                            }

                            return res.status(500).json({
                                success: false,
                                message: "Processing error: " + innerErr.message,
                            });
                        }

                    });
                } catch (error) {
                    console.error('Outer Error:', error);
                    return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
                }
                break;
            }
            case "GET": {
                const { housing_id, HousingID, housename, HousingByStatus, eventId } = query
                // console.log('HousingByStatus', HousingByStatus);
                // return
                if (housing_id) {
                    const vierStaff = await view_HousingByIdNew({ housing_id }, res);
                    res.status(200).json(vierStaff);
                    break;
                } else if (HousingID) {
                    const vierStaff = await view_HousingImage({ HousingID }, res);
                    res.json(vierStaff);
                    break;
                } else if (housename) {
                    const view_house = await view_HouseDetail({ housename }, res);
                    res.json(view_house);
                    break;
                } else if (HousingByStatus) {
                    const getHousing = await getHousingByStatus({ HousingByStatus, eventId }, res);
                    res.json(getHousing);
                    break;
                } else {
                    const Viewhousing = await View_HousingNew(req);
                    res.status(200).json(Viewhousing);
                    break;
                }
            }
            case "PUT": {
                s3FileUpload.single('ImageURL')(req, res, async (err) => {
                    const { id } = query;
                    const targetFolder = req.body.folder || 'housing';
                    let filename = '';

                    if (err) {
                        console.error("Multer Error:", err);
                        return res.status(500).json({ success: false, message: "File upload failed: " + err.message });
                    }

                    try {
                        // ✅ Upload to S3 if image exists
                        if (req.file) {
                            const fileForS3 = {
                                originalFilename: req.file.originalname,
                                mimetype: req.file.mimetype,
                                filepath: req.file.path,
                            };

                            const uploaded = await uploadToS3(fileForS3, targetFolder);
                            filename = uploaded?.[0]?.filename || '';

                            if (!filename) {
                                return res.status(500).json({ success: false, message: 'Image upload to S3 failed' });
                            }
                        }

                        // ✅ Update housing
                        const data = await updateHousingNew({ id, filename }, req);
                        return res.status(200).json(data);

                    } catch (error) {
                        console.error('Error during PUT update:', error);

                        // ❌ Delete uploaded image on failure
                        if (filename) {
                            try {
                                await deleteFromS3(filename, targetFolder);
                                console.log("Rolled back image from S3 due to failure.");
                            } catch (delErr) {
                                console.warn("Failed to delete image from S3:", delErr.message);
                            }
                        }

                        return res.status(500).json({
                            success: false,
                            message: "Update failed: " + error.message,
                        });
                    }
                });

                break;
            }
            case "DELETE": {
                const { id, imageId } = query;

                if (id) {
                    const deletionResult = await deleteHousing({ id }, res);
                    res.status(200).json(deletionResult);
                    break;
                } else if (imageId) {
                    const deletionResult = await deleteHousingImage({ imageId }, res);
                    res.json(deletionResult);
                    break;
                }
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

const saveFile = async (file) => {
    const data = fs.readFileSync(file.path);
    fs.writeFileSync(`./public/${file.name}`, data);
    await fs.unlinkSync(file.path);
};

export default handler;