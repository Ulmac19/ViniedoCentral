/**
 * productos.routes.js — Ruta pública del catálogo (prefijo /api).
 * No requiere autenticación: cualquier visitante puede ver los productos.
 */
const express = require('express');
const router = express.Router();
const { getProductos } = require('../controllers/productos.controller');

router.get('/productos', getProductos); // GET /api/productos

module.exports = router;