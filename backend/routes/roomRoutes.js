// routes/roomRoutes.js
const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

// Crear una nueva sala
router.post('/', async (req, res) => {
  const { nombre, ubicación } = req.body;

  try {
    const newRoom = new Room({ nombre, ubicación });
    const roomSaved = await newRoom.save();
    res.status(201).json(roomSaved);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la sala', error: err });
  }
});

// Obtener todas las salas
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las salas', error: err });
  }
});

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
router.put('/:id', async (req, res) => {
  const { nombre, ubicación } = req.body;

  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { nombre, ubicación },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    res.status(200).json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la sala', error: err });
  }
});

// Eliminar una sala
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }
    res.status(200).json({ message: 'Sala eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la sala', error: err });
  }
});

module.exports = router;
