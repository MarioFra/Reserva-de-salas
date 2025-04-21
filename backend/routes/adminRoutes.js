const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta pública para login
router.post('/login', authController.loginAdmin);

// Rutas protegidas que requieren autenticación
router.post('/create', authMiddleware, adminController.createAdmin);
router.get('/', authMiddleware, adminController.getAdmins);
router.delete('/:id', authMiddleware, adminController.deleteAdmin);

module.exports = router; 