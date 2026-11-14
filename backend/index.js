require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Intentamos conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    return;
  }
  console.log('✅ Conexión exitosa a la base de datos trapped_db');
});

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('API de Trapped Escape Room funcionando 🚀');
});

// ---------------------------------------------
// ENDPOINTS DE LA API REST
// ---------------------------------------------

// 1. Obtener todas las salas
app.get('/api/salas', (req, res) => {
  const sql = 'SELECT * FROM Salas WHERE estado_sala = "Activa"';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error obteniendo las salas:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// 2. Obtener el tarifario
app.get('/api/precios', (req, res) => {
  const sql = 'SELECT * FROM Precios ORDER BY cantidad_participantes ASC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error obteniendo los precios:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// 3. Consultar disponibilidad de horarios para una sala y fecha específica
app.get('/api/reservas/disponibilidad', (req, res) => {
  const { id_sala, fecha } = req.query;

  if (!id_sala || !fecha) {
    return res.status(400).json({ error: 'Faltan los parámetros id_sala y fecha' });
  }

  // Buscamos solo las reservas que bloquean horario (Pendientes o Confirmadas)
  const sql = `
    SELECT TIME_FORMAT(horario, '%H:%i') as horario_ocupado 
    FROM Reservas 
    WHERE id_sala = ? AND fecha = ? AND estado_reserva IN ('Pendiente de pago', 'Confirmada')
  `;
  
  db.query(sql, [id_sala, fecha], (err, results) => {
    if (err) {
      console.error('Error consultando disponibilidad:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    // Convertimos el resultado en un arreglo simple, ej: ['16:00', '19:00']
    const horariosOcupados = results.map(row => row.horario_ocupado);
    res.json(horariosOcupados);
  });
});

// 4. Crear una nueva reserva (con validación de precio en el servidor)
app.post('/api/reservas', (req, res) => {
  const { 
    id_sala, fecha, horario, cantidad_participantes, 
    nombre_cliente, apellido_cliente, email_cliente, telefono_cliente 
  } = req.body;

  // PASO 1: Calcular el precio oficial directamente desde MySQL
  const precioSql = `SELECT precio FROM Precios WHERE id_sala = ? AND cantidad_participantes = ?`;
  
  db.query(precioSql, [id_sala, cantidad_participantes], (err, preciosResult) => {
    if (err) {
      console.error('Error consultando precio:', err);
      return res.status(500).json({ error: 'Error interno validando la tarifa' });
    }

    if (preciosResult.length === 0) {
      return res.status(400).json({ error: 'Cantidad de participantes no válida para esta sala' });
    }

    // Guardamos el precio real que nos devolvió la base de datos
    const monto_total_real = preciosResult[0].precio;

    // PASO 2: Verificar que nadie haya ganado de mano el turno
    const checkSql = `
      SELECT id_reserva FROM Reservas 
      WHERE id_sala = ? AND fecha = ? AND horario = ? 
      AND estado_reserva IN ('Pendiente de pago', 'Confirmada')
    `;

    db.query(checkSql, [id_sala, fecha, horario], (err, results) => {
      if (err) {
        console.error('Error verificando disponibilidad previa:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Lo sentimos, este horario acaba de ser reservado por otra persona.' });
      }

      // PASO 3: Insertar la reserva con el precio seguro
      const insertSql = `
        INSERT INTO Reservas 
        (id_sala, fecha, horario, cantidad_participantes, monto_total, nombre_cliente, apellido_cliente, email_cliente, telefono_cliente) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id_sala, fecha, horario, cantidad_participantes, monto_total_real, 
        nombre_cliente, apellido_cliente, email_cliente, telefono_cliente
      ];

      db.query(insertSql, values, (err, result) => {
        if (err) {
          console.error('Error guardando la reserva:', err);
          return res.status(500).json({ error: 'Error al registrar la reserva' });
        }
        res.json({ mensaje: '¡Reserva creada con éxito!', id_reserva: result.insertId });
      });
    });
  });
});

// Iniciamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});