const Contacto = require('../models/Contacto');
const nodemailer = require('nodemailer');

// Configurar transporter de email
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Configuración de email no encontrada. Las notificaciones por email estarán deshabilitadas.');
    return null;
  }

  const port = parseInt(process.env.EMAIL_PORT) || 465;
  const useSSL = port === 465;
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: useSSL, // true para puerto 465, false para 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Opciones adicionales para mejorar compatibilidad
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Enviar mensaje de contacto
const enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje, tipo } = req.body;

    const contacto = new Contacto({
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
      tipo
    });

    await contacto.save();

    // Enviar email de notificación (opcional)
    const transporter = createTransporter();
    console.log('📧 Transporter creado:', !!transporter);
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'No configurado');
    console.log('📧 EMAIL_RECIPIENT:', process.env.EMAIL_RECIPIENT ? 'Configurado' : 'No configurado');
    
    if (transporter) {
      try {
        // EMAIL_USER: tu correo que envía (ej: tu_correo@gmail.com)
        // EMAIL_RECIPIENT: correo del cliente que recibe (ej: dodgeballuruguay@gmail.com)
        const emailDestinatario = process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER;
        
        console.log(`📧 Intentando enviar email a: ${emailDestinatario}`);
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER, // Tu correo (el que envía)
          to: emailDestinatario, // Correo del cliente (el que recibe)
          replyTo: email, // Email del usuario que escribió el mensaje
          subject: `Nuevo mensaje de contacto: ${asunto}`,
          html: `
            <h3>Nuevo mensaje de contacto desde la web</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
            <p><strong>Tipo:</strong> ${tipo}</p>
            <p><strong>Asunto:</strong> ${asunto}</p>
            <hr>
            <p><strong>Mensaje:</strong></p>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${mensaje}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Para responder, simplemente responde a este email o escribe a: ${email}</p>
          `
        });
        
        console.log(`✅ Email enviado exitosamente a ${emailDestinatario}`);
      } catch (emailError) {
        console.error('❌ Error al enviar email:', emailError.message);
        console.error('❌ Stack completo:', emailError.stack);
        console.error('❌ Detalles:', {
          code: emailError.code,
          command: emailError.command,
          response: emailError.response
        });
        // No fallar la operación si el email falla
      }
    } else {
      console.log('⚠️ Transporter no disponible - email no enviado');
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los mensajes (admin)
const obtenerMensajes = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      estado = '', 
      tipo = '',
      prioridad = ''
    } = req.query;
    
    const skip = (pagina - 1) * limite;
    let filtros = {};

    // Filtros
    if (estado) filtros.estado = estado;
    if (tipo) filtros.tipo = tipo;
    if (prioridad) filtros.prioridad = prioridad;

    const mensajes = await Contacto.find(filtros)
      .populate('respuesta.respondidoPor', 'nombre email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Contacto.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        mensajes,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener mensaje por ID
const obtenerMensaje = async (req, res) => {
  try {
    const { id } = req.params;

    const mensaje = await Contacto.findById(id)
      .populate('respuesta.respondidoPor', 'nombre email');

    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Marcar como leído
    if (!mensaje.leido) {
      mensaje.leido = true;
      mensaje.fechaLectura = new Date();
      await mensaje.save();
    }

    res.json({
      success: true,
      data: { mensaje }
    });
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estado del mensaje
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, prioridad } = req.body;

    const mensaje = await Contacto.findById(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    if (estado) mensaje.estado = estado;
    if (prioridad) mensaje.prioridad = prioridad;

    await mensaje.save();

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: { mensaje }
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Responder mensaje
const responderMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    const usuarioId = req.usuario.id;

    const mensaje = await Contacto.findById(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Actualizar respuesta
    mensaje.respuesta = {
      contenido,
      fecha: new Date(),
      respondidoPor: usuarioId
    };
    mensaje.estado = 'respondido';

    await mensaje.save();

    // Enviar email de respuesta (opcional)
    const transporter = createTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: mensaje.email,
          subject: `Respuesta a tu mensaje: ${mensaje.asunto}`,
          html: `
            <h3>Hola ${mensaje.nombre},</h3>
            <p>Gracias por contactarnos. Aquí está nuestra respuesta:</p>
            <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
              ${contenido}
            </div>
            <p>Si tienes más preguntas, no dudes en contactarnos nuevamente.</p>
            <p>Saludos,<br>Equipo Dodgeball Club</p>
          `
        });
      } catch (emailError) {
        console.error('Error al enviar email de respuesta:', emailError);
        // No fallar la operación si el email falla
      }
    }

    res.json({
      success: true,
      message: 'Respuesta enviada exitosamente',
      data: { mensaje }
    });
  } catch (error) {
    console.error('Error al responder mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de contacto
const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Contacto.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);

    const porTipo = await Contacto.aggregate([
      {
        $group: {
          _id: '$tipo',
          count: { $sum: 1 }
        }
      }
    ]);

    const ultimosMeses = await Contacto.aggregate([
      {
        $group: {
          _id: {
            año: { $year: '$createdAt' },
            mes: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.año': -1, '_id.mes': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        porEstado: estadisticas,
        porTipo,
        ultimosMeses
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  enviarMensaje,
  obtenerMensajes,
  obtenerMensaje,
  actualizarEstado,
  responderMensaje,
  obtenerEstadisticas
};
