/**
 * server.js — Punto de entrada del backend.
 *
 * Carga las variables de entorno (.env), obtiene la app ya configurada
 * desde app.js y la pone a escuchar en el puerto indicado por PORT.
 */
require('dotenv').config(); // Debe ir primero: el resto de módulos depende de process.env
const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});