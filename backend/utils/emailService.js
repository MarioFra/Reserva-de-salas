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
const enviarConfirmacionReserva = async (reserva, esActualizacion = false) => {
    try {
        // Verificando disponibilidad

        const titulo = esActualizacion ? 'Actualización de Reserva' : 'Confirmación de Reserva';
        const mensaje = esActualizacion ? 'Tu reserva ha sido actualizada con los siguientes detalles:' : 'Tu reserva ha sido confirmada con los siguientes detalles:';
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reserva.correo,
            subject: `${titulo} - ${reserva.ubicacion} - ${reserva.sala}`,
            html: `
                <h2>${titulo}</h2>
                <p>Hola ${reserva.nombre},</p>
                <p>${mensaje}</p>
                <ul>
                    <li><strong>Nave:</strong> ${reserva.ubicacion}</li>
                    <li><strong>Sala:</strong> ${reserva.sala}</li>
                    <li><strong>Fecha:</strong> ${reserva.fecha}</li>
                    <li><strong>Hora de inicio:</strong> ${reserva.horaInicio}</li>
                    <li><strong>Hora de fin:</strong> ${reserva.horaFin}</li>
                    <li><strong>Motivo:</strong> ${reserva.motivo}</li>
                    <li><strong>Contraseña:</strong> ${reserva.contraseña}</li>
                </ul>
                <p>Guarda esta contraseña para futuras modificaciones o cancelaciones de tu reserva.</p>
                <p>Saludos,</p>
                <p>Equipo de Sistemas</p>
            `
        };

        console.log('Enviando correo con las siguientes opciones:', mailOptions);
        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar correo de confirmación:', error);
        throw error;
    }
};

// Función para enviar invitaciones
const enviarInvitaciones = async (reserva) => {
    try {
        console.log('Preparando envío de invitaciones para la reserva:', reserva);
        const fechaFormateada = formatearFecha(reserva.fecha);
        const horaInicio = formatearHora(reserva.horaInicio);
        const horaFin = formatearHora(reserva.horaFin);

        if (!reserva.invitados || reserva.invitados.length === 0) {
            console.log('No hay invitados para enviar');
            return;
        }

        console.log('Lista de invitados:', reserva.invitados);
        const destinatarios = reserva.invitados.join(', ');
        console.log('Destinatarios formateados:', destinatarios);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: destinatarios,
            subject: `Invitación a Reunión - ${reserva.ubicacion} - ${reserva.sala}`,
            html: `
                <h2>Invitación a Reunión</h2>
                <p>Has sido invitado a una reunión por ${reserva.nombre}</p>
                <p>Detalles de la reunión:</p>
                <ul>
                    <li><strong>Nave:</strong> ${reserva.ubicacion}</li>
                    <li><strong>Sala:</strong> ${reserva.sala}</li>
                    <li><strong>Fecha:</strong> ${fechaFormateada}</li>
                    <li><strong>Hora de inicio:</strong> ${horaInicio}</li>
                    <li><strong>Hora de fin:</strong> ${horaFin}</li>
                    <li><strong>Motivo:</strong> ${reserva.motivo}</li>
                </ul>
            `
        };

        console.log('Enviando correo con las siguientes opciones:', mailOptions);
        await transporter.sendMail(mailOptions);
        console.log('Invitaciones enviadas exitosamente a:', destinatarios);
    } catch (error) {
        console.error('Error al enviar invitaciones:', error);
        throw error;
    }
};

// Función para enviar confirmación de cancelación de reserva
const enviarConfirmacionCancelacion = async (reserva) => {
    try {
        // Verificando disponibilidad
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reserva.correo,
            subject: `Cancelación de Reserva - ${reserva.ubicacion} - ${reserva.sala}`,
            html: `
                <h2>Cancelación de Reserva</h2>
                <p>Hola ${reserva.nombre},</p>
                <p>Tu reserva ha sido cancelada exitosamente.</p>
                <p>Detalles de la reserva cancelada:</p>
                <ul>
                    <li><strong>Nave:</strong> ${reserva.ubicacion}</li>
                    <li><strong>Sala:</strong> ${reserva.sala}</li>
                    <li><strong>Fecha:</strong> ${reserva.fecha}</li>
                    <li><strong>Hora de inicio:</strong> ${reserva.horaInicio}</li>
                    <li><strong>Hora de fin:</strong> ${reserva.horaFin}</li>
                    <li><strong>Motivo:</strong> ${reserva.motivo}</li>
                </ul>
                <p>Si esta cancelación fue realizada por error, por favor realiza una nueva reserva.</p>
                <p>Saludos,</p>
                <p>Equipo de Sistemas</p>
            `
        };

        // Enviando correo
        await transporter.sendMail(mailOptions);
        // Correo de cancelación enviado exitosamente
    } catch (error) {
        // Error al enviar correo de cancelación
        throw error;
    }
};

module.exports = {
    enviarConfirmacionReserva,
    enviarInvitaciones,
    enviarConfirmacionCancelacion,
    formatearHora
};