const db = require('../config/db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });
}

function folioUnico() {
  return `VTC-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function lineasProducto(items) {
  return (items || []).filter(
    (i) => i.id_producto != null && i.id_producto !== '' && !Number.isNaN(Number(i.id_producto)),
  );
}

function lineaEnvio(items) {
  return (items || []).find(
    (i) =>
      (i.id_producto == null || i.id_producto === '') &&
      String(i.nombre || '')
        .toLowerCase()
        .includes('envío'),
  );
}

/**
 * Tras crear la orden en PayPal: guarda cabecera + detalle (solo productos con id_producto).
 */
async function persistirOrdenCreada({ items, total, paypalOrderId, paypalStatus }) {
  const productos = lineasProducto(items);
  const envio = lineaEnvio(items);
  const subtotalProductos = productos.reduce(
    (acc, it) => acc + Number(it.cantidad) * Number(it.precio),
    0,
  );
  const costoEnvio = envio ? Number(envio.cantidad) * Number(envio.precio) : 0;

  await query('START TRANSACTION');
  try {
    const folio = folioUnico();
    const resInsert = await query(
      `INSERT INTO ordenes (
        folio, estado, moneda, subtotal, descuento, costo_envio, total,
        paypal_order_id, paypal_status
      ) VALUES (?, 'creada_paypal', 'MXN', ?, 0, ?, ?, ?, ?)`,
      [
        folio,
        Number(subtotalProductos.toFixed(2)),
        Number(costoEnvio.toFixed(2)),
        Number(Number(total).toFixed(2)),
        paypalOrderId,
        paypalStatus || null,
      ],
    );
    const idOrden = resInsert.insertId;

    for (const it of productos) {
      const pid = Number(it.id_producto);
      const rows = await query(
        'SELECT sku, nombre FROM productos WHERE id_producto = ? LIMIT 1',
        [pid],
      );
      const prod = rows[0];
      if (!prod) {
        throw new Error(`Producto id ${pid} no existe en la base de datos`);
      }
      const cant = Math.max(1, Math.floor(Number(it.cantidad)));
      const precio = Math.round(Number(it.precio) * 100) / 100;
      const subLinea = Math.round(cant * precio * 100) / 100;
      await query(
        `INSERT INTO orden_detalle (
          id_orden, id_producto, sku, nombre_producto, cantidad, precio_unitario, subtotal_linea
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idOrden, pid, prod.sku, prod.nombre, cant, precio, subLinea],
      );
    }

    await query('COMMIT');
    return { idOrden, folio };
  } catch (e) {
    await query('ROLLBACK').catch(() => {});
    throw e;
  }
}

function extraerCaptura(captureData) {
  const capture = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    captureId: capture?.id || null,
    monto: capture?.amount?.value ? Number(capture.amount.value) : null,
    moneda: capture?.amount?.currency_code || 'MXN',
    payerEmail: captureData?.payer?.email_address || null,
    status: captureData?.status || null,
  };
}

/**
 * Tras capturar en PayPal: actualiza orden y registra pago.
 */
async function persistirCapturaPaypal(orderIdPaypal, captureData) {
  const { captureId, monto, moneda, payerEmail, status } = extraerCaptura(captureData);
  const rows = await query('SELECT id_orden, total FROM ordenes WHERE paypal_order_id = ? LIMIT 1', [
    orderIdPaypal,
  ]);
  if (!rows.length) {
    return { guardado: false, motivo: 'No hay orden local con ese paypal_order_id' };
  }
  const idOrden = rows[0].id_orden;
  const montoFinal = monto != null && !Number.isNaN(monto) ? monto : Number(rows[0].total);

  await query('START TRANSACTION');
  try {
    await query(
      `UPDATE ordenes SET estado = 'pagada', paypal_status = ?, payer_email = COALESCE(?, payer_email)
       WHERE id_orden = ?`,
      [status || 'COMPLETED', payerEmail, idOrden],
    );

    await query(
      `INSERT INTO pagos (
        id_orden, proveedor, estado, monto, moneda, paypal_order_id, paypal_capture_id,
        respuesta_json, fecha_pago
      ) VALUES (?, 'paypal', 'completado', ?, ?, ?, ?, ?, NOW())`,
      [
        idOrden,
        Number(montoFinal.toFixed(2)),
        moneda,
        orderIdPaypal,
        captureId,
        JSON.stringify(captureData),
      ],
    );

    await query('COMMIT');
    return { guardado: true, idOrden, captureId };
  } catch (e) {
    await query('ROLLBACK').catch(() => {});
    throw e;
  }
}

module.exports = {
  persistirOrdenCreada,
  persistirCapturaPaypal,
};
