import { CountryLocation } from "@/database/models";
import { StatusCodes } from "http-status-codes";

// Find All State base on country
export async function viewAllLocation({ country_id }, req, res) {
    try {
        const findLocation = await CountryLocation.findAll({
            where: { country_id: country_id }
        });
        if (findLocation) {
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Fetch All Country Location By Country_id Successfully!",
                data: findLocation,
            };
        } else {
            return {
                statusCode: 500,
                success: false,
                message: "Location not found.",
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: "Failed to find All Location",
            error: error.message,
        };
    }
}