# Sistema de Reservas - Trapped Escape Room

**Nombre del informe:** Construcción del prototipo del sistema de reservas de Trapped Escape Room (Trabajo Final)  
**Alumna:** Claudina Alonso Barrionuevo  
**DNI:** 43875305  
**Mail:** claudialonsob@gmail.com  
**Fecha de entrega:** 24 de noviembre de 2026  
**Carrera:** Tec. Univ. en Tecnología de la Información (Orientación en Desarrollo Web)  
**Materia:** Taller de Proyectos II  

## Descripción del Proyecto
Sistema web desarrollado para la gestión de reservas de un negocio de escape room. Permite a los usuarios consultar las salas disponibles, acceder a sus detalles, seleccionar la cantidad de participantes, consultar las tarifas y elegir un horario disponible para realizar una reserva.

Además, incorpora un **panel de administración protegido con autenticación JWT** que permite gestionar las reservas registradas, verificar el plazo de pago, confirmar o cancelar turnos y liberar automáticamente los horarios disponibles.

El sistema utiliza una arquitectura frontend-backend y una base de datos MySQL para almacenar la información de las salas, las tarifas, los administradores y las reservas realizadas.

## 🛠️ Tecnologías utilizadas

* **Frontend:** React, Vite, React Router DOM, Axios y Bootstrap 5.
* **Backend:** Node.js, Express, `bcryptjs` y `jsonwebtoken` (JWT).
* **Base de datos:** MySQL.
* **Conexión a la base de datos:** `mysql2`.
* **Otras herramientas:** Git y GitHub.

## 📂 Estructura del repositorio

```text
trapped-escape-room/
├── backend/       # Servidor, API REST y script de creación de administrador
├── frontend/      # Interfaz web pública y panel de administración en React
├── .gitignore     # Exclusión de dependencias y variables de entorno
├── database.sql   # Script de creación de la base de datos
└── README.md      # Documentación e instrucciones del proyecto
```

## ✨ Funcionalidades implementadas

### Sitio público
* Visualización del listado de salas disponibles.
* Acceso al detalle de cada sala, con sus características e información.
* Selección de la cantidad de participantes según las condiciones de cada sala.
* Consulta de tarifas según la cantidad de participantes.
* Selección de fechas y horarios disponibles.
* Registro de reservas mediante un formulario.
* Validación de disponibilidad y tarifas en el servidor antes de registrar una reserva.
* Almacenamiento de las reservas en una base de datos MySQL.

### Panel de administración
* Inicio de sesión protegido mediante usuario, contraseña hasheada (`bcryptjs`) y token JWT.
* Visualización de todas las reservas ordenadas por prioridad operativa (*Pendiente de pago*, *Confirmada*, *Vencida* y *Cancelada*) y por fecha más próxima.
* Tarjetas de resumen y filtros por estado de reserva.
* Seguimiento del plazo de 48 horas para reservas pendientes de pago y actualización automática de su estado a *Vencida* cuando se supera ese límite, al consultar o gestionar las reservas.
* Confirmación y cancelación de reservas con liberación automática del horario en caso de cancelación o vencimiento.

## ⚙️ Requisitos previos

Para ejecutar el proyecto localmente es necesario contar con:

* Node.js y npm.
* MySQL Server y MySQL Workbench (o una herramienta similar).
* Un navegador web.
* Git para clonar el repositorio.

## 🚀 Instalación y ejecución local

### 1. Clonar el repositorio

Abrir una terminal y ejecutar:

```bash
git clone [https://github.com/claudialonsob/trapped-escape-room.git](https://github.com/claudialonsob/trapped-escape-room.git)
cd trapped-escape-room
```

### 2. Configurar la base de datos

Para que el sistema funcione, es necesario crear la base de datos y sus tablas a partir del script incluido en el repositorio:

1. Abrir MySQL Workbench y conectarse a una instancia local de MySQL Server.
2. Abrir el archivo `database.sql`, ubicado en la carpeta principal del proyecto.
3. Ejecutar el script mediante el botón de ejecución (ícono del rayo).

El script creará la base de datos `trapped_db` y las tablas `Administradores`, `Salas`, `Precios` y `Reservas`. También cargará los registros iniciales correspondientes a las salas y sus tarifas.

### 3. Configurar y ejecutar el backend

Abrir una terminal y acceder a la carpeta del backend:

```bash
cd backend
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo llamado `.env` dentro de la carpeta `backend` con los datos de conexión a MySQL, la clave secreta para JWT y las credenciales del administrador:

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=trapped_db
JWT_SECRET=tu_clave_secreta_jwt
ADMIN_USER=tu_usuario_administrador
ADMIN_PASSWORD=tu_contraseña_administrador
```

Reemplazar los valores de ejemplo por los datos correspondientes a la instalación local.

Una vez configuradas las variables de entorno, iniciar el servidor:

```bash
npm run dev
```

El backend se ejecutará localmente en el puerto `3000`. En la terminal debería aparecer el mensaje de conexión exitosa a la base de datos.

> **Importante:** El archivo `.env` contiene datos de conexión y credenciales locales, por lo que está excluido en `.gitignore` y no debe subirse a GitHub.

### 4. Crear un usuario administrador

Por seguridad, el sistema **no cuenta con un registro público de administradores**. Para acceder al panel administrativo es necesario crear previamente un usuario en la base de datos local utilizando el script `crearAdmin.js`:

1. Configurar `ADMIN_USER` y `ADMIN_PASSWORD` en el archivo `.env` dentro de la carpeta `backend`.
2. Abrir una nueva terminal, acceder a la carpeta `backend` y ejecutar:

```bash
cd backend
node crearAdmin.js
```

El script generará el hash de la contraseña mediante `bcryptjs` y registrará el administrador en la tabla `Administradores`.

> **Importante:** Las credenciales del administrador son locales y no deben publicarse en el repositorio de GitHub.

### 5. Configurar y ejecutar el frontend

Abrir una segunda terminal y acceder a la carpeta del frontend:

```bash
cd frontend
```

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local desde la cual se puede acceder a la aplicación (generalmente `http://localhost:5173`):

* **Sitio público:** `http://localhost:5173`
* **Panel de administración:** `http://localhost:5173/admin/login`

> **Importante:** Para que el sistema funcione correctamente, el backend y el frontend deben estar ejecutándose al mismo tiempo, en terminales separadas.

## 🔌 Endpoints principales de la API

El backend cuenta con los siguientes endpoints para gestionar la información del sistema:

### Públicos
* `GET /api/salas`: obtiene el listado de salas que se encuentran activas.
* `GET /api/precios`: obtiene las tarifas disponibles según la cantidad de participantes.
* `GET /api/reservas/disponibilidad`: consulta los horarios ocupados para una sala y una fecha determinadas (parámetros `id_sala` y `fecha`). Permite mostrar al usuario únicamente los horarios disponibles.
* `POST /api/reservas`: registra una nueva reserva. Antes de guardarla, el servidor verifica que la tarifa corresponda a la cantidad de participantes seleccionada y que el horario continúe disponible.

### Administración
* `POST /api/admin/login`: valida las credenciales del administrador y devuelve un token JWT para acceder al panel.
* `GET /api/reservas` *(protegido con JWT)*: actualiza el estado de las reservas vencidas y devuelve el listado completo ordenado por prioridad de estado y fecha.
* `PATCH /api/reservas/:id/estado` *(protegido con JWT)*: permite confirmar o cancelar una reserva específica.

## 🔄 Funcionamiento general

1. **Reserva de clientes:** El usuario selecciona una sala y accede a su detalle. Desde allí inicia una reserva, elige la cantidad de participantes, consulta el precio correspondiente y selecciona una fecha y un horario disponible. Al enviar el formulario, el backend valida la tarifa y la disponibilidad antes de registrar la reserva en MySQL con estado *Pendiente de pago*.
2. **Gestión administrativa:** El administrador ingresa a `/admin/login` con sus credenciales. Desde el panel visualiza las reservas ordenadas por prioridad, controla el tiempo restante de pago (48 horas) y puede confirmar o cancelar turnos. Si una reserva se cancela o vence, el horario vuelve a quedar disponible automáticamente en el sitio público.