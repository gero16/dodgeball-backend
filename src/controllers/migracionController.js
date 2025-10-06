const Jugador = require('../models/Jugador');
const { calcularEstadisticasCompletas } = require('../utils/estadisticas');

/**
 * Migrar estadísticas de jugadores a la nueva estructura
 */
const migrarEstadisticas = async (req, res) => {
  try {
    console.log('🔄 Iniciando migración de estadísticas...');
    
    // Obtener todos los jugadores
    const jugadores = await Jugador.find({});
    console.log(`📊 Encontrados ${jugadores.length} jugadores para migrar`);

    let jugadoresActualizados = 0;
    let errores = 0;
    const resultados = [];

    for (const jugador of jugadores) {
      try {
        const nombreJugador = `${jugador.nombre} ${jugador.apellido}`;
        console.log(`👤 Procesando: ${nombreJugador}`);
        
        // Inicializar nuevos campos si no existen
        const stats = jugador.estadisticasGenerales;
        
        // Agregar nuevos campos con valores por defecto si no existen
        const nuevosCampos = {
          setsJugados: stats.setsJugados || 0,
          tirosTotales: stats.tirosTotales || 0,
          asistencias: stats.asistencias || 0,
          tirosRecibidos: stats.tirosRecibidos || 0,
          hitsRecibidos: stats.hitsRecibidos || 0,
          esquives: stats.esquives || 0,
          esquivesExitosos: stats.esquivesExitosos || 0,
          ponchado: stats.ponchado || 0,
          porcentajeOuts: stats.porcentajeOuts || 0,
          catchesIntentos: stats.catchesIntentos || 0,
          catchesRecibidos: stats.catchesRecibidos || 0,
          bloqueosIntentos: stats.bloqueosIntentos || 0,
          pisoLinea: stats.pisoLinea || 0,
          indiceAtaque: stats.indiceAtaque || 0,
          indiceDefensa: stats.indiceDefensa || 0,
          indicePoder: stats.indicePoder || 0
        };

        // Actualizar estadísticas generales
        Object.assign(stats, nuevosCampos);

        // Recalcular porcentajes e índices
        const estadisticasCompletas = calcularEstadisticasCompletas(stats);
        jugador.estadisticasGenerales = estadisticasCompletas;

        // Actualizar estadísticas por equipo
        for (const equipoStats of jugador.estadisticasPorEquipo) {
          const equipoNuevosCampos = {
            setsJugados: equipoStats.estadisticas.setsJugados || 0,
            tirosTotales: equipoStats.estadisticas.tirosTotales || 0,
            asistencias: equipoStats.estadisticas.asistencias || 0,
            tirosRecibidos: equipoStats.estadisticas.tirosRecibidos || 0,
            hitsRecibidos: equipoStats.estadisticas.hitsRecibidos || 0,
            esquives: equipoStats.estadisticas.esquives || 0,
            esquivesExitosos: equipoStats.estadisticas.esquivesExitosos || 0,
            ponchado: equipoStats.estadisticas.ponchado || 0,
            catchesIntentos: equipoStats.estadisticas.catchesIntentos || 0,
            bloqueosIntentos: equipoStats.estadisticas.bloqueosIntentos || 0,
            indiceAtaque: equipoStats.estadisticas.indiceAtaque || 0,
            indiceDefensa: equipoStats.estadisticas.indiceDefensa || 0,
            indicePoder: equipoStats.estadisticas.indicePoder || 0
          };

          Object.assign(equipoStats.estadisticas, equipoNuevosCampos);
        }

        await jugador.save();
        jugadoresActualizados++;
        
        resultados.push({
          jugador: nombreJugador,
          id: jugador._id,
          estado: 'actualizado',
          estadisticas: {
            indicePoder: estadisticasCompletas.indicePoder,
            indiceAtaque: estadisticasCompletas.indiceAtaque,
            indiceDefensa: estadisticasCompletas.indiceDefensa,
            porcentajeHits: estadisticasCompletas.porcentajeHits,
            porcentajeCatches: estadisticasCompletas.porcentajeCatches,
            porcentajeBloqueos: estadisticasCompletas.porcentajeBloqueos
          }
        });
        
        console.log(`✅ ${nombreJugador} actualizado`);

      } catch (error) {
        console.error(`❌ Error actualizando ${jugador.nombre}:`, error.message);
        errores++;
        resultados.push({
          jugador: `${jugador.nombre} ${jugador.apellido}`,
          id: jugador._id,
          estado: 'error',
          error: error.message
        });
      }
    }

    const resumen = {
      mensaje: 'Migración completada',
      totalJugadores: jugadores.length,
      jugadoresActualizados,
      errores,
      resultados
    };

    console.log('\n📈 Resumen de migración:');
    console.log(`✅ Jugadores actualizados: ${jugadoresActualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${jugadores.length}`);

    res.json({
      success: true,
      ...resumen
    });

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error en la migración',
      error: error.message
    });
  }
};

/**
 * Verificar el estado de la migración
 */
const verificarEstadoMigracion = async (req, res) => {
  try {
    const totalJugadores = await Jugador.countDocuments();
    const jugadoresConNuevosCampos = await Jugador.countDocuments({
      'estadisticasGenerales.setsJugados': { $exists: true }
    });
    
    res.json({
      success: true,
      totalJugadores,
      jugadoresConNuevosCampos,
      porcentajeMigrado: totalJugadores > 0 ? (jugadoresConNuevosCampos / totalJugadores * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  migrarEstadisticas,
  verificarEstadoMigracion
};
