const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Crear nuevo administrador
const createAdmin = async (req, res, next) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                message: 'Todos los campos son requeridos',
                error: 'Campos incompletos'
            });
        }

        // Verificar si el email ya existe
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                message: 'El email ya está registrado',
                error: 'Email duplicado'
            });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo administrador
        const newAdmin = new Admin({
            nombre,
            email,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({
            message: 'Administrador creado exitosamente',
            admin: {
                id: newAdmin._id,
                nombre: newAdmin.nombre,
                email: newAdmin.email
            }
        });
    } catch (error) {
        console.error('Error en createAdmin:', error);
        res.status(500).json({
            message: 'Error al crear administrador',
            error: error.message
        });
    }
};

// Obtener todos los administradores
const getAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json(admins);
    } catch (error) {
        console.error('Error en getAdmins:', error);
        res.status(500).json({
            message: 'Error al obtener administradores',
            error: error.message
        });
    }
};

// Eliminar administrador
const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Admin.findByIdAndDelete(id);
        res.json({ message: 'Administrador eliminado exitosamente' });
    } catch (error) {
        console.error('Error en deleteAdmin:', error);
        res.status(500).json({
            message: 'Error al eliminar administrador',
            error: error.message
        });
    }
};

module.exports = {
    createAdmin,
    getAdmins,
    deleteAdmin
}; 