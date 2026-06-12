/**
 * paypal.route.js — Pago con PayPal (prefijo /api/paypal).
 * Ambas rutas exigen sesión: la orden se asocia al usuario del token.
 */
const express = require('express');
const router = express.Router();
const { createOrder, captureOrder } = require('../controllers/paypal.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Protegemos ambas rutas inyectando el middleware "verificarToken"
router.post('/crear-orden', verificarToken, createOrder);       // Paso 1: crear orden
router.post('/capturar-orden', verificarToken, captureOrder);   // Paso 2: capturar cobro
module.exports = router;