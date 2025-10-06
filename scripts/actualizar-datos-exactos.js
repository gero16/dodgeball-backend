const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Datos exactos que me proporcionaste
const datosExactos = [
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

async function actualizarDatosExactos() {
  try {
    console.log('🔄 Actualizando estadísticas con datos exactos...\n');

    // 1. Obtener todas las estadísticas existentes
    console.log('📊 Obteniendo estadísticas existentes...');
    const estadisticasResponse = await axios.get(`${API_BASE_URL}/estadisticas`);
    const estadisticas = estadisticasResponse.data.data;
    console.log(`✅ Encontradas ${estadisticas.length} estadísticas\n`);

    if (estadisticas.length === 0) {
      console.log('ℹ️  No hay estadísticas para actualizar');
      return;
    }

    let actualizadas = 0;
    let errores = 0;

    // 2. Iterar y actualizar cada estadística con datos exactos
    for (const datoJugador of datosExactos) {
      const estadisticaExistente = estadisticas.find(
        (e) =>
          e.jugador.nombre === datoJugador.nombre &&
          e.jugador.apellido === datoJugador.apellido
      );

      if (estadisticaExistente) {
        console.log(`🔄 Actualizando ${datoJugador.nombre} ${datoJugador.apellido}...`);
        try {
          await axios.put(`${API_BASE_URL}/estadisticas/${estadisticaExistente._id}`, {
            setsJugados: datoJugador.setsJugados,
            tirosTotales: datoJugador.tirosTotales,
            hits: datoJugador.hits,
            quemados: datoJugador.quemados,
            asistencias: datoJugador.asistencias,
            tirosRecibidos: datoJugador.tirosRecibidos,
            hitsRecibidos: datoJugador.hitsRecibidos,
            esquives: datoJugador.esquives,
            esquivesSinEsfuerzo: datoJugador.esquivesSinEsfuerzo,
            ponchado: datoJugador.ponchado,
            catchesIntentados: datoJugador.catchesIntentados,
            catches: datoJugador.catches,
            bloqueosIntentados: datoJugador.bloqueosIntentados,
            bloqueos: datoJugador.bloqueos,
            pisoLinea: datoJugador.pisoLinea,
            catchesRecibidos: datoJugador.catchesRecibidos,
            porcentajeHits: datoJugador.porcentajeHits,
            porcentajeOuts: datoJugador.porcentajeOuts,
            porcentajeCatches: datoJugador.porcentajeCatches,
            porcentajeBloqueos: datoJugador.porcentajeBloqueos,
            indiceAtaque: datoJugador.indiceAtaque,
            indiceDefensa: datoJugador.indiceDefensa,
            indicePoder: datoJugador.indicePoder,
          });
          console.log(`   ✅ Actualizada - Poder: ${datoJugador.indicePoder}`);
          actualizadas++;
        } catch (error) {
          console.error(`   ❌ Error actualizando ${datoJugador.nombre} ${datoJugador.apellido}: ${error.message}`);
          errores++;
        }
      } else {
        console.log(`   ⚠️  Estadística no encontrada para ${datoJugador.nombre} ${datoJugador.apellido}. Saltando.`);
      }
    }

    console.log('\n📈 Resumen de la actualización:');
    console.log(`   ✅ Actualizadas: ${actualizadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesadas: ${datosExactos.length}`);

    // 3. Verificar estadísticas finales ordenadas por poder
    console.log('\n🔍 Verificando estadísticas finales...');
    const estadisticasFinalesResponse = await axios.get(`${API_BASE_URL}/estadisticas?evento=68db0409ddcdb45a97d57ffd`);
    const estadisticasFinales = estadisticasFinalesResponse.data.data;

    console.log('\n🏆 Ranking final por índice de poder:');
    estadisticasFinales
      .sort((a, b) => b.indicePoder - a.indicePoder)
      .forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.jugador.nombre} ${e.jugador.apellido} - Poder: ${e.indicePoder}`);
      });

    console.log('\n🎉 Actualización completada!');
  } catch (error) {
    console.error('❌ Error en la actualización:', error.message);
  } finally {
    console.log('✅ Script completado');
  }
}

actualizarDatosExactos();
