const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/registro', authController.registrarUsuario);
router.post('/login', authController.iniciarSesion);
router.get('/perfil', verificarToken, authController.obtenerPerfil);
router.put('/perfil', verificarToken, authController.actualizarPerfil);
router.delete('/cuenta', verificarToken, authController.eliminarCuenta);

module.exports = router;