const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String},
    isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false 
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);