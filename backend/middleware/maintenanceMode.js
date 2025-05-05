const Configuracion = require('../models/Configuracion');

const maintenanceMode = async (req, res, next) => {
    try {
        // Obtener la configuración del sistema
        const configuracion = await Configuracion.findOne();

        // Si no hay configuración o el modo mantenimiento está desactivado, continuar
        if (!configuracion || !configuracion.mantenimiento.modoMantenimiento) {
            return next();
        }

        // Verificar si la ruta actual es para el panel de administración
        if (req.path.startsWith('/api/admin')) {
            return next(); // Permitir acceso a rutas de administración
        }

        // Si estamos en modo mantenimiento, devolver error 503
        res.status(503).json({
            error: true,
            mensaje: configuracion.mantenimiento.mensajeMantenimiento || 'El sistema está en mantenimiento. Por favor, intente más tarde.',
            fechaInicio: configuracion.mantenimiento.fechaInicioMantenimiento,
            fechaFin: configuracion.mantenimiento.fechaFinMantenimiento
        });
    } catch (error) {
        console.error('Error en middleware de mantenimiento:', error);
        next();
    }
};

module.exports = maintenanceMode; 