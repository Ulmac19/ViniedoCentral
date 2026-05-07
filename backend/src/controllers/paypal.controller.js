const { createPaypalOrder, capturePaypalOrder } = require('../services/paypal.service');
const { persistirOrdenCreada, persistirCapturaPaypal } = require('../services/ordenDb.service');

async function createOrder(req, res) {
  try {
    const { items, total } = req.body;

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
        idUsuario: req.usuario.id // <-- PASAMOS EL ID DEL USUARIO DESDE EL TOKEN
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
