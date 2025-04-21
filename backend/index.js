// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors'); // Para habilitar CORS

// Importar las rutas
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const historyRoutes = require('./routes/historyRoutes');
const faqRoutes = require('./routes/faqRoutes');
const app = express();
app.use(express.json()); // Para que Express pueda procesar datos JSON

// Habilitar CORS
app.use(cors()); // Esto permite que el frontend pueda hacer solicitudes al backend

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Registrar las rutas
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/faq', faqRoutes);

// Middleware para manejo de errores (debe ir después de las rutas)
const errorHandler = (err, req, res, next) => {
  console.error(err);  // Opcional: puedes registrar el error en la consola

  // Si el error tiene un statusCode, lo usa, si no, usa 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Algo salió mal en el servidor';

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

// Registrar el middleware de errores (después de las rutas)
app.use(errorHandler);

// Configurar el puerto de la aplicación
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
