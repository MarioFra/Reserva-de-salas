const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/reserva_salas', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('Conectado a MongoDB');

        try {
            // Primero, eliminar cualquier administrador existente con el mismo email
            await Admin.deleteOne({ email: 'admin@example.com' });
            console.log('✅ Administrador existente eliminado (si existía)');

            // Crear administrador por defecto
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new Admin({
                nombre: 'Administrador Principal',
                email: 'admin@example.com',
                password: hashedPassword
            });

            await admin.save();
            console.log('✅ Administrador creado exitosamente');
            console.log('Email: admin@example.com');
            console.log('Contraseña: admin123');
            console.log('Contraseña hasheada:', hashedPassword);
        } catch (error) {
            console.error('❌ Error al crear administrador:', error);
            if (error.code === 11000) {
                console.error('Error: El email ya está en uso');
            }
        } finally {
            mongoose.connection.close();
        }
    })
    .catch((error) => {
        console.error('❌ Error al conectar a MongoDB:', error);
        console.error('Detalles del error:', error.message);
    }); 