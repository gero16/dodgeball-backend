const mongoose = require('mongoose');

const contactoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  telefono: {
    type: String,
    trim: true
  },
  asunto: {
    type: String,
    required: [true, 'El asunto es obligatorio'],
    trim: true,
    maxlength: [200, 'El asunto no puede tener más de 200 caracteres']
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    maxlength: [2000, 'El mensaje no puede tener más de 2000 caracteres']
  },
  tipo: {
    type: String,
    enum: ['consulta', 'sugerencia', 'queja', 'soporte', 'general'],
    default: 'consulta'
  },
  estado: {
    type: String,
    enum: ['nuevo', 'leido', 'en_proceso', 'respondido', 'cerrado'],
    default: 'nuevo'
  },
  prioridad: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  respuesta: {
    contenido: String,
    fecha: Date,
    respondidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  },
  leido: {
    type: Boolean,
    default: false
  },
  fechaLectura: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
contactoSchema.index({ estado: 1, fechaCreacion: -1 });
contactoSchema.index({ email: 1 });
contactoSchema.index({ tipo: 1, prioridad: 1 });

module.exports = mongoose.model('Contacto', contactoSchema);
