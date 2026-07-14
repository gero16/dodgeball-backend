const mongoose = require('mongoose');

/**
 * Registro de transferencia de un Jugador entre clubes.
 * Las stats de partidos NO se reescriben: quedan en el partido.
 * La fecha sirve para historial / atribución por tramo de membresía.
 */
const transferenciaSchema = new mongoose.Schema({
  jugador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true,
    index: true
  },
  desdeEquipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    default: null
  },
  haciaEquipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  motivo: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  }
}, {
  timestamps: true
});

transferenciaSchema.index({ jugador: 1, fecha: -1 });

module.exports = mongoose.model('Transferencia', transferenciaSchema);
