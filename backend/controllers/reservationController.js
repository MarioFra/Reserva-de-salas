const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

// Crear una nueva reserva
const createReservation = async (req, res, next) => {
  try {
    const { usuarioId, salaId, fecha, horaInicio, horaFin, contraseña } = req.body;

    // Verificar si la sala está disponible
    const room = await Room.findById(salaId);
    if (!room) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    // Crear la reserva
    const newReservation = new Reservation({
      usuarioId,
      salaId,
      fecha,
      horaInicio,
      horaFin,
      contraseña,
      estado: 'pendiente',
    });

    await newReservation.save();

    res.status(201).json(newReservation);
  } catch (err) {
    next(err);
  }
};

// Obtener todas las reservas
const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().populate('usuarioId').populate('salaId');
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReservation, getAllReservations };
