const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede tener más de 200 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
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
  ubicacion: {
    nombre: {
      type: String,
      required: [true, 'El nombre de la ubicación es obligatorio']
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria']
    },
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  tipo: {
    type: String,
    required: [true, 'El tipo es obligatorio'],
    enum: ['torneo', 'entrenamiento', 'liga', 'social', 'benefico']
  },
  categoria: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado', 'mixto'],
    default: 'mixto'
  },
  precio: {
    type: Number,
    default: 0,
    min: [0, 'El precio no puede ser negativo']
  },
  cupoMaximo: {
    type: Number,
    required: [true, 'El cupo máximo es obligatorio'],
    min: [1, 'El cupo debe ser al menos 1']
  },
  cupoDisponible: {
    type: Number,
    required: [true, 'El cupo disponible es obligatorio']
  },
  imagen: {
    type: String,
    default: ''
  },
  organizador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  requisitos: [{
    type: String,
    trim: true
  }],
  equipos: [{
    nombre: {
      type: String,
      required: true
    },
    integrantes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }],
    puntos: {
      type: Number,
      default: 0
    }
  }],
  inscripciones: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    fechaInscripcion: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada'],
      default: 'pendiente'
    },
    pago: {
      realizado: {
        type: Boolean,
        default: false
      },
      metodo: String,
      referencia: String,
      fecha: Date
    }
  }],
  activo: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices
eventoSchema.index({ fecha: 1, activo: 1 });
eventoSchema.index({ tipo: 1, activo: 1 });
eventoSchema.index({ organizador: 1 });

// Middleware para actualizar cupo disponible
eventoSchema.pre('save', function(next) {
  if (this.isModified('inscripciones')) {
    const confirmadas = this.inscripciones.filter(ins => ins.estado === 'confirmada').length;
    this.cupoDisponible = this.cupoMaximo - confirmadas;
  }
  next();
});

module.exports = mongoose.model('Evento', eventoSchema);
