const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app/api';

async function testFelipe() {
  try {
    console.log('🔄 Actualizando solo Felipe Demarco...\n');

    // Obtener estadística de Felipe
    const response = await axios.get(`${API_BASE_URL}/estadisticas`);
    const estadisticas = response.data.data;
    const felipe = estadisticas.find(est => est.jugador.nombre === 'Felipe' && est.jugador.apellido === 'Demarco');

    if (!felipe) {
      console.log('❌ No se encontró Felipe Demarco');
      return;
    }

    console.log('📊 Datos actuales de Felipe:');
    console.log(`   - Índice Poder: ${felipe.indicePoder}`);
    console.log(`   - % Hits: ${felipe.porcentajeHits}`);
    console.log('');

    console.log('🔄 Actualizando con datos del Excel...');
    const updateResponse = await axios.put(
      `${API_BASE_URL}/estadisticas/${felipe._id}`,
      {
        indicePoder: 99.99,
        porcentajeHits: 99.99
      }
    );

    if (updateResponse.data.success) {
      console.log('✅ Actualización exitosa');
      console.log('📊 Datos después de la actualización:');
      console.log(`   - Índice Poder: ${updateResponse.data.data.indicePoder}`);
      console.log(`   - % Hits: ${updateResponse.data.data.porcentajeHits}`);
    } else {
      console.log('❌ Error en la actualización:', updateResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

testFelipe();
