require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('❌ Error: falta configurar JWT_SECRET en el archivo .env');
  process.exit(1);
}

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Función auxiliar: marca como 'Vencida' toda reserva pendiente con más de 48 horas
function actualizarReservasVencidas(callback) {
  const sql = `
    UPDATE Reservas
    SET estado_reserva = 'Vencida'
    WHERE estado_reserva = 'Pendiente de pago'
      AND fecha_creacion < DATE_SUB(NOW(), INTERVAL 48 HOUR)
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error actualizando reservas vencidas:', err);
      return callback(err);
    }
    callback(null, result);
  });
}

// Middleware: verifica que la petición traiga un token JWT válido
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.admin = decoded;
    next();
  });
}

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

  actualizarReservasVencidas((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno al verificar vencimientos' });
    }

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
      const horariosOcupados = results.map(row => row.horario_ocupado);
      res.json(horariosOcupados);
    });
  });
});

// 4. Crear una nueva reserva (con validación de precio en el servidor)
app.post('/api/reservas', (req, res) => {
  const { 
    id_sala, fecha, horario, cantidad_participantes, 
    nombre_cliente, apellido_cliente, email_cliente, telefono_cliente 
  } = req.body;

  actualizarReservasVencidas((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno al verificar vencimientos' });
    }

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
});

// 5. Login de administrador
app.post('/api/admin/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Debés ingresar usuario y contraseña' });
  }

  const sql = 'SELECT id_admin, usuario, password FROM Administradores WHERE usuario = ?';
  db.query(sql, [usuario], (err, results) => {
    if (err) {
      console.error('Error buscando administrador:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const admin = results[0];

    bcrypt.compare(password, admin.password, (err, esValida) => {
      if (err) {
        console.error('Error comparando contraseñas:', err);
        return res.status(500).json({ error: 'Error verificando credenciales' });
      }

      if (!esValida) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }

      const token = jwt.sign(
        { id_admin: admin.id_admin, usuario: admin.usuario },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: admin.usuario
      });
    });
  });
});

// 6. Obtener todas las reservas (Ruta protegida - Solo Admin)
app.get('/api/reservas', verificarToken, (req, res) => {
  actualizarReservasVencidas((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno al verificar vencimientos' });
    }

    const sql = `
      SELECT 
        r.id_reserva,
        r.id_sala,
        s.nombre AS nombre_sala,
        DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha,
        TIME_FORMAT(r.horario, '%H:%i') AS horario,
        r.cantidad_participantes,
        r.monto_total,
        r.nombre_cliente,
        r.apellido_cliente,
        r.email_cliente,
        r.telefono_cliente,
        r.estado_reserva,
        r.fecha_creacion
      FROM Reservas r
      INNER JOIN Salas s ON r.id_sala = s.id_sala
      ORDER BY r.fecha DESC, r.horario ASC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error obteniendo las reservas:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(results);
    });
  });
});

// 7. Cambiar estado de una reserva (Ruta protegida - Solo Admin)
app.patch('/api/reservas/:id/estado', verificarToken, (req, res) => {
  const { id } = req.params;
  const { nuevo_estado } = req.body;

  const estadosPermitidos = ['Confirmada', 'Cancelada'];
  if (!estadosPermitidos.includes(nuevo_estado)) {
    return res.status(400).json({ error: 'Estado no válido. Solo se permite Confirmada o Cancelada.' });
  }

  actualizarReservasVencidas((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno al verificar vencimientos' });
    }

    const checkSql = 'SELECT estado_reserva FROM Reservas WHERE id_reserva = ?';
    db.query(checkSql, [id], (err, results) => {
      if (err) {
        console.error('Error buscando la reserva:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      const estadoActual = results[0].estado_reserva;

      // Reglas de transición de estados
      if (nuevo_estado === 'Confirmada' && estadoActual !== 'Pendiente de pago') {
        return res.status(400).json({
          error: `No se puede confirmar una reserva en estado "${estadoActual}".`
        });
      }

      if (nuevo_estado === 'Cancelada' && !['Pendiente de pago', 'Confirmada'].includes(estadoActual)) {
        return res.status(400).json({
          error: `No se puede cancelar una reserva en estado "${estadoActual}".`
        });
      }

      const updateSql = 'UPDATE Reservas SET estado_reserva = ? WHERE id_reserva = ?';
      db.query(updateSql, [nuevo_estado, id], (err) => {
        if (err) {
          console.error('Error actualizando estado de la reserva:', err);
          return res.status(500).json({ error: 'Error al actualizar el estado' });
        }

        res.json({
          mensaje: `Reserva #${id} actualizada a "${nuevo_estado}" correctamente.`,
          estado_reserva: nuevo_estado
        });
      });
    });
  });
});

// Iniciamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});