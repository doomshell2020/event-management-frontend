import { Transaction, User } from "../../../../database/models"
import { StatusCodes } from 'http-status-codes';
import responseManagement from "../../../../utils_back/responsemanagement"
const { NotFoundError, BadRequestError } = require('../../../../utils_back/api-errors');


// Transaction View
export async function View_Transaction(req) {
    const viewtransactions = await Transaction.findAll({
        order: [["id", "DESC"]],
        include: { model: User }
    });
    return {
        statusCode: 200,
        success: true,
        message: 'View Transaction detail Successfully!',
        viewtransactions
    };
}



// Search Transaction
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
export async function Search_Transactions({ UserID, ID }) {
    // const { Name } = req.body; // Assuming the search query parameter is "Name"
    try {
        let newobject = {};
        if (UserID) {
            newobject.UserID = { [Op.like]: `%${UserID}%` }
        }
        if (ID) {
            newobject.ID = { [Op.like]: `%${ID}%` }
        }
        const searchResults = await Transaction.findAll({
            where: newobject,
            include: { model: User }
        });
        return {
            statusCode: 200,
            success: true,
            message: 'Search Transactions Successfully!',
            searchResults
        };
    } catch (error) {
        console.log("error")
        //   res.status(500).json({ error: 'Internal Server Error' });

    }
}
