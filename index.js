require('dotenv').config();
const express = require('express');
require('./connection');
const verifyApiKey = require('./middleware/apiKey');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth/register', authRoutes);
app.use('/auth/login', authRoutes);
app.use('/auth', verifyApiKey, authRoutes);
app.use('/products', verifyApiKey, productRoutes);
app.use('/users', verifyApiKey, userRoutes);
app.use('/cart', verifyApiKey, cartRoutes);
app.use('/orders', verifyApiKey, orderRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});