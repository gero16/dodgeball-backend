const mongoose = require('mongoose');

const estadisticaSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: [true, 'El equipo es obligatorio']
  },
  jugador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: [true, 'El jugador es obligatorio']
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    required: [true, 'El evento es obligatorio']
  },
  
  // Estadísticas básicas
  setsJugados: {
    type: Number,
    default: 0,
    min: [0, 'Los sets jugados no pueden ser negativos']
  },
  tirosTotales: {
    type: Number,
    default: 0,
    min: [0, 'Los tiros totales no pueden ser negativos']
  },
  hits: {
    type: Number,
    default: 0,
    min: [0, 'Los hits no pueden ser negativos']
  },
  quemados: {
    type: Number,
    default: 0,
    min: [0, 'Los quemados no pueden ser negativos']
  },
  asistencias: {
    type: Number,
    default: 0,
    min: [0, 'Las asistencias no pueden ser negativos']
  },
  tirosRecibidos: {
    type: Number,
    default: 0,
    min: [0, 'Los tiros recibidos no pueden ser negativos']
  },
  hitsRecibidos: {
    type: Number,
    default: 0,
    min: [0, 'Los hits recibidos no pueden ser negativos']
  },
  esquives: {
    type: Number,
    default: 0,
    min: [0, 'Los esquives no pueden ser negativos']
  },
  esquivesSinEsfuerzo: {
    type: Number,
    default: 0,
    min: [0, 'Los esquives sin esfuerzo no pueden ser negativos']
  },
  ponchado: {
    type: Number,
    default: 0,
    min: [0, 'Los ponchados no pueden ser negativos']
  },
  catchesIntentados: {
    type: Number,
    default: 0,
    min: [0, 'Los catches intentados no pueden ser negativos']
  },
  catches: {
    type: Number,
    default: 0,
    min: [0, 'Los catches no pueden ser negativos']
  },
  bloqueosIntentados: {
    type: Number,
    default: 0,
    min: [0, 'Los bloqueos intentados no pueden ser negativos']
  },
  bloqueos: {
    type: Number,
    default: 0,
    min: [0, 'Los bloqueos no pueden ser negativos']
  },
  pisoLinea: {
    type: Number,
    default: 0,
    min: [0, 'Los piso línea no pueden ser negativos']
  },
  catchesRecibidos: {
    type: Number,
    default: 0,
    min: [0, 'Los catches recibidos no pueden ser negativos']
  },
  
  // Porcentajes calculados
  porcentajeHits: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje de hits no puede ser negativo'],
    max: [100, 'El porcentaje de hits no puede ser mayor a 100']
  },
  porcentajeOuts: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje de outs no puede ser negativo'],
    max: [100, 'El porcentaje de outs no puede ser mayor a 100']
  },
  porcentajeCatches: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje de catches no puede ser negativo'],
    max: [100, 'El porcentaje de catches no puede ser mayor a 100']
  },
  porcentajeBloqueos: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje de bloqueos no puede ser negativo'],
    max: [100, 'El porcentaje de bloqueos no puede ser mayor a 100']
  },
  
  // Índices calculados
  indiceAtaque: {
    type: Number,
    default: 0,
    min: [0, 'El índice de ataque no puede ser negativo']
  },
  indiceDefensa: {
    type: Number,
    default: 0,
    min: [0, 'El índice de defensa no puede ser negativo']
  },
  indicePoder: {
    type: Number,
    default: 0,
    min: [0, 'El índice de poder no puede ser negativo']
  },
  
  // Metadatos
  temporada: {
    type: String,
    default: '2024-2025',
    trim: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
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

// Índices para optimizar consultas
estadisticaSchema.index({ equipo: 1, jugador: 1, evento: 1 });
estadisticaSchema.index({ evento: 1, temporada: 1 });
estadisticaSchema.index({ temporada: 1 });
estadisticaSchema.index({ activo: 1 });

// Middleware para actualizar fecha de actualización
estadisticaSchema.pre('save', function(next) {
  // Actualizar fecha de actualización
  this.fechaActualizacion = new Date();
  
  next();
});

// Virtual para obtener el nombre completo del jugador
estadisticaSchema.virtual('jugadorNombre').get(function() {
  return this.populated('jugador') ? 
    `${this.jugador.nombre} ${this.jugador.apellido}` : 
    'Jugador no encontrado';
});

// Virtual para obtener el nombre del equipo
estadisticaSchema.virtual('equipoNombre').get(function() {
  return this.populated('equipo') ? 
    this.equipo.nombre : 
    'Equipo no encontrado';
});

// Virtual para obtener el nombre del evento
estadisticaSchema.virtual('eventoNombre').get(function() {
  return this.populated('evento') ? 
    this.evento.titulo : 
    'Evento no encontrado';
});

// Método estático para obtener estadísticas por equipo
estadisticaSchema.statics.porEquipo = function(equipoId, eventoId = null, temporada = '2024-2025') {
  const filtros = { 
    equipo: equipoId, 
    temporada: temporada, 
    activo: true 
  };
  if (eventoId) filtros.evento = eventoId;
  
  return this.find(filtros)
    .populate('jugador', 'nombre apellido numeroCamiseta posicion')
    .populate('evento', 'titulo');
};

// Método estático para obtener estadísticas por jugador
estadisticaSchema.statics.porJugador = function(jugadorId, eventoId = null, temporada = '2024-2025') {
  const filtros = { 
    jugador: jugadorId, 
    temporada: temporada, 
    activo: true 
  };
  if (eventoId) filtros.evento = eventoId;
  
  return this.find(filtros)
    .populate('equipo', 'nombre colorPrincipal colorSecundario')
    .populate('evento', 'titulo');
};

// Método estático para obtener ranking de jugadores
estadisticaSchema.statics.ranking = function(criterio = 'indicePoder', eventoId = null, temporada = '2024-2025', limite = 10) {
  const filtros = { 
    temporada: temporada, 
    activo: true 
  };
  if (eventoId) filtros.evento = eventoId;
  
  return this.find(filtros)
    .populate('jugador', 'nombre apellido numeroCamiseta posicion')
    .populate('equipo', 'nombre')
    .populate('evento', 'titulo')
    .sort({ [criterio]: -1 })
    .limit(limite);
};

module.exports = mongoose.model('Estadistica', estadisticaSchema);
