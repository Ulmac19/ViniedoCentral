/**
 * ordenes.controller.js — Historial de pedidos y envío del recibo CFDI.
 *
 * Cubre tres acciones del cliente autenticado:
 *   - getMisPedidos     → lista resumida de sus órdenes.
 *   - getDetallePedido  → detalle (líneas) de una orden suya.
 *   - enviarRecibo      → genera el CFDI 4.0 de una orden y lo envía por correo.
 *
 * Toda consulta filtra por req.usuario.id para que un usuario no pueda acceder a
 * órdenes ajenas, aunque conozca el id.
 */
const db = require('../config/db');
const { generarCFDI }     = require('../services/cfdi.service');
const { enviarReciboCFDI } = require('../services/email.service');

// Obtener la lista general de pedidos del usuario logueado
const getMisPedidos = async (req, res) => {
    try {
        const idUsuario = req.usuario.id; // Este ID viene seguro desde el token
        
        const [ordenes] = await db.promise().query(
            `SELECT id_orden, folio, estado, total, fecha_creacion, direccion_entrega
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

/**
 * POST /api/ordenes/enviar-recibo — Genera y envía el CFDI de una orden pagada.
 * Recibe el paypalOrderId, reconstruye el desglose fiscal (IEPS variable por
 * graduación + IVA en cascada) y manda el XML adjunto al correo del usuario.
 */
const enviarRecibo = async (req, res) => {
    try {
        const { paypalOrderId } = req.body;
        if (!paypalOrderId) {
            return res.status(400).json({ error: 'paypalOrderId es obligatorio.' });
        }

        // Obtener la orden verificando que pertenece al usuario del token
        const [ordenes] = await db.promise().query(
            `SELECT o.*, u.nombre, u.email 
             FROM ordenes o
             JOIN usuarios u ON o.id_usuario = u.id_usuario
             WHERE o.paypal_order_id = ? AND o.id_usuario = ?`,
            [paypalOrderId, req.usuario.id]
        );
        if (!ordenes.length) {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }
        const orden = ordenes[0];

        // Obtener detalles con graduación alcohólica para calcular IEPS correcto
        const [detalles] = await db.promise().query(
            `SELECT od.nombre_producto, od.cantidad, od.precio_unitario, od.subtotal_linea,
                    p.precio_neto, p.graduacion_alcoholica
             FROM orden_detalle od
             LEFT JOIN productos p ON od.id_producto = p.id_producto
             WHERE od.id_orden = ?`,
            [orden.id_orden]
        );

        const subtotal = detalles.reduce(
            (acc, d) => acc + Number(d.precio_neto || d.precio_unitario) * Number(d.cantidad),
            0
        );

        const fecha = new Date().toISOString().slice(0, 19); // Formato YYYY-MM-DD HH:MM:SS

        const xmlContent = generarCFDI({
            folio: orden.folio,
            fecha,
            usuario: { nombre: orden.nombre },
            productos: detalles,
            subtotal,
            costoEnvio: Number(orden.costo_envio || 0),
            total: Number(orden.total),
        });

        await enviarReciboCFDI({
            destinatario: orden.email,
            nombre: orden.nombre,
            folio: orden.folio,
            xmlContent,
            total: orden.total,
        });

        res.json({ mensaje: 'Recibo enviado correctamente.' });
    } catch (error) {
        console.error('Error al enviar recibo:', error);
        res.status(500).json({ error: 'No se pudo enviar el recibo.', detalle: error.message });
    }
};

module.exports = {
    getMisPedidos,
    getDetallePedido,
    enviarRecibo,
};