const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema({
    sistema: {
        nombreEmpresa: {
            type: String,
            default: 'Salas Juntas'
        },
        logo: {
            type: String,
            default: ''
        },
        tema: {
            type: String,
            enum: ['claro', 'oscuro', 'sistema'],
            default: 'claro'
        },
        idioma: {
            type: String,
            enum: ['es', 'en'],
            default: 'es'
        },
        zonaHoraria: {
            type: String,
            default: 'America/Mexico_City'
        }
    },
    mantenimiento: {
        modoMantenimiento: {
            type: Boolean,
            default: false
        },
        mensajeMantenimiento: {
            type: String,
            default: 'El sistema está en mantenimiento. Por favor, intente más tarde.'
        },
        fechaInicioMantenimiento: {
            type: Date
        },
        fechaFinMantenimiento: {
            type: Date
        },
        correosNotificacion: [{
            type: String
        }]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Configuracion', configuracionSchema); 