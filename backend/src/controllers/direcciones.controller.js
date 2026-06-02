const db = require('../config/db');

const ESTADOS_MX = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila de Zaragoza', 'Colima', 'Durango',
  'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Michoacán de Ocampo', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
  'Tamaulipas', 'Tlaxcala', 'Veracruz de Ignacio de la Llave', 'Yucatán', 'Zacatecas'
];

// Validadores por campo
const RE_TEXTO_LIBRE = /^[\w\sÀ-ÿáéíóúÁÉÍÓÚüÜñÑ.,'\-#\/]{1,150}$/; // Letras, números, espacios, algunos acentos y caracteres comunes en direcciones. Máximo 150 caracteres.
const RE_NUMERO     = /^[\w\-#\/]{1,20}$/; // Letras, números, guión, # y / para números exteriores e interiores. Máximo 20 caracteres.
const RE_CP         = /^\d{5}$/; // Exactamente 5 dígitos numéricos para código postal.

function validarDireccion({ alias, calle, numero_exterior, numero_interior, colonia, municipio, ciudad, estado, codigo_postal, referencias }) {
  if (!alias?.trim() || alias.trim().length > 50)
    return 'Alias inválido (máximo 50 caracteres, sin caracteres especiales).';
  if (!calle?.trim() || !RE_TEXTO_LIBRE.test(calle.trim()))
    return 'Calle inválida.';
  if (!numero_exterior?.trim() || !RE_NUMERO.test(numero_exterior.trim()))
    return 'Número exterior inválido (solo letras, números, guión y #).';
  if (numero_interior?.trim() && !RE_NUMERO.test(numero_interior.trim()))
    return 'Número interior inválido.';
  if (!colonia?.trim() || !RE_TEXTO_LIBRE.test(colonia.trim()))
    return 'Colonia inválida.';
  if (!municipio?.trim() || !RE_TEXTO_LIBRE.test(municipio.trim()))
    return 'Municipio/Alcaldía inválido.';
  if (!ciudad?.trim() || !RE_TEXTO_LIBRE.test(ciudad.trim()))
    return 'Ciudad inválida.';
  if (!ESTADOS_MX.includes(estado))
    return 'Estado inválido. Selecciona un estado de México.';
  if (!RE_CP.test(codigo_postal))
    return 'Código postal inválido (exactamente 5 dígitos numéricos).';
  if (referencias?.trim() && referencias.trim().length > 255)
    return 'Referencias demasiado largas (máximo 255 caracteres).';
  return null;
}

const getDirecciones = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM direcciones WHERE id_usuario = ? ORDER BY id_direccion ASC',
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener direcciones.' });
  }
};

const crearDireccion = async (req, res) => {
  try {
    const [[{ total }]] = await db.promise().query(
      'SELECT COUNT(*) AS total FROM direcciones WHERE id_usuario = ?',
      [req.usuario.id]
    );
    if (total >= 4) {
      return res.status(400).json({ error: 'Límite alcanzado: máximo 4 direcciones por usuario.' });
    }

    const error = validarDireccion(req.body);
    if (error) return res.status(400).json({ error });

    const { alias, calle, numero_exterior, numero_interior, colonia, municipio, ciudad, estado, codigo_postal, referencias } = req.body;

    await db.promise().query(
      `INSERT INTO direcciones
         (id_usuario, alias, calle, numero_exterior, numero_interior, colonia, municipio, ciudad, estado, codigo_postal, referencias)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id,
        alias.trim(), calle.trim(), numero_exterior.trim(),
        numero_interior?.trim() || null,
        colonia.trim(), municipio.trim(), ciudad.trim(), estado.trim(),
        codigo_postal.trim(), referencias?.trim() || null
      ]
    );
    res.status(201).json({ mensaje: 'Dirección creada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear dirección.' });
  }
};

const actualizarDireccion = async (req, res) => {
  try {
    const { id } = req.params;

    const [filas] = await db.promise().query(
      'SELECT id_direccion FROM direcciones WHERE id_direccion = ? AND id_usuario = ?',
      [id, req.usuario.id]
    );
    if (!filas.length) return res.status(404).json({ error: 'Dirección no encontrada.' });

    const error = validarDireccion(req.body);
    if (error) return res.status(400).json({ error });

    const { alias, calle, numero_exterior, numero_interior, colonia, municipio, ciudad, estado, codigo_postal, referencias } = req.body;

    await db.promise().query(
      `UPDATE direcciones
       SET alias=?, calle=?, numero_exterior=?, numero_interior=?, colonia=?, municipio=?, ciudad=?, estado=?, codigo_postal=?, referencias=?
       WHERE id_direccion = ?`,
      [
        alias.trim(), calle.trim(), numero_exterior.trim(),
        numero_interior?.trim() || null,
        colonia.trim(), municipio.trim(), ciudad.trim(), estado.trim(),
        codigo_postal.trim(), referencias?.trim() || null,
        id
      ]
    );
    res.json({ mensaje: 'Dirección actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar dirección.' });
  }
};

const eliminarDireccion = async (req, res) => {
  try {
    const { id } = req.params;

    const [filas] = await db.promise().query(
      'SELECT id_direccion FROM direcciones WHERE id_direccion = ? AND id_usuario = ?',
      [id, req.usuario.id]
    );
    if (!filas.length) return res.status(404).json({ error: 'Dirección no encontrada.' });

    await db.promise().query('DELETE FROM direcciones WHERE id_direccion = ?', [id]);
    res.json({ mensaje: 'Dirección eliminada.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar dirección.' });
  }
};

module.exports = { getDirecciones, crearDireccion, actualizarDireccion, eliminarDireccion };
