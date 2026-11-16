CREATE DATABASE IF NOT EXISTS trapped_db;
USE trapped_db;

-- 2. TABLA ADMINISTRADORES
CREATE TABLE Administradores (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 3. TABLA SALAS
CREATE TABLE Salas (
    id_sala VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_minutos INT DEFAULT 60,
    capacidad_minima INT NOT NULL,
    capacidad_maxima INT NOT NULL,
    estado_sala VARCHAR(50) DEFAULT 'Activa'
);

-- 4. TABLA PRECIOS
CREATE TABLE Precios (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    id_sala VARCHAR(50) NOT NULL,
    cantidad_participantes INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_sala) REFERENCES Salas(id_sala),
    UNIQUE (id_sala, cantidad_participantes)
);

-- 5. TABLA RESERVAS
CREATE TABLE Reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_sala VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    horario TIME NOT NULL,
    cantidad_participantes INT NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    apellido_cliente VARCHAR(100) NOT NULL,
    email_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(50) NOT NULL,
    estado_reserva ENUM('Pendiente de pago', 'Confirmada', 'Cancelada', 'Vencida') DEFAULT 'Pendiente de pago',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sala) REFERENCES Salas(id_sala)
);

-- --------------------------------------------------------
-- INSERCION DE DATOS INICIALES (SALAS Y PRECIOS)
-- --------------------------------------------------------

INSERT INTO Salas (id_sala, nombre, descripcion, duracion_minutos, capacidad_minima, capacidad_maxima, estado_sala) VALUES
('fragmentado', 'Fragmentado', 'Sala con espejo divisor.', 60, 2, 6, 'Activa'),
('conexion-perdida', 'Conexión Perdida', 'Comunicación por walkie-talkie.', 60, 2, 6, 'Activa'),
('el-acertijo', 'El Acertijo', 'Misterio clásico y villano enmascarado.', 60, 1, 6, 'Activa');

INSERT INTO Precios (id_sala, cantidad_participantes, precio) VALUES
('el-acertijo', 1, 20000),
('el-acertijo', 2, 35000),
('fragmentado', 2, 35000),
('conexion-perdida', 2, 35000),
('el-acertijo', 3, 45000),
('conexion-perdida', 3, 45000),
('el-acertijo', 4, 55000),
('fragmentado', 4, 55000),
('conexion-perdida', 4, 55000),
('el-acertijo', 5, 65000),
('conexion-perdida', 5, 65000),
('el-acertijo', 6, 75000),
('fragmentado', 6, 75000),
('conexion-perdida', 6, 75000);
