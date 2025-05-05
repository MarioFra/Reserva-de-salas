const express = require('express');
const Reservation = require('../models/Reservation');
const router = express.Router();
const { enviarConfirmacionReserva, enviarInvitaciones, enviarConfirmacionCancelacion } = require('../utils/emailService');
const { verificarDisponibilidad, createReservation } = require('../controllers/reservationController');

// Ruta para crear una reserva
router.post('/', createReservation);

// Ruta para obtener reservas con filtros
router.get('/', async (req, res) => {
  try {
    // Procesando solicitud GET con filtros

    // Construir el filtro de MongoDB
    const filtro = {};

    if (req.query.ubicacion) {
      filtro.ubicacion = req.query.ubicacion;
    }

    if (req.query.sala) {
      filtro.sala = req.query.sala;
    }

    if (req.query.fecha) {
      const fechaSeleccionada = req.query.fecha;
      const tipoFiltro = req.query.tipo || 'dia';

      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaSeleccionada)) {
        return res.status(400).json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
      }

      // Procesando filtro de fecha

      switch (tipoFiltro) {
        case 'dia':
          filtro.fecha = fechaSeleccionada;
          break;

        case 'semana':
          const [year, month, day] = fechaSeleccionada.split('-');
          const fechaInicio = new Date(year, month - 1, day);
          const inicioSemana = new Date(fechaInicio);
          inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

          const finSemana = new Date(inicioSemana);
          finSemana.setDate(finSemana.getDate() + 6);

          filtro.fecha = {
            $gte: inicioSemana.toISOString().split('T')[0],
            $lte: finSemana.toISOString().split('T')[0]
          };
          break;

        case 'mes':
          const [yearMes, monthMes] = fechaSeleccionada.split('-');
          const inicioMes = `${yearMes}-${monthMes}-01`;
          const finMes = `${yearMes}-${monthMes}-31`;

          filtro.fecha = {
            $gte: inicioMes,
            $lte: finMes
          };
          break;
      }
    }

    // Filtro de MongoDB construido

    // Obtener las reservas con los filtros aplicados
    const reservas = await Reservation.find(filtro);
    // Reservas encontradas con los filtros aplicados

    // Formatear las reservas para el frontend
    const reservasFormateadas = reservas.map(reserva => {
      try {
        return {
          _id: reserva._id,
          fecha: reserva.fecha,
          horaInicio: reserva.horaInicio,
          horaFin: reserva.horaFin,
          ubicacion: reserva.ubicacion,
          sala: reserva.sala,
          nombre: reserva.nombre,
          correo: reserva.correo,
          motivo: reserva.motivo,
          invitados: reserva.invitados,
          estado: reserva.estado,
          contraseña: reserva.contraseña
        };
      } catch (error) {
        // Error al procesar reserva
        return null;
      }
    }).filter(reserva => reserva !== null);

    // Reservas formateadas correctamente
    res.json(reservasFormateadas);
  } catch (error) {
    // Error al obtener las reservas
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener una reserva por ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la reserva', error });
  }
});

// Ruta para cancelar una reserva
router.put('/:id/cancelar', async (req, res) => {
  const { contraseña } = req.body;

  try {
    // Buscar la reserva por ID
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Validar la contraseña antes de cancelar
    if (reservation.contraseña !== contraseña) {
      return res.status(403).json({ message: 'Contraseña incorrecta' });
    }

    // Actualizar el estado de la reserva a 'cancelada'
    reservation.estado = 'cancelada';
    await reservation.save();

    res.status(200).json({ message: 'Reserva cancelada exitosamente', data: reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar la reserva', error });
  }
});

// Ruta para modificar una reserva
router.put('/:id/editar', async (req, res) => {
  const { contraseña, ubicacion, sala, fecha, horaInicio, horaFin, motivo, invitados, cambios } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Buscar la reserva por ID
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Solo validar contraseña si no es un admin
    if (!token) {
      if (reservation.contraseña !== contraseña) {
        return res.status(403).json({ message: 'Contraseña incorrecta' });
      }
    }

    // Filtrar invitados vacíos
    const invitadosFiltrados = (invitados || []).filter(invitado => invitado && invitado.trim() !== '');

    // Actualizar los campos de la reserva
    if (ubicacion) reservation.ubicacion = ubicacion;
    if (sala) reservation.sala = sala;
    if (fecha) reservation.fecha = fecha;
    if (horaInicio) reservation.horaInicio = horaInicio;
    if (horaFin) reservation.horaFin = horaFin;
    if (motivo) reservation.motivo = motivo;
    if (invitados) reservation.invitados = invitadosFiltrados;

    const updatedReservation = await reservation.save();

    // Enviar correo de actualización con los cambios
    try {
      // Pasar true como segundo parámetro para indicar que es una actualización
      await enviarConfirmacionReserva(updatedReservation, true);
      if (invitadosFiltrados.length > 0) {
        await enviarInvitaciones(updatedReservation);
      }
    } catch (emailError) {
      // Error al enviar correos de actualización
    }

    res.status(200).json({ message: 'Reserva actualizada exitosamente', data: updatedReservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la reserva', error });
  }
});

// Ruta para eliminar una reserva
router.delete('/:id', async (req, res) => {
  const { contraseña } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Buscar la reserva por ID
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Solo validar contraseña si no es un admin
    if (!token) {
      if (reservation.contraseña !== contraseña) {
        return res.status(403).json({ message: 'Contraseña incorrecta' });
      }
    }

    // Guardar una copia de la reserva antes de eliminarla para enviar el correo
    const reservaEliminada = { ...reservation.toObject() };
    
    // Eliminar la reserva
    await Reservation.findByIdAndDelete(req.params.id);
    
    // Enviar correo de confirmación de cancelación
    try {
      await enviarConfirmacionCancelacion(reservaEliminada);
    } catch (emailError) {
      // Error al enviar correo de cancelación
      // Continuamos con la respuesta exitosa aunque el correo falle
    }

    res.status(200).json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la reserva', error });
  }
});

// Ruta para verificar la contraseña de una reserva
router.post('/:id/verificar-password', async (req, res) => {
  try {
    const { contraseña } = req.body;
    // Verificando ID y contraseña recibidos
    const reserva = await Reservation.findById(req.params.id);

    if (!reserva) {
      // Reserva no encontrada
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reserva.contraseña !== contraseña) {
      // Contraseña incorrecta
      return res.status(403).json({ message: 'Contraseña incorrecta' });
    }

    // Contraseña verificada correctamente
    res.status(200).json({ message: 'Contraseña correcta' });
  } catch (error) {
    // Error al verificar contraseña
    res.status(500).json({ message: 'Error al verificar la contraseña' });
  }
});

// Ruta para verificar disponibilidad
router.post('/verificar-disponibilidad', async (req, res) => {
  try {
    const { ubicacion, sala, fecha, horaInicio, horaFin } = req.body;
    // Verificando disponibilidad con los datos recibidos

    if (!ubicacion || !sala || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({
        disponible: false,
        mensaje: 'Todos los campos son requeridos para verificar disponibilidad'
      });
    }

    const disponible = await verificarDisponibilidad(ubicacion, sala, fecha, horaInicio, horaFin);
    console.log('Resultado de disponibilidad:', disponible);

    res.json({
      disponible,
      mensaje: disponible ? 'La sala está disponible' : 'La sala no está disponible en el horario seleccionado'
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({
      disponible: false,
      mensaje: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
});

module.exports = router;