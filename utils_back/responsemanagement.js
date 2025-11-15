module.exports.sendResponse = async (res, statusCode, msg, data) => {
    try {
        if (!res) {
            return;
        }
        res.status(statusCode);
        return res.json({
            statusCode: statusCode,
            message: msg,
            data,
        });
    } catch (error) {
        if (res) {
            res.status(statusCode);
            return res.json({
                statusCode: statusCode,
                message: msg,
                data,
            });
        }
    }
};