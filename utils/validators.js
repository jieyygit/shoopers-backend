const mongoose = require('mongoose');
const AppError = require('./appError');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const createValidationError = (message) => new AppError(400, message);

const validatePaginationQuery = (query) => {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 10 : Number(query.limit);

    if (!Number.isInteger(page) || page < 1) {
        throw createValidationError('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw createValidationError('Limit must be an integer between 1 and 100');
    }

    return { page, limit };
};

const validateRegisterBody = (body) => {
    const { firstname, lastname, email, username, password, role } = body;

    if (!isNonEmptyString(firstname) || !isNonEmptyString(lastname)) {
        throw createValidationError('Firstname and lastname are required');
    }

    if (!isNonEmptyString(email) || !isEmail(email.trim())) {
        throw createValidationError('A valid email is required');
    }

    if (!isNonEmptyString(username) || username.trim().length < 3) {
        throw createValidationError('Username must be at least 3 characters long');
    }

    if (!isNonEmptyString(password) || password.length < 6) {
        throw createValidationError('Password must be at least 6 characters long');
    }

    if (role && role !== 'user') {
        throw new AppError(403, 'Role cannot be assigned during self-registration');
    }

    return {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password
    };
};

const validateLoginBody = (body) => {
    const { username, password } = body;

    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
        throw createValidationError('Username and password are required');
    }

    return {
        username: username.trim(),
        password
    };
};

const validateApiKeyBody = (body) => {
    const { name } = body;

    if (name !== undefined && !isNonEmptyString(name)) {
        throw createValidationError('API key name must be a non-empty string');
    }

    return name === undefined ? {} : { name: name.trim() };
};

const validateProductBody = (body, { partial = false } = {}) => {
    const payload = {};

    if (!partial || Object.prototype.hasOwnProperty.call(body, 'name')) {
        if (!isNonEmptyString(body.name)) {
            throw createValidationError('Product name is required');
        }
        payload.name = body.name.trim();
    }

    if (!partial || Object.prototype.hasOwnProperty.call(body, 'price')) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) {
            throw createValidationError('Price must be a non-negative number');
        }
        payload.price = price;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'stock')) {
        const stock = Number(body.stock);
        if (!Number.isInteger(stock) || stock < 0) {
            throw createValidationError('Stock must be a non-negative integer');
        }
        payload.stock = stock;
    } else if (!partial) {
        payload.stock = 0;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'category')) {
        if (body.category !== null && body.category !== undefined && !isNonEmptyString(body.category)) {
            throw createValidationError('Category must be a non-empty string');
        }
        payload.category = body.category ? body.category.trim() : '';
    }

    if (Object.keys(payload).length === 0) {
        throw createValidationError('At least one valid product field is required');
    }

    return payload;
};

const validateUserUpdateBody = (body) => {
    const payload = {};

    if (Object.prototype.hasOwnProperty.call(body, 'firstname')) {
        if (!isNonEmptyString(body.firstname)) {
            throw createValidationError('Firstname must be a non-empty string');
        }
        payload.firstname = body.firstname.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, 'lastname')) {
        if (!isNonEmptyString(body.lastname)) {
            throw createValidationError('Lastname must be a non-empty string');
        }
        payload.lastname = body.lastname.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, 'email')) {
        if (!isNonEmptyString(body.email) || !isEmail(body.email.trim())) {
            throw createValidationError('Email must be valid');
        }
        payload.email = body.email.trim().toLowerCase();
    }

    if (Object.prototype.hasOwnProperty.call(body, 'username')) {
        if (!isNonEmptyString(body.username) || body.username.trim().length < 3) {
            throw createValidationError('Username must be at least 3 characters long');
        }
        payload.username = body.username.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
        if (!['user', 'admin'].includes(body.role)) {
            throw createValidationError('Role must be either user or admin');
        }
        payload.role = body.role;
    }

    if (Object.keys(payload).length === 0) {
        throw createValidationError('No valid user fields provided for update');
    }

    return payload;
};

const validateCartBody = (body) => {
    const quantity = body.quantity === undefined ? 1 : Number(body.quantity);

    if (!mongoose.Types.ObjectId.isValid(body.productId)) {
        throw createValidationError('Invalid productId');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw createValidationError('Quantity must be a positive integer');
    }

    return {
        productId: body.productId,
        quantity
    };
};

const validateCheckoutBody = (body) => {
    if (!isNonEmptyString(body.shippingAddress)) {
        throw createValidationError('Shipping address is required');
    }

    return {
        shippingAddress: body.shippingAddress.trim()
    };
};

const validateOrderStatusBody = (body) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!statuses.includes(body.status)) {
        throw createValidationError('Invalid order status');
    }

    return { status: body.status };
};

const validatePaymentBody = (body) => {
    const methods = ['card', 'gcash', 'bank_transfer', 'cod'];
    const method = typeof body.method === 'string' ? body.method.trim().toLowerCase() : '';

    if (!mongoose.Types.ObjectId.isValid(body.orderId)) {
        throw createValidationError('Invalid orderId');
    }

    if (!methods.includes(method)) {
        throw createValidationError('Invalid payment method');
    }

    return {
        orderId: body.orderId,
        method
    };
};

const validateObjectId = (value, fieldName) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw createValidationError(`Invalid ${fieldName}`);
    }

    return value;
};

module.exports = {
    validateApiKeyBody,
    validateCartBody,
    validateCheckoutBody,
    validateLoginBody,
    validateObjectId,
    validateOrderStatusBody,
    validatePaginationQuery,
    validatePaymentBody,
    validateProductBody,
    validateRegisterBody,
    validateUserUpdateBody
};
