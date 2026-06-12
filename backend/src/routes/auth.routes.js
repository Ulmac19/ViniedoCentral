/**
 * auth.routes.js — Rutas de autenticación (prefijo /api/auth).
 *
 * /registro y /login son públicas; el resto exige un JWT válido, por eso
 * pasan por el middleware verificarToken antes de llegar al controlador.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/registro', authController.registrarUsuario);   // Crear cuenta (público)
router.post('/login', authController.iniciarSesion);          // Iniciar sesión (público)
router.get('/perfil', verificarToken, authController.obtenerPerfil);     // Ver perfil
router.put('/perfil', verificarToken, authController.actualizarPerfil);  // Editar perfil
router.delete('/cuenta', verificarToken, authController.eliminarCuenta); // Eliminar cuenta

module.exports = router;