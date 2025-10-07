require('dotenv').config();
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function analizarJugadoresDuplicados() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Analizando jugadores...');
    
    // Obtener todos los jugadores
    const jugadores = await Jugador.find({});
    console.log(`📈 Total de jugadores: ${jugadores.length}`);
    
    // Analizar duplicados por nombre completo
    const nombresCompletos = jugadores.map(j => `${j.nombre} ${j.apellido}`);
    const duplicados = nombresCompletos.filter((nombre, index) => nombresCompletos.indexOf(nombre) !== index);
    
    console.log(`\n⚠️  Duplicados por nombre: ${duplicados.length}`);
    if (duplicados.length > 0) {
      console.log('📋 Nombres duplicados:');
      duplicados.forEach(duplicado => console.log(`  - ${duplicado}`));
    }
    
    // Analizar duplicados por email
    const emails = jugadores.map(j => j.usuario?.email).filter(Boolean);
    const emailsDuplicados = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    console.log(`\n⚠️  Emails duplicados: ${emailsDuplicados.length}`);
    if (emailsDuplicados.length > 0) {
      console.log('📋 Emails duplicados:');
      emailsDuplicados.forEach(email => console.log(`  - ${email}`));
    }
    
    // Mostrar todos los jugadores con detalles
    console.log('\n📋 Lista completa de jugadores:');
    jugadores.forEach((jugador, index) => {
      const email = jugador.usuario?.email || 'Sin email';
      const equipo = jugador.estadisticasPorEquipo?.[0]?.nombreEquipo || 'Sin equipo';
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta} (${equipo}) - ${email}`);
    });
    
    // Identificar jugadores que no deberían estar
    const jugadoresOriginales = [
      'Felipe Demarco', 'Alejandro Rocca', 'Guzmán Demarco', 'Rafael García',
      'Valentino Gloodtdfosky', 'Salvador Méndez', 'Edewel Cremel', 'Gerónimo Nicola',
      'Agustín Giles', 'Santiago Giles', 'Diego Burrera', 'Pastor Pastor',
      'Santino Barreiro', 'Patricia Yanes', 'Josué Arboleda', 'Matheo Santos',
      'Ignacio Rodríguez', 'Santiago Gil', 'Agustín Sogliano', 'Mateo Alonso',
      'Facundo Alonso', 'Rodrigo Pérez', 'Tiago Pereira'
    ];
    
    console.log('\n🔍 Verificando jugadores originales vs existentes...');
    const jugadoresEncontrados = [];
    const jugadoresFaltantes = [];
    const jugadoresExtra = [];
    
    // Verificar jugadores originales
    jugadoresOriginales.forEach(nombreCompleto => {
      const [nombre, apellido] = nombreCompleto.split(' ');
      const existe = jugadores.find(j => j.nombre === nombre && j.apellido === apellido);
      if (existe) {
        jugadoresEncontrados.push(nombreCompleto);
      } else {
        jugadoresFaltantes.push(nombreCompleto);
      }
    });
    
    // Verificar jugadores extra
    jugadores.forEach(jugador => {
      const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`;
      if (!jugadoresOriginales.includes(nombreCompleto)) {
        jugadoresExtra.push(nombreCompleto);
      }
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`✅ Jugadores originales encontrados: ${jugadoresEncontrados.length}/${jugadoresOriginales.length}`);
    console.log(`❌ Jugadores originales faltantes: ${jugadoresFaltantes.length}`);
    console.log(`⚠️  Jugadores extra (no originales): ${jugadoresExtra.length}`);
    
    if (jugadoresFaltantes.length > 0) {
      console.log('\n❌ Jugadores originales faltantes:');
      jugadoresFaltantes.forEach(jugador => console.log(`  - ${jugador}`));
    }
    
    if (jugadoresExtra.length > 0) {
      console.log('\n⚠️  Jugadores extra (no deberían estar):');
      jugadoresExtra.forEach(jugador => console.log(`  - ${jugador}`));
    }
    
    // Analizar por equipos
    console.log('\n🏆 Análisis por equipos:');
    const jugadoresPorEquipo = {};
    jugadores.forEach(jugador => {
      const equipo = jugador.estadisticasPorEquipo?.[0]?.nombreEquipo || 'Sin equipo';
      if (!jugadoresPorEquipo[equipo]) {
        jugadoresPorEquipo[equipo] = [];
      }
      jugadoresPorEquipo[equipo].push(`${jugador.nombre} ${jugador.apellido}`);
    });
    
    Object.entries(jugadoresPorEquipo).forEach(([equipo, jugadores]) => {
      console.log(`\n${equipo}: ${jugadores.length} jugadores`);
      jugadores.forEach(jugador => console.log(`  - ${jugador}`));
    });
    
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

analizarJugadoresDuplicados();
