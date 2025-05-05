const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Obtener todos los administradores
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, '-password');
        return res.status(200).json(admins);
    } catch (error) {
        console.error('Error en getAdmins:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los administradores',
            error: error.message
        });
    }
};

// Crear un nuevo administrador
exports.createAdmin = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Verificar si el email ya existe
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo administrador
        const newAdmin = new Admin({
            nombre,
            email,
            password: hashedPassword,
            isActive: true
        });

        await newAdmin.save();

        // No enviar la contraseña en la respuesta
        const adminResponse = {
            _id: newAdmin._id,
            nombre: newAdmin.nombre,
            email: newAdmin.email,
            isActive: newAdmin.isActive,
            createdAt: newAdmin.createdAt
        };

        return res.status(201).json({
            success: true,
            message: 'Administrador creado exitosamente',
            admin: adminResponse
        });
    } catch (error) {
        console.error('Error en createAdmin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear el administrador',
            error: error.message
        });
    }
};

// Actualizar un administrador
exports.updateAdmin = async (req, res) => {
    try {
        const { nombre, password, isActive } = req.body;
        const adminId = req.params.id;

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: 'ID de administrador no proporcionado'
            });
        }

        const updateData = { nombre, isActive };

        // Si se proporciona una nueva contraseña, encriptarla
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Administrador no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Administrador actualizado exitosamente',
            admin: updatedAdmin
        });
    } catch (error) {
        console.error('Error en updateAdmin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el administrador',
            error: error.message
        });
    }
};

// Eliminar un administrador
exports.deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: 'ID de administrador no proporcionado'
            });
        }

        const deletedAdmin = await Admin.findByIdAndDelete(adminId);
        if (!deletedAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Administrador no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Administrador eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en deleteAdmin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el administrador',
            error: error.message
        });
    }
}; 