/**
 * inventario.routes.js — CRUD de productos para admin (prefijo /api/inventario).
 *
 * Cada ruta encadena dos middlewares antes del controlador:
 *   verificarToken  → exige un JWT válido y carga req.usuario.
 *   adminMiddleware → exige que ese usuario tenga rol 'administrador'.
 */
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { adminMiddleware } = require('../middlewares/admin.middleware');
const { getProductos, crearProducto, actualizarProducto, eliminarProducto, toggleActivo } = require('../controllers/inventario.controller');

router.get('/', verificarToken, adminMiddleware, getProductos);              // Listar todos (incl. inactivos)
router.post('/', verificarToken, adminMiddleware, crearProducto);            // Crear producto
router.put('/:id', verificarToken, adminMiddleware, actualizarProducto);     // Editar producto
router.delete('/:id', verificarToken, adminMiddleware, eliminarProducto);    // Soft delete (activo = 0)
router.put('/:id/activo', verificarToken, adminMiddleware, toggleActivo);    // Activar/desactivar

module.exports = router;
