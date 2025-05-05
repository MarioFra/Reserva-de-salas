// routes/roomRoutes.js
const express = require('express');
const Room = require('../models/Room');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para asegurar respuestas JSON
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Ruta pública para obtener todas las salas
router.get('/', async (req, res) => {
  try {
    const salas = await Room.find();
    res.json(salas);
  } catch (error) {
    // Error al obtener las salas
    res.status(500).json({ message: 'Error al obtener las salas' });
  }
});

// Las demás rutas que requieren autenticación
router.use(authMiddleware);

// Crear una nueva sala
router.post('/', roomController.createRoom);

// Obtener una sala por ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la sala', error: err });
  }
});

// Actualizar una sala
router.put('/:id', roomController.updateRoom);

// Eliminar una sala
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
