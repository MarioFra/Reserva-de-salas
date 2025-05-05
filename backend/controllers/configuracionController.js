const Configuracion = require('../models/Configuracion');

// Obtener la configuración actual
exports.getConfiguracion = async (req, res) => {
    try {
        let configuracion = await Configuracion.findOne();

        // Si no existe configuración, crear una por defecto
        if (!configuracion) {
            configuracion = await Configuracion.create({});
        }

        res.json(configuracion);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({ mensaje: 'Error al obtener la configuración' });
    }
};

// Actualizar la configuración
exports.updateConfiguracion = async (req, res) => {
    try {
        const configuracion = await Configuracion.findOne();

        if (!configuracion) {
            // Si no existe, crear nueva configuración
            const nuevaConfiguracion = await Configuracion.create(req.body);
            return res.json(nuevaConfiguracion);
        }

        // Actualizar la configuración existente
        Object.assign(configuracion, req.body);
        await configuracion.save();

        res.json(configuracion);
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la configuración' });
    }
};

// Verificar estado de mantenimiento
exports.checkMaintenance = async (req, res) => {
    try {
        const configuracion = await Configuracion.findOne();

        if (!configuracion || !configuracion.mantenimiento.modoMantenimiento) {
            return res.json({ enMantenimiento: false });
        }

        res.json({
            enMantenimiento: true,
            mensaje: configuracion.mantenimiento.mensajeMantenimiento,
            fechaInicio: configuracion.mantenimiento.fechaInicioMantenimiento,
            fechaFin: configuracion.mantenimiento.fechaFinMantenimiento
        });
    } catch (error) {
        console.error('Error al verificar mantenimiento:', error);
        res.status(500).json({ mensaje: 'Error al verificar el estado de mantenimiento' });
    }
}; 