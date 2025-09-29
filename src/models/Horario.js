const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  horaInicio: {
    type: String,
    required: [true, 'La hora de inicio es obligatoria']
  },
  horaFin: {
    type: String,
    required: [true, 'La hora de fin es obligatoria']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo es obligatorio'],
    enum: ['entrenamiento', 'partido', 'torneo', 'reunion', 'mantenimiento']
  },
  ubicacion: {
    nombre: {
      type: String,
      required: [true, 'El nombre de la ubicación es obligatorio']
    },
    direccion: String,
    capacidad: Number
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  cupoMaximo: {
    type: Number,
    default: 20,
    min: [1, 'El cupo debe ser al menos 1']
  },
  cupoDisponible: {
    type: Number,
    required: true
  },
  precio: {
    type: Number,
    default: 0,
    min: [0, 'El precio no puede ser negativo']
  },
  activo: {
    type: Boolean,
    default: true
  },
  reservas: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    fechaReserva: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
      default: 'pendiente'
    },
    observaciones: {
      type: String,
      maxlength: [300, 'Las observaciones no pueden tener más de 300 caracteres']
    }
  }]
}, {
  timestamps: true
});

// Índices
horarioSchema.index({ fecha: 1, horaInicio: 1 });
horarioSchema.index({ activo: 1, fecha: 1 });

// Middleware para actualizar cupo disponible
horarioSchema.pre('save', function(next) {
  if (this.isModified('reservas')) {
    const confirmadas = this.reservas.filter(res => res.estado === 'confirmada').length;
    this.cupoDisponible = this.cupoMaximo - confirmadas;
  }
  next();
});

module.exports = mongoose.model('Horario', horarioSchema);
