const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Intento de login con:', { email, password });

        // Validar campos requeridos
        if (!email || !password) {
            console.log('Campos incompletos');
            return res.status(400).json({
                message: 'Email y contraseña son requeridos',
                error: 'Campos incompletos'
            });
        }

        // Buscar administrador por email
        const admin = await Admin.findOne({ email });
        console.log('Admin encontrado:', admin ? {
            id: admin._id,
            email: admin.email,
            password: admin.password
        } : 'No encontrado');

        if (!admin) {
            console.log('Admin no encontrado');
            return res.status(401).json({
                message: 'Credenciales inválidas',
                error: 'Admin no encontrado'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Contraseña correcta:', isMatch);
        console.log('Contraseña proporcionada:', password);
        console.log('Contraseña almacenada:', admin.password);

        if (!isMatch) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({
                message: 'Credenciales inválidas',
                error: 'Contraseña incorrecta'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            'tu_clave_secreta_jwt',
            { expiresIn: '1h' }
        );

        console.log('Login exitoso, token generado');
        res.json({
            message: 'Login exitoso',
            token,
            admin: {
                id: admin._id,
                nombre: admin.nombre,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Error en loginAdmin:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

module.exports = {
    loginAdmin
}; 