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
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: {
    type: Date,
    required: false
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
    enum: ['torneo', 'entrenamiento', 'liga', 'social', 'benefico', 'casual', 'campeonato', 'practica', 'no-deportivo']
  },
  tipoJuego: {
    type: String,
    required: [true, 'El tipo de juego es obligatorio'],
    enum: ['foam', 'cloth'],
    default: 'foam'
  },
  categoria: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado', 'mixto'],
    default: 'mixto'
  },
  rol: {
    type: String,
    required: [true, 'El rol es obligatorio'],
    enum: ['organizador', 'participante'],
    default: 'organizador'
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
    ref: 'Usuario'
  },
  dificultad: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  },
  genero: {
    type: String,
    enum: ['masculino', 'femenino', 'mixto'],
    default: 'mixto'
  },
  requisitos: [{
    type: String
  }],
  activo: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  },
  
  // Datos específicos por tipo de evento
  datosEspecificos: {
    // Para ligas
    liga: {
      temporada: String,
      division: String,
      formato: {
        type: String,
        enum: ['todos-contra-todos', 'eliminacion-directa', 'mixto']
      },
      equipos: [{
        nombre: String,
        logo: String,
        plantelNombres: [String],
        puntos: { type: Number, default: 0 },
        partidosJugados: { type: Number, default: 0 },
        partidosGanados: { type: Number, default: 0 },
        partidosEmpatados: { type: Number, default: 0 },
        partidosPerdidos: { type: Number, default: 0 },
        golesFavor: { type: Number, default: 0 },
        golesContra: { type: Number, default: 0 },
        diferenciaGoles: { type: Number, default: 0 }
      }],
      // Estadísticas manuales a nivel de liga (pegadas desde ranking por jugador)
      estadisticasLiga: [{
        equipoNombre: String,
        nombreJugador: String,
        partidosJugados: { type: Number, default: 0 },
        setsJugados: { type: Number, default: 0 },
        tirosTotales: { type: Number, default: 0 },
        hits: { type: Number, default: 0 },
        quemados: { type: Number, default: 0 },
        asistencias: { type: Number, default: 0 },
        tirosRecibidos: { type: Number, default: 0 },
        hitsRecibidos: { type: Number, default: 0 },
        esquives: { type: Number, default: 0 },
        esquivesExitosos: { type: Number, default: 0 },
        ponchado: { type: Number, default: 0 },
        catchesIntentos: { type: Number, default: 0 },
        catches: { type: Number, default: 0 },
        bloqueosIntentos: { type: Number, default: 0 },
        bloqueos: { type: Number, default: 0 },
        pisoLinea: { type: Number, default: 0 },
        catchesRecibidos: { type: Number, default: 0 },
        poderLiga: { type: Number, default: 0 }
      }],
      partidos: [{
        fecha: Date,
        equipoLocal: String,
        equipoVisitante: String,
        golesLocal: Number,
        golesVisitante: Number,
        estado: {
          type: String,
          enum: ['programado', 'en-curso', 'finalizado', 'cancelado'],
          default: 'programado'
        },
        // Estadísticas individuales por jugador (opcional)
        estadisticasJugadores: [{
          nombreJugador: String,
          equipo: { type: String, enum: ['local', 'visitante'] },
          // Métricas principales
          tirosTotales: { type: Number, default: 0 },
          hits: { type: Number, default: 0 },
          tirosRecibidos: { type: Number, default: 0 },
          catches: { type: Number, default: 0 },
          dodges: { type: Number, default: 0 }, // Esquives
          bloqueos: { type: Number, default: 0 },
          bloqueosIntentos: { type: Number, default: 0 },
          quemados: { type: Number, default: 0 },
          ponchado: { type: Number, default: 0 },
          pisoLinea: { type: Number, default: 0 },
          catchesRecibidos: { type: Number, default: 0 },
          setsJugados: { type: Number, default: 0 },
          tarjetasAmarillas: { type: Number, default: 0 },
          tarjetasRojas: { type: Number, default: 0 }
        }],
        estadisticas: {
          local: {
            hits: { type: Number, default: 0 },
            catches: { type: Number, default: 0 },
            dodges: { type: Number, default: 0 },
            bloqueos: { type: Number, default: 0 },
            quemados: { type: Number, default: 0 },
            tarjetasAmarillas: { type: Number, default: 0 },
            tarjetasRojas: { type: Number, default: 0 }
          },
          visitante: {
            hits: { type: Number, default: 0 },
            catches: { type: Number, default: 0 },
            dodges: { type: Number, default: 0 },
            bloqueos: { type: Number, default: 0 },
            quemados: { type: Number, default: 0 },
            tarjetasAmarillas: { type: Number, default: 0 },
            tarjetasRojas: { type: Number, default: 0 }
          }
        }
      }],
      reglas: [String],
      premios: [{
        posicion: Number,
        premio: String,
        valor: Number
      }],
      // Resumen agregado desde planillas: categorias -> { equipos, jugadores }
      resumenEstadisticas: mongoose.Schema.Types.Mixed
    },
    
    // Para campeonatos
    campeonato: {
      formato: {
        type: String,
        enum: ['eliminacion-simple', 'eliminacion-doble', 'grupos-y-eliminacion', 'todos-contra-todos']
      },
      fases: [{
        nombre: String,
        fechaInicio: Date,
        fechaFin: Date,
        equipos: [String],
        partidos: [{
          fecha: Date,
          equipo1: String,
          equipo2: String,
          resultado: String,
          estadisticas: mongoose.Schema.Types.Mixed
        }]
      }],
      bracket: {
        octavos: [mongoose.Schema.Types.Mixed],
        cuartos: [mongoose.Schema.Types.Mixed],
        semifinales: [mongoose.Schema.Types.Mixed],
        final: mongoose.Schema.Types.Mixed,
        tercerPuesto: mongoose.Schema.Types.Mixed
      },
      premios: [{
        posicion: Number,
        premio: String,
        valor: Number,
        ganador: String
      }]
    },
    
    // Para participaciones internacionales
    participacion: {
      pais: String,
      ciudad: String,
      organizador: String,
      categoria: String,
      posicion: Number,
      totalParticipantes: Number,
      resultados: [{
        fase: String,
        rival: String,
        resultado: String,
        fecha: Date
      }],
      estadisticas: {
        partidosJugados: Number,
        partidosGanados: Number,
        partidosPerdidos: Number,
        golesFavor: Number,
        golesContra: Number
      },
      logros: [String],
      medallas: [{
        tipo: {
          type: String,
          enum: ['oro', 'plata', 'bronce']
        },
        categoria: String
      }]
    },
    
    // Para entrenamientos/prácticas
    practica: {
      nivel: {
        type: String,
        enum: ['principiante', 'intermedio', 'avanzado', 'mixto']
      },
      instructor: String,
      duracion: Number, // en minutos
      materialNecesario: [String],
      objetivos: [String]
    },
    
    // Para eventos sociales/no deportivos
    social: {
      tipoEvento: {
        type: String,
        enum: ['reunion', 'fiesta', 'charla', 'taller', 'otro']
      },
      incluyeComida: Boolean,
      incluyeBebidas: Boolean,
      actividades: [String]
    }
  },
  
  // Campos comunes para todos los eventos
  equipos: [{
    nombre: String,
    integrantes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }]
  }],
  inscripciones: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    datosInscripcion: {
      nombre: String,
      email: String,
      telefono: String,
      emergencia: String
    },
    fechaInscripcion: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada'],
      default: 'pendiente'
    }
  }]
}, {
  timestamps: true
});

// Índices
eventoSchema.index({ fecha: 1, activo: 1 });
eventoSchema.index({ tipo: 1, activo: 1 });
eventoSchema.index({ rol: 1, activo: 1 });
eventoSchema.index({ titulo: 'text', descripcion: 'text' });

module.exports = mongoose.model('Evento', eventoSchema);
