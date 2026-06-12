/**
 * paypal.service.js — Cliente de la API REST de PayPal (sandbox).
 *
 * Encapsula las llamadas HTTP a PayPal para que los controladores no traten con
 * tokens, auth ni formatos de PayPal. Tres pasos:
 *   getAccessToken    → token OAuth con las credenciales (Basic auth).
 *   createPaypalOrder → crea la orden a partir de los items del carrito.
 *   capturePaypalOrder→ captura (cobra) una orden ya aprobada por el comprador.
 */
const { paypalConfig } = require('../config/paypal.config');

// PayPal autentica la obtención del token con Basic auth: client_id:secret en base64.
function getBasicAuth() {
  return Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');
}

// Obtiene un access token OAuth2 (válido por un tiempo) para las demás llamadas.
async function getAccessToken() {
  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Error obteniendo access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// Normaliza un número a string monetario con 2 decimales ("123.40").
// PayPal rechaza la orden si los importes no cuadran al centavo.
function toMoney2(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2);
}

// Crea una orden de pago en PayPal a partir de los items del carrito.
async function createPaypalOrder(orderData) {
  const accessToken = await getAccessToken(); // Obtenemos el token de acceso para autenticar la solicitud a PayPal

  /** PayPal exige que item_total === suma de (cantidad × precio_unitario) por línea. */
  const items = orderData.items.map((item) => {
    const qty = Math.max(1, Math.floor(Number(item.cantidad))); // Aseguramos que la cantidad sea al menos 1 y un número entero
    const unit = Math.round(Number(item.precio) * 100) / 100; // Redondeamos el precio unitario a 2 decimales para evitar problemas de precisión con PayPal
    return { // PayPal tiene un límite de 127 caracteres para el nombre del producto, así que truncamos si es necesario
      name: String(item.nombre ?? 'Producto').slice(0, 127),
      quantity: String(qty),
      unit_amount: {
        currency_code: 'MXN',
        value: toMoney2(unit)
      }
    };
  });

  let itemTotalNum = 0;
  for (const it of items) {
    itemTotalNum += Number(it.quantity) * Number(it.unit_amount.value);
  }
  const itemTotal = toMoney2(itemTotalNum);

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'MXN',
          value: itemTotal,
          breakdown: {
            item_total: {
              currency_code: 'MXN',
              value: itemTotal
            }
          }
        },
        items
      }
    ]
  };

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error creando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

// Captura (cobra) una orden ya aprobada por el comprador en el popup de PayPal.
async function capturePaypalOrder(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error capturando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = {
  getAccessToken,
  createPaypalOrder,
  capturePaypalOrder
};
  