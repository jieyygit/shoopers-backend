const validateBody = (validator) => (req, res, next) => {
    try {
        req.body = validator(req.body || {});
        next();
    } catch (err) {
        next(err);
    }
};

const validateQuery = (validator) => (req, res, next) => {
    try {
        req.validatedQuery = validator(req.query || {});
        next();
    } catch (err) {
        next(err);
    }
};

const validateParam = (paramName, validator) => (req, res, next) => {
    try {
        req.params[paramName] = validator(req.params[paramName], paramName);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { validateBody, validateParam, validateQuery };
