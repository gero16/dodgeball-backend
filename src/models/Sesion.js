const mongoose = require('mongoose');

const sesionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  jti: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  dispositivo: {
    type: String,
    default: 'Dispositivo desconocido',
    trim: true,
    maxlength: 200
  },
  userAgent: {
    type: String,
    default: '',
    maxlength: 500
  },
  ip: {
    type: String,
    default: '',
    maxlength: 100
  },
  activa: {
    type: Boolean,
    default: true,
    index: true
  },
  ultimoUso: {
    type: Date,
    default: Date.now
  },
  revocadaEn: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

sesionSchema.index({ usuario: 1, activa: 1 });

module.exports = mongoose.model('Sesion', sesionSchema);
