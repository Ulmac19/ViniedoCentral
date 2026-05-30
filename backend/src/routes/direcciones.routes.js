const express = require('express');
const router = express.Router();
const { getDirecciones, crearDireccion, actualizarDireccion, eliminarDireccion } = require('../controllers/direcciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',     verificarToken, getDirecciones);
router.post('/',    verificarToken, crearDireccion);
router.put('/:id',  verificarToken, actualizarDireccion);
router.delete('/:id', verificarToken, eliminarDireccion);

module.exports = router;
