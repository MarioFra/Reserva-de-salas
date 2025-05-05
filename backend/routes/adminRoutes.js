const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para asegurar respuestas JSON
router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Ruta pública para login
router.post('/login', authController.loginAdmin);

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para administradores
router.get('/admins', adminController.getAdmins);
router.post('/admins/create', adminController.createAdmin);
router.put('/admins/:id', adminController.updateAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

module.exports = router; 