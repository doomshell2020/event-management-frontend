import { States } from "@/database/models";
import { StatusCodes } from "http-status-codes";

// Find All State base on country
export async function viewAllStates({ country_id }, req, res) {
    console.log("country_id", country_id)
    try {
        const findStates = await States.findAll({
            where: { country_id: country_id },
            order: [['name', 'ASC']], // Sort states by name in ascending (A-Z) order
        });
        if (findStates) {
            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Fetch All States By Country_id Successfully!",
                data: findStates,
            };
        } else {
            return {
                statusCode: 500,
                success: false,
                message: "States not found.",
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: "Failed to find All States",
            error: error.message,
        };
    }
}

