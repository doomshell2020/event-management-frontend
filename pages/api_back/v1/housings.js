import {
    search_Housing, View_Housing, add_Hosuing, deleteHousing, releaseHousing, view_HousingByid, updateHousing,
    deleteHousingImage, view_HouseDetail, addOrUpdateHousing, view_HousingImage, getHousingByStatus,
    addUpdateHousing, getAssignedHousing, searchEventHousing, getAvailableHousingDateRange, approvedHousingRequest, isBookingRequest,getEventHousingDetails
} from "@/shared/services/admin/housing/housingservices";
import { isBooked, isAccommodationBooked } from "@/shared/services/front/housing/housingservices";

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

                        if (req.body.key == "date-extend") {
                            const isSubmit = await isBookingRequest(req, res);
                            res.json(isSubmit);

                        } else if (req.body.key == "searchHousing") {
                            var searchData = await search_Housing(req.body, res);
                            res.json(searchData);
                        } else if (req.body.key == 'search_event_housing') {
                            var eventHousing = await searchEventHousing(req.body, res);
                            res.json(eventHousing);
                        } else if (req.body.key == 'eligibleHousing') {
                            var insertData = await addUpdateHousing(req, res);
                            res.json(insertData);
                        } else if (req.body.key == 'getAssignedHousing') {
                            let housingList = await getAssignedHousing(req, res);
                            res.json(housingList);
                        } else if (req.body.key == 'approved_housing_request') {
                            let approved_housing = await approvedHousingRequest(req, res);
                            res.json(approved_housing);
                        } else {
                            if (req.file) {
                                const { filename } = req.file;
                                const event_add = await add_Hosuing(req.body, filename, res);
                                res.status(200).json(event_add);
                            } else {
                                if (req.body.key == 'add_update_housing') {
                                    const result = await addOrUpdateHousing(req.body);
                                    res.json(result);
                                } else {
                                    const event_add = await add_Hosuing(req.body, '', res);
                                    res.status(200).json(event_add);
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
                const { housingId, eventHousingId, HousingID, housename, HousingByStatus, eventId, userId, queryArrival, queryDeparture, action } = query;

                try {
                    if (req.query.key == 'get-event-housing') {
                        // console.log('>>>>>>>>>>',eventHousingId);
                        const housingList = await getEventHousingDetails(eventHousingId);
                        res.json(housingList);
                        break;
                    } else if (action == 'isAccommodationAssigned') {
                        const apiResponse = await isAccommodationBooked({ housingId, eventId }, res);
                        res.json(apiResponse);
                        break;
                    } else if (action == 'is_booked') {
                        const apiResponse = await isBooked(eventHousingId, res);
                        res.json(apiResponse);
                        // return false
                        break;
                    } else if (action == 'release_housing') {
                        const releaseHousingData = await releaseHousing(req, res);
                        res.json(releaseHousingData);
                    } else if (housingId) {
                        const vierStaff = await view_HousingByid({ housingId }, res);
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
                    } else if (queryArrival && queryDeparture) {
                        const getHousing = await getAvailableHousingDateRange(req, res);
                        res.json(getHousing);
                        break;
                    } else if (HousingByStatus) {
                        const getHousing = await getHousingByStatus({ HousingByStatus, eventId, userId }, res);
                        res.json(getHousing);
                        break;
                    } else {
                        const ViewHousing = await View_Housing(req);
                        res.status(200).json(ViewHousing);
                        break;
                    }

                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(200).json(
                        {
                            "success": false,
                            "message": "Error processing request " + error
                        }
                    )

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
                            const data = await updateHousing({ id, filename }, req, res);
                            res.status(200).json({ data });
                        } else {
                            const data = await updateHousing({ id }, req, res);
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