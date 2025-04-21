const Reservation = require('../models/Reservation');

// Obtener historial de reservas de un usuario
const getUserHistory = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;

    const history = await Reservation.find({ usuarioId }).populate('salaId');
    res.json(history);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserHistory };
