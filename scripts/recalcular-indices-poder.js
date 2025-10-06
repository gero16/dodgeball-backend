const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app/api';

async function recalcularIndicesPoder() {
  try {
    console.log('🔄 Recalculando índices de poder con las fórmulas correctas...\n');

    // 1. Obtener todas las estadísticas existentes
    console.log('📊 Obteniendo estadísticas existentes...');
    const estadisticasResponse = await axios.get(`${API_BASE_URL}/estadisticas`);
    
    if (!estadisticasResponse.data.success) {
      throw new Error('Error obteniendo estadísticas');
    }

    const estadisticas = estadisticasResponse.data.data;
    console.log(`✅ Encontradas ${estadisticas.length} estadísticas\n`);

    if (estadisticas.length === 0) {
      console.log('ℹ️  No hay estadísticas para recalcular');
      return;
    }

    // 2. Recalcular cada estadística
    let actualizadas = 0;
    let errores = 0;

    for (const estadistica of estadisticas) {
      try {
        console.log(`🔄 Recalculando ${estadistica.jugador?.nombre} ${estadistica.jugador?.apellido}...`);
        
        // Simplemente actualizar la estadística para que se recalculen los índices
        const updateResponse = await axios.put(
          `${API_BASE_URL}/estadisticas/${estadistica._id}`,
          {
            // Solo enviar los campos que necesitan recálculo
            setsJugados: estadistica.setsJugados,
            tirosTotales: estadistica.tirosTotales,
            hits: estadistica.hits,
            quemados: estadistica.quemados,
            asistencias: estadistica.asistencias,
            catchesRecibidos: estadistica.catchesRecibidos,
            bloqueos: estadistica.bloqueos,
            catches: estadistica.catches,
            esquives: estadistica.esquives,
            esquivesSinEsfuerzo: estadistica.esquivesSinEsfuerzo,
            hitsRecibidos: estadistica.hitsRecibidos,
            tirosRecibidos: estadistica.tirosRecibidos
          }
        );

        if (updateResponse.data.success) {
          const nuevaEstadistica = updateResponse.data.data;
          console.log(`   ✅ Actualizada - Ataque: ${nuevaEstadistica.indiceAtaque.toFixed(2)}, Defensa: ${nuevaEstadistica.indiceDefensa.toFixed(2)}, Poder: ${nuevaEstadistica.indicePoder.toFixed(2)}`);
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
    console.log('\n📈 Resumen del recálculo:');
    console.log(`   ✅ Actualizadas: ${actualizadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesadas: ${estadisticas.length}`);

    // 4. Mostrar nuevo ranking
    console.log('\n🏆 Nuevo ranking por índice de poder:');
    const estadisticasFinalesResponse = await axios.get(`${API_BASE_URL}/eventos/68db0409ddcdb45a97d57ffd/estadisticas/jugadores`);
    const rankingFinal = estadisticasFinalesResponse.data.data.estadisticas.rankingGeneral;
    
    rankingFinal.slice(0, 10).forEach((estadistica, index) => {
      console.log(`   ${index + 1}. ${estadistica.jugador.nombre} ${estadistica.jugador.apellido} - Poder: ${estadistica.indicePoder.toFixed(2)}`);
    });

    console.log('\n🎉 Recálculo completado!');
    console.log('✅ Script completado');

  } catch (error) {
    console.error('❌ Error en el recálculo:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar el script
recalcularIndicesPoder();
