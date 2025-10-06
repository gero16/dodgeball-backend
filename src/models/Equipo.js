const mongoose = require('mongoose');

const equipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del equipo es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  tipo: {
    type: String,
    enum: ['seleccion', 'cuadro', 'club', 'otro'],
    required: [true, 'El tipo de equipo es obligatorio']
  },
  pais: {
    type: String,
    trim: true
  },
  ciudad: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  colorPrincipal: {
    type: String,
    default: '#000000'
  },
  colorSecundario: {
    type: String,
    default: '#FFFFFF'
  },
  
  // Jugadores del equipo
  jugadores: [{
    jugador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jugador',
      required: true
    },
    numeroCamiseta: {
      type: Number,
      min: [1, 'El número de camiseta debe ser mayor a 0'],
      max: [99, 'El número de camiseta no puede ser mayor a 99']
    },
    posicion: {
      type: String,
      enum: ['thrower', 'catcher', 'dodger', 'versatil'],
      default: 'versatil'
    },
    fechaIngreso: {
      type: Date,
      default: Date.now
    },
    activo: {
      type: Boolean,
      default: true
    }
  }],
  
  // Estadísticas del equipo
  estadisticas: {
    partidosJugados: { type: Number, default: 0 },
    partidosGanados: { type: Number, default: 0 },
    partidosPerdidos: { type: Number, default: 0 },
    puntos: { type: Number, default: 0 },
    hits: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
    dodges: { type: Number, default: 0 }
  },
  
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
// nombre ya tiene índice único por la propiedad unique: true
equipoSchema.index({ tipo: 1 });
equipoSchema.index({ activo: 1 });
equipoSchema.index({ 'jugadores.jugador': 1 });

module.exports = mongoose.model('Equipo', equipoSchema);
