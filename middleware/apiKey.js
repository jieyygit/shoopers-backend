const ApiKey = require('../models/ApiKeyModel');

const verifyApiKey = async (req, res, next) => {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) return res.status(401).json({ message: 'No API key provided' });

        const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });
        if (!validKey) return res.status(403).json({ message: 'Invalid API key' });

        next();
    } catch (err) {
        res.status(500).json({ message: `API key validation failed: ${err.message}` });
    }
};

module.exports = verifyApiKey;
