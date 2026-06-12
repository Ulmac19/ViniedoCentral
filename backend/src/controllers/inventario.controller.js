/**
 * inventario.controller.js — Gestión de productos (panel de administración).
 *
 * Todas estas rutas pasan por verificarToken + adminMiddleware, así que solo un
 * administrador llega aquí. A diferencia del catálogo público, lista también los
 * productos inactivos. El "borrado" es un soft delete (activo = 0).
 */
const db = require('../config/db');

const getProductos = async (req, res) => { // Trae el listado completo de productos, sin filtros. Solo para uso administrativo.
    try {
        const [rows] = await db.promise().query('SELECT * FROM productos');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos', detalle: err.message });
    }
};

const crearProducto = async (req, res) => {
    try {
        const { sku, nombre, categoria, descripcion, imagen_url, volumen_ml, graduacion_alcoholica, precio_neto, stock, umbral_alerta } = req.body;
        if (!sku || !nombre || !categoria || !precio_neto) {
            return res.status(400).json({ error: 'sku, nombre, categoria y precio_neto son obligatorios' });
        }
        const [result] = await db.promise().query(
            `INSERT INTO productos (sku, nombre, categoria, descripcion, imagen_url, volumen_ml, graduacion_alcoholica, precio_neto, stock, umbral_alerta)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sku, nombre, categoria, descripcion || null, imagen_url || '', volumen_ml || 0, graduacion_alcoholica || 0, precio_neto, stock || 0, umbral_alerta || 5]
        );
        res.status(201).json({ mensaje: 'Producto creado', id_producto: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear producto', detalle: err.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, nombre, categoria, descripcion, imagen_url, volumen_ml, graduacion_alcoholica, precio_neto, stock, umbral_alerta } = req.body;
        if (!sku || !nombre || !categoria || !precio_neto) {
            return res.status(400).json({ error: 'sku, nombre, categoria y precio_neto son obligatorios' });
        }
        await db.promise().query(
            `UPDATE productos SET sku=?, nombre=?, categoria=?, descripcion=?, imagen_url=?,
             volumen_ml=?, graduacion_alcoholica=?, precio_neto=?, stock=?, umbral_alerta=?
             WHERE id_producto = ?`,
            [sku, nombre, categoria, descripcion || null, imagen_url || '', volumen_ml || 0, graduacion_alcoholica || 0, precio_neto, stock || 0, umbral_alerta || 5, id]
        );
        res.json({ mensaje: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar producto', detalle: err.message });
    }
};

// Soft delete: no borra la fila, solo marca activo = 0 para conservar el
// historial (órdenes que referencian el producto siguen siendo válidas).
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await db.promise().query('UPDATE productos SET activo = 0 WHERE id_producto = ?', [id]);
        res.json({ mensaje: 'Producto desactivado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar producto', detalle: err.message });
    }
};

const toggleActivo = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        await db.promise().query('UPDATE productos SET activo = ? WHERE id_producto = ?', [activo ? 1 : 0, id]);
        res.json({ mensaje: activo ? 'Producto activado' : 'Producto desactivado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al cambiar estado del producto', detalle: err.message });
    }
};

module.exports = { getProductos, crearProducto, actualizarProducto, eliminarProducto, toggleActivo };
