const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const User = require('../models/Users');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Iniciando getDashboardStats...');

        // Verificar autenticación
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('No se encontró token de autenticación');
            return res.status(401).json({
                success: false,
                message: 'No autorizado: Token no proporcionado'
            });
        }

        // Obtener total de salas
        const totalRooms = await Room.countDocuments();
        console.log('Total de salas:', totalRooms);

        // Obtener salas disponibles (no reservadas hoy)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservedRoomsToday = await Reservation.distinct('salaId', {
            fecha: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        const availableRooms = totalRooms - reservedRoomsToday.length;
        console.log('Salas disponibles:', availableRooms);

        // Obtener reservas del día actual
        const reservationsToday = await Reservation.countDocuments({
            fecha: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        console.log('Reservas hoy:', reservationsToday);

        // Obtener usuarios activos
        const activeUsers = await User.countDocuments({ isActive: true });
        console.log('Usuarios activos:', activeUsers);

        // Obtener próximas reservas (próximos 7 días)
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingReservations = await Reservation.find({
            fecha: {
                $gte: today,
                $lt: nextWeek
            }
        })
            .sort({ fecha: 1, horaInicio: 1 })
            .limit(5)
            .populate('salaId', 'nombre')
            .populate('usuarioId', 'nombre');
        console.log('Próximas reservas:', upcomingReservations.length);

        // Obtener salas más utilizadas
        const mostUsedRooms = await Reservation.aggregate([
            {
                $group: {
                    _id: '$salaId',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $unwind: '$room'
            },
            {
                $project: {
                    _id: '$room._id',
                    nombre: '$room.nombre',
                    reservas: '$count'
                }
            }
        ]);
        console.log('Salas más utilizadas:', mostUsedRooms.length);

        // Obtener reservas por nave
        const reservationsByLocation = await Reservation.aggregate([
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'salaId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $unwind: '$room'
            },
            {
                $group: {
                    _id: '$room.ubicacion',
                    count: { $sum: 1 }
                }
            }
        ]);

        const reservationsByNave = {};
        reservationsByLocation.forEach(item => {
            reservationsByNave[item._id] = item.count;
        });
        console.log('Reservas por nave:', reservationsByNave);

        const response = {
            totalReservas: await Reservation.countDocuments(),
            reservasHoy: reservationsToday,
            salasDisponibles: availableRooms,
            usuariosActivos: activeUsers,
            reservasProximas: upcomingReservations.map(res => ({
                _id: res._id,
                sala: res.salaId?.nombre || 'Sala no especificada',
                fecha: res.fecha,
                horaInicio: res.horaInicio,
                usuario: res.usuarioId?.nombre || 'Usuario no especificado'
            })),
            salasMasUtilizadas: mostUsedRooms,
            reservasPorNave: reservationsByNave
        };

        console.log('Respuesta final:', response);
        res.json(response);

    } catch (error) {
        console.error('Error detallado en getDashboardStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas del dashboard',
            error: error.message
        });
    }
}; 