const adminMiddleware = (req, res, next) => { // Verifica que el usuario esté autenticado y tenga rol de administrador
    if (!req.user) { //SI no hay usuario en el request, significa que no pasó el middleware de autenticación o no se proporcionó un token válido
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }
    if (req.user.rol !== 'administrador') {// Si el rol del usuario no es "administrador", denegamos el acceso
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo administradores.' });
    }
    next();// Si pasó ambas validaciones, continúa al siguiente handler
};

module.exports = { adminMiddleware };
