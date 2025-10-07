require('dotenv').config();
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

// Jugadores faltantes que necesitamos agregar
const jugadoresFaltantes = [
  {
    nombre: 'Diego',
    apellido: 'Burrera',
    equipo: 'BUMBA',
    numeroCamiseta: 4,
    posicion: 'versatil',
    email: 'diego.burrera@email.com',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 29,
      hits: 7,
      quemados: 5,
      asistencias: 0,
      tirosRecibidos: 26,
      hitsRecibidos: 7,
      esquives: 7,
      esquivesSinEsfuerzo: 11,
      ponchado: 7,
      catchesIntentados: 1,
      catches: 0,
      bloqueosIntentados: 2,
      bloqueos: 1,
      pisoLinea: 0,
      catchesRecibidos: 0,
      porcentajeHits: 24.1,
      porcentajeOuts: 17.2,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 14.3,
      indiceAtaque: 2.98,
      indiceDefensa: 1.39,
      indicePoder: 29.23
    }
  },
  {
    nombre: 'Santino',
    apellido: 'Barreiro',
    equipo: 'BUMBA',
    numeroCamiseta: 6,
    posicion: 'versatil',
    email: 'santino.barreiro@email.com',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 5,
      hits: 0,
      quemados: 0,
      asistencias: 0,
      tirosRecibidos: 6,
      hitsRecibidos: 5,
      esquives: 0,
      esquivesSinEsfuerzo: 1,
      ponchado: 5,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 0,
      bloqueos: 0,
      pisoLinea: 0,
      catchesRecibidos: 0,
      porcentajeHits: 0.0,
      porcentajeOuts: 0.0,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 0.0,
      indiceAtaque: 0.00,
      indiceDefensa: -1.14,
      indicePoder: 0.00
    }
  },
  {
    nombre: 'Matheo',
    apellido: 'Santos',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 10,
    posicion: 'versatil',
    email: 'matheo.santos@email.com',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 8,
      hits: 2,
      quemados: 1,
      asistencias: 0,
      tirosRecibidos: 28,
      hitsRecibidos: 8,
      esquives: 5,
      esquivesSinEsfuerzo: 13,
      ponchado: 8,
      catchesIntentados: 4,
      catches: 2,
      bloqueosIntentados: 1,
      bloqueos: 1,
      pisoLinea: 0,
      catchesRecibidos: 1,
      porcentajeHits: 25.0,
      porcentajeOuts: 12.5,
      porcentajeCatches: 25.0,
      porcentajeBloqueos: 12.5,
      indiceAtaque: 0.55,
      indiceDefensa: 4.62,
      indicePoder: 32.10
    }
  },
  {
    nombre: 'Ignacio',
    apellido: 'Rodríguez',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 12,
    posicion: 'versatil',
    email: 'ignacio.rodriguez@email.com',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 4,
      hits: 3,
      quemados: 0,
      asistencias: 1,
      tirosRecibidos: 15,
      hitsRecibidos: 6,
      esquives: 3,
      esquivesSinEsfuerzo: 6,
      ponchado: 6,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 2,
      bloqueos: 2,
      pisoLinea: 0,
      catchesRecibidos: 2,
      porcentajeHits: 75.0,
      porcentajeOuts: 0.0,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 33.3,
      indiceAtaque: 0.53,
      indiceDefensa: 0.88,
      indicePoder: 13.16
    }
  },
  {
    nombre: 'Santiago',
    apellido: 'Gil',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 22,
    posicion: 'versatil',
    email: 'santiago.gil@email.com',
    estadisticas: {
      setsJugados: 8,
      tirosTotales: 2,
      hits: 0,
      quemados: 0,
      asistencias: 1,
      tirosRecibidos: 19,
      hitsRecibidos: 10,
      esquives: 3,
      esquivesSinEsfuerzo: 6,
      ponchado: 8,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 5,
      bloqueos: 3,
      pisoLinea: 1,
      catchesRecibidos: 0,
      porcentajeHits: 0.0,
      porcentajeOuts: 0.0,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 30.0,
      indiceAtaque: 0.45,
      indiceDefensa: 0.20,
      indicePoder: 9.28
    }
  },
  {
    nombre: 'Agustín',
    apellido: 'Sogliano',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 23,
    posicion: 'versatil',
    email: 'agustin.sogliano@email.com',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 7,
      hits: 2,
      quemados: 0,
      asistencias: 0,
      tirosRecibidos: 10,
      hitsRecibidos: 5,
      esquives: 4,
      esquivesSinEsfuerzo: 0,
      ponchado: 7,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 0,
      bloqueos: 0,
      pisoLinea: 1,
      catchesRecibidos: 1,
      porcentajeHits: 28.6,
      porcentajeOuts: 0.0,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 0.0,
      indiceAtaque: 0.20,
      indiceDefensa: -0.03,
      indicePoder: 6.72
    }
  },
  {
    nombre: 'Mateo',
    apellido: 'Alonso',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 16,
    posicion: 'versatil',
    email: 'mateo.alonso@email.com',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 6,
      hits: 0,
      quemados: 0,
      asistencias: 1,
      tirosRecibidos: 15,
      hitsRecibidos: 7,
      esquives: 4,
      esquivesSinEsfuerzo: 3,
      ponchado: 8,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 1,
      bloqueos: 0,
      pisoLinea: 0,
      catchesRecibidos: 1,
      porcentajeHits: 0.0,
      porcentajeOuts: 0.0,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 0.0,
      indiceAtaque: 0.31,
      indiceDefensa: -0.46,
      indicePoder: 5.18
    }
  },
  {
    nombre: 'Facundo',
    apellido: 'Alonso',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 15,
    posicion: 'versatil',
    email: 'facundo.alonso@email.com',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 19,
      hits: 8,
      quemados: 1,
      asistencias: 1,
      tirosRecibidos: 20,
      hitsRecibidos: 8,
      esquives: 8,
      esquivesSinEsfuerzo: 3,
      ponchado: 8,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 1,
      bloqueos: 0,
      pisoLinea: 0,
      catchesRecibidos: 0,
      porcentajeHits: 42.1,
      porcentajeOuts: 5.3,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 0.0,
      indiceAtaque: 2.07,
      indiceDefensa: 0.33,
      indicePoder: 18.85
    }
  },
  {
    nombre: 'Rodrigo',
    apellido: 'Pérez',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 21,
    posicion: 'versatil',
    email: 'rodrigo.perez@email.com',
    estadisticas: {
      setsJugados: 10,
      tirosTotales: 16,
      hits: 7,
      quemados: 3,
      asistencias: 0,
      tirosRecibidos: 24,
      hitsRecibidos: 9,
      esquives: 6,
      esquivesSinEsfuerzo: 9,
      ponchado: 10,
      catchesIntentados: 1,
      catches: 1,
      bloqueosIntentados: 0,
      bloqueos: 0,
      pisoLinea: 1,
      catchesRecibidos: 0,
      porcentajeHits: 43.8,
      porcentajeOuts: 18.8,
      porcentajeCatches: 11.1,
      porcentajeBloqueos: 0.0,
      indiceAtaque: 2.26,
      indiceDefensa: 1.90,
      indicePoder: 27.82
    }
  },
  {
    nombre: 'Tiago',
    apellido: 'Pereira',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 11,
    posicion: 'versatil',
    email: 'tiago.pereira@email.com',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 18,
      hits: 7,
      quemados: 2,
      asistencias: 0,
      tirosRecibidos: 21,
      hitsRecibidos: 5,
      esquives: 4,
      esquivesSinEsfuerzo: 13,
      ponchado: 6,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 2,
      bloqueos: 1,
      pisoLinea: 0,
      catchesRecibidos: 2,
      porcentajeHits: 38.9,
      porcentajeOuts: 11.1,
      porcentajeCatches: 0.0,
      porcentajeBloqueos: 20.0,
      indiceAtaque: 1.48,
      indiceDefensa: 1.23,
      indicePoder: 20.18
    }
  }
];

