# Sistema de Reserva de Salas de Juntas

Este proyecto es un sistema para la gestión y reserva de salas de juntas. Permite a los usuarios reservar salas, recibir confirmaciones por correo electrónico, y a los administradores gestionar salas, reservas y usuarios.

## Plan de Desarrollo

### 1. Desarrollo del Backend

Se desarrolló la lógica del servidor utilizando Node.js y Express para manejar las reservas de salas y verificar la disponibilidad en tiempo real. La base de datos MongoDB se utilizó para almacenar las reservas, usuarios y la disponibilidad de las salas.

#### Componentes Implementados:

- **Estructura MVC**: Organización del código en Modelos, Vistas y Controladores para una mejor mantenibilidad
- **API RESTful**: Endpoints para gestión de salas, reservas y usuarios
- **Autenticación**: Sistema de autenticación con JWT para proteger rutas de administración
- **Validación de Datos**: Verificación de disponibilidad en tiempo real para evitar conflictos de horarios
- **Servicio de Correo**: Implementación de Nodemailer para envío de confirmaciones, actualizaciones y cancelaciones
- **Middleware de Seguridad**: Protección de rutas y validación de permisos
- **Controladores Especializados**: Lógica separada para cada entidad del sistema (salas, reservas, usuarios, etc.)

### 2. Desarrollo del Frontend

Utilizando React.js, se creó una interfaz amigable y accesible para los usuarios, permitiéndoles consultar la disponibilidad de las salas y realizar reservas. Se integraron librerías para ofrecer una experiencia de usuario moderna y eficiente, priorizando la implementación de un diseño responsivo que se ajusta a diferentes tamaños de pantalla.

#### Componentes Implementados:

- **Interfaz de Usuario Intuitiva**: Diseño centrado en el usuario con navegación clara
- **Calendario Interactivo**: Visualización de reservas con filtros por ubicación y sala
- **Formularios de Reserva**: Interfaz para crear y editar reservas con validación en tiempo real
- **Panel de Administración**: Dashboard completo para gestión de salas, reservas y usuarios
- **Sistema de Navegación**: Implementación de breadcrumbs para mejorar la experiencia de usuario
- **Diseño Responsivo**: Adaptación a diferentes dispositivos y tamaños de pantalla
- **Optimización de Rendimiento**: Eliminación de console.log y archivos no utilizados

## Características

- **Reserva de Salas**: Interfaz intuitiva para reservar salas con verificación de disponibilidad en tiempo real
- **Panel de Administración**: Gestión completa de salas, reservas y usuarios administradores
- **Notificaciones por Correo**: Envío automático de correos para confirmación de reservas, actualizaciones y cancelaciones
- **Calendario Interactivo**: Visualización de reservas en formato de calendario con filtros por ubicación y sala
- **Verificación de Disponibilidad**: Sistema que previene conflictos de horarios al crear o editar reservas
- **Autenticación Segura**: Sistema de autenticación con JWT para el acceso al panel de administración

## Mejoras Implementadas

### Verificación de Horarios Disponibles

Se implementó un sistema de verificación de horarios disponibles al editar una reserva. El sistema consulta las reservas existentes para la sala y fecha seleccionadas, y muestra solo los horarios disponibles en los selectores de hora de inicio y hora fin, deshabilitando aquellos que ya están ocupados por otras reservas. Esto mejora la experiencia de usuario al evitar conflictos de horarios durante la edición.

### Sistema de Notificaciones por Correo

Se desarrolló un sistema completo de notificaciones por correo electrónico que incluye:

- **Confirmación de Reservas Nuevas**: Envío de correos con los detalles de la reserva cuando se crea una nueva.
- **Confirmación de Actualizaciones**: Correos con título diferenciado ("Actualización de Reserva") cuando se modifica una reserva existente.
- **Confirmación de Cancelaciones**: Notificación automática cuando se cancela una reserva.

### Navegación Mejorada

- **Sistema de Breadcrumbs**: Implementación de migas de pan en el panel de administrador que muestran la ruta jerárquica actual (Dashboard > Sección actual).
- **Corrección de Rutas**: Optimización de la navegación en el dashboard de administrador para que los botones de Gestión de salas, Gestión de reservas y Gestión de usuarios funcionen correctamente.

### Optimización de Rendimiento

