const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }
    if (req.user.rol !== 'administrador') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo administradores.' });
    }
    next();
};

module.exports = { adminMiddleware };
