/**
 * direcciones.routes.js — CRUD de direcciones del usuario (prefijo /api/direcciones).
 * Todas requieren sesión; el controlador acota cada operación a req.usuario.id.
 */
const express = require('express');
const router = express.Router();
const { getDirecciones, crearDireccion, actualizarDireccion, eliminarDireccion } = require('../controllers/direcciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',     verificarToken, getDirecciones);       // Listar direcciones
router.post('/',    verificarToken, crearDireccion);       // Crear (máx. 4)
router.put('/:id',  verificarToken, actualizarDireccion);  // Editar
router.delete('/:id', verificarToken, eliminarDireccion);  // Eliminar

module.exports = router;
