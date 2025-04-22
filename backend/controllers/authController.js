/**
 * Controlador de autenticación
 * Maneja las operaciones relacionadas con el inicio de sesión y autenticación
 */

const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Función para iniciar sesión como administrador
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Respuesta JSON con token y datos del administrador
 */
const loginAdmin = async (req, res) => {
    try {
        // Extraer credenciales del cuerpo de la solicitud
        const { email, password } = req.body;
        console.log('🔑 Intento de login con:', { email });

        // Validar campos requeridos
        if (!email || !password) {
            console.log('❌ Campos incompletos');
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos',
                error: 'Campos incompletos'
            });
        }

        // Buscar administrador en la base de datos
        const admin = await Admin.findOne({ email });
        console.log('🔍 Admin encontrado:', admin ? 'Sí' : 'No');

        if (!admin) {
            console.log('❌ Admin no encontrado');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
                error: 'Admin no encontrado'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('🔐 Contraseña correcta:', isMatch ? 'Sí' : 'No');

        if (!isMatch) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
                error: 'Contraseña incorrecta'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ Login exitoso');
        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            admin: {
                id: admin._id,
                nombre: admin.nombre,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('❌ Error en loginAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

module.exports = {
    loginAdmin
}; 