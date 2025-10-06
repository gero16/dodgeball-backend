const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app/api';

// ID del evento "Liga de Dodgeball 2024"
const EVENTO_LIGA_2024 = '68db0409ddcdb45a97d57ffd';

async function actualizarEstadisticasConEvento() {
  try {
    console.log('🔄 Actualizando estadísticas con evento "Liga de Dodgeball 2024"...\n');

    // 1. Obtener todas las estadísticas existentes
    console.log('📊 Obteniendo estadísticas existentes...');
    const estadisticasResponse = await axios.get(`${API_BASE_URL}/estadisticas`);
    
    if (!estadisticasResponse.data.success) {
      throw new Error('Error obteniendo estadísticas');
    }

    const estadisticas = estadisticasResponse.data.data;
    console.log(`✅ Encontradas ${estadisticas.length} estadísticas\n`);

    if (estadisticas.length === 0) {
      console.log('ℹ️  No hay estadísticas para actualizar');
      return;
    }

    // 2. Actualizar cada estadística con el evento
    let actualizadas = 0;
    let errores = 0;

    for (const estadistica of estadisticas) {
      try {
        console.log(`🔄 Actualizando estadística de ${estadistica.jugador?.nombre} ${estadistica.jugador?.apellido}...`);
        
        const updateData = {
          evento: EVENTO_LIGA_2024
        };

        const updateResponse = await axios.put(
          `${API_BASE_URL}/estadisticas/${estadistica._id}`,
          updateData
        );

        if (updateResponse.data.success) {
          console.log(`   ✅ Actualizada correctamente`);
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
    console.log(`   📊 Total procesadas: ${estadisticas.length}`);

    // 4. Verificar estadísticas finales
    console.log('\n🔍 Verificando estadísticas finales...');
    const estadisticasFinalesResponse = await axios.get(`${API_BASE_URL}/estadisticas`);
    const estadisticasFinales = estadisticasFinalesResponse.data.data;
    
    const conEvento = estadisticasFinales.filter(e => e.evento === EVENTO_LIGA_2024);
    console.log(`   📊 Total de estadísticas: ${estadisticasFinales.length}`);
    console.log(`   🏆 Con evento "Liga de Dodgeball 2024": ${conEvento.length}`);

    if (conEvento.length > 0) {
      console.log('\n🏆 Ranking actualizado:');
      conEvento
        .sort((a, b) => b.indicePoder - a.indicePoder)
        .slice(0, 10)
        .forEach((estadistica, index) => {
          console.log(`   ${index + 1}. ${estadistica.jugador?.nombre} ${estadistica.jugador?.apellido} - Poder: ${estadistica.indicePoder}`);
        });
    }

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
actualizarEstadisticasConEvento();
