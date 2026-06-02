const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_vitisbyte_2026';

/**
 * REGISTRO (Nuevo usuario)
 */
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const [existingUser] = await db.promise().query(
            'SELECT id_usuario FROM usuarios WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

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

        const [users] = await db.promise().query(
            'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
            [email]
        );
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = users[0];

        const match = await bcrypt.compare(password, usuario.password_hash); // Compara la contraseña ingresada con el hash almacenado
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Si las credenciales son válidas, se genera un token JWT con el ID y rol del usuario
        const payload = {
            id: usuario.id_usuario,
            rol: usuario.rol
        };

        // Generar token JWT con los datos del usuario (en payload) y la firma con una expiración de 8 horas
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            token,
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

const obtenerPerfil = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE id_usuario = ?',
            [req.usuario.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado.' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre?.trim() || !email?.trim()) {
            return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
        }
        const [existing] = await db.promise().query(
            'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
            [email.trim(), req.usuario.id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado por otro usuario.' });
        }
        if (password) {
            const passwordHash = await bcrypt.hash(password, 12);
            await db.promise().query(
                'UPDATE usuarios SET nombre = ?, email = ?, password_hash = ? WHERE id_usuario = ?',
                [nombre.trim(), email.trim(), passwordHash, req.usuario.id]
            );
        } else {
            await db.promise().query(
                'UPDATE usuarios SET nombre = ?, email = ? WHERE id_usuario = ?',
                [nombre.trim(), email.trim(), req.usuario.id]
            );
        }
        res.json({ mensaje: 'Perfil actualizado correctamente.', nombre: nombre.trim(), email: email.trim() });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const eliminarCuenta = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Se requiere la contraseña para confirmar.' });
        }
        const [users] = await db.promise().query(
            'SELECT password_hash FROM usuarios WHERE id_usuario = ?',
            [req.usuario.id]
        );
        if (!users.length) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const match = await bcrypt.compare(password, users[0].password_hash);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta.' });

        await db.promise().query('DELETE FROM usuarios WHERE id_usuario = ?', [req.usuario.id]);
        res.json({ mensaje: 'Cuenta eliminada correctamente.' });
    } catch (error) {
        console.error('Error eliminando cuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { registrarUsuario, iniciarSesion, obtenerPerfil, actualizarPerfil, eliminarCuenta };
