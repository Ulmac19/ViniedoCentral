/** trim: en .env a veces queda espacio tras `=` y PayPal rechaza el Basic auth. */
const paypalConfig = {
  clientId: String(process.env.PAYPAL_CLIENT_ID ?? '').trim(),
  clientSecret: String(process.env.PAYPAL_CLIENT_SECRET ?? '').trim(),
  baseUrl: String(process.env.PAYPAL_BASE_URL ?? '').trim()
};

module.exports = {
  paypalConfig
};