const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyToken } = require('../middleware/auth');

// Login de administrador
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar administrador por email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        console.log('Datos del administrador encontrado:', {
            id: admin._id,
            nombre: admin.nombre,
            email: admin.email,
            role: admin.role
        });

        // Generar token con todos los datos necesarios
        const tokenPayload = {
            id: admin._id,
            role: 'admin',
            nombre: admin.nombre,
            email: admin.email
        };

        console.log("Datos que se incluirán en el token:", tokenPayload);

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                nombre: admin.nombre,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener perfil del administrador
router.get('/profile', verifyToken, async (req, res) => {
    try {
        console.log('ID del usuario:', req.user.id);
        const admin = await Admin.findById(req.user.id);
        console.log('Administrador encontrado:', admin);

        if (!admin) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }

        // Devolver los datos del administrador
        const profileData = {
            _id: admin._id,
            nombre: admin.nombre,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
        };

        console.log('Datos del perfil a enviar:', profileData);
        res.json(profileData);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil del administrador' });
    }
});

// Obtener lista de usuarios
router.get('/users', verifyToken, async (req, res) => {
    try {
        const users = await Admin.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
});

module.exports = router; 