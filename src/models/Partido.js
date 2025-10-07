const mongoose = require('mongoose');

const partidoSchema = new mongoose.Schema({
  // Información básica del partido
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  equipoLocal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  equipoVisitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  resultado: {
    setsLocal: { type: Number, default: 0 },
    setsVisitante: { type: Number, default: 0 },
    ganador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipo'
    }
  },
  
  // Estadísticas detalladas por jugador
  estadisticasJugadores: [{
    jugador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jugador',
      required: true
    },
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipo',
      required: true
    },
    setsJugados: { type: Number, default: 0 },
    
    // Estadísticas ofensivas
    tirosTotales: { type: Number, default: 0 },
    hits: { type: Number, default: 0 },
    quemados: { type: Number, default: 0 },
    asistencias: { type: Number, default: 0 },
    porcentajeHits: { type: Number, default: 0 },
    
    // Estadísticas defensivas
    tirosRecibidos: { type: Number, default: 0 },
    hitsRecibidos: { type: Number, default: 0 },
    esquives: { type: Number, default: 0 },
    esquivesExitosos: { type: Number, default: 0 },
    ponchado: { type: Number, default: 0 },
    
    // Estadísticas de catch
    catchesIntentos: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
    catchesRecibidos: { type: Number, default: 0 },
    porcentajeCatches: { type: Number, default: 0 },
    
    // Estadísticas de bloqueo
    bloqueosIntentos: { type: Number, default: 0 },
    bloqueos: { type: Number, default: 0 },
    porcentajeBloqueos: { type: Number, default: 0 },
    
    // Infracciones
    pisoLinea: { type: Number, default: 0 },
    
    // Métricas de rendimiento
    porcentajeOuts: { type: Number, default: 0 },
    
    // Índices calculados
    indiceAtaque: { type: Number, default: 0 },
    indiceDefensa: { type: Number, default: 0 },
    indicePoder: { type: Number, default: 0 }
  }],
  
  // Estadísticas por equipo
  estadisticasEquipos: {
    local: {
      tirosTotales: { type: Number, default: 0 },
      hits: { type: Number, default: 0 },
      quemados: { type: Number, default: 0 },
      catches: { type: Number, default: 0 },
      bloqueos: { type: Number, default: 0 },
      esquives: { type: Number, default: 0 }
    },
    visitante: {
      tirosTotales: { type: Number, default: 0 },
      hits: { type: Number, default: 0 },
      quemados: { type: Number, default: 0 },
      catches: { type: Number, default: 0 },
      bloqueos: { type: Number, default: 0 },
      esquives: { type: Number, default: 0 }
    }
  },
  
  // Metadatos
  duracion: { type: Number, default: 0 }, // en minutos
  arbitro: String,
  observaciones: String,
  estado: {
    type: String,
    enum: ['programado', 'en-curso', 'finalizado', 'cancelado'],
    default: 'programado'
  }
}, {
  timestamps: true
});

// Middleware para calcular porcentajes automáticamente
partidoSchema.pre('save', function(next) {
  this.estadisticasJugadores.forEach(jugador => {
    // Calcular porcentajes
    if (jugador.tirosTotales > 0) {
      jugador.porcentajeHits = (jugador.hits / jugador.tirosTotales) * 100;
    }
    
    if (jugador.catchesIntentos > 0) {
      jugador.porcentajeCatches = (jugador.catches / jugador.catchesIntentos) * 100;
    }
    
    if (jugador.bloqueosIntentos > 0) {
      jugador.porcentajeBloqueos = (jugador.bloqueos / jugador.bloqueosIntentos) * 100;
    }
    
    if (jugador.tirosRecibidos > 0) {
      jugador.porcentajeOuts = (jugador.ponchado / jugador.tirosRecibidos) * 100;
    }
    
    // Los índices se deben pasar exactamente como se calculan externamente
    // No se deben recalcular automáticamente para mantener la precisión
  });
  
  next();
});

// Métodos para calcular índices
partidoSchema.methods.calcularIndiceAtaque = function(jugador) {
  // Fórmula basada en hits, quemados, asistencias y porcentaje de hits
  const baseAtaque = (jugador.hits * 2) + (jugador.quemados * 3) + (jugador.asistencias * 1);
  const bonusPrecision = jugador.porcentajeHits > 30 ? (jugador.porcentajeHits - 30) * 0.1 : 0;
  return baseAtaque + bonusPrecision;
};

partidoSchema.methods.calcularIndiceDefensa = function(jugador) {
  // Fórmula basada en catches, bloqueos, esquives y porcentajes
  const baseDefensa = (jugador.catches * 2) + (jugador.bloqueos * 1.5) + (jugador.esquivesExitosos * 1);
  const bonusEficiencia = (jugador.porcentajeCatches * 0.1) + (jugador.porcentajeBloqueos * 0.05);
  return baseDefensa + bonusEficiencia;
};

// Índices
partidoSchema.index({ evento: 1, fecha: 1 });
partidoSchema.index({ equipoLocal: 1, equipoVisitante: 1 });
partidoSchema.index({ fecha: -1 });
partidoSchema.index({ 'estadisticasJugadores.jugador': 1 });

module.exports = mongoose.model('Partido', partidoSchema);
