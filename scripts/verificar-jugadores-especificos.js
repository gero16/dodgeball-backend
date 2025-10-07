require('dotenv').config();
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function verificarJugadoresEspecificos() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n🔍 Verificando jugadores específicos...');
    
    // Lista de jugadores que me pasaste originalmente
    const jugadoresOriginales = [
      'Felipe Demarco', 'Alejandro Rocca', 'Guzmán Demarco', 'Rafael García',
      'Valentino Gloodtdfosky', 'Salvador Méndez', 'Edewel Cremel', 'Gerónimo Nicola',
      'Agustín Giles', 'Santiago Giles', 'Diego Burrera', 'Pastor Pastor',
      'Santino Barreiro', 'Patricia Yanes', 'Josué Arboleda', 'Matheo Santos',
      'Ignacio Rodríguez', 'Santiago Gil', 'Agustín Sogliano', 'Mateo Alonso',
      'Facundo Alonso', 'Rodrigo Pérez', 'Tiago Pereira'
    ];
    
    console.log(`📈 Total de jugadores originales: ${jugadoresOriginales.length}`);
    
    const jugadoresEncontrados = [];
    const jugadoresFaltantes = [];
    
    for (const nombreCompleto of jugadoresOriginales) {
      const [nombre, apellido] = nombreCompleto.split(' ');
      const jugador = await Jugador.findOne({ nombre, apellido }).populate('usuario', 'email');
      
      if (jugador) {
        jugadoresEncontrados.push({
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          email: jugador.usuario?.email || 'Sin email',
          numeroCamiseta: jugador.numeroCamiseta,
          equipo: jugador.estadisticasPorEquipo?.[0]?.nombreEquipo || 'Sin equipo'
        });
      } else {
        jugadoresFaltantes.push(nombreCompleto);
      }
    }
    
    console.log(`\n✅ Jugadores encontrados: ${jugadoresEncontrados.length}/${jugadoresOriginales.length}`);
    console.log(`❌ Jugadores faltantes: ${jugadoresFaltantes.length}`);
    
    if (jugadoresFaltantes.length > 0) {
      console.log('\n📋 Jugadores faltantes:');
      jugadoresFaltantes.forEach(jugador => console.log(`  - ${jugador}`));
    }
    
    console.log('\n📋 Jugadores encontrados:');
    jugadoresEncontrados.forEach((jugador, index) => {
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta} (${jugador.equipo}) - ${jugador.email}`);
    });
    
    // Verificar si hay jugadores con nombres similares
    console.log('\n🔍 Buscando jugadores con nombres similares...');
    for (const nombreCompleto of jugadoresFaltantes) {
      const [nombre, apellido] = nombreCompleto.split(' ');
      
      // Buscar por nombre o apellido
      const jugadoresSimilares = await Jugador.find({
        $or: [
          { nombre: { $regex: nombre, $options: 'i' } },
          { apellido: { $regex: apellido, $options: 'i' } }
        ]
      }).populate('usuario', 'email');
      
      if (jugadoresSimilares.length > 0) {
        console.log(`\n🔍 Posibles coincidencias para "${nombreCompleto}":`);
        jugadoresSimilares.forEach(j => {
          console.log(`  - ${j.nombre} ${j.apellido} - ${j.usuario?.email || 'Sin email'}`);
        });
      }
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificarJugadoresEspecificos();
