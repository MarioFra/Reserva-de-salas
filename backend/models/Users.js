const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  rol: { type: String, required: true, enum: ['administrador', 'usuario'] },
  isActive: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
