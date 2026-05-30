'use strict';

function tasaIEPS(graduacion) {
  const g = Number(graduacion) || 0;
  if (g <= 14) return 0.265;
  if (g <= 20) return 0.30;
  return 0.53;
}

function fmt(n) {
  return Number(n).toFixed(2);
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Genera un CFDI 4.0 simplificado (ficticio, proyecto escolar).
 * @param {object} opts
 * @param {string} opts.folio
 * @param {string} opts.fecha  ISO-8601 "YYYY-MM-DDTHH:MM:SS"
 * @param {{ nombre: string }} opts.usuario
 * @param {Array<{ nombre_producto, cantidad, precio_neto, graduacion_alcoholica }>} opts.productos
 * @param {number} opts.subtotal   suma de precio_neto * cantidad
 * @param {number} opts.costoEnvio
 * @param {number} opts.total
 */
function generarCFDI({ folio, fecha, usuario, productos, subtotal, costoEnvio, total }) {
  const conceptos = [];
  // Agrupamos IEPS por tasa para el resumen
  const iepsGrupos = {};
  let totalIvaBase = 0;
  let totalIvaImporte = 0;

  for (const p of productos) {
    const tasa = tasaIEPS(p.graduacion_alcoholica);
    const tasaStr = tasa.toFixed(6);
    const precioNeto = Number(p.precio_neto) || 0;
    const cantidad = Number(p.cantidad) || 1;

    const iepsBase     = precioNeto * cantidad;
    const iepsImporte  = iepsBase * tasa;
    const ivaBase      = iepsBase + iepsImporte;         // precio_neto * (1 + tasa)
    const ivaImporte   = ivaBase * 0.16;

    if (!iepsGrupos[tasaStr]) iepsGrupos[tasaStr] = { base: 0, importe: 0 };
    iepsGrupos[tasaStr].base    += iepsBase;
    iepsGrupos[tasaStr].importe += iepsImporte;
    totalIvaBase    += ivaBase;
    totalIvaImporte += ivaImporte;

    conceptos.push({ p, cantidad, precioNeto, tasaStr, iepsBase, iepsImporte, ivaBase, ivaImporte });
  }

  const totalImpuestos = Object.values(iepsGrupos).reduce((a, g) => a + g.importe, 0) + totalIvaImporte;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<cfdi:Comprobante\n`;
  xml += `  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"\n`;
  xml += `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"\n`;
  xml += `  Version="4.0"\n`;
  xml += `  Folio="${escapeXml(folio)}"\n`;
  xml += `  Fecha="${fecha}"\n`;
  xml += `  Sello="Comprobante generado para fines academicos - Sin validez fiscal"\n`;
  xml += `  FormaPago="03"\n`;
  xml += `  NoCertificado="00000000000000000000"\n`;
  xml += `  Certificado="Q2VydGlmaWNhZG8gZmljdGljaW8gcGFyYSBwcm95ZWN0byBlc2NvbGFy"\n`;
  xml += `  SubTotal="${fmt(subtotal)}"\n`;
  xml += `  Descuento="0.00"\n`;
  xml += `  Moneda="MXN"\n`;
  xml += `  Total="${fmt(total)}"\n`;
  xml += `  TipoDeComprobante="I"\n`;
  xml += `  Exportacion="01"\n`;
  xml += `  MetodoPago="PUE"\n`;
  xml += `  LugarExpedicion="45010">\n\n`;

  xml += `  <cfdi:Emisor\n`;
  xml += `    Rfc="XAXX010101000"\n`;
  xml += `    Nombre="Vi&#241;edo Central S.A. de C.V."\n`;
  xml += `    RegimenFiscal="601"/>\n\n`;

  xml += `  <cfdi:Receptor\n`;
  xml += `    Rfc="XEXX010101000"\n`;
  xml += `    Nombre="${escapeXml(usuario.nombre)}"\n`;
  xml += `    DomicilioFiscalReceptor="00000"\n`;
  xml += `    RegimenFiscalReceptor="616"\n`;
  xml += `    UsoCFDI="G01"/>\n\n`;

  xml += `  <cfdi:Conceptos>\n`;
  for (const c of conceptos) {
    xml += `    <cfdi:Concepto\n`;
    xml += `      ClaveProdServ="24122700"\n`;
    xml += `      Cantidad="${c.cantidad}"\n`;
    xml += `      ClaveUnidad="H87"\n`;
    xml += `      Unidad="Pieza"\n`;
    xml += `      Descripcion="${escapeXml(c.p.nombre_producto)}"\n`;
    xml += `      ValorUnitario="${fmt(c.precioNeto)}"\n`;
    xml += `      Importe="${fmt(c.iepsBase)}"\n`;
    xml += `      Descuento="0.00"\n`;
    xml += `      ObjetoImp="02">\n`;
    xml += `      <cfdi:Impuestos>\n`;
    xml += `        <cfdi:Traslados>\n`;
    xml += `          <cfdi:Traslado Base="${fmt(c.iepsBase)}" Impuesto="003" TipoFactor="Tasa" TasaOCuota="${c.tasaStr}" Importe="${fmt(c.iepsImporte)}"/>\n`;
    xml += `          <cfdi:Traslado Base="${fmt(c.ivaBase)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${fmt(c.ivaImporte)}"/>\n`;
    xml += `        </cfdi:Traslados>\n`;
    xml += `      </cfdi:Impuestos>\n`;
    xml += `    </cfdi:Concepto>\n`;
  }
  xml += `  </cfdi:Conceptos>\n\n`;

  xml += `  <cfdi:Impuestos TotalImpuestosTrasladados="${fmt(totalImpuestos)}">\n`;
  xml += `    <cfdi:Traslados>\n`;
  for (const [tasa, grupo] of Object.entries(iepsGrupos)) {
    xml += `      <cfdi:Traslado Base="${fmt(grupo.base)}" Impuesto="003" TipoFactor="Tasa" TasaOCuota="${tasa}" Importe="${fmt(grupo.importe)}"/>\n`;
  }
  xml += `      <cfdi:Traslado Base="${fmt(totalIvaBase)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${fmt(totalIvaImporte)}"/>\n`;
  xml += `    </cfdi:Traslados>\n`;
  xml += `  </cfdi:Impuestos>\n\n`;

  xml += `</cfdi:Comprobante>`;

  return xml;
}

module.exports = { generarCFDI };
