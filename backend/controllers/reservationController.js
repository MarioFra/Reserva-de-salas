const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { enviarConfirmacionReserva, enviarInvitaciones } = require('../utils/emailService');

// Función para verificar disponibilidad de sala
const verificarDisponibilidad = async (ubicacion, sala, fecha, horaInicio, horaFin) => {
  try {
    // Verificando disponibilidad

    // Buscar reservas existentes para la misma sala y fecha
    const reservasExistentes = await Reservation.find({
      ubicacion,
      sala,
      fecha,
      estado: 'activa',
      $or: [
        // Caso 1: La nueva reserva comienza durante una reserva existente
        {
          horaInicio: { $lte: horaInicio },
          horaFin: { $gt: horaInicio }
        },
        // Caso 2: La nueva reserva termina durante una reserva existente
        {
          horaInicio: { $lt: horaFin },
          horaFin: { $gte: horaFin }
        },
        // Caso 3: La nueva reserva contiene completamente una reserva existente
        {
          horaInicio: { $gte: horaInicio },
          horaFin: { $lte: horaFin }
        }
      ]
    });

    // Verificación de reservas existentes completada
    return reservasExistentes.length === 0;
  } catch (error) {
    // Error al verificar disponibilidad
    throw error;
  }
};

// Crear una nueva reserva
const createReservation = async (req, res, next) => {
  try {
    // Procesando datos para nueva reserva
    const { ubicacion, sala, fecha, horaInicio, horaFin, nombre, correo, motivo, invitados, contraseña } = req.body;

    // Validar campos requeridos
    if (!ubicacion || !sala || !fecha || !horaInicio || !horaFin || !nombre || !correo || !motivo || !contraseña) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos, incluyendo la contraseña'
      });
    }

    // Verificar que la sala exista
    const room = await Room.findOne({ nombre: sala, ubicacion: ubicacion });
    if (!room) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    // Verificar disponibilidad
    const disponible = await verificarDisponibilidad(ubicacion, sala, fecha, horaInicio, horaFin);
    if (!disponible) {
      return res.status(400).json({
        message: 'La sala no está disponible en el horario seleccionado'
      });
    }

    // Crear nueva reserva
    const nuevaReserva = new Reservation({
      ubicacion: ubicacion,
      sala: sala,
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: horaFin,
      nombre: nombre,
      correo: correo,
      motivo: motivo,
      invitados: invitados || [],
      contraseña: contraseña,
      estado: 'activa'
    });

    // Guardando nueva reserva
    const savedReservation = await nuevaReserva.save();
    // Reserva guardada exitosamente

    // Enviar correos de confirmación
    try {
      // Enviando correo de confirmación
      await enviarConfirmacionReserva(savedReservation);
      
      if (savedReservation.invitados && savedReservation.invitados.length > 0) {
        // Enviando invitaciones a los invitados
        await enviarInvitaciones(savedReservation);
      }
      // Correos enviados exitosamente
    } catch (emailError) {
      // Error al enviar correos de confirmación
      // No retornamos error aquí para no fallar la reserva si el correo falla
    }

    return res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: savedReservation
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear la reserva',
      error: error.message
    });
  }
};

// Obtener todas las reservas
const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    console.error('Error al obtener reservas:', err);
    res.status(500).json({
      message: 'Error al obtener las reservas',
      error: err.message
    });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  verificarDisponibilidad
};
