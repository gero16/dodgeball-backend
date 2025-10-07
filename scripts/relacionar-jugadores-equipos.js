require('dotenv').config();
const mongoose = require('mongoose');
const Equipo = require('../src/models/Equipo');
const Jugador = require('../src/models/Jugador');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function relacionarJugadoresEquipos() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Relacionando jugadores con equipos...');
    
    // Obtener equipos
    const equipos = await Equipo.find({});
    console.log(`📈 Total de equipos: ${equipos.length}`);
    
    // Mapeo de nombres de equipos
    const mapeoEquipos = {
      'BUMBA': 'Bumba',
      'THE DODGEBALL MONKEYS': 'THE DODGEBALL MONKEYS',
      'THE CATCHERS': 'The Catchers',
      'LA NEOFARAFA': 'LA NEOFARAFA'
    };
    
    // Mapeo de jugadores a equipos
    const mapeoJugadoresEquipos = {
      'Felipe Demarco': 'BUMBA',
      'Agustín Giles': 'BUMBA',
      'Santiago Giles': 'BUMBA',
      'Diego Burrera': 'BUMBA',
      'Pastor Pastor': 'BUMBA',
      'Santino Barreiro': 'BUMBA',
      'Alejandro Rocca': 'THE DODGEBALL MONKEYS',
      'Valentino Gloodtdfosky': 'THE DODGEBALL MONKEYS',
      'Salvador Méndez': 'THE DODGEBALL MONKEYS',
      'Matheo Santos': 'THE DODGEBALL MONKEYS',
      'Tiago Pereira': 'THE DODGEBALL MONKEYS',
      'Ignacio Rodríguez': 'THE DODGEBALL MONKEYS',
      'Guzmán Demarco': 'THE CATCHERS',
      'Edewel Cremel': 'THE CATCHERS',
      'Facundo Alonso': 'THE CATCHERS',
      'Mateo Alonso': 'THE CATCHERS',
      'Rafael García': 'LA NEOFARAFA',
      'Gerónimo Nicola': 'LA NEOFARAFA',
      'Patricia Yanes': 'LA NEOFARAFA',
      'Josué Arboleda': 'LA NEOFARAFA',
      'Rodrigo Pérez': 'LA NEOFARAFA',
      'Santiago Gil': 'LA NEOFARAFA',
      'Agustín Sogliano': 'LA NEOFARAFA'
    };
    
    // Crear mapeo de IDs de equipos
    const equiposMap = {};
    equipos.forEach(equipo => {
      equiposMap[equipo.nombre] = equipo._id;
    });
    
    console.log('\n📋 Mapeo de equipos:');
    Object.entries(equiposMap).forEach(([nombre, id]) => {
      console.log(`  ${nombre}: ${id}`);
    });
    
    // Obtener todos los jugadores
    const jugadores = await Jugador.find({});
    console.log(`\n📈 Total de jugadores: ${jugadores.length}`);
    
    let jugadoresActualizados = 0;
    let errores = 0;
    
    // Relacionar cada jugador con su equipo
    for (const jugador of jugadores) {
      try {
        const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`;
        const equipoOriginal = mapeoJugadoresEquipos[nombreCompleto];
        
        if (equipoOriginal) {
          const nombreEquipoEnBD = mapeoEquipos[equipoOriginal];
          const equipoId = equiposMap[nombreEquipoEnBD];
          
          if (equipoId) {
            // Actualizar el jugador con el equipo
            jugador.estadisticasPorEquipo = [{
              equipo: equipoId,
              nombreEquipo: nombreEquipoEnBD,
              estadisticas: jugador.estadisticasGenerales || {}
            }];
            
            await jugador.save();
            jugadoresActualizados++;
            console.log(`✅ ${nombreCompleto} → ${nombreEquipoEnBD}`);
          } else {
            console.log(`⚠️  Equipo no encontrado para ${nombreCompleto}: ${equipoOriginal}`);
          }
        } else {
          console.log(`⚠️  Jugador no mapeado: ${nombreCompleto}`);
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error actualizando ${jugador.nombre} ${jugador.apellido}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumen del procesamiento:');
    console.log(`✅ Jugadores actualizados: ${jugadoresActualizados}`);
    console.log(`❌ Errores: ${errores}`);
    
    // Verificar resultados
    console.log('\n🔍 Verificando resultados...');
    const jugadoresConEquipos = await Jugador.find({
      'estadisticasPorEquipo.0': { $exists: true }
    });
    
    console.log(`📈 Jugadores con equipos asignados: ${jugadoresConEquipos.length}`);
    
    // Mostrar resumen por equipo
    const resumenEquipos = {};
    jugadoresConEquipos.forEach(jugador => {
      const equipo = jugador.estadisticasPorEquipo[0]?.nombreEquipo || 'Sin equipo';
      if (!resumenEquipos[equipo]) {
        resumenEquipos[equipo] = 0;
      }
      resumenEquipos[equipo]++;
    });
    
    console.log('\n📋 Resumen por equipo:');
    Object.entries(resumenEquipos).forEach(([equipo, cantidad]) => {
      console.log(`  ${equipo}: ${cantidad} jugadores`);
    });
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

relacionarJugadoresEquipos();
