# Sistema de Reservas - Trapped Escape Room

**Nombre del informe:** Construcción del prototipo del sistema de reservas de Trapped Escape Room (Avance 3)
**Alumna:** Claudina Alonso Barrionuevo
**DNI:** 43875305
**Mail:** claudialonsob@gmail.com
**Fecha de entrega:** 17 de noviembre de 2026
**Carrera:** Tec. Univ. en Tecnología de la Información (Orientación en Desarrollo Web)
**Materia:** Taller de Proyectos II

## Descripción del Proyecto
Sistema web desarrollado para la gestión de reservas de un negocio de escape room. Permite a los usuarios consultar las salas disponibles, acceder a sus detalles, seleccionar la cantidad de participantes, consultar las tarifas y elegir un horario disponible para realizar una reserva.

El sistema utiliza una arquitectura frontend-backend y una base de datos MySQL para almacenar la información de las salas, las tarifas y las reservas realizadas.

🛠️ Tecnologías utilizadas

Frontend: React, Vite, React Router DOM, Axios y Bootstrap 5.

Backend: Node.js y Express.

Base de datos: MySQL.

Conexión a la base de datos: mysql2.

Otras herramientas: Git y GitHub.

📂 Estructura del repositorio

trapped-escape-room/
├── backend/       # Servidor y API REST
├── frontend/      # Interfaz web desarrollada con React
├── database.sql   # Script de creación de la base de datos
└── README.md      # Documentación e instrucciones del proyecto

✨ Funcionalidades implementadas

Visualización del listado de salas disponibles.

Acceso al detalle de cada sala, con sus características e información.

Selección de la cantidad de participantes según las condiciones de cada sala.

Consulta de tarifas según la cantidad de participantes.

Selección de fechas y horarios disponibles.

Registro de reservas mediante un formulario.

Validación de disponibilidad y tarifas en el servidor antes de registrar una reserva.

Almacenamiento de las reservas en una base de datos MySQL.

⚙️ Requisitos previos

Para ejecutar el proyecto localmente es necesario contar con:

Node.js y npm.

MySQL Server y MySQL Workbench (o una herramienta similar).

Un navegador web.

Git para clonar el repositorio.

🚀 Instalación y ejecución local

1. Clonar el repositorio

Abrir una terminal y ejecutar:

git clone https://github.com/claudialonsob/trapped-escape-room.git
cd trapped-escape-room

2. Configurar la base de datos

Para que el sistema funcione, es necesario crear la base de datos y sus tablas a partir del script incluido en el repositorio.

Abrir MySQL Workbench y conectarse a una instancia local de MySQL Server.

Abrir el archivo database.sql, ubicado en la carpeta principal del proyecto.

Ejecutar el script mediante el botón de ejecución (icono del rayo).

El script creará la base de datos trapped_db y las tablas Administradores, Salas, Precios y Reservas. También cargará los registros iniciales correspondientes a las salas y sus tarifas.

3. Configurar y ejecutar el backend

Abrir una terminal y acceder a la carpeta del backend:

cd backend

Instalar las dependencias:

npm install

Crear un archivo llamado .env dentro de la carpeta backend, con los datos de conexión a MySQL:

PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=trapped_db

Reemplazar los valores de ejemplo por los datos correspondientes a la instalación local de MySQL.

Una vez configuradas las variables de entorno, iniciar el servidor:

npm run dev

El backend se ejecutará localmente en el puerto 3000. En la terminal debería aparecer el mensaje de conexión exitosa a la base de datos.

Importante: El archivo .env contiene datos de conexión locales y no debe subirse al repositorio de GitHub.

4. Configurar y ejecutar el frontend

Abrir una segunda terminal y acceder a la carpeta del frontend:

cd frontend

Instalar las dependencias:

npm install

Iniciar el servidor de desarrollo:

npm run dev

Vite mostrará en la terminal la dirección local desde la cual se puede acceder a la aplicación (generalmente http://localhost:5173). Abrir esa dirección en el navegador para utilizar el sistema.

Importante: Para que el sistema funcione correctamente, el backend y el frontend deben estar ejecutándose al mismo tiempo, en terminales separadas.

🔌 Endpoints principales de la API

El backend cuenta con los siguientes endpoints para gestionar la información del sistema:

GET /api/salas: obtiene el listado de salas que se encuentran activas.

GET /api/precios: obtiene las tarifas disponibles según la cantidad de participantes.

GET /api/reservas/disponibilidad: consulta los horarios ocupados para una sala y una fecha determinadas. Para realizar esta consulta se utilizan los parámetros id_sala y fecha. La información obtenida permite mostrar al usuario únicamente los horarios disponibles.

POST /api/reservas: permite registrar una nueva reserva. Antes de guardarla, el servidor verifica que la tarifa corresponda a la cantidad de participantes seleccionada y que el horario continúe disponible.

🔄 Funcionamiento general

El usuario selecciona una sala y accede a su detalle. Desde allí puede iniciar una reserva, elegir la cantidad de participantes, consultar el precio correspondiente y seleccionar una fecha y un horario disponible.

Al enviar el formulario, los datos se envían al backend, que consulta la tarifa correspondiente en la base de datos y vuelve a verificar que el horario no esté ocupado. Si las validaciones son correctas, la reserva se registra en MySQL.