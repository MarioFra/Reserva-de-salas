const Room = require('../models/Room');

// Obtener todas las salas
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

// Crear una nueva sala
const createRoom = async (req, res, next) => {
  try {
    const { nombre, ubicacion, capacidad, equipamiento } = req.body;

    const newRoom = new Room({ nombre, ubicacion, capacidad, equipamiento });
    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllRooms, createRoom };
