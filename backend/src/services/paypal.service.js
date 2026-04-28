const { paypalConfig } = require('../config/paypal.config');

function getBasicAuth() {
  return Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');
}

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

function toMoney2(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2);
}

async function createPaypalOrder(orderData) {
  const accessToken = await getAccessToken();

  /** PayPal exige que item_total === suma de (cantidad × precio_unitario) por línea. */
  const items = orderData.items.map((item) => {
    const qty = Math.max(1, Math.floor(Number(item.cantidad)));
    const unit = Math.round(Number(item.precio) * 100) / 100;
    return {
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
  