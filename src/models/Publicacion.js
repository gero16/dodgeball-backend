const mongoose = require('mongoose');

const publicacionSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede tener más de 200 caracteres']
  },
  contenido: {
    type: String,
    required: [true, 'El contenido es obligatorio']
  },
  resumen: {
    type: String,
    maxlength: [500, 'El resumen no puede tener más de 500 caracteres']
  },
  imagen: {
    type: String,
    default: ''
  },
  imagenPosY: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['noticias', 'eventos', 'torneos', 'entrenamientos', 'general']
  },
  etiquetas: [{
    type: String,
    trim: true
  }],
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  destacada: {
    type: Boolean,
    default: false
  },
  activa: {
    type: Boolean,
    default: true
  },
  fechaPublicacion: {
    type: Date,
    default: Date.now
  },
  vistas: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  comentarios: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    contenido: {
      type: String,
      required: true,
      maxlength: [500, 'El comentario no puede tener más de 500 caracteres']
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    activo: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Índices para búsquedas
publicacionSchema.index({ titulo: 'text', contenido: 'text', etiquetas: 'text' });
publicacionSchema.index({ categoria: 1, activa: 1 });
publicacionSchema.index({ fechaPublicacion: -1 });

module.exports = mongoose.model('Publicacion', publicacionSchema);
