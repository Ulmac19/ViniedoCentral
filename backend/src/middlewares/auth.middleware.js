const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_vitisbyte_2026';

// Middleware para verificar el token JWT en las rutas protegidas
const verificarToken = (req, res, next) => {
    // El token se espera en el header "Authorization" con el formato "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Descarta el prefijo "Bearer" para obtener solo el token

    // Sin token → la petición no tiene credenciales (no está logueado)
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    // Verificamos la validez del token (firma y expiración)
    try {
        //Nadie alteró el token, no ha expirado y usó la misma clave (JWT_SECRET) → decodificamos el payload (datos del usuario)
        const decodificado = jwt.verify(token, JWT_SECRET);

        req.usuario = decodificado; //Agrega los datos del usuario (id y rol) decodificado al objeto req para que esté disponible en los siguientes handlers
        req.user = decodificado;    
        next(); // Token válido → pasa al siguiente handler
    } catch (error) {
        // TokenExpiredError o JsonWebTokenError → token inválido o vencido
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };