import {
    search_Housing, View_HousingNew, add_HosuingNew, deleteHousing, view_HousingByIdNew, updateHousingNew, View_HousingBedTypes,
    deleteHousingImage, view_HouseDetail, addOrUpdateHousing, view_HousingImage, getHousingByStatus, View_HousingNeighborhood, View_HousingTypes,
    addUpdateHousing, getAssignedHousing, View_HousingAmenities, GetHousingNeighborhood, searchEventHousingNew
} from "@/shared/services/admin/housing/housingservices"
import { housingImageUpload } from "@/utils_back/fileUpload";
import { checkApiKey } from '@/middleware/checkApiKey';

const handler = async (req, res) => {
    return checkApiKey(req, res, async () => {
        try {
            const { method, query } = req;

            switch (method) {

                case "POST": {
                    try {
                        const key = req.body.key;

                        if (key === "searchHousing") {
                            const searchData = await search_Housing(req.body, res);
                            return res.json(searchData);
                        }

                        if (key === "eligibleHousing") {
                            const insertData = await addUpdateHousing(req, res);
                            return res.json(insertData);
                        }

                        if (key === "getAssignedHousing") {
                            const housingList = await getAssignedHousing(req, res);
                            return res.json(housingList);
                        }

                        if (key === "getHousingBedTypes") {
                            const bedList = await View_HousingBedTypes(req, res);
                            return res.json(bedList);
                        }

                        if (key === "getHousingNeighborhood") {
                            const neighborhoodList = await View_HousingNeighborhood(req, res);
                            return res.json(neighborhoodList);
                        }

                        if (key === "get_housingTypes") {
                            const housingTypeList = await View_HousingTypes(req, res);
                            return res.json(housingTypeList);
                        }

                        if (key === "amenities") {
                            const AmenitiesList = await View_HousingAmenities(req, res);
                            return res.json(AmenitiesList);
                        }

                        if (key === "add_update_housing") {
                            const result = await addOrUpdateHousing(req.body);
                            return res.json(result);
                        }

                        const housing_add = await add_HosuingNew(req.body, req.body.ImageURL || '', res);
                        return res.status(200).json(housing_add);
                    } catch (error) {
                        console.error('Error processing request:', error);
                        res.status(500).json({ error: 'Internal Server Error' });
                    }
                    break;
                }
                case "GET": {
                    const { housing_id, HousingID, housename, HousingByStatus, eventId, key } = query

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
        } catch (error) {
            console.error("API Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error",
                error: error.message || error,
            });
        }
    });
};

export default handler;