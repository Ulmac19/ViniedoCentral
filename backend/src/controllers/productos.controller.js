/**
 * productos.controller.js — Catálogo público de productos.
 *
 * Expone únicamente la lectura del catálogo para clientes. La gestión
 * (crear/editar/eliminar) vive en inventario.controller.js y está restringida
 * a administradores.
 */
const db = require('../config/db');

/**
 * GET /api/productos
 * Devuelve solo los productos activos (activo = 1); los desactivados por el
 * admin (soft delete) quedan ocultos al cliente.
 */
const getProductos = (req, res) =>{
    const sql = 'SELECT * FROM productos WHERE activo = 1';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        res.json(results);
    });
}

module.exports = {
    getProductos
};