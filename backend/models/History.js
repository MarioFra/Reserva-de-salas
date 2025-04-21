// models/History.js
const { Schema, model } = require('mongoose');

const historySchema = new Schema(
  {
    reservaId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true },
    accion: { type: String, enum: ['creada', 'modificada', 'cancelada'], required: true },
    detalles: { type: String },
    usuarioResponsable: { type: String }
  },
  { timestamps: true }
);

module.exports = model('History', historySchema);
