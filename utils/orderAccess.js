const AppError = require('./appError');

const assertOrderAccess = (user, order) => {
    if (!order) {
        throw new AppError(404, 'Order not found');
    }

    if (user.role === 'admin') {
        return;
    }

    if (order.userId.toString() !== user.id) {
        throw new AppError(403, 'Not allowed to access this order');
    }
};

module.exports = { assertOrderAccess };
