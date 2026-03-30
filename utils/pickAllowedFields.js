const pickAllowedFields = (source, allowedFields) => {
    const picked = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(source, field)) {
            picked[field] = source[field];
        }
    }

    return picked;
};

module.exports = pickAllowedFields;
