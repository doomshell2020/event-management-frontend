import { UserInterest } from "../../../database/models"

// Transaction View
export async function View_Interest(req) {
    const data = await UserInterest.findAll({ });
    return {
        statusCode: 200,
        success: true,
        message: 'View User Interest Successfully!',
        data
    };
}

