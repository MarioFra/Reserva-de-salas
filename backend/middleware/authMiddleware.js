const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'No se proporcionó token de autenticación',
                error: 'Token no encontrado'
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar el usuario decodificado a la solicitud
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error en authMiddleware:', error);
        res.status(401).json({
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

module.exports = authMiddleware; 