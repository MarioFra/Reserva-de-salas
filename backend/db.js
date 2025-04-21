const mongoose = require('mongoose');

// Reemplaza la URL con tu conexión de MongoDB
const MONGO_URI = 'mongodb://localhost:27017/reserva_salas';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch((error) => console.error('Error al conectar a MongoDB:', error));
