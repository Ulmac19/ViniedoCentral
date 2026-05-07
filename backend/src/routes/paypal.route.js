const express = require('express');
const router = express.Router();
const { createOrder, captureOrder } = require('../controllers/paypal.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
// Protegemos ambas rutas inyectando el middleware "verificarToken"
router.post('/crear-orden', verificarToken, createOrder);
router.post('/capturar-orden', verificarToken, captureOrder);
module.exports = router;