const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express Backend API',
            version: '1.0.0',
            description: 'Swagger documentation for the Express e-commerce backend.'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'Admin user management endpoints' },
            { name: 'Products', description: 'Product catalog and admin product management' },
            { name: 'Cart', description: 'Logged in user cart operations' },
            { name: 'Orders', description: 'Checkout and order management' },
            { name: 'Payments', description: 'Payment processing and payment history' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key'
                }
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Invalid or expired token' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['firstname', 'lastname', 'email', 'username', 'password'],
                    properties: {
                        firstname: { type: 'string', example: 'Juan' },
                        lastname: { type: 'string', example: 'Dela Cruz' },
                        email: { type: 'string', format: 'email', example: 'juan@example.com' },
                        username: { type: 'string', example: 'juan123' },
                        password: { type: 'string', format: 'password', example: 'secret123' },
                        role: { type: 'string', example: 'user', description: 'Self-registration only allows user role.' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'juan123' },
                        password: { type: 'string', format: 'password', example: 'secret123' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '661f7c4622f1b0db6bd72010' },
                        firstname: { type: 'string', example: 'Juan' },
                        lastname: { type: 'string', example: 'Dela Cruz' },
                        username: { type: 'string', example: 'juan123' },
                        email: { type: 'string', format: 'email', example: 'juan@example.com' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '661f7e5e22f1b0db6bd72022' },
                        name: { type: 'string', example: 'Mechanical Keyboard' },
                        price: { type: 'number', example: 2499 },
                        stock: { type: 'integer', example: 12 },
                        category: { type: 'string', example: 'Accessories' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'price'],
                    properties: {
                        name: { type: 'string', example: 'Mechanical Keyboard' },
                        price: { type: 'number', example: 2499 },
                        stock: { type: 'integer', example: 12 },
                        category: { type: 'string', example: 'Accessories' }
                    }
                },
                CartItemInput: {
                    type: 'object',
                    required: ['productId'],
                    properties: {
                        productId: { type: 'string', example: '661f7e5e22f1b0db6bd72022' },
                        quantity: { type: 'integer', example: 2, default: 1 }
                    }
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        productId: {
                            oneOf: [
                                { type: 'string', example: '661f7e5e22f1b0db6bd72022' },
                                { $ref: '#/components/schemas/Product' }
                            ]
                        },
                        quantity: { type: 'integer', example: 2 }
                    }
                },
                Cart: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '661f81d022f1b0db6bd72040' },
                        userId: { type: 'string', example: '661f7c4622f1b0db6bd72010' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CartItem' }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                OrderItem: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', example: '661f7e5e22f1b0db6bd72022' },
                        productName: { type: 'string', example: 'Mechanical Keyboard' },
                        quantity: { type: 'integer', example: 2 },
                        price: { type: 'number', example: 2499 }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '661f842522f1b0db6bd72055' },
                        userId: { type: 'string', example: '661f7c4622f1b0db6bd72010' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/OrderItem' }
                        },
                        totalAmount: { type: 'number', example: 4998 },
                        shippingAddress: { type: 'string', example: '123 Sample Street, Manila' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                            example: 'pending'
                        },
                        paymentStatus: {
                            type: 'string',
                            enum: ['pending', 'paid', 'failed', 'refunded'],
                            example: 'pending'
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CheckoutRequest: {
                    type: 'object',
                    required: ['shippingAddress'],
                    properties: {
                        shippingAddress: { type: 'string', example: '123 Sample Street, Manila' }
                    }
                },
                OrderStatusUpdateRequest: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                            example: 'processing'
                        }
                    }
                },
                Payment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '661f858e22f1b0db6bd72061' },
                        orderId: { type: 'string', example: '661f842522f1b0db6bd72055' },
                        userId: { type: 'string', example: '661f7c4622f1b0db6bd72010' },
                        method: {
                            type: 'string',
                            enum: ['card', 'gcash', 'bank_transfer', 'cod'],
                            example: 'gcash'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'paid', 'failed', 'refunded'],
                            example: 'paid'
                        },
                        amount: { type: 'number', example: 4998 },
                        transactionId: { type: 'string', example: 'TXN-1711800000000-ABCD1234' },
                        paidAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                PaymentProcessRequest: {
                    type: 'object',
                    required: ['orderId', 'method'],
                    properties: {
                        orderId: { type: 'string', example: '661f842522f1b0db6bd72055' },
                        method: {
                            type: 'string',
                            enum: ['card', 'gcash', 'bank_transfer', 'cod'],
                            example: 'gcash'
                        }
                    }
                },
                PaginationUsers: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', example: 2 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        users: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' }
                        }
                    }
                },
                PaginationOrders: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', example: 4 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        orders: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Order' }
                        }
                    }
                }
            }
        },
        security: [
            { apiKeyAuth: [] }
        ],
        paths: {
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Register a new user account',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RegisterRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'User registered successfully' },
                        400: {
                            description: 'Invalid registration payload',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login using username and password',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/LoginResponse' }
                                }
                            }
                        },
                        401: { description: 'Wrong password' },
                        404: { description: 'User not found' }
                    }
                }
            },
            '/auth/generate-key': {
                post: {
                    tags: ['Auth'],
                    summary: 'Generate a new API key',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Frontend App Key' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'API key generated' },
                        403: { description: 'Admin access only' }
                    }
                }
            },
            '/users': {
                get: {
                    tags: ['Users'],
                    summary: 'Get paginated users',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }
                    ],
                    responses: {
                        200: {
                            description: 'Users fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/PaginationUsers' }
                                }
                            }
                        },
                        403: { description: 'Admin access only' }
                    }
                }
            },
            '/users/{id}': {
                get: {
                    tags: ['Users'],
                    summary: 'Get a single user by ID',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: {
                            description: 'User fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/User' }
                                }
                            }
                        },
                        404: { description: 'User not found' }
                    }
                },
                put: {
                    tags: ['Users'],
                    summary: 'Update a user by ID',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        firstname: { type: 'string' },
                                        lastname: { type: 'string' },
                                        email: { type: 'string', format: 'email' },
                                        username: { type: 'string' },
                                        role: { type: 'string', enum: ['user', 'admin'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'User updated' },
                        404: { description: 'User not found' }
                    }
                },
                delete: {
                    tags: ['Users'],
                    summary: 'Delete a user by ID',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'User deleted' },
                        404: { description: 'User not found' }
                    }
                }
            },
            '/products': {
                get: {
                    tags: ['Products'],
                    summary: 'Get all active products',
                    responses: {
                        200: {
                            description: 'Products fetched successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Product' }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ['Products'],
                    summary: 'Create a product',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductInput' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Product created' },
                        403: { description: 'Admin access only' }
                    }
                }
            },
            '/products/{id}': {
                get: {
                    tags: ['Products'],
                    summary: 'Get a single active product',
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: {
                            description: 'Product fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Product' }
                                }
                            }
                        },
                        404: { description: 'Product not found' }
                    }
                },
                put: {
                    tags: ['Products'],
                    summary: 'Update a product',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductInput' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Product updated' },
                        404: { description: 'Product not found' }
                    }
                },
                delete: {
                    tags: ['Products'],
                    summary: 'Archive a product',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Product archived' },
                        404: { description: 'Product not found' }
                    }
                }
            },
            '/cart': {
                get: {
                    tags: ['Cart'],
                    summary: 'Get the current user cart',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    responses: {
                        200: {
                            description: 'Cart fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Cart' }
                                }
                            }
                        },
                        404: { description: 'Cart not found' }
                    }
                },
                post: {
                    tags: ['Cart'],
                    summary: 'Add an item to the cart',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CartItemInput' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Cart updated' },
                        400: { description: 'Invalid product or quantity' },
                        404: { description: 'Product not found or inactive' }
                    }
                },
                delete: {
                    tags: ['Cart'],
                    summary: 'Clear the current user cart',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    responses: {
                        200: { description: 'Cart cleared' }
                    }
                }
            },
            '/cart/{productId}': {
                delete: {
                    tags: ['Cart'],
                    summary: 'Remove a specific item from the cart',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'productId', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Item removed' },
                        400: { description: 'Invalid productId' },
                        404: { description: 'Cart not found' }
                    }
                }
            },
            '/orders': {
                get: {
                    tags: ['Orders'],
                    summary: 'Get all orders',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }
                    ],
                    responses: {
                        200: {
                            description: 'Orders fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/PaginationOrders' }
                                }
                            }
                        },
                        403: { description: 'Admin access only' }
                    }
                },
                post: {
                    tags: ['Orders'],
                    summary: 'Checkout the current user cart',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CheckoutRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Order placed successfully' },
                        400: { description: 'Cart is empty or shipping address is missing' }
                    }
                }
            },
            '/orders/my': {
                get: {
                    tags: ['Orders'],
                    summary: 'Get orders of the logged in user',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    responses: {
                        200: {
                            description: 'Orders fetched successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Order' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/orders/{id}': {
                get: {
                    tags: ['Orders'],
                    summary: 'Get a single order by ID',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: {
                            description: 'Order fetched successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Order' }
                                }
                            }
                        },
                        404: { description: 'Order not found' }
                    }
                }
            },
            '/orders/{id}/status': {
                put: {
                    tags: ['Orders'],
                    summary: 'Update order status',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrderStatusUpdateRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Order status updated' },
                        404: { description: 'Order not found' }
                    }
                }
            },
            '/payments/my': {
                get: {
                    tags: ['Payments'],
                    summary: 'Get payments of the logged in user',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    responses: {
                        200: {
                            description: 'Payments fetched successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Payment' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/payments': {
                get: {
                    tags: ['Payments'],
                    summary: 'Get all payments',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    responses: {
                        200: {
                            description: 'Payments fetched successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Payment' }
                                    }
                                }
                            }
                        },
                        403: { description: 'Admin access only' }
                    }
                }
            },
            '/payments/process': {
                post: {
                    tags: ['Payments'],
                    summary: 'Process payment for an order',
                    security: [
                        { apiKeyAuth: [] },
                        { bearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PaymentProcessRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Payment successful' },
                        400: { description: 'orderId and method are required or order is already paid' },
                        403: { description: 'Not allowed to pay for this order' },
                        404: { description: 'Order not found' }
                    }
                }
            }
        }
    },
    apis: []
};

module.exports = swaggerJsdoc(options);
