const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  rol: { type: String, required: true, enum: ['administrador', 'usuario'] },
  fechaCreacion: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