- **Eliminación de Console.log**: Se eliminaron todos los console.log tanto del frontend como del backend, reemplazándolos por comentarios descriptivos para mejorar el rendimiento.
- **Limpieza de Código**: Se identificaron y eliminaron archivos no utilizados como Reservar.css para mantener el código más limpio.

## Tecnologías Utilizadas

### Backend

- Node.js
- Express.js
- MongoDB (con Mongoose)
- JSON Web Tokens (JWT)
- Nodemailer

### Frontend

- React.js
- React Bootstrap
- React Big Calendar
- Axios
- Moment.js

## Requisitos Previos

- Node.js (v14.0.0 o superior)
- MongoDB (v4.0.0 o superior)
- Cuenta de correo electrónico para envío de notificaciones

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MarioFra/Reserva-de-salas.git
cd Reserva-de-salas
```

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
```

Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```
MONGODB_URI=mongodb://localhost:27017/reserva-salas
JWT_SECRET=tu_clave_secreta_para_jwt
PORT=5000
EMAIL_USER=tu_correo@ejemplo.com
EMAIL_PASSWORD=tu_contraseña_de_correo
```

### 3. Configurar el Frontend

```bash
cd ../frontend/salas

# Instalar dependencias
npm install
```

Si necesitas modificar la URL de la API, edita el archivo de configuración o las llamadas Axios en los componentes.

### 4. Iniciar la Aplicación en Modo Desarrollo

#### Backend

```bash
cd backend
npm run dev  # O 'npm start' si no tienes un script de desarrollo
```

#### Frontend

```bash
cd frontend/salas
npm start
```

## Despliegue en Producción

### 1. Construir el Frontend para Producción

```bash
cd frontend/salas
npm run build
```

### 2. Configurar el Servidor

#### Opción A: Servidor Único (Node.js)

1. Configura el backend para servir los archivos estáticos del frontend:

```javascript
// En backend/index.js
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend/salas/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/salas/build", "index.html"));
});
```

2. Inicia el servidor:

```bash
cd backend
npm start
```

#### Opción B: Servidor Web Separado (Nginx, Apache, etc.)

1. Configura tu servidor web para servir los archivos estáticos del frontend desde la carpeta `frontend/salas/build`

2. Configura un proxy para redirigir las peticiones API al backend:

Ejemplo para Nginx:

```
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /ruta/a/Reserva-de-salas/frontend/salas/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Configurar un Gestor de Procesos (PM2)

Para mantener la aplicación en ejecución:

```bash
npm install -g pm2
cd backend
pm2 start index.js --name "reserva-salas"
pm2 save
pm2 startup
```

## Configuración Inicial del Sistema

### Crear un Usuario Administrador

Para acceder al panel de administración, necesitarás crear un usuario administrador inicial. Puedes hacerlo mediante:

1. Acceder a la ruta de registro de administradores (si está habilitada)
2. Insertar directamente en la base de datos:

```javascript
db.admins.insertOne({
  nombre: "Admin Principal",
  email: "admin@ejemplo.com",
  password: "$2b$10$...", // Contraseña hasheada con bcrypt
  isActive: true,
});
```

### Crear Salas Iniciales

Para que los usuarios puedan realizar reservas, necesitarás crear algunas salas iniciales desde el panel de administración.

## Mantenimiento

### Respaldo de la Base de Datos

Es recomendable realizar respaldos periódicos de la base de datos:

```bash
mongodump --uri="mongodb://localhost:27017/reserva-salas" --out=/ruta/de/respaldo
```

### Actualización del Sistema

Para actualizar el sistema con nuevas versiones:

```bash
git pull
cd backend
npm install
cd ../frontend/salas
npm install
npm run build
```

## Solución de Problemas

### Problemas de Conexión a MongoDB

- Verifica que MongoDB esté en ejecución
- Comprueba la cadena de conexión en el archivo `.env`
- Asegúrate de que el usuario tenga permisos adecuados

### Problemas con el Envío de Correos

- Verifica las credenciales en el archivo `.env`
- Si usas Gmail, asegúrate de habilitar "Acceso de aplicaciones menos seguras" o usar contraseñas de aplicación

## Licencia

Este proyecto está licenciado bajo [Licencia MIT](LICENSE).

## Contacto

Para soporte o consultas, contacta a [tu_correo@ejemplo.com](mailto:tu_correo@ejemplo.com).
