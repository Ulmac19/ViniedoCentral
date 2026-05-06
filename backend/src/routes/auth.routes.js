const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Estas son las rutas que tu servicio de Angular está buscando
router.post('/registro', authController.registrarUsuario);
router.post('/login', authController.iniciarSesion);

module.exports = router;