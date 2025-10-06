/**
 * Script DEMO para migrar estadísticas existentes a la nueva estructura
 * Este script simula la migración sin conectarse a la base de datos
 * Útil para verificar que la lógica de migración funciona correctamente
 */

const { calcularEstadisticasCompletas } = require('../src/utils/estadisticas');

// Datos de ejemplo para simular jugadores existentes
const jugadoresEjemplo = [
  {
    _id: '1',
    nombre: 'Felipe',
    apellido: 'Demarco',
    posicion: 'thrower',
    numeroCamiseta: 10,
    estadisticasGenerales: {
      partidosJugados: 5,
      hits: 20,
      catches: 5,
      bloqueos: 15,
      // Campos que necesitan migración
      setsJugados: 0, // Se inicializará
      tirosTotales: 0,
      asistencias: 0,
      tirosRecibidos: 0,
      hitsRecibidos: 0,
      esquives: 0,
      esquivesExitosos: 0,
      ponchado: 0,
      porcentajeOuts: 0,
      catchesIntentos: 0,
      catchesRecibidos: 0,
      bloqueosIntentos: 0,
      pisoLinea: 0,
      indiceAtaque: 0,
      indiceDefensa: 0,
      indicePoder: 0
    }
  },
  {
    _id: '2',
    nombre: 'Alejandro',
    apellido: 'Rocca',
    posicion: 'catcher',
    numeroCamiseta: 7,
    estadisticasGenerales: {
      partidosJugados: 8,
      hits: 15,
      catches: 12,
      bloqueos: 8,
      // Campos que necesitan migración
      setsJugados: 0,
      tirosTotales: 0,
      asistencias: 0,
      tirosRecibidos: 0,
      hitsRecibidos: 0,
      esquives: 0,
      esquivesExitosos: 0,
      ponchado: 0,
      porcentajeOuts: 0,
      catchesIntentos: 0,
      catchesRecibidos: 0,
      bloqueosIntentos: 0,
      pisoLinea: 0,
      indiceAtaque: 0,
      indiceDefensa: 0,
      indicePoder: 0
    }
  }
];

async function migrarEstadisticasDemo() {
  try {
    console.log('🔄 Iniciando migración DEMO de estadísticas...');
    console.log('📊 Este es un simulador - no se conecta a la base de datos real\n');

    let jugadoresActualizados = 0;
    let errores = 0;

    for (const jugador of jugadoresEjemplo) {
      try {
        console.log(`\n👤 Procesando jugador: ${jugador.nombre} ${jugador.apellido}`);
        
        // Simular datos de un partido para agregar estadísticas
        const estadisticasPartido = {
          setsJugados: 3,
          tirosTotales: 15,
          hits: 8,
          quemados: 6,
          asistencias: 2,
          tirosRecibidos: 12,
          hitsRecibidos: 4,
          esquives: 5,
          esquivesExitosos: 4,
          ponchado: 2,
          catchesIntentos: 3,
          catches: 2,
          catchesRecibidos: 1,
          bloqueosIntentos: 8,
          bloqueos: 6,
          pisoLinea: 0,
          tarjetasAmarillas: 0,
          tarjetasRojas: 0,
          eliminaciones: 6,
          vecesEliminado: 2,
          minutosJugados: 45,
          puntos: 12
        };

        // Mostrar estadísticas antes de la migración
        console.log('📈 Estadísticas ANTES de la migración:');
        console.log(`   - Partidos jugados: ${jugador.estadisticasGenerales.partidosJugados}`);
        console.log(`   - Hits: ${jugador.estadisticasGenerales.hits}`);
        console.log(`   - Catches: ${jugador.estadisticasGenerales.catches}`);
        console.log(`   - Bloqueos: ${jugador.estadisticasGenerales.bloqueos}`);
        console.log(`   - Índice de Poder: ${jugador.estadisticasGenerales.indicePoder}`);

        // Simular agregar estadísticas del partido
        const stats = jugador.estadisticasGenerales;
        
        // Agregar estadísticas del partido
        stats.partidosJugados += 1;
        stats.setsJugados += estadisticasPartido.setsJugados;
        stats.tirosTotales += estadisticasPartido.tirosTotales;
        stats.hits += estadisticasPartido.hits;
        stats.quemados += estadisticasPartido.quemados;
        stats.asistencias += estadisticasPartido.asistencias;
        stats.tirosRecibidos += estadisticasPartido.tirosRecibidos;
        stats.hitsRecibidos += estadisticasPartido.hitsRecibidos;
        stats.esquives += estadisticasPartido.esquives;
        stats.esquivesExitosos += estadisticasPartido.esquivesExitosos;
        stats.ponchado += estadisticasPartido.ponchado;
        stats.catches += estadisticasPartido.catches;
        stats.catchesIntentos += estadisticasPartido.catchesIntentos;
        stats.catchesRecibidos += estadisticasPartido.catchesRecibidos;
        stats.bloqueos += estadisticasPartido.bloqueos;
        stats.bloqueosIntentos += estadisticasPartido.bloqueosIntentos;
        stats.pisoLinea += estadisticasPartido.pisoLinea;
        stats.eliminaciones += estadisticasPartido.eliminaciones;
        stats.vecesEliminado += estadisticasPartido.vecesEliminado;
        stats.minutosJugados += estadisticasPartido.minutosJugados;
        stats.puntos += estadisticasPartido.puntos;

        // Calcular estadísticas completas (porcentajes e índices)
        const estadisticasCompletas = calcularEstadisticasCompletas(stats);
        jugador.estadisticasGenerales = estadisticasCompletas;

        // Mostrar estadísticas después de la migración
        console.log('\n📈 Estadísticas DESPUÉS de la migración:');
        console.log(`   - Partidos jugados: ${estadisticasCompletas.partidosJugados}`);
        console.log(`   - Sets jugados: ${estadisticasCompletas.setsJugados}`);
        console.log(`   - Tiros totales: ${estadisticasCompletas.tirosTotales}`);
        console.log(`   - Hits: ${estadisticasCompletas.hits}`);
        console.log(`   - Quemados: ${estadisticasCompletas.quemados}`);
        console.log(`   - Asistencias: ${estadisticasCompletas.asistencias}`);
        console.log(`   - % Hits: ${estadisticasCompletas.porcentajeHits.toFixed(2)}%`);
        console.log(`   - Catches: ${estadisticasCompletas.catches}`);
        console.log(`   - % Catches: ${estadisticasCompletas.porcentajeCatches.toFixed(2)}%`);
        console.log(`   - Bloqueos: ${estadisticasCompletas.bloqueos}`);
        console.log(`   - % Bloqueos: ${estadisticasCompletas.porcentajeBloqueos.toFixed(2)}%`);
        console.log(`   - Esquives exitosos: ${estadisticasCompletas.esquivesExitosos}`);
        console.log(`   - Ponchado: ${estadisticasCompletas.ponchado}`);
        console.log(`   - % Outs: ${estadisticasCompletas.porcentajeOuts.toFixed(2)}%`);
        console.log(`   - Índice de Ataque: ${estadisticasCompletas.indiceAtaque.toFixed(2)}`);
        console.log(`   - Índice de Defensa: ${estadisticasCompletas.indiceDefensa.toFixed(2)}`);
        console.log(`   - Índice de Poder: ${estadisticasCompletas.indicePoder.toFixed(2)}`);

        jugadoresActualizados++;
        console.log(`✅ Jugador ${jugador.nombre} ${jugador.apellido} actualizado correctamente`);

      } catch (error) {
        console.error(`❌ Error actualizando jugador ${jugador.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n📈 Resumen de migración DEMO:');
    console.log(`✅ Jugadores actualizados: ${jugadoresActualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${jugadoresEjemplo.length}`);

    console.log('\n🎯 Próximos pasos para la migración real:');
    console.log('1. Instalar MongoDB localmente o configurar MongoDB Atlas');
    console.log('2. Ejecutar: node scripts/migrar-estadisticas-avanzadas.js');
    console.log('3. Verificar que los datos se migraron correctamente');

  } catch (error) {
    console.error('❌ Error en la migración DEMO:', error);
  }
}

// Ejecutar migración demo si se llama directamente
if (require.main === module) {
  migrarEstadisticasDemo()
    .then(() => {
      console.log('\n🎉 Migración DEMO completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = migrarEstadisticasDemo;
