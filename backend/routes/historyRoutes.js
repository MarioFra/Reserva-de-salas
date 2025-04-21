// routes/historyRoutes.js
const express = require('express');
const History = require('../models/History');
const router = express.Router();

// Crear un nuevo registro de historial
router.post('/', async (req, res) => {
  const { reservaId, acción, detalles } = req.body;

  try {
    const newHistory = new History({ reservaId, acción, detalles, timestamp: new Date() });
    const historySaved = await newHistory.save();
    res.status(201).json(historySaved);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el historial', error: err });
  }
});

// Obtener todos los registros de historial
router.get('/', async (req, res) => {
  try {
    const histories = await History.find().populate('reservaId');
    res.status(200).json(histories);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el historial', error: err });
  }
});

module.exports = router;
