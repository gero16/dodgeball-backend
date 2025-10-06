/**
 * Script para migrar estadísticas existentes a la nueva estructura
 * Este script actualiza los jugadores existentes con los nuevos campos de estadísticas
 */

const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const { calcularEstadisticasCompletas } = require('../src/utils/estadisticas');
require('dotenv').config();

async function migrarEstadisticas() {
  try {
    console.log('🔄 Iniciando migración de estadísticas...');
    
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball');
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los jugadores
    const jugadores = await Jugador.find({});
    console.log(`📊 Encontrados ${jugadores.length} jugadores para migrar`);

    let jugadoresActualizados = 0;
    let errores = 0;

    for (const jugador of jugadores) {
      try {
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
        
        console.log(`✅ Jugador ${jugador.nombre} ${jugador.apellido} actualizado`);

      } catch (error) {
        console.error(`❌ Error actualizando jugador ${jugador.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`✅ Jugadores actualizados: ${jugadoresActualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${jugadores.length}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrarEstadisticas()
    .then(() => {
      console.log('🎉 Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = migrarEstadisticas;
