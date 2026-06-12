/**
 * app.js — Configuración central de la aplicación Express.
 *
 * Aquí se ensambla la app: middlewares globales y montaje de routers.
 * No arranca el servidor (eso lo hace server.js); solo exporta la app
 * configurada para que pueda reutilizarse, por ejemplo en pruebas.
 */
const express = require('express');
const cors = require('cors');

// Routers: cada uno agrupa los endpoints de un recurso del dominio.
const productosRoutes = require('./routes/productos.routes');
const paypalRoutes = require('./routes/paypal.route');
const authRoutes = require('./routes/auth.routes');
const oredenesRoutes = require('./routes/ordenes.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const direccionesRoutes = require('./routes/direcciones.routes');

const app = express();

// Middlewares globales (se ejecutan en cada petición, en orden):
app.use(cors());            // Permite peticiones desde el frontend Angular (otro origen/puerto)
app.use(express.json());    // Parsea el body JSON y lo deja disponible en req.body

// Montaje de routers bajo el prefijo /api. El primer argumento es el prefijo
// de ruta; las rutas internas de cada router se cuelgan de ese prefijo.
app.use('/api', productosRoutes);              // /api/productos (catálogo público)
app.use('/api/paypal', paypalRoutes);          // Crear/capturar órdenes PayPal
app.use('/api/auth/', authRoutes);             // Login, registro, perfil
app.use('/api/ordenes', oredenesRoutes);       // Historial de órdenes + recibo CFDI
app.use('/api/inventario', inventarioRoutes);  // CRUD de productos (solo admin)
app.use('/api/direcciones', direccionesRoutes); // CRUD de direcciones del usuario

module.exports = app;