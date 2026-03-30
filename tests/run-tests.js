const assert = require('node:assert/strict');

const { errorHandler } = require('../middleware/errorHandler');
const { assertOrderAccess } = require('../utils/orderAccess');
const pickAllowedFields = require('../utils/pickAllowedFields');
const {
    validateProductBody,
    validateRegisterBody,
    validateUserUpdateBody
} = require('../utils/validators');

const tests = [];

const addTest = (name, fn) => {
    tests.push({ name, fn });
};

const createMockRes = () => ({
    statusCode: null,
    payload: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.payload = body;
        return this;
    }
});

addTest('validateRegisterBody trims and normalizes valid input', () => {
    const result = validateRegisterBody({
        firstname: ' Juan ',
        lastname: ' Dela Cruz ',
        email: ' USER@Example.com ',
        username: ' juan123 ',
        password: 'secret123'
    });

    assert.deepEqual(result, {
        firstname: 'Juan',
        lastname: 'Dela Cruz',
        email: 'user@example.com',
        username: 'juan123',
        password: 'secret123'
    });
});

addTest('validateUserUpdateBody rejects empty updates', () => {
    assert.throws(
        () => validateUserUpdateBody({}),
        /No valid user fields provided for update/
    );
});

addTest('validateProductBody supports partial updates', () => {
    const result = validateProductBody({ price: '199.5', stock: '4' }, { partial: true });

    assert.deepEqual(result, {
        price: 199.5,
        stock: 4
    });
});

addTest('pickAllowedFields only keeps allowed keys', () => {
    const result = pickAllowedFields(
        { firstname: 'Juan', role: 'admin', password: 'secret' },
        ['firstname', 'role']
    );

    assert.deepEqual(result, {
        firstname: 'Juan',
        role: 'admin'
    });
});

addTest('assertOrderAccess allows admin access', () => {
    assert.doesNotThrow(() => {
        assertOrderAccess(
            { id: 'user-1', role: 'admin' },
            { userId: { toString: () => 'user-2' } }
        );
    });
});

addTest('assertOrderAccess rejects non-owner user', () => {
    assert.throws(
        () => {
            assertOrderAccess(
                { id: 'user-1', role: 'user' },
                { userId: { toString: () => 'user-2' } }
            );
        },
        /Not allowed to access this order/
    );
});

addTest('errorHandler maps duplicate key errors to a readable message', () => {
    const res = createMockRes();

    errorHandler(
        { code: 11000, keyValue: { email: 'taken@example.com' } },
        {},
        res,
        () => {}
    );

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, { message: 'email already exists' });
});

addTest('errorHandler preserves explicit statusCode values', () => {
    const res = createMockRes();

    errorHandler(
        { statusCode: 403, message: 'Admin access only' },
        {},
        res,
        () => {}
    );

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.payload, { message: 'Admin access only' });
});

let failed = 0;

for (const { name, fn } of tests) {
    try {
        fn();
        console.log(`PASS ${name}`);
    } catch (err) {
        failed += 1;
        console.error(`FAIL ${name}`);
        console.error(err.stack);
    }
}

if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
}

console.log(`\n${tests.length} test(s) passed.`);
