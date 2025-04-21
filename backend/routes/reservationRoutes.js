const express = require('express');
const Reservation = require('../models/Reservation');
const router = express.Router();
const { enviarConfirmacionReserva, enviarInvitaciones } = require('../utils/emailService');

// Ruta para crear una reserva
router.post('/', async (req, res) => {
  console.log("Datos recibidos para nueva reserva:", req.body);
  const { nave, sala, fecha, horaInicio, horaFin, nombre, correo, motivo, invitados, contraseña } = req.body;

  try {
    // Validar que la fecha tenga el formato correcto (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }

    // Filtrar invitados vacíos
    const invitadosFiltrados = (invitados || []).filter(invitado => invitado && invitado.trim() !== '');

    const newReservation = new Reservation({
      nave,
      sala,
      fecha: fecha, // Guardamos la fecha como string
      horaInicio,
      horaFin,
      nombre,
      correo,
      motivo,
      invitados: invitadosFiltrados,
      contraseña,
      estado: "activa"
    });

    console.log("Nueva reserva a guardar:", newReservation);
    const savedReservation = await newReservation.save();
    console.log("Reserva guardada exitosamente:", savedReservation);

    // Enviar correos (ahora no lanzan errores)
    try {
      await enviarConfirmacionReserva(savedReservation);
      if (invitadosFiltrados.length > 0) {
        await enviarInvitaciones(savedReservation);
      }
    } catch (emailError) {
      console.error("Error al enviar correos, pero la reserva se creó:", emailError);
    }

    res.status(201).json(savedReservation);
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ error: "Hubo un error al crear la reserva", details: error.message });
  }
});

// Ruta para obtener reservas con filtros
router.get('/', async (req, res) => {
  try {
    console.log("Recibida solicitud GET con filtros:", req.query);

    // Construir el filtro de MongoDB
    const filtro = {};

    if (req.query.nave) {
      filtro.nave = req.query.nave;
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

      console.log("Fecha seleccionada:", fechaSeleccionada);
      console.log("Tipo de filtro:", tipoFiltro);

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

    console.log("Filtro de MongoDB:", JSON.stringify(filtro, null, 2));

    // Obtener las reservas con los filtros aplicados
    const reservas = await Reservation.find(filtro);
    console.log(`Se encontraron ${reservas.length} reservas con los filtros aplicados`);

    // Formatear las reservas para el frontend
    const reservasFormateadas = reservas.map(reserva => {
      try {
        return {
          _id: reserva._id,
          fecha: reserva.fecha,
          horaInicio: reserva.horaInicio,
          horaFin: reserva.horaFin,
          nave: reserva.nave,
          sala: reserva.sala,
          nombre: reserva.nombre,
          correo: reserva.correo,
          motivo: reserva.motivo,
          invitados: reserva.invitados,
          estado: reserva.estado
        };
      } catch (error) {
        console.error("Error al procesar reserva:", error);
        return null;
      }
    }).filter(reserva => reserva !== null);

    console.log("Primeras 3 reservas formateadas:", reservasFormateadas.slice(0, 3));
    res.json(reservasFormateadas);
  } catch (error) {
    console.error("Error al obtener las reservas:", error);
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
  const { contraseña, nave, sala, fecha, horaInicio, horaFin, motivo, invitados, cambios } = req.body;

  try {
    // Buscar la reserva por ID
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Validar la contraseña antes de editar
    if (reservation.contraseña !== contraseña) {
      return res.status(403).json({ message: 'Contraseña incorrecta' });
    }

    // Filtrar invitados vacíos
    const invitadosFiltrados = (invitados || []).filter(invitado => invitado && invitado.trim() !== '');

    // Actualizar los campos de la reserva
    if (nave) reservation.nave = nave;
    if (sala) reservation.sala = sala;
    if (fecha) reservation.fecha = fecha;
    if (horaInicio) reservation.horaInicio = horaInicio;
    if (horaFin) reservation.horaFin = horaFin;
    if (motivo) reservation.motivo = motivo;
    if (invitados) reservation.invitados = invitadosFiltrados;

    const updatedReservation = await reservation.save();

    // Enviar correo de actualización con los cambios
    try {
      await enviarConfirmacionReserva(updatedReservation, cambios);
      if (invitadosFiltrados.length > 0) {
        await enviarInvitaciones(updatedReservation);
      }
    } catch (emailError) {
      console.error("Error al enviar correos de actualización:", emailError);
    }

    res.status(200).json({ message: 'Reserva actualizada exitosamente', data: updatedReservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la reserva', error });
  }
});

// Ruta para eliminar una reserva
router.delete('/:id', async (req, res) => {
  const { contraseña } = req.body;

  try {
    // Buscar la reserva por ID
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Validar la contraseña antes de eliminar
    if (reservation.contraseña !== contraseña) {
      return res.status(403).json({ message: 'Contraseña incorrecta' });
    }

    // Eliminar la reserva
    await Reservation.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la reserva', error });
  }
});

// Ruta para verificar la contraseña de una reserva
router.post('/:id/verificar-password', async (req, res) => {
  try {
    const { contraseña } = req.body;
    console.log('ID de reserva recibido:', req.params.id);
    console.log('Contraseña recibida:', contraseña);

    const reserva = await Reservation.findById(req.params.id);
    console.log('Reserva encontrada:', reserva);

    if (!reserva) {
      console.log('Reserva no encontrada para el ID:', req.params.id);
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reserva.contraseña !== contraseña) {
      console.log('Contraseña incorrecta para la reserva:', reserva._id);
      return res.status(403).json({ message: 'Contraseña incorrecta' });
    }

    console.log('Contraseña verificada correctamente para la reserva:', reserva._id);
    res.status(200).json({ message: 'Contraseña correcta' });
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    res.status(500).json({ message: 'Error al verificar la contraseña' });
  }
});

module.exports = router;