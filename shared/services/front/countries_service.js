import { Country, States } from "@/database/models";
import { StatusCodes } from "http-status-codes";

// Find All users
export async function viewAllCountries(req, res) {
    try {
        const findCountries = await Country.findAll({});
        if (findCountries) {

            return {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Fetch All Countries Successfully!!",
                data: findCountries,
            };
        } else {
            return {
                statusCode: 500,
                success: false,
                message: "Countries not found.",
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            success: false,
            message: "Failed to find All Countries",
            error: error.message,
        };
    }
}


