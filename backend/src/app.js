const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const paypalRoutes = require('./routes/paypal.route');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', productosRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/auth/', authRoutes);
module.exports = app;