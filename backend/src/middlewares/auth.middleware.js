const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_vitisbyte_2026';

const verificarToken = (req, res, next) => {
    // El cliente debe enviar el token en el header: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Descarta el prefijo "Bearer"

    // Sin token → la petición no tiene credenciales (no está logueado)
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    try {
        // jwt.verify lanza excepción si la firma no coincide o el token expiró (TTL: 8h)
        const decodificado = jwt.verify(token, JWT_SECRET);

        // Adjuntamos el payload al objeto request para que los controladores
        // puedan acceder a req.usuario.id sin necesidad de otra consulta a la DB
        req.usuario = decodificado; // compatibilidad con controladores existentes
        req.user = decodificado;    // requerido por adminMiddleware
        next(); // Token válido → pasa al siguiente handler
    } catch (error) {
        // TokenExpiredError o JsonWebTokenError → token inválido o vencido
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };