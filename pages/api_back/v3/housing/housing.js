import {
    search_Housing, View_HousingNew, view_HousingByIdNew, View_HousingBedTypes, view_HouseDetail, addOrUpdateHousing, view_HousingImage, getHousingByStatus, View_HousingNeighborhood, View_HousingTypes, fetchAllHousingDetailsV3,
    addUpdateHousing, getAssignedHousing, View_HousingAmenities
} from "@/shared/services/admin/housing/housingservices";
import { add_new_housing, add_new_housingV3, updateHousingNew, updateHousingNewV3, addUpdateHousingImagesV3, syncAllProperty, deleteHousingImage, deleteHousing } from "@/shared/services/admin/housing/housing_services";
import { checkApiKey } from '@/middleware/checkApiKey';


const handler = async (req, res) => {
    return checkApiKey(req, res, async () => {
        try {
            const { method, query } = req;
            const { action } = query;

            switch (method) {

                case "POST": {
                    try {
                        if (action == 'sync-property') {
                            const update = await syncAllProperty(req, res);
                        }
                        const housingAdd = await add_new_housingV3(req.body, req.body.ImageURL, res);
                    } catch (error) {
                        console.error('Outer Error:', error);
                        return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
                    }
                    break;
                }
                case "GET": {
                    const data = await fetchAllHousingDetailsV3(req, res);
                    return res.json(
                        { data: JSON.stringify(data) }
                    )
                    break;
                }
                case "PUT": {
                    const { id, action } = query;
                    // console.log('>>>>>>>>>>>>>>',req.body, id, action);
                    // return true

                    try {
                        if (action == 'update-image') {
                            const updateImages = await addUpdateHousingImagesV3(id, req, res);
                        } else {
                            const housingAdd = await updateHousingNewV3(id, req, res);
                        }
                    } catch (error) {
                        console.error('Outer Error:', error);
                        return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
                    }
                    break;
                }
                case "DELETE": {
                    // return res.status(500).json({ success: false, message: 'Internal Server Error' });
                    // break;
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
                success: false,
                message: err.message,
            });
        }
    });
};

export default handler;