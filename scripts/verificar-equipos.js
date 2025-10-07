require('dotenv').config();
const mongoose = require('mongoose');
const Equipo = require('../src/models/Equipo');
const Jugador = require('../src/models/Jugador');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function verificarEquipos() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Verificando equipos existentes...');
    
    // Obtener todos los equipos
    const equipos = await Equipo.find({});
    console.log(`📈 Total de equipos: ${equipos.length}`);
    
    console.log('\n📋 Lista de equipos:');
    equipos.forEach((equipo, index) => {
      console.log(`${index + 1}. ${equipo.nombre} (ID: ${equipo._id})`);
    });
    
    // Verificar jugadores y sus equipos
    console.log('\n📊 Verificando jugadores y sus equipos...');
    const jugadores = await Jugador.find({});
    console.log(`📈 Total de jugadores: ${jugadores.length}`);
    
    // Agrupar jugadores por equipo según los datos originales
    const jugadoresPorEquipo = {
      'BUMBA': [],
      'THE DODGEBALL MONKEYS': [],
      'THE CATCHERS': [],
      'LA NEOFARAFA': []
    };
    
    // Mapeo de jugadores a equipos según los datos originales
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
    
    // Agrupar jugadores
    jugadores.forEach(jugador => {
      const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`;
      const equipo = mapeoJugadoresEquipos[nombreCompleto];
      if (equipo && jugadoresPorEquipo[equipo]) {
        jugadoresPorEquipo[equipo].push({
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          numeroCamiseta: jugador.numeroCamiseta,
          email: 'Sin email'
        });
      }
    });
    
    console.log('\n📋 Jugadores por equipo:');
    Object.entries(jugadoresPorEquipo).forEach(([equipo, jugadores]) => {
      console.log(`\n🏆 ${equipo}: ${jugadores.length} jugadores`);
      jugadores.forEach(jugador => {
        console.log(`  - ${jugador.nombre} ${jugador.apellido} (#${jugador.numeroCamiseta}) - ${jugador.email}`);
      });
    });
    
    // Buscar coincidencias de nombres entre equipos y jugadores
    console.log('\n🔍 Buscando coincidencias de nombres...');
    equipos.forEach(equipo => {
      console.log(`\n🏆 Equipo: ${equipo.nombre}`);
      const jugadoresDelEquipo = jugadoresPorEquipo[equipo.nombre] || [];
      console.log(`  Jugadores asignados: ${jugadoresDelEquipo.length}`);
      
      // Buscar jugadores que podrían pertenecer a este equipo por nombre
      const jugadoresSimilares = jugadores.filter(jugador => {
        const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`.toLowerCase();
        const nombreEquipo = equipo.nombre.toLowerCase();
        return nombreCompleto.includes(nombreEquipo) || nombreEquipo.includes(nombreCompleto);
      });
      
      if (jugadoresSimilares.length > 0) {
        console.log(`  Posibles coincidencias por nombre:`);
        jugadoresSimilares.forEach(j => {
          console.log(`    - ${j.nombre} ${j.apellido}`);
        });
      }
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificarEquipos();
