const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
  },
  fechaNacimiento: {
    type: Date
  },
  posicion: {
    type: String,
    enum: ['thrower', 'catcher', 'dodger', 'versatil'],
    default: 'versatil'
  },
  numeroCamiseta: {
    type: Number,
    min: [1, 'El número de camiseta debe ser mayor a 0'],
    max: [99, 'El número de camiseta no puede ser mayor a 99']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

jugadorSchema.virtual('nombreCompleto').get(function nombreCompleto() {
  const n = (this.nombre || '').toString().trim();
  const a = (this.apellido || '').toString().trim();
  if (!a || a.toLowerCase() === 'sinapellido') return n;
  return `${n} ${a}`.trim();
});

jugadorSchema.index({ usuario: 1 });
jugadorSchema.index({ activo: 1 });
jugadorSchema.index({ nombre: 1, apellido: 1 });

module.exports = mongoose.model('Jugador', jugadorSchema);
