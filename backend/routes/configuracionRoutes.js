const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Rutas protegidas que requieren autenticación y rol de administrador
router.get('/', verificarToken, esAdmin, configuracionController.getConfiguracion);
router.put('/', verificarToken, esAdmin, configuracionController.updateConfiguracion);

// Ruta pública para verificar el estado de mantenimiento
router.get('/maintenance', configuracionController.checkMaintenance);

module.exports = router; 