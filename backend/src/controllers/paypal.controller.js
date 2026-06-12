/**
 * paypal.controller.js — Orquesta el flujo de pago con PayPal.
 *
 * El pago se hace en dos pasos:
 *   1. createOrder  → crea la orden en PayPal y la persiste como 'creada_paypal'.
 *   2. captureOrder → captura el cobro y marca la orden como 'pagada'.
 *
 * Regla clave: si PayPal responde OK pero la BD falla, NO bloqueamos al
 * comprador (el dinero ya se movió en PayPal); registramos el error y seguimos.
 */
const { createPaypalOrder, capturePaypalOrder } = require('../services/paypal.service');
const { persistirOrdenCreada, persistirCapturaPaypal } = require('../services/ordenDb.service');

/**
 * POST /api/paypal/crear-orden
 * Crea la orden en PayPal y guarda la cabecera + detalle en la BD.
 * El id_usuario se toma del token (req.usuario.id), nunca del body.
 */
async function createOrder(req, res) {
  try {
    const { items, total, id_direccion } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'El carrito está vacío'
      });
    }

    if (!total || Number(total) <= 0) {
      return res.status(400).json({
        error: 'El total es inválido'
      });
    }

    const order = await createPaypalOrder({ items, total });

    try {
      await persistirOrdenCreada({
        items,
        total,
        paypalOrderId: order.id,
        paypalStatus: order.status,
        idUsuario: req.usuario.id,
        idDireccion: id_direccion ?? null,
      });
    } catch (dbErr) {
      console.error('Orden PayPal creada pero falló guardado en BD:', dbErr.message);
      return res.status(500).json({
        error: 'La orden de PayPal se creó pero no se pudo guardar en la base de datos',
        detalle: dbErr.message,
        paypalOrderId: order.id
      });
    }

    res.status(200).json({
      id: order.id,
      status: order.status
    });
  } catch (error) {
    console.error('Error en createOrder:', error.message);

    res.status(500).json({
      error: 'No se pudo crear la orden',
      detalle: error.message
    });
  }
}

/**
 * POST /api/paypal/capturar-orden
 * Captura el cobro en PayPal y actualiza la orden a 'pagada', registra el pago
 * y descuenta el stock. Nota: el frontend envía `orderId` (camelCase exacto).
 */
async function captureOrder(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: 'orderId es obligatorio'
      });
    }

    const captureData = await capturePaypalOrder(orderId);

    try {
      const r = await persistirCapturaPaypal(orderId, captureData);
      if (!r.guardado) {
        console.warn('Captura PayPal OK pero:', r.motivo, orderId);
      }
    } catch (dbErr) {
      // El cobro ya quedó en PayPal; no fallamos el HTTP para no bloquear al comprador.
      console.error('Captura PayPal OK pero falló guardado en BD:', dbErr.message);
      captureData._persistenciaError = dbErr.message;
    }

    res.status(200).json(captureData);
  } catch (error) {
    console.error('Error en captureOrder:', error.message);

    res.status(500).json({
      error: 'No se pudo capturar la orden',
      detalle: error.message
    });
  }
}

module.exports = {
  createOrder,
  captureOrder
};
