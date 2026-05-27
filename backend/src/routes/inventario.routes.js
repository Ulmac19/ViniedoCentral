const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { adminMiddleware } = require('../middlewares/admin.middleware');
const { getProductos, crearProducto, actualizarProducto, eliminarProducto, toggleActivo } = require('../controllers/inventario.controller');

router.get('/', verificarToken, adminMiddleware, getProductos);
router.post('/', verificarToken, adminMiddleware, crearProducto);
router.put('/:id', verificarToken, adminMiddleware, actualizarProducto);
router.delete('/:id', verificarToken, adminMiddleware, eliminarProducto);
router.put('/:id/activo', verificarToken, adminMiddleware, toggleActivo);

module.exports = router;
