const nodemailer = require('nodemailer');

// Configurar transporter de email
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Configuración de email no encontrada. Las notificaciones por email estarán deshabilitadas.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Enviar email de bienvenida
const enviarEmailBienvenida = async (email, nombre) => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '¡Bienvenido al Dodgeball Club!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Bienvenido al Dodgeball Club, ${nombre}!</h2>
          <p>Gracias por registrarte en nuestra plataforma. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
          <p>Con tu cuenta podrás:</p>
          <ul>
            <li>Reservar horarios de entrenamiento</li>
            <li>Inscribirte en eventos y torneos</li>
            <li>Comprar productos del club</li>
            <li>Realizar donaciones</li>
            <li>Mantenerte al día con las noticias</li>
          </ul>
          <p>¡Esperamos verte pronto en la cancha!</p>
          <p>Saludos,<br>Equipo Dodgeball Club</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error);
  }
};

// Enviar email de notificación de evento
const enviarNotificacionEvento = async (email, nombre, evento) => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Nuevo evento: ${evento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Nuevo evento disponible!</h2>
          <p>Hola ${nombre},</p>
          <p>Te informamos que hay un nuevo evento disponible:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${evento.titulo}</h3>
            <p><strong>Fecha:</strong> ${new Date(evento.fecha).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${evento.horaInicio} - ${evento.horaFin}</p>
            <p><strong>Ubicación:</strong> ${evento.ubicacion.nombre}</p>
            <p><strong>Tipo:</strong> ${evento.tipo}</p>
            <p>${evento.descripcion}</p>
          </div>
          <p>¡No te lo pierdas!</p>
          <p>Saludos,<br>Equipo Dodgeball Club</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error al enviar notificación de evento:', error);
  }
};

module.exports = {
  enviarEmailBienvenida,
  enviarNotificacionEvento
};
