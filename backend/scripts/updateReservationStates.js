require('dotenv').config();
const mongoose = require('mongoose');
const { actualizarEstadosReservas } = require('../utils/reservationUtils');

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Conectado a la base de datos');
        try {
            await actualizarEstadosReservas();
            console.log('Actualización completada');
            process.exit(0);
        } catch (error) {
            console.error('Error en la actualización:', error);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    }); 