/**
 * Archivo principal del servidor backend
 * Configura y ejecuta el servidor Express con MongoDB
 */

// Importación de dependencias
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

// Importación de rutas
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const historyRoutes = require('./routes/historyRoutes');
const faqRoutes = require('./routes/faqRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Inicialización de la aplicación Express
const app = express();

// Middleware global
app.use(express.json()); // Permite procesar datos JSON en las solicitudes
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend

/**
 * Conexión a la base de datos MongoDB
 * Utiliza la URI definida en las variables de entorno
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

/**
 * Registro de rutas de la API
 * Cada ruta está prefijada con /api para mejor organización
 */
app.use('/api/users', userRoutes);      // Rutas para gestión de usuarios
app.use('/api/rooms', roomRoutes);      // Rutas para gestión de salas
app.use('/api/reservations', reservationRoutes); // Rutas para gestión de reservas
app.use('/api/history', historyRoutes);  // Rutas para historial de acciones
app.use('/api/faq', faqRoutes);         // Rutas para preguntas frecuentes
app.use('/api/admin', adminRoutes);     // Rutas para administradores
app.use('/api/dashboard', dashboardRoutes);

/**
 * Middleware para manejo de errores
 * Captura y procesa los errores de forma centralizada
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Registro del middleware de errores
app.use(errorHandler);

/**
 * Inicio del servidor
 * Escucha en el puerto definido en las variables de entorno o 5000 por defecto
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📡 Rutas disponibles:');
  console.log('- /api/users');
  console.log('- /api/rooms');
  console.log('- /api/reservations');
  console.log('- /api/history');
  console.log('- /api/faq');
  console.log('- /api/admin');
  console.log('- /api/dashboard');
});
