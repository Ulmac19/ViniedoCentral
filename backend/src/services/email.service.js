'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía el recibo CFDI al correo del usuario.
 * @param {object} opts
 * @param {string} opts.destinatario  email del usuario
 * @param {string} opts.nombre        nombre del usuario
 * @param {string} opts.folio         folio de la orden
 * @param {string} opts.xmlContent    contenido del XML CFDI
 * @param {number} opts.total
 */
async function enviarReciboCFDI({ destinatario, nombre, folio, xmlContent, total }) {
  const totalFormateado = Number(total).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f0f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0f4;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(74,21,49,0.12);">

        <!-- Header -->
        <tr>
          <td style="background:#4A1531;padding:28px 36px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:2px;">VITIS &amp; BYTE</h1>
            <p style="margin:6px 0 0;color:#d1c4cb;font-size:13px;">Tu cava exclusiva en línea</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Hola, <strong>${escapeHtml(nombre)}</strong></p>
            <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.6;">
              Tu pago ha sido procesado exitosamente. Adjunto a este correo encontrarás tu
              <strong>Comprobante Fiscal Digital (CFDI 4.0)</strong> en formato XML.
            </p>

            <!-- Order summary box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f4f9;border:1px solid #e0c8e0;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#4A1531;text-transform:uppercase;letter-spacing:0.5px;">Resumen de tu orden</p>
                  <table width="100%" cellpadding="4" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#555;">Folio</td>
                      <td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${escapeHtml(folio)}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#555;">Total pagado</td>
                      <td style="font-size:15px;color:#4A1531;font-weight:700;text-align:right;">${totalFormateado}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#666;line-height:1.6;">
              El XML adjunto (<code style="background:#f0e6f0;padding:2px 6px;border-radius:4px;font-size:12px;">${escapeHtml(folio)}.xml</code>)
              ha sido generado con estructura <strong>CFDI 4.0</strong> conforme a la
              <em>Ley del IEPS (Art. 2, Fracción I, Inciso A)</em> y la <em>Ley del IVA (Art. 1)</em>.
            </p>
            <p style="margin:0;font-size:12px;color:#999;font-style:italic;">
              * Este comprobante es generado para fines académicos y no tiene validez fiscal ante el SAT.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#2e0d1e;padding:18px 36px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">
              © 2026 Vitis &amp; Byte, S.A. de C.V. · Todos los derechos reservados
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destinatario,
    subject: `Tu recibo de compra — Folio ${folio} | Vitis & Byte`,
    html,
    attachments: [
      {
        filename: `${folio}.xml`,
        content: xmlContent,
        contentType: 'application/xml',
      },
    ],
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { enviarReciboCFDI };
