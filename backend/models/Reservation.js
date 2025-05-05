const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es requerida']
  },
  sala: {
    type: String,
    required: [true, 'La sala es requerida']
  },
  fecha: {
    type: String,
    required: [true, 'La fecha es requerida']
  },
  horaInicio: {
    type: String,
    required: [true, 'La hora de inicio es requerida']
  },
  horaFin: {
    type: String,
    required: [true, 'La hora de fin es requerida']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido']
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido']
  },
  motivo: {
    type: String,
    required: [true, 'El motivo es requerido']
  },
  invitados: {
    type: [String],
    default: []
  },
  contraseña: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ['activa', 'cancelada'],
    default: 'activa'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
