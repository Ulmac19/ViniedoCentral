const db = require('../config/db');

// Obtener la lista general de pedidos del usuario logueado
const getMisPedidos = async (req, res) => {
    try {
        const idUsuario = req.usuario.id; // Este ID viene seguro desde el token
        
        const [ordenes] = await db.promise().query(
            `SELECT id_orden, folio, estado, total, fecha_creacion 
             FROM ordenes 
             WHERE id_usuario = ? 
             ORDER BY fecha_creacion DESC`,
            [idUsuario]
        );
        
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener el historial de pedidos.' });
    }
};

// Obtener el detalle de un pedido en específico (las botellas que compró)
const getDetallePedido = async (req, res) => {
    try {
        const idOrden = req.params.id;
        const idUsuario = req.usuario.id;

        // Doble validación de seguridad: Que la orden exista Y le pertenezca a este usuario
        const [orden] = await db.promise().query(
            'SELECT * FROM ordenes WHERE id_orden = ? AND id_usuario = ?',
            [idOrden, idUsuario]
        );

        if (orden.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado o acceso no autorizado.' });
        }

        // Si pasó la validación, traemos los productos de esa orden
        const [detalles] = await db.promise().query(
            'SELECT nombre_producto, cantidad, precio_unitario, subtotal_linea FROM orden_detalle WHERE id_orden = ?',
            [idOrden]
        );

        res.status(200).json({
            orden: orden[0],
            productos: detalles
        });
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).json({ error: 'Error al obtener el detalle del pedido.' });
    }
};

module.exports = {
    getMisPedidos,
    getDetallePedido
};