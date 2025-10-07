require('dotenv').config();
const mongoose = require('mongoose');
const Equipo = require('../src/models/Equipo');
const Jugador = require('../src/models/Jugador');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function verificacionFinal() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 VERIFICACIÓN FINAL - JUGADORES Y EQUIPOS');
    
    // Obtener equipos
    const equipos = await Equipo.find({});
    console.log(`\n🏆 EQUIPOS (${equipos.length}):`);
    equipos.forEach((equipo, index) => {
      console.log(`${index + 1}. ${equipo.nombre} (ID: ${equipo._id})`);
    });
    
    // Obtener jugadores con equipos asignados
    const jugadoresConEquipos = await Jugador.find({
      'estadisticasPorEquipo.0': { $exists: true }
    });
    
    console.log(`\n👥 JUGADORES CON EQUIPOS (${jugadoresConEquipos.length}):`);
    
    // Agrupar por equipo
    const jugadoresPorEquipo = {};
    jugadoresConEquipos.forEach(jugador => {
      const equipo = jugador.estadisticasPorEquipo[0]?.nombreEquipo || 'Sin equipo';
      if (!jugadoresPorEquipo[equipo]) {
        jugadoresPorEquipo[equipo] = [];
      }
      jugadoresPorEquipo[equipo].push({
        nombre: jugador.nombre,
        apellido: jugador.apellido,
        numeroCamiseta: jugador.numeroCamiseta,
        estadisticas: jugador.estadisticasGenerales
      });
    });
    
    // Mostrar jugadores por equipo
    Object.entries(jugadoresPorEquipo).forEach(([equipo, jugadores]) => {
      console.log(`\n🏆 ${equipo} (${jugadores.length} jugadores):`);
      jugadores.forEach((jugador, index) => {
        const stats = jugador.estadisticas || {};
        console.log(`  ${index + 1}. ${jugador.nombre} ${jugador.apellido} (#${jugador.numeroCamiseta})`);
        console.log(`     Sets: ${stats.setsJugados || 0}, Tiros: ${stats.tirosTotales || 0}, Hits: ${stats.hits || 0}`);
        console.log(`     Poder: ${stats.indicePoder || 0}, Ataque: ${stats.indiceAtaque || 0}, Defensa: ${stats.indiceDefensa || 0}`);
      });
    });
    
    // Verificar jugadores originales
    const jugadoresOriginales = [
      'Felipe Demarco', 'Alejandro Rocca', 'Guzmán Demarco', 'Rafael García',
      'Valentino Gloodtdfosky', 'Salvador Méndez', 'Edewel Cremel', 'Gerónimo Nicola',
      'Agustín Giles', 'Santiago Giles', 'Diego Burrera', 'Pastor Pastor',
      'Santino Barreiro', 'Patricia Yanes', 'Josué Arboleda', 'Matheo Santos',
      'Ignacio Rodríguez', 'Santiago Gil', 'Agustín Sogliano', 'Mateo Alonso',
      'Facundo Alonso', 'Rodrigo Pérez', 'Tiago Pereira'
    ];
    
    console.log(`\n✅ VERIFICACIÓN DE JUGADORES ORIGINALES:`);
    console.log(`📈 Total de jugadores originales: ${jugadoresOriginales.length}`);
    
    const jugadoresEncontrados = [];
    const jugadoresFaltantes = [];
    
    jugadoresOriginales.forEach(nombreCompleto => {
      const [nombre, apellido] = nombreCompleto.split(' ');
      const jugador = jugadoresConEquipos.find(j => j.nombre === nombre && j.apellido === apellido);
      if (jugador) {
        const equipo = jugador.estadisticasPorEquipo[0]?.nombreEquipo || 'Sin equipo';
        jugadoresEncontrados.push(`${nombreCompleto} (${equipo})`);
      } else {
        jugadoresFaltantes.push(nombreCompleto);
      }
    });
    
    console.log(`✅ Jugadores encontrados: ${jugadoresEncontrados.length}/${jugadoresOriginales.length}`);
    console.log(`❌ Jugadores faltantes: ${jugadoresFaltantes.length}`);
    
    if (jugadoresFaltantes.length > 0) {
      console.log('\n❌ Jugadores faltantes:');
      jugadoresFaltantes.forEach(jugador => console.log(`  - ${jugador}`));
    }
    
    console.log('\n📋 Jugadores encontrados con equipos:');
    jugadoresEncontrados.forEach((jugador, index) => {
      console.log(`${index + 1}. ${jugador}`);
    });
    
    // Resumen final
    console.log('\n🎉 RESUMEN FINAL:');
    console.log(`🏆 Equipos en la base de datos: ${equipos.length}`);
    console.log(`👥 Jugadores con equipos asignados: ${jugadoresConEquipos.length}`);
    console.log(`✅ Jugadores originales encontrados: ${jugadoresEncontrados.length}/${jugadoresOriginales.length}`);
    
    if (jugadoresEncontrados.length === jugadoresOriginales.length && jugadoresFaltantes.length === 0) {
      console.log('\n🎉 ¡ÉXITO! Todos los jugadores están correctamente relacionados con sus equipos.');
    } else {
      console.log('\n⚠️  Algunos jugadores no están relacionados correctamente.');
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificacionFinal();
