/**
 * db.js — Conexión a la base de datos MySQL (esquema VITISBYTE).
 *
 * Crea una única conexión a partir de las credenciales del .env y la exporta
 * para reutilizarla en toda la app. Los controladores usan `db.promise().query()`
 * para trabajar con async/await en lugar de callbacks anidados.
 */
const mysql = require('mysql2');
require('dotenv').config();

// Conexión única compartida por toda la aplicación.
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Intento de conexión inicial: si falla, se registra el error en consola.
conexion.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

module.exports = conexion;
