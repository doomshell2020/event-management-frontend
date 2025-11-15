// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';

const generateJWT = async ({ secretKey, payload, signOption }) => {
    const token = `Bearer ${jwt.sign(payload, secretKey, signOption)}`;
    return token;
};
module.exports = {
    generateJWT,

};
