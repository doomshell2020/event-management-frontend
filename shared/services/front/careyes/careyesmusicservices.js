import { Cms } from "../../../../database/models"
import { StatusCodes } from 'http-status-codes';

// View by VanityURL 
export async function Cms_VanityURL(VanityURL, res) {
    try {
        const data = await Cms.findOne({
            where: {
                VanityURL: VanityURL,
            },
        });
        if (!data) {
            const error = new Error("ID not found");
            error.StatusCodes = 404; // You can set an appropriate status code
            throw error;
        }
        return {
            message: "View VanityURL",
            data: data,
        }
    } catch (error) {
        return error;
    }
}


