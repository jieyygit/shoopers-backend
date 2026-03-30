const ApiKey = require('../models/ApiKeyModel');
const AppError = require('../utils/appError');

const verifyApiKey = async (req, res, next) => {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) {
            throw new AppError(401, 'No API key provided');
        }

        const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });
        if (!validKey) {
            throw new AppError(403, 'Invalid API key');
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = verifyApiKey;
