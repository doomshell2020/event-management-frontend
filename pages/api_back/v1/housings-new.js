import {
    search_Housing, View_HousingNew, add_HosuingNew, deleteHousing, view_HousingByIdNew, updateHousingNew, View_HousingBedTypes,
    deleteHousingImage, view_HouseDetail, addOrUpdateHousing, view_HousingImage, getHousingByStatus, View_HousingNeighborhood, View_HousingTypes,
    addUpdateHousing, getAssignedHousing, View_HousingAmenities, GetHousingNeighborhood,searchEventHousingNew
} from "@/shared/services/admin/housing/housingservices"
import { housingImageUpload } from "@/utils_back/fileUpload";
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
                    housingImageUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.error('Error uploading image:', err);
                            return res.status(400).json({ message: 'Error uploading image', error: err.message });
                        }
                        if (req.body.key == "searchHousing") {
                            var searchData = await search_Housing(req.body, res);
                            res.json(searchData);
                        } else if (req.body.key == 'eligibleHousing') {
                            var insertData = await addUpdateHousing(req, res);
                            res.json(insertData);
                        } else if (req.body.key == 'getAssignedHousing') {
                            let housingList = await getAssignedHousing(req, res);
                            res.json(housingList);
                        } else if (req.body.key == 'getHousingBedTypes') {
                            let bedList = await View_HousingBedTypes(req, res);
                            res.json(bedList);
                        } else if (req.body.key == 'getHousingNeighborhood') {
                            let neighborhoodList = await View_HousingNeighborhood(req, res);
                            res.json(neighborhoodList);
                        } else if (req.body.key == 'get_housingTypes') {
                            let housingTypeList = await View_HousingTypes(req, res);
                            res.json(housingTypeList);
                        } else if (req.body.key == 'amenities') {
                            let AmenitiesList = await View_HousingAmenities(req, res);
                            res.json(AmenitiesList);
                        }
                        else {
                            if (req.file) {
                                const { filename } = req.file;
                                const housing_add = await add_HosuingNew(req.body, filename, res);
                                res.status(200).json(housing_add);
                            } else {
                                if (req.body.key == 'add_update_housing') {
                                    const result = await addOrUpdateHousing(req.body);
                                    res.json(result);
                                } else {
                                    const housing_add = await add_HosuingNew(req.body, '', res);
                                    res.status(200).json(housing_add);
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case "GET": {
                const { housing_id, HousingID, housename, HousingByStatus, eventId, key } = query
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
                } else if (key == "getHousingNeighborhood") {
                    const getHousing = await GetHousingNeighborhood(res);
                    res.json(getHousing);
                    break;
                } else if (key == 'get_housingTypes') {
                    let housingTypeList = await View_HousingTypes(res);
                    res.json(housingTypeList);
                }
                else if (req.query.key === 'search_event_housing') {
                    const eventHousing = await searchEventHousingNew(req.query, res);
                    res.json(eventHousing);
                    break;
                }
                else {
                    const Viewhousing = await View_HousingNew(req);
                    res.status(200).json(Viewhousing);
                    break;
                }
            }
            case "PUT": {
                try {
                    housingImageUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.error('Error uploading image:', err);
                            return res.status(400).json({ message: 'Error uploading image', error: err.message });
                        }
                        const { id } = query;
                        if (req.file) {
                            const { filename } = req.file;
                            const data = await updateHousingNew({ id, filename }, req, res);
                            res.status(200).json({ data });
                        } else {
                            const data = await updateHousingNew({ id }, req, res);
                            res.status(200).json({ data });
                        }
                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
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