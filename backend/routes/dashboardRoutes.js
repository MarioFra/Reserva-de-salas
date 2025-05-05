const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para asegurar respuestas JSON
router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estadísticas del dashboard
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router; 