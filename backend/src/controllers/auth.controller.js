const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); 

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_vitisbyte_2026';

/**
 * SIGNIN (Registro de nuevo usuario)
 */
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        
        const [existingUser] = await db.promise().query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        const saltRounds = 12; 
        const passwordHash = await bcrypt.hash(password, saltRounds);

        
        const [result] = await db.promise().query(
            'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, 'cliente']
        );

        res.status(201).json({ 
            mensaje: 'Usuario creado exitosamente',
            usuarioId: result.insertId 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * LOGIN (Inicio de sesión)
 */
const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const [users] = await db.promise().query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = users[0];

        const match = await bcrypt.compare(password, usuario.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const payload = {
            id: usuario.id_usuario,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, JWT_SECRET, { 
            expiresIn: '8h' 
        });

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion
};