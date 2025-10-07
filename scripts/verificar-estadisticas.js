require('dotenv').config();
const mongoose = require('mongoose');
const Estadistica = require('../src/models/Estadistica');
const Jugador = require('../src/models/Jugador');
const Equipo = require('../src/models/Equipo');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function verificarEstadisticas() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Verificando estadísticas...');
    
    // Obtener todas las estadísticas
    const estadisticas = await Estadistica.find({});
    console.log(`📈 Total de estadísticas: ${estadisticas.length}`);
    
    // Verificar estadísticas con referencias nulas
    const estadisticasProblematicas = [];
    
    for (const estadistica of estadisticas) {
      try {
        // Intentar acceder a los virtuals para detectar problemas
        const jugadorNombre = estadistica.jugadorNombre;
        const equipoNombre = estadistica.equipoNombre;
        
        if (jugadorNombre === 'Jugador no encontrado' || equipoNombre === 'Equipo no encontrado') {
          estadisticasProblematicas.push({
            id: estadistica._id,
            jugador: estadistica.jugador,
            equipo: estadistica.equipo,
            evento: estadistica.evento,
            jugadorNombre,
            equipoNombre
          });
        }
      } catch (error) {
        console.log(`❌ Error en estadística ${estadistica._id}:`, error.message);
        estadisticasProblematicas.push({
          id: estadistica._id,
          error: error.message
        });
      }
    }
    
    console.log(`\n⚠️  Estadísticas problemáticas: ${estadisticasProblematicas.length}`);
    
    if (estadisticasProblematicas.length > 0) {
      console.log('\n📋 Lista de estadísticas problemáticas:');
      estadisticasProblematicas.forEach((est, index) => {
        console.log(`${index + 1}. ID: ${est.id}`);
        if (est.jugador) console.log(`   Jugador: ${est.jugador}`);
        if (est.equipo) console.log(`   Equipo: ${est.equipo}`);
        if (est.evento) console.log(`   Evento: ${est.evento}`);
        if (est.error) console.log(`   Error: ${est.error}`);
        console.log('');
      });
    }
    
    // Verificar referencias válidas
    console.log('\n🔍 Verificando referencias...');
    
    // Verificar jugadores
    const jugadoresIds = [...new Set(estadisticas.map(e => e.jugador).filter(Boolean))];
    const jugadoresExistentes = await Jugador.find({ _id: { $in: jugadoresIds } });
    console.log(`👥 Jugadores referenciados: ${jugadoresIds.length}, Existentes: ${jugadoresExistentes.length}`);
    
    // Verificar equipos
    const equiposIds = [...new Set(estadisticas.map(e => e.equipo).filter(Boolean))];
    const equiposExistentes = await Equipo.find({ _id: { $in: equiposIds } });
    console.log(`🏆 Equipos referenciados: ${equiposIds.length}, Existentes: ${equiposExistentes.length}`);
    
    // Identificar referencias rotas
    const jugadoresExistentesIds = jugadoresExistentes.map(j => j._id.toString());
    const equiposExistentesIds = equiposExistentes.map(e => e._id.toString());
    
    const referenciasRotas = estadisticas.filter(est => {
      const jugadorRoto = est.jugador && !jugadoresExistentesIds.includes(est.jugador.toString());
      const equipoRoto = est.equipo && !equiposExistentesIds.includes(est.equipo.toString());
      return jugadorRoto || equipoRoto;
    });
    
    console.log(`\n❌ Referencias rotas: ${referenciasRotas.length}`);
    
    if (referenciasRotas.length > 0) {
      console.log('\n📋 Estadísticas con referencias rotas:');
      referenciasRotas.forEach((est, index) => {
        console.log(`${index + 1}. ID: ${est._id}`);
        console.log(`   Jugador: ${est.jugador} ${!jugadoresExistentesIds.includes(est.jugador?.toString()) ? '(ROTO)' : '(OK)'}`);
        console.log(`   Equipo: ${est.equipo} ${!equiposExistentesIds.includes(est.equipo?.toString()) ? '(ROTO)' : '(OK)'}`);
        console.log('');
      });
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificarEstadisticas();