async function corregirJugadoresFaltantes() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Agregando jugadores faltantes...');
    console.log(`📈 Total de jugadores a agregar: ${jugadoresFaltantes.length}`);
    
    let jugadoresCreados = 0;
    let errores = 0;
    
    for (const jugadorData of jugadoresFaltantes) {
      try {
        // Verificar si el jugador ya existe
        const jugadorExistente = await Jugador.findOne({
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido
        });
        
        if (jugadorExistente) {
          console.log(`⚠️  Jugador ya existe: ${jugadorData.nombre} ${jugadorData.apellido}`);
          continue;
        }
        
        // Crear usuario primero
        const usuario = new Usuario({
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          email: jugadorData.email,
          password: 'password123', // Contraseña temporal
          rol: 'usuario',
          telefono: '+1234567890'
        });
        
        await usuario.save();
        
        // Crear jugador
        const jugador = new Jugador({
          usuario: usuario._id,
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          numeroCamiseta: jugadorData.numeroCamiseta,
          posicion: jugadorData.posicion,
          activo: true,
          estadisticasGenerales: jugadorData.estadisticas
        });
        
        await jugador.save();
        jugadoresCreados++;
        console.log(`✅ Jugador creado: ${jugadorData.nombre} ${jugadorData.apellido}`);
        
      } catch (error) {
        errores++;
        console.error(`❌ Error creando ${jugadorData.nombre} ${jugadorData.apellido}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumen del procesamiento:');
    console.log(`✅ Jugadores creados: ${jugadoresCreados}`);
    console.log(`❌ Errores: ${errores}`);
    
    // Verificar total final
    const totalJugadores = await Jugador.countDocuments();
    console.log(`📈 Total de jugadores en la base de datos: ${totalJugadores}`);
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

corregirJugadoresFaltantes();
