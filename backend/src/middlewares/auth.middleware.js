const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_vitisbyte_2026';

const verificarToken = (req, res, next) => {
    // El token suele enviarse en los headers como "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    try {
        // Si el token es válido, extraemos los datos del usuario (id y rol)
        const decodificado = jwt.verify(token, JWT_SECRET);
        req.usuario = decodificado; 
        next(); // Lo dejamos pasar al controlador
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };