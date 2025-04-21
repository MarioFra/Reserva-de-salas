const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  nave: String,
  sala: String,
  fecha: {
    type: String,
    required: true
  },
  horaInicio: String,
  horaFin: String,
  nombre: String,
  correo: String,
  motivo: String,
  invitados: [String],  // O cualquier tipo de dato apropiado
  contraseña: String,
  estado: { type: String, default: 'activa' }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
