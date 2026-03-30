const ApiKey = require('../models/ApiKeyModel');

const verifyApiKey = async (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) return res.status(401).json({ message: 'No Api key provided' });

    const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });
    if (!validKey) return res.status(403).json({ message: 'Invalid Api key' });
    
    next();
};

module.exports = verifyApiKey;