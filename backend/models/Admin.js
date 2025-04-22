/**
 * Modelo de Administrador
 * Define la estructura y validaciones para los administradores del sistema
 */

const mongoose = require('mongoose');

/**
 * Esquema de Administrador
 * Define los campos y sus validaciones para el modelo de administrador
 */
const adminSchema = new mongoose.Schema({
    // Nombre completo del administrador
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
    },

    // Email del administrador (usado para login)
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
    },

    // Contraseña hasheada
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },

    // Fecha de creación del registro
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Última actualización del registro
    updatedAt: {
        type: Date,
        default: Date.now
    },

    // Estado del administrador (activo/inactivo)
    isActive: {
        type: Boolean,
        default: true
    }
});

// Middleware para actualizar la fecha de modificación antes de guardar
adminSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Exportar el modelo
module.exports = mongoose.model('Admin', adminSchema); 