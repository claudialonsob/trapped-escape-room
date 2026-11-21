require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const usuario = process.env.ADMIN_USER;
const passwordPlana = process.env.ADMIN_PASSWORD;

if (!usuario || !passwordPlana) {
  console.error('❌ Faltan ADMIN_USER o ADMIN_PASSWORD en el archivo .env');
  process.exit(1);
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1);
  }

  // 1. Verificamos si el usuario ya existe para no duplicarlo
  const checkSql = 'SELECT id_admin FROM Administradores WHERE usuario = ?';
  db.query(checkSql, [usuario], (err, results) => {
    if (err) {
      console.error('❌ Error consultando administradores:', err.message);
      db.end();
      return;
    }

    if (results.length > 0) {
      console.log(`ℹ️ El administrador "${usuario}" ya existe en la base de datos.`);
      db.end();
      return;
    }

    // 2. Si no existe, encriptamos la contraseña y lo insertamos
    bcrypt.hash(passwordPlana, 10, (err, passwordEncriptada) => {
      if (err) {
        console.error('❌ Error encriptando la contraseña:', err.message);
        db.end();
        return;
      }

      const insertSql = 'INSERT INTO Administradores (usuario, password) VALUES (?, ?)';
      db.query(insertSql, [usuario, passwordEncriptada], (err) => {
        if (err) {
          console.error('❌ Error creando el administrador:', err.message);
        } else {
          console.log(`✅ Administrador "${usuario}" creado con éxito (contraseña encriptada).`);
        }
        db.end();
      });
    });
  });
});