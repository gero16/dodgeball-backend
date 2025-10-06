const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app/api';

// Datos exactos del Excel proporcionado por el usuario
const datosExcel = [
  {
    nombre: 'Felipe',
    apellido: 'Demarco',
    equipo: 'BUMBA',
    setsJugados: 9,
    tirosTotales: 61,
    hits: 20,
    quemados: 18,
    asistencias: 2,
    tirosRecibidos: 47,
    hitsRecibidos: 22,
    esquives: 3,
    esquivesSinEsfuerzo: 15,
    ponchado: 6,
    catchesIntentados: 1,
    catches: 0,
    bloqueosIntentados: 19,
    bloqueos: 18,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 32.8,
    porcentajeOuts: 29.5,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 81.8,
    indiceAtaque: 10.08,
    indiceDefensa: 5.79,
    indicePoder: 90.62
  },
  {
    nombre: 'Alejandro',
    apellido: 'Rocca',
    equipo: 'THE DODGEBALL MONKEYS',
    setsJugados: 11,
    tirosTotales: 68,
    hits: 26,
    quemados: 19,
    asistencias: 2,
    tirosRecibidos: 22,
    hitsRecibidos: 15,
    esquives: 4,
    esquivesSinEsfuerzo: 3,
    ponchado: 6,
    catchesIntentados: 1,
    catches: 1,
    bloqueosIntentados: 10,
    bloqueos: 8,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 38.2,
    porcentajeOuts: 27.9,
    porcentajeCatches: 6.7,
    porcentajeBloqueos: 53.3,
    indiceAtaque: 10.35,
    indiceDefensa: 3.59,
    indicePoder: 81.03
  },
  {
    nombre: 'Guzmán',
    apellido: 'Demarco',
    equipo: 'THE CATCHERS',
    setsJugados: 9,
    tirosTotales: 63,
    hits: 23,
    quemados: 20,
    asistencias: 4,
    tirosRecibidos: 20,
    hitsRecibidos: 7,
    esquives: 6,
    esquivesSinEsfuerzo: 4,
    ponchado: 6,
    catchesIntentados: 2,
    catches: 0,
    bloqueosIntentados: 2,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 36.5,
    porcentajeOuts: 31.7,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 28.6,
    indiceAtaque: 11.77,
    indiceDefensa: 1.36,
    indicePoder: 77.65
  },
  {
    nombre: 'Rafael',
    apellido: 'García',
    equipo: 'LA NEOFARAFA',
    setsJugados: 11,
    tirosTotales: 73,
    hits: 21,
    quemados: 14,
    asistencias: 1,
    tirosRecibidos: 35,
    hitsRecibidos: 14,
    esquives: 5,
    esquivesSinEsfuerzo: 16,
    ponchado: 8,
    catchesIntentados: 2,
    catches: 2,
    bloqueosIntentados: 6,
    bloqueos: 6,
    pisoLinea: 1,
    catchesRecibidos: 1,
    porcentajeHits: 28.8,
    porcentajeOuts: 19.2,
    porcentajeCatches: 14.3,
    porcentajeBloqueos: 42.9,
    indiceAtaque: 7.63,
    indiceDefensa: 5.66,
    indicePoder: 76.49
  },
  {
    nombre: 'Valentino',
    apellido: 'Gloodtdfosky',
    equipo: 'THE DODGEBALL MONKEYS',
    setsJugados: 11,
    tirosTotales: 63,
    hits: 23,
    quemados: 18,
    asistencias: 1,
    tirosRecibidos: 20,
    hitsRecibidos: 5,
    esquives: 5,
    esquivesSinEsfuerzo: 9,
    ponchado: 5,
    catchesIntentados: 2,
    catches: 1,
    bloqueosIntentados: 2,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 1,
    porcentajeHits: 36.5,
    porcentajeOuts: 28.6,
    porcentajeCatches: 20.0,
    porcentajeBloqueos: 40.0,
    indiceAtaque: 9.21,
    indiceDefensa: 3.80,
    indicePoder: 75.81
  },
  {
    nombre: 'Salvador',
    apellido: 'Méndez',
    equipo: 'THE DODGEBALL MONKEYS',
    setsJugados: 11,
    tirosTotales: 28,
    hits: 8,
    quemados: 8,
    asistencias: 1,
    tirosRecibidos: 32,
    hitsRecibidos: 8,
    esquives: 7,
    esquivesSinEsfuerzo: 17,
    ponchado: 5,
    catchesIntentados: 1,
    catches: 1,
    bloqueosIntentados: 4,
    bloqueos: 4,
    pisoLinea: 1,
    catchesRecibidos: 0,
    porcentajeHits: 28.6,
    porcentajeOuts: 28.6,
    porcentajeCatches: 12.5,
    porcentajeBloqueos: 50.0,
    indiceAtaque: 4.07,
    indiceDefensa: 4.89,
    indicePoder: 52.92
  },
  {
    nombre: 'Edewel',
    apellido: 'Cremel',
    equipo: 'THE CATCHERS',
    setsJugados: 9,
    tirosTotales: 34,
    hits: 12,
    quemados: 3,
    asistencias: 2,
    tirosRecibidos: 34,
    hitsRecibidos: 10,
    esquives: 7,
    esquivesSinEsfuerzo: 16,
    ponchado: 8,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 5,
    bloqueos: 5,
    pisoLinea: 0,
    catchesRecibidos: 1,
    porcentajeHits: 35.3,
    porcentajeOuts: 8.8,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 50.0,
    indiceAtaque: 3.48,
    indiceDefensa: 3.03,
    indicePoder: 40.30
  },
  {
    nombre: 'Gerónimo',
    apellido: 'Nicola',
    equipo: 'LA NEOFARAFA',
    setsJugados: 11,
    tirosTotales: 49,
    hits: 16,
    quemados: 9,
    asistencias: 3,
    tirosRecibidos: 15,
    hitsRecibidos: 10,
    esquives: 0,
    esquivesSinEsfuerzo: 5,
    ponchado: 8,
    catchesIntentados: 1,
    catches: 1,
    bloqueosIntentados: 2,
    bloqueos: 1,
    pisoLinea: 0,
    catchesRecibidos: 1,
    porcentajeHits: 32.7,
    porcentajeOuts: 18.4,
    porcentajeCatches: 10.0,
    porcentajeBloqueos: 10.0,
    indiceAtaque: 5.84,
    indiceDefensa: 0.40,
    indicePoder: 40.05
  },
  {
    nombre: 'Agustín',
    apellido: 'Giles',
    equipo: 'BUMBA',
    setsJugados: 9,
    tirosTotales: 35,
    hits: 8,
    quemados: 7,
    asistencias: 1,
    tirosRecibidos: 18,
    hitsRecibidos: 7,
    esquives: 3,
    esquivesSinEsfuerzo: 8,
    ponchado: 7,
    catchesIntentados: 1,
    catches: 1,
    bloqueosIntentados: 1,
    bloqueos: 1,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 22.9,
    porcentajeOuts: 20.0,
    porcentajeCatches: 14.3,
    porcentajeBloqueos: 14.3,
    indiceAtaque: 4.08,
    indiceDefensa: 2.28,
    indicePoder: 39.85
  },
  {
    nombre: 'Santiago',
    apellido: 'Giles',
    equipo: 'BUMBA',
    setsJugados: 9,
    tirosTotales: 19,
    hits: 8,
    quemados: 8,
    asistencias: 2,
    tirosRecibidos: 14,
    hitsRecibidos: 6,
    esquives: 3,
    esquivesSinEsfuerzo: 4,
    ponchado: 5,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 2,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 42.1,
    porcentajeOuts: 42.1,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 33.3,
    indiceAtaque: 4.86,
    indiceDefensa: 0.80,
    indicePoder: 36.61
  }
];

async function actualizarDatosExcel() {
  try {
    console.log('🔄 Actualizando estadísticas con datos exactos del Excel...\n');

    // 1. Obtener todas las estadísticas existentes
    console.log('📊 Obteniendo estadísticas existentes...');
    const estadisticasResponse = await axios.get(`${API_BASE_URL}/estadisticas`);
    
    if (!estadisticasResponse.data.success) {
      throw new Error('Error obteniendo estadísticas');
    }

    const estadisticas = estadisticasResponse.data.data;
    console.log(`✅ Encontradas ${estadisticas.length} estadísticas\n`);

    let actualizadas = 0;
    let errores = 0;

    // 2. Actualizar cada estadística con los datos del Excel
    for (const datosJugador of datosExcel) {
      try {
        // Buscar la estadística por nombre del jugador
        const estadistica = estadisticas.find(est => 
          est.jugador.nombre === datosJugador.nombre && 
          est.jugador.apellido === datosJugador.apellido
        );

        if (!estadistica) {
          console.log(`❌ No se encontró estadística para ${datosJugador.nombre} ${datosJugador.apellido}`);
          errores++;
          continue;
        }

        console.log(`🔄 Actualizando ${datosJugador.nombre} ${datosJugador.apellido}...`);
        
        // Actualizar con los datos exactos del Excel
        const updateResponse = await axios.put(
          `${API_BASE_URL}/estadisticas/${estadistica._id}`,
          {
            setsJugados: datosJugador.setsJugados,
            tirosTotales: datosJugador.tirosTotales,
            hits: datosJugador.hits,
            quemados: datosJugador.quemados,
            asistencias: datosJugador.asistencias,
            tirosRecibidos: datosJugador.tirosRecibidos,
            hitsRecibidos: datosJugador.hitsRecibidos,
            esquives: datosJugador.esquives,
            esquivesSinEsfuerzo: datosJugador.esquivesSinEsfuerzo,
            ponchado: datosJugador.ponchado,
            catchesIntentados: datosJugador.catchesIntentados,
            catches: datosJugador.catches,
            bloqueosIntentados: datosJugador.bloqueosIntentados,
            bloqueos: datosJugador.bloqueos,
            pisoLinea: datosJugador.pisoLinea,
            catchesRecibidos: datosJugador.catchesRecibidos,
            porcentajeHits: datosJugador.porcentajeHits,
            porcentajeOuts: datosJugador.porcentajeOuts,
            porcentajeCatches: datosJugador.porcentajeCatches,
            porcentajeBloqueos: datosJugador.porcentajeBloqueos,
            indiceAtaque: datosJugador.indiceAtaque,
            indiceDefensa: datosJugador.indiceDefensa,
            indicePoder: datosJugador.indicePoder
          }
        );

        if (updateResponse.data.success) {
          console.log(`   ✅ Actualizada - Poder: ${datosJugador.indicePoder}`);
          actualizadas++;
        } else {
          console.log(`   ❌ Error: ${updateResponse.data.message}`);
          errores++;
        }
      } catch (error) {
        console.log(`   ❌ Error actualizando: ${error.response?.data?.message || error.message}`);
        errores++;
      }
    }

    // 3. Verificar resultado final
    console.log('\n📈 Resumen de la actualización:');
    console.log(`   ✅ Actualizadas: ${actualizadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesadas: ${datosExcel.length}`);

    // 4. Mostrar nuevo ranking
    console.log('\n🏆 Nuevo ranking por índice de poder:');
    const estadisticasFinalesResponse = await axios.get(`${API_BASE_URL}/eventos/68db0409ddcdb45a97d57ffd/estadisticas/jugadores`);
    const rankingFinal = estadisticasFinalesResponse.data.data.estadisticas.rankingGeneral;
    
    rankingFinal.slice(0, 10).forEach((estadistica, index) => {
      console.log(`   ${index + 1}. ${estadistica.jugador.nombre} ${estadistica.jugador.apellido} - Poder: ${estadistica.indicePoder}`);
    });

    console.log('\n🎉 Actualización completada!');
    console.log('✅ Script completado');

  } catch (error) {
    console.error('❌ Error en la actualización:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar el script
actualizarDatosExcel();
