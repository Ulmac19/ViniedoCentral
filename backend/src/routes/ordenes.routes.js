/**
 * ordenes.routes.js — Historial de pedidos y recibo CFDI (prefijo /api/ordenes).
 * Todas requieren sesión: el controlador usa req.usuario.id para devolver solo
 * las órdenes del usuario autenticado.
 */
const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Protegemos todas las rutas inyectando el middleware "verificarToken"
router.get('/mis-pedidos', verificarToken, ordenesController.getMisPedidos);          // Lista de órdenes
router.get('/mis-pedidos/:id', verificarToken, ordenesController.getDetallePedido);   // Detalle de una orden
router.post('/enviar-recibo', verificarToken, ordenesController.enviarRecibo);        // Enviar CFDI por correo

module.exports = router;