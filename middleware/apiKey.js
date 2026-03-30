const verifyApiKey = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) return res.status(401).json({ message: 'No Api key provided' });
    
    if (apiKey !== process.env.API_KEY) return res.status(403).json({ message: 'Invalid Api key' });
    
    next();
};

module.exports = verifyApiKey;