require('dotenv').config();
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function verificarDatosFinales() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Verificando datos finales...');
    
    // Obtener todos los jugadores
    const jugadores = await Jugador.find({}).populate('usuario', 'nombre apellido email');
    console.log(`📈 Total de jugadores en la base de datos: ${jugadores.length}`);
    
    // Verificar duplicados por nombre completo
    const nombresCompletos = jugadores.map(j => `${j.nombre} ${j.apellido}`);
    const duplicados = nombresCompletos.filter((nombre, index) => nombresCompletos.indexOf(nombre) !== index);
    
    if (duplicados.length > 0) {
      console.log(`\n⚠️  Duplicados encontrados: ${duplicados.length}`);
      duplicados.forEach(duplicado => console.log(`  - ${duplicado}`));
    } else {
      console.log('\n✅ No se encontraron duplicados');
    }
    
    // Verificar duplicados por email
    const emails = jugadores.map(j => j.usuario?.email).filter(Boolean);
    const emailsDuplicados = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (emailsDuplicados.length > 0) {
      console.log(`\n⚠️  Emails duplicados encontrados: ${emailsDuplicados.length}`);
      emailsDuplicados.forEach(email => console.log(`  - ${email}`));
    } else {
      console.log('\n✅ No se encontraron emails duplicados');
    }
    
    // Mostrar todos los jugadores con sus datos
    console.log('\n📋 Lista completa de jugadores:');
    jugadores.forEach((jugador, index) => {
      const email = jugador.usuario?.email || 'Sin email';
      const equipo = jugador.estadisticasPorEquipo?.[0]?.nombreEquipo || 'Sin equipo';
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta} (${equipo}) - ${email}`);
    });
    
    // Verificar estadísticas
    console.log('\n📊 Verificando estadísticas...');
    const jugadoresConEstadisticas = jugadores.filter(j => j.estadisticasGenerales);
    console.log(`📈 Jugadores con estadísticas: ${jugadoresConEstadisticas.length}/${jugadores.length}`);
    
    // Verificar los jugadores que me pasaste originalmente
    const jugadoresOriginales = [
      'Felipe Demarco', 'Alejandro Rocca', 'Guzmán Demarco', 'Rafael García',
      'Valentino Gloodtdfosky', 'Salvador Méndez', 'Edewel Cremel', 'Gerónimo Nicola',
      'Agustín Giles', 'Santiago Giles', 'Diego Burrera', 'Pastor Pastor',
      'Santino Barreiro', 'Patricia Yanes', 'Josué Arboleda', 'Matheo Santos',
      'Ignacio Rodríguez', 'Santiago Gil', 'Agustín Sogliano', 'Mateo Alonso',
      'Facundo Alonso', 'Rodrigo Pérez', 'Tiago Pereira'
    ];
    
    console.log('\n🔍 Verificando jugadores originales...');
    const jugadoresEncontrados = [];
    const jugadoresFaltantes = [];
    
    jugadoresOriginales.forEach(nombreCompleto => {
      const [nombre, apellido] = nombreCompleto.split(' ');
      const existe = jugadores.find(j => j.nombre === nombre && j.apellido === apellido);
      if (existe) {
        jugadoresEncontrados.push(nombreCompleto);
      } else {
        jugadoresFaltantes.push(nombreCompleto);
      }
    });
    
    console.log(`✅ Jugadores originales encontrados: ${jugadoresEncontrados.length}/${jugadoresOriginales.length}`);
    if (jugadoresFaltantes.length > 0) {
      console.log(`❌ Jugadores faltantes: ${jugadoresFaltantes.length}`);
      jugadoresFaltantes.forEach(jugador => console.log(`  - ${jugador}`));
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificarDatosFinales();
