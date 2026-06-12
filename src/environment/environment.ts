/**
 * environment.ts — Configuración de entorno (desarrollo).
 *
 * Nota: hoy los servicios hardcodean la URL del backend en lugar de leer
 * `apiUrl` de aquí. Este archivo queda como punto único para centralizar esa
 * configuración (API, client-id de PayPal, moneda) cuando se unifique.
 */
export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    paypalClientId: 'AT5AJ09xAfjdHnljNE4zUgCfhq2BNFP-bCdhsQKqqWO6-ZyF_T9z_xqmqKON1UrGF8yfHCQX598YOH8b',
    currency: 'MXN'
};