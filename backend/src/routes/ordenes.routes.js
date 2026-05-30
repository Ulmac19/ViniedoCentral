const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Protegemos ambas rutas inyectando el middleware "verificarToken"
router.get('/mis-pedidos', verificarToken, ordenesController.getMisPedidos);
router.get('/mis-pedidos/:id', verificarToken, ordenesController.getDetallePedido);
router.post('/enviar-recibo', verificarToken, ordenesController.enviarRecibo);

module.exports = router;