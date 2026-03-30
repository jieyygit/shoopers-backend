require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('./connection');
const verifyApiKey = require('./middleware/apiKey');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const swaggerSpec = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', verifyApiKey, authRoutes);
app.use('/products', verifyApiKey, productRoutes);
app.use('/users', verifyApiKey, userRoutes);
app.use('/cart', verifyApiKey, cartRoutes);
app.use('/orders', verifyApiKey, orderRoutes);
app.use('/payments', verifyApiKey, paymentRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
