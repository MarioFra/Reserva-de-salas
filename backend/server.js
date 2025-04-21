const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:5173', // URL del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Rutas
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    console.log('Solicitud de salud recibida');
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.url}`);
    res.status(404).json({
        message: 'Ruta no encontrada',
        path: req.url
    });
});

// Conectar a MongoDB
console.log('Intentando conectar a MongoDB...');
mongoose.connect('mongodb://localhost:27017/reserva_salas', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('❌ Error al conectar a MongoDB:', error);
    });

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('Rutas disponibles:');
    console.log('- GET /api/health');
    console.log('- POST /api/admin/login');
    console.log('- POST /api/admin/create');
    console.log('- GET /api/admin');
    console.log('- DELETE /api/admin/:id');
}); 