const Room = require('../models/Room');

// Obtener todas las salas
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json(rooms);
  } catch (error) {
    // Error al obtener las salas
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las salas',
      error: error.message
    });
  }
};

// Crear una nueva sala
exports.createRoom = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const { nombre, ubicacion } = req.body;

    // Validar campos requeridos
    if (!nombre || !ubicacion) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y ubicación son requeridos'
      });
    }

    // Verificar si ya existe una sala con el mismo nombre en la misma ubicación
    const existingRoom = await Room.findOne({ nombre, ubicacion });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una sala con ese nombre en esa ubicación'
      });
    }

    // Crear nueva sala
    const newRoom = new Room({
      nombre,
      ubicacion
    });

    await newRoom.save();
    return res.status(201).json({
      success: true,
      message: 'Sala creada exitosamente',
      room: newRoom
    });
  } catch (error) {
    // Error al crear la sala
    return res.status(500).json({
      success: false,
      message: 'Error al crear la sala',
      error: error.message
    });
  }
};

// Actualizar una sala
exports.updateRoom = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const { nombre, ubicacion } = req.body;
    const roomId = req.params.id;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'ID de sala no proporcionado'
      });
    }

    const updateData = {
      nombre,
      ubicacion
    };

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sala actualizada exitosamente',
      room: updatedRoom
    });
  } catch (error) {
    // Error al actualizar la sala
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la sala',
      error: error.message
    });
  }
};

// Eliminar una sala
exports.deleteRoom = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const roomId = req.params.id;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'ID de sala no proporcionado'
      });
    }

    const deletedRoom = await Room.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sala eliminada exitosamente'
    });
  } catch (error) {
    // Error al eliminar la sala
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la sala',
      error: error.message
    });
  }
};
