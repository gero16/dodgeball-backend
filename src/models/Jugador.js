const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
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
  },
  
  // Estadísticas generales (suma de todos los equipos)
  estadisticasGenerales: {
    partidosJugados: { type: Number, default: 0 },
    partidosGanados: { type: Number, default: 0 },
    partidosPerdidos: { type: Number, default: 0 },
    minutosJugados: { type: Number, default: 0 },
    setsJugados: { type: Number, default: 0 },
    
    // Estadísticas ofensivas avanzadas
    tirosTotales: { type: Number, default: 0 },
    hits: { type: Number, default: 0 },
    hitsExitosos: { type: Number, default: 0 },
    porcentajeHits: { type: Number, default: 0 },
    quemados: { type: Number, default: 0 },
    asistencias: { type: Number, default: 0 },
    
    // Estadísticas defensivas avanzadas
    tirosRecibidos: { type: Number, default: 0 },
    hitsRecibidos: { type: Number, default: 0 },
    esquives: { type: Number, default: 0 },
    esquivesExitosos: { type: Number, default: 0 },
    ponchado: { type: Number, default: 0 },
    porcentajeOuts: { type: Number, default: 0 },
    
    // Estadísticas de catch
    catches: { type: Number, default: 0 },
    catchesExitosos: { type: Number, default: 0 },
    catchesIntentos: { type: Number, default: 0 },
    catchesRecibidos: { type: Number, default: 0 },
    porcentajeCatches: { type: Number, default: 0 },
    
    // Estadísticas de bloqueo
    bloqueos: { type: Number, default: 0 },
    bloqueosExitosos: { type: Number, default: 0 },
    bloqueosIntentos: { type: Number, default: 0 },
    porcentajeBloqueos: { type: Number, default: 0 },
    
    // Estadísticas disciplinarias
    tarjetasAmarillas: { type: Number, default: 0 },
    tarjetasRojas: { type: Number, default: 0 },
    pisoLinea: { type: Number, default: 0 },
    
    // Estadísticas de eliminación
    eliminaciones: { type: Number, default: 0 },
    vecesEliminado: { type: Number, default: 0 },
    
    // Índices de rendimiento
    indiceAtaque: { type: Number, default: 0 },
    indiceDefensa: { type: Number, default: 0 },
    indicePoder: { type: Number, default: 0 },
    
    // Puntos y rendimiento
    puntos: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
  },
  
  // Estadísticas por equipo (para manejar múltiples equipos)
  estadisticasPorEquipo: [{
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipo'
    },
    nombreEquipo: String,
    tipoEquipo: {
      type: String,
      enum: ['seleccion', 'cuadro', 'club', 'otro']
    },
    temporada: String,
    estadisticas: {
      partidosJugados: { type: Number, default: 0 },
      setsJugados: { type: Number, default: 0 },
      
      // Estadísticas ofensivas
      tirosTotales: { type: Number, default: 0 },
      hits: { type: Number, default: 0 },
      quemados: { type: Number, default: 0 },
      asistencias: { type: Number, default: 0 },
      
      // Estadísticas defensivas
      tirosRecibidos: { type: Number, default: 0 },
      hitsRecibidos: { type: Number, default: 0 },
      esquives: { type: Number, default: 0 },
      esquivesExitosos: { type: Number, default: 0 },
      ponchado: { type: Number, default: 0 },
      
      // Estadísticas de catch y bloqueo
      catches: { type: Number, default: 0 },
      catchesIntentos: { type: Number, default: 0 },
      bloqueos: { type: Number, default: 0 },
      bloqueosIntentos: { type: Number, default: 0 },
      
      // Índices
      indiceAtaque: { type: Number, default: 0 },
      indiceDefensa: { type: Number, default: 0 },
      indicePoder: { type: Number, default: 0 },
      puntos: { type: Number, default: 0 }
    }
  }],
  
  // Historial de partidos
  historialPartidos: [{
    partido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento'
    },
    equipo: String,
    fecha: Date,
    estadisticas: {
      setsJugados: Number,
      
      // Estadísticas ofensivas
      tirosTotales: Number,
      hits: Number,
      quemados: Number,
      asistencias: Number,
      
      // Estadísticas defensivas
      tirosRecibidos: Number,
      hitsRecibidos: Number,
      esquives: Number,
      esquivesExitosos: Number,
      ponchado: Number,
      
      // Estadísticas de catch y bloqueo
      catches: Number,
      catchesIntentos: Number,
      catchesRecibidos: Number,
      bloqueos: Number,
      bloqueosIntentos: Number,
      
      // Infracciones
      tarjetasAmarillas: Number,
      tarjetasRojas: Number,
      pisoLinea: Number,
      
      // Eliminaciones
      eliminaciones: Number,
      vecesEliminado: Number,
      
      // Tiempo y rendimiento
      minutosJugados: Number,
      puntos: Number,
      
      // Índices
      indiceAtaque: Number,
      indiceDefensa: Number,
      indicePoder: Number
    }
  }]
}, {
  timestamps: true
});

// Middleware para calcular porcentajes automáticamente
jugadorSchema.pre('save', function(next) {
  const stats = this.estadisticasGenerales;
  
  // Calcular porcentaje de hits
  if (stats.tirosTotales > 0) {
    stats.porcentajeHits = (stats.hits / stats.tirosTotales) * 100;
  }
  
  // Calcular porcentaje de catches
  if (stats.catchesIntentos > 0) {
    stats.porcentajeCatches = (stats.catches / stats.catchesIntentos) * 100;
  }
  
  // Calcular porcentaje de bloqueos
  if (stats.bloqueosIntentos > 0) {
    stats.porcentajeBloqueos = (stats.bloqueos / stats.bloqueosIntentos) * 100;
  }
  
  // Calcular porcentaje de outs
  if (stats.tirosRecibidos > 0) {
    stats.porcentajeOuts = (stats.ponchado / stats.tirosRecibidos) * 100;
  }
  
  // Los índices se deben pasar exactamente como se calculan externamente
  // No se deben recalcular automáticamente para mantener la precisión
  
  next();
});

// Métodos para calcular índices
jugadorSchema.methods.calcularIndiceAtaque = function(stats) {
  // Fórmula basada en hits, quemados, asistencias y porcentaje de hits
  const baseAtaque = (stats.hits * 2) + (stats.quemados * 3) + (stats.asistencias * 1);
  const bonusPrecision = stats.porcentajeHits > 30 ? (stats.porcentajeHits - 30) * 0.1 : 0;
  return baseAtaque + bonusPrecision;
};

jugadorSchema.methods.calcularIndiceDefensa = function(stats) {
  // Fórmula basada en catches, bloqueos, esquives y porcentajes
  const baseDefensa = (stats.catches * 2) + (stats.bloqueos * 1.5) + (stats.esquivesExitosos * 1);
  const bonusEficiencia = (stats.porcentajeCatches * 0.1) + (stats.porcentajeBloqueos * 0.05);
  return baseDefensa + bonusEficiencia;
};

// Índices
jugadorSchema.index({ usuario: 1 });
jugadorSchema.index({ activo: 1 });
jugadorSchema.index({ 'estadisticasPorEquipo.equipo': 1 });
jugadorSchema.index({ 'estadisticasGenerales.puntos': -1 });

module.exports = mongoose.model('Jugador', jugadorSchema);
