const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app/api';

async function verificarDatos() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    // Obtener estadísticas
    const response = await axios.get(`${API_BASE_URL}/estadisticas`);
    const estadisticas = response.data.data;

    console.log('📊 Datos actuales en la BD:');
    estadisticas.forEach((est, index) => {
      console.log(`${index + 1}. ${est.jugador.nombre} ${est.jugador.apellido}:`);
      console.log(`   - Índice Poder: ${est.indicePoder}`);
      console.log(`   - % Hits: ${est.porcentajeHits}`);
      console.log(`   - Hits: ${est.hits}`);
      console.log(`   - Tiros Totales: ${est.tirosTotales}`);
      console.log('');
    });

    // Verificar específicamente Felipe Demarco
    const felipe = estadisticas.find(est => est.jugador.nombre === 'Felipe' && est.jugador.apellido === 'Demarco');
    if (felipe) {
      console.log('🎯 Verificación específica de Felipe Demarco:');
      console.log(`   - Índice Poder almacenado: ${felipe.indicePoder}`);
      console.log(`   - % Hits almacenado: ${felipe.porcentajeHits}`);
      console.log(`   - Valor esperado del Excel: 90.62`);
      console.log(`   - % Hits esperado del Excel: 32.8`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarDatos();
