/**
 * Script para probar el nuevo modelo de Estadísticas
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

async function probarEstadisticas() {
  try {
    console.log('🧪 Probando modelo de Estadísticas...\n');

    // 1. Crear una estadística de prueba
    console.log('📊 Creando estadística de prueba...');
    const estadisticaPrueba = {
      equipo: '65f8a1b2c3d4e5f6a7b8c9d0', // ID de equipo de prueba
      jugador: '65f8a1b2c3d4e5f6a7b8c9d1', // ID de jugador de prueba
      setsJugados: 15,
      tirosTotales: 120,
      hits: 45,
      quemados: 32,
      asistencias: 18,
      tirosRecibidos: 80,
      hitsRecibidos: 25,
      esquives: 35,
      esquivesSinEsfuerzo: 28,
      ponchado: 7,
      catchesIntentados: 25,
      catches: 18,
      bloqueosIntentados: 30,
      bloqueos: 22,
      pisoLinea: 3,
      catchesRecibidos: 8,
      temporada: '2024-2025'
    };

    const responseCrear = await axios.post(`${API_BASE_URL}/api/estadisticas`, estadisticaPrueba);
    console.log('✅ Estadística creada:', responseCrear.data.message);

    // 2. Obtener todas las estadísticas
    console.log('\n📋 Obteniendo todas las estadísticas...');
    const responseLista = await axios.get(`${API_BASE_URL}/api/estadisticas`);
    console.log(`✅ Encontradas ${responseLista.data.data.length} estadísticas`);

    // 3. Obtener resumen
    console.log('\n📈 Obteniendo resumen...');
    const responseResumen = await axios.get(`${API_BASE_URL}/api/estadisticas/resumen`);
    console.log('✅ Resumen:', responseResumen.data.data);

    // 4. Obtener ranking
    console.log('\n🏆 Obteniendo ranking...');
    const responseRanking = await axios.get(`${API_BASE_URL}/api/estadisticas/ranking?criterio=indicePoder&limite=5`);
    console.log('✅ Top 5 jugadores por índice de poder:');
    responseRanking.data.data.forEach((estadistica, index) => {
      console.log(`   ${index + 1}. ${estadistica.jugador?.nombre || 'N/A'} ${estadistica.jugador?.apellido || 'N/A'} - Poder: ${estadistica.indicePoder}`);
    });

    console.log('\n🎉 Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar
if (require.main === module) {
  probarEstadisticas()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = probarEstadisticas;
