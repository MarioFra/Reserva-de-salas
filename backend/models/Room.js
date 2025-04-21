const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  nombre: String,
  ubicacion: String,
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
