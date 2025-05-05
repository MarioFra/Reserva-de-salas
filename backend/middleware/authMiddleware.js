/**
 * Middleware de autenticación
 * Verifica y valida los tokens JWT para proteger las rutas
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar la autenticación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void}
 */
const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header de autorización
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            // No se proporcionó token
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación',
                error: 'Token no encontrado'
            });
        }

        // Extraer el token del formato "Bearer <token>"
        const token = authHeader.split(' ')[1];

        if (!token) {
            // Formato de token inválido
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido',
                error: 'Token mal formado'
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Token verificado correctamente

        // Agregar la información del usuario a la solicitud
        req.user = decoded;
        next();
    } catch (error) {
        // Error en la autenticación

        // Manejar diferentes tipos de errores de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                error: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: 'Token inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error en la autenticación',
            error: error.message
        });
    }
};

module.exports = authMiddleware; 