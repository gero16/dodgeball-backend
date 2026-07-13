/**
 * Utilidades para cálculos de estadísticas de dodgeball
 */

/**
 * Calcula el índice de ataque de un jugador
 * @param {Object} stats - Estadísticas del jugador
 * @returns {Number} - Índice de ataque
 */
function calcularIndiceAtaque(stats) {
  // Fórmula basada en hits, quemados, asistencias y porcentaje de hits
  const baseAtaque = (stats.hits * 2) + (stats.quemados * 3) + (stats.asistencias * 1);
  const bonusPrecision = stats.porcentajeHits > 30 ? (stats.porcentajeHits - 30) * 0.1 : 0;
  return Math.round((baseAtaque + bonusPrecision) * 100) / 100;
}

/**
 * Calcula el índice de defensa de un jugador
 * @param {Object} stats - Estadísticas del jugador
 * @returns {Number} - Índice de defensa
 */
function calcularIndiceDefensa(stats) {
  // Fórmula basada en catches, bloqueos, esquives y porcentajes
  const baseDefensa = (stats.catches * 2) + (stats.bloqueos * 1.5) + (stats.esquivesExitosos * 1);
  const bonusEficiencia = (stats.porcentajeCatches * 0.1) + (stats.porcentajeBloqueos * 0.05);
  return Math.round((baseDefensa + bonusEficiencia) * 100) / 100;
}

/**
 * Calcula el índice de poder total de un jugador
 * @param {Object} stats - Estadísticas del jugador
 * @returns {Number} - Índice de poder
 */
function calcularIndicePoder(stats) {
  const ataque = calcularIndiceAtaque(stats);
  const defensa = calcularIndiceDefensa(stats);
  return Math.round((ataque + defensa) * 100) / 100;
}

/**
 * Calcula todos los porcentajes de un jugador
 * @param {Object} stats - Estadísticas del jugador
 * @returns {Object} - Estadísticas con porcentajes calculados
 */
function calcularPorcentajes(stats) {
  const porcentajes = { ...stats };
  
  // Porcentaje de hits
  if (stats.tirosTotales > 0) {
    porcentajes.porcentajeHits = Math.round((stats.hits / stats.tirosTotales) * 100 * 100) / 100;
  }
  
  // Porcentaje de catches
  if (stats.catchesIntentos > 0) {
    porcentajes.porcentajeCatches = Math.round((stats.catches / stats.catchesIntentos) * 100 * 100) / 100;
  }
  
  // Porcentaje de bloqueos
  if (stats.bloqueosIntentos > 0) {
    porcentajes.porcentajeBloqueos = Math.round((stats.bloqueos / stats.bloqueosIntentos) * 100 * 100) / 100;
  }
  
  // Porcentaje de outs
  if (stats.tirosRecibidos > 0) {
    porcentajes.porcentajeOuts = Math.round((stats.ponchado / stats.tirosRecibidos) * 100 * 100) / 100;
  }
  
  return porcentajes;
}

/**
 * Calcula estadísticas completas de un jugador
 * @param {Object} stats - Estadísticas básicas del jugador
 * @returns {Object} - Estadísticas completas con porcentajes e índices
 */
function calcularEstadisticasCompletas(stats) {
  const estadisticasConPorcentajes = calcularPorcentajes(stats);
  
  return {
    ...estadisticasConPorcentajes,
    indiceAtaque: calcularIndiceAtaque(estadisticasConPorcentajes),
    indiceDefensa: calcularIndiceDefensa(estadisticasConPorcentajes),
    indicePoder: calcularIndicePoder(estadisticasConPorcentajes)
  };
}

/**
 * Agrega estadísticas de un partido a las estadísticas generales
 * @param {Object} estadisticasGenerales - Estadísticas actuales
 * @param {Object} estadisticasPartido - Estadísticas del partido
 * @returns {Object} - Estadísticas actualizadas
 */
function agregarEstadisticasPartido(estadisticasGenerales, estadisticasPartido) {
  const nuevasEstadisticas = { ...estadisticasGenerales };
  
  // Incrementar contadores básicos
  nuevasEstadisticas.partidosJugados += 1;
  nuevasEstadisticas.setsJugados += estadisticasPartido.setsJugados || 0;
  nuevasEstadisticas.minutosJugados += estadisticasPartido.minutosJugados || 0;
  
  // Estadísticas ofensivas
  nuevasEstadisticas.tirosTotales += estadisticasPartido.tirosTotales || 0;
  nuevasEstadisticas.hits += estadisticasPartido.hits || 0;
  nuevasEstadisticas.quemados += estadisticasPartido.quemados || 0;
  nuevasEstadisticas.asistencias += estadisticasPartido.asistencias || 0;
  
  // Estadísticas defensivas
  nuevasEstadisticas.tirosRecibidos += estadisticasPartido.tirosRecibidos || 0;
  nuevasEstadisticas.hitsRecibidos += estadisticasPartido.hitsRecibidos || 0;
  nuevasEstadisticas.esquives += estadisticasPartido.esquives || 0;
  nuevasEstadisticas.esquivesExitosos += estadisticasPartido.esquivesExitosos || 0;
  nuevasEstadisticas.ponchado += estadisticasPartido.ponchado || 0;
  
  // Estadísticas de catch y bloqueo
  nuevasEstadisticas.catches += estadisticasPartido.catches || 0;
  nuevasEstadisticas.catchesIntentos += estadisticasPartido.catchesIntentos || 0;
  nuevasEstadisticas.catchesRecibidos += estadisticasPartido.catchesRecibidos || 0;
  nuevasEstadisticas.bloqueos += estadisticasPartido.bloqueos || 0;
  nuevasEstadisticas.bloqueosIntentos += estadisticasPartido.bloqueosIntentos || 0;
  
  // Infracciones
  nuevasEstadisticas.tarjetasAmarillas += estadisticasPartido.tarjetasAmarillas || 0;
  nuevasEstadisticas.tarjetasRojas += estadisticasPartido.tarjetasRojas || 0;
  nuevasEstadisticas.pisoLinea += estadisticasPartido.pisoLinea || 0;
  
  // Eliminaciones
  nuevasEstadisticas.eliminaciones += estadisticasPartido.eliminaciones || 0;
  nuevasEstadisticas.vecesEliminado += estadisticasPartido.vecesEliminado || 0;
  
  // Puntos
  nuevasEstadisticas.puntos += estadisticasPartido.puntos || 0;
  
  // Recalcular porcentajes e índices
  return calcularEstadisticasCompletas(nuevasEstadisticas);
}

/**
 * Genera un reporte de estadísticas para un jugador
 * @param {Object} jugador - Datos del jugador
 * @returns {Object} - Reporte completo de estadísticas
 */
function generarReporteJugador(jugador) {
  const stats = jugador.estadisticasGenerales;
  const reporte = {
    jugador: {
      nombre: `${jugador.nombre} ${jugador.apellido}`,
      posicion: jugador.posicion,
      numeroCamiseta: jugador.numeroCamiseta
    },
    resumen: {
      partidosJugados: stats.partidosJugados,
      setsJugados: stats.setsJugados,
      minutosJugados: stats.minutosJugados,
      indicePoder: stats.indicePoder
    },
    ataque: {
      tirosTotales: stats.tirosTotales,
      hits: stats.hits,
      porcentajeHits: stats.porcentajeHits,
      quemados: stats.quemados,
      asistencias: stats.asistencias,
      indiceAtaque: stats.indiceAtaque
    },
    defensa: {
      tirosRecibidos: stats.tirosRecibidos,
      hitsRecibidos: stats.hitsRecibidos,
      esquives: stats.esquives,
      esquivesExitosos: stats.esquivesExitosos,
      ponchado: stats.ponchado,
      porcentajeOuts: stats.porcentajeOuts,
      indiceDefensa: stats.indiceDefensa
    },
    especialidades: {
      catches: stats.catches,
      catchesIntentos: stats.catchesIntentos,
      porcentajeCatches: stats.porcentajeCatches,
      bloqueos: stats.bloqueos,
      bloqueosIntentos: stats.bloqueosIntentos,
      porcentajeBloqueos: stats.porcentajeBloqueos
    },
    disciplina: {
      tarjetasAmarillas: stats.tarjetasAmarillas,
      tarjetasRojas: stats.tarjetasRojas,
      pisoLinea: stats.pisoLinea
    }
  };
  
  return reporte;
}

/**
 * Compara estadísticas entre dos jugadores
 * @param {Object} jugador1 - Primer jugador
 * @param {Object} jugador2 - Segundo jugador
 * @returns {Object} - Comparación de estadísticas
 */
function compararJugadores(jugador1, jugador2) {
  const stats1 = jugador1.estadisticasGenerales;
  const stats2 = jugador2.estadisticasGenerales;
  
  return {
    jugador1: {
      nombre: `${jugador1.nombre} ${jugador1.apellido}`,
      indicePoder: stats1.indicePoder,
      indiceAtaque: stats1.indiceAtaque,
      indiceDefensa: stats1.indiceDefensa,
      porcentajeHits: stats1.porcentajeHits,
      porcentajeCatches: stats1.porcentajeCatches
    },
    jugador2: {
      nombre: `${jugador2.nombre} ${jugador2.apellido}`,
      indicePoder: stats2.indicePoder,
      indiceAtaque: stats2.indiceAtaque,
      indiceDefensa: stats2.indiceDefensa,
      porcentajeHits: stats2.porcentajeHits,
      porcentajeCatches: stats2.porcentajeCatches
    },
    diferencias: {
      indicePoder: stats1.indicePoder - stats2.indicePoder,
      indiceAtaque: stats1.indiceAtaque - stats2.indiceAtaque,
      indiceDefensa: stats1.indiceDefensa - stats2.indiceDefensa
    }
  };
}

/** Campos numéricos por jugador en un set (sin jugoSet / setsJugados). */
const CAMPOS_STATS_SET = [
  'tirosTotales', 'hits', 'quemados', 'asistencias',
  'tirosRecibidos', 'hitsRecibidos',
  'dodges', 'esquivesExitosos', 'ponchado',
  'catchesIntentos', 'catches',
  'bloqueosIntentos', 'bloqueos',
  'pisoLinea', 'catchesRecibidos'
];

const normalizePlayerKey = (nombre, equipo) => {
  const n = (nombre || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .trim();
  const side = equipo === 'visitante' ? 'visitante' : 'local';
  return `${side}|${n}`;
};

/**
 * Parsea una fila de stats de un set a enteros seguros.
 */
function normalizeJugadorSetStats(j, equipoFallback = 'local') {
  const equipo = j.equipo === 'visitante' ? 'visitante'
    : (j.equipo === 'local' ? 'local' : (equipoFallback === 'visitante' ? 'visitante' : 'local'));
  const out = {
    nombreJugador: (j.nombreJugador || j.nombre || '').toString().trim(),
    equipo,
    jugoSet: j.jugoSet === true || j.jugoSet === 1 || j.jugoSet === 'true'
  };
  for (const k of CAMPOS_STATS_SET) {
    out[k] = parseInt(j[k], 10) || 0;
  }
  return out;
}

/**
 * Suma estadisticasPorSet → totales por jugador del partido.
 */
function agregarEstadisticasDesdeSets(estadisticasPorSet = []) {
  const map = new Map();

  for (const set of estadisticasPorSet || []) {
    const jugadores = Array.isArray(set?.jugadores) ? set.jugadores : [];
    for (const raw of jugadores) {
      const j = normalizeJugadorSetStats(raw);
      if (!j.nombreJugador) continue;
      const key = normalizePlayerKey(j.nombreJugador, j.equipo);
      if (!map.has(key)) {
        const base = {
          nombreJugador: j.nombreJugador,
          equipo: j.equipo,
          setsJugados: 0,
          tarjetasAmarillas: 0,
          tarjetasRojas: 0
        };
        for (const k of CAMPOS_STATS_SET) base[k] = 0;
        map.set(key, base);
      }
      const acc = map.get(key);
      if (j.jugoSet) acc.setsJugados += 1;
      for (const k of CAMPOS_STATS_SET) {
        acc[k] += j[k] || 0;
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Suma totales de jugadores del partido → totales por equipo (local/visitante).
 */
function agregarTotalesEquipoDesdeJugadores(estadisticasJugadores = []) {
  const init = () => ({
    tirosTotales: 0,
    hits: 0,
    quemados: 0,
    asistencias: 0,
    tirosRecibidos: 0,
    hitsRecibidos: 0,
    esquives: 0,
    dodges: 0,
    esquivesExitosos: 0,
    ponchado: 0,
    catchesIntentos: 0,
    catches: 0,
    bloqueosIntentos: 0,
    bloqueos: 0,
    pisoLinea: 0,
    catchesRecibidos: 0,
    setsJugados: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  });
  const sum = { local: init(), visitante: init() };

  for (const j of estadisticasJugadores || []) {
    const side = j.equipo === 'visitante' ? 'visitante' : 'local';
    const t = sum[side];
    t.tirosTotales += parseInt(j.tirosTotales, 10) || 0;
    t.hits += parseInt(j.hits, 10) || 0;
    t.quemados += parseInt(j.quemados, 10) || 0;
    t.asistencias += parseInt(j.asistencias, 10) || 0;
    t.tirosRecibidos += parseInt(j.tirosRecibidos, 10) || 0;
    t.hitsRecibidos += parseInt(j.hitsRecibidos, 10) || 0;
    const dodges = parseInt(j.dodges, 10) || 0;
    t.esquives += dodges;
    t.dodges += dodges;
    t.esquivesExitosos += parseInt(j.esquivesExitosos, 10) || 0;
    t.ponchado += parseInt(j.ponchado, 10) || 0;
    t.catchesIntentos += parseInt(j.catchesIntentos, 10) || 0;
    t.catches += parseInt(j.catches, 10) || 0;
    t.bloqueosIntentos += parseInt(j.bloqueosIntentos, 10) || 0;
    t.bloqueos += parseInt(j.bloqueos, 10) || 0;
    t.pisoLinea += parseInt(j.pisoLinea, 10) || 0;
    t.catchesRecibidos += parseInt(j.catchesRecibidos, 10) || 0;
    t.setsJugados += parseInt(j.setsJugados, 10) || 0;
    t.tarjetasAmarillas += parseInt(j.tarjetasAmarillas, 10) || 0;
    t.tarjetasRojas += parseInt(j.tarjetasRojas, 10) || 0;
  }

  return sum;
}

module.exports = {
  calcularIndiceAtaque,
  calcularIndiceDefensa,
  calcularIndicePoder,
  calcularPorcentajes,
  calcularEstadisticasCompletas,
  agregarEstadisticasPartido,
  generarReporteJugador,
  compararJugadores,
  CAMPOS_STATS_SET,
  normalizeJugadorSetStats,
  agregarEstadisticasDesdeSets,
  agregarTotalesEquipoDesdeJugadores
};
