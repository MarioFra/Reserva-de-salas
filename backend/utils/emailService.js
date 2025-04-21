const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transporter de nodemailer para Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Función para formatear la fecha
const formatearFecha = (fechaString) => {
    // La fecha viene en formato YYYY-MM-DD
    const [year, month, day] = fechaString.split('-');
    const fecha = new Date(year, month - 1, day);
    return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Función para formatear la hora
const formatearHora = (hora) => {
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum % 12 || 12;
    return `${hora12}:${minutos} ${ampm}`;
};

// Función para enviar confirmación de reserva
const enviarConfirmacionReserva = async (reserva, cambios = null) => {
    try {
        const fechaFormateada = formatearFecha(reserva.fecha);
        const horaInicio = formatearHora(reserva.horaInicio);
        const horaFin = formatearHora(reserva.horaFin);

        let cuerpoCorreo = `
            <h2>Confirmación de Reserva</h2>
            <p>Hola ${reserva.nombre},</p>
            <p>${cambios ? 'Tu reserva ha sido actualizada' : 'Tu reserva ha sido confirmada'} con los siguientes detalles:</p>
            <ul>
                <li><strong>Nave:</strong> ${reserva.nave}</li>
                <li><strong>Sala:</strong> ${reserva.sala}</li>
                <li><strong>Fecha:</strong> ${fechaFormateada}</li>
                <li><strong>Hora de inicio:</strong> ${horaInicio}</li>
                <li><strong>Hora de fin:</strong> ${horaFin}</li>
                <li><strong>Motivo:</strong> ${reserva.motivo}</li>
            </ul>
        `;

        if (cambios) {
            cuerpoCorreo += `
                <h3>Cambios realizados:</h3>
                <ul>
                    ${cambios.fecha ? `<li>Fecha: ${formatearFecha(reserva.fecha)}</li>` : ''}
                    ${cambios.horaInicio ? `<li>Hora de inicio: ${formatearHora(reserva.horaInicio)}</li>` : ''}
                    ${cambios.horaFin ? `<li>Hora de fin: ${formatearHora(reserva.horaFin)}</li>` : ''}
                    ${cambios.nave ? `<li>Nave: ${reserva.nave}</li>` : ''}
                    ${cambios.sala ? `<li>Sala: ${reserva.sala}</li>` : ''}
                    ${cambios.motivo ? `<li>Motivo: ${reserva.motivo}</li>` : ''}
                    ${cambios.invitados ? `<li>Invitados: ${reserva.invitados.join(', ')}</li>` : ''}
                </ul>
            `;
        }

        cuerpoCorreo += `
            <p>Si necesitas hacer algún cambio, puedes editar tu reserva utilizando la contraseña que proporcionaste al crear la reserva.</p>
            <p>Saludos,</p>
            <p>Equipo de Reservas</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reserva.correo,
            subject: `${cambios ? 'Actualización' : 'Confirmación'} de Reserva - ${reserva.nave} - ${reserva.sala}`,
            html: cuerpoCorreo
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado a:', reserva.correo);
    } catch (error) {
        console.error('Error al enviar correo de confirmación:', error);
        throw error;
    }
};

// Función para enviar invitaciones
const enviarInvitaciones = async (reserva) => {
    try {
        const fechaFormateada = formatearFecha(reserva.fecha);
        const horaInicio = formatearHora(reserva.horaInicio);
        const horaFin = formatearHora(reserva.horaFin);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reserva.invitados.join(', '),
            subject: `Invitación a Reunión - ${reserva.nave} - ${reserva.sala}`,
            html: `
                <h2>Invitación a Reunión</h2>
                <p>Has sido invitado a una reunión por ${reserva.nombre}</p>
                <p>Detalles de la reunión:</p>
                <ul>
                    <li><strong>Nave:</strong> ${reserva.nave}</li>
                    <li><strong>Sala:</strong> ${reserva.sala}</li>
                    <li><strong>Fecha:</strong> ${fechaFormateada}</li>
                    <li><strong>Hora de inicio:</strong> ${horaInicio}</li>
                    <li><strong>Hora de fin:</strong> ${horaFin}</li>
                    <li><strong>Motivo:</strong> ${reserva.motivo}</li>
                </ul>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Invitaciones enviadas a:', reserva.invitados.join(', '));
    } catch (error) {
        console.error('Error al enviar invitaciones:', error);
        throw error;
    }
};

module.exports = {
    enviarConfirmacionReserva,
    enviarInvitaciones,
    formatearHora
};