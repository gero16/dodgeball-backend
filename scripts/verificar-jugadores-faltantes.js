const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');
const Equipo = require('../src/models/Equipo');

// Configuración directa para desarrollo
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball-club';

// Lista de jugadores que deberían existir (basado en los datos que me pasaste anteriormente)
const jugadoresEsperados = [
  // BUMBA
  { nombre: 'Felipe', apellido: 'Demarco', equipo: 'BUMBA', numeroCamiseta: 1 },
  { nombre: 'Patricia', apellido: 'Yanes', equipo: 'BUMBA', numeroCamiseta: 7 },
  { nombre: 'Josué', apellido: 'Arboleda', equipo: 'BUMBA', numeroCamiseta: 8 },
  { nombre: 'Santiago', apellido: 'García', equipo: 'BUMBA', numeroCamiseta: 9 },
  { nombre: 'María', apellido: 'Rodríguez', equipo: 'BUMBA', numeroCamiseta: 10 },
  { nombre: 'Carlos', apellido: 'López', equipo: 'BUMBA', numeroCamiseta: 11 },
  
  // THE CATCHERS
  { nombre: 'Ana', apellido: 'Martínez', equipo: 'THE CATCHERS', numeroCamiseta: 2 },
  { nombre: 'Luis', apellido: 'González', equipo: 'THE CATCHERS', numeroCamiseta: 3 },
  { nombre: 'Laura', apellido: 'Hernández', equipo: 'THE CATCHERS', numeroCamiseta: 4 },
  { nombre: 'Diego', apellido: 'Pérez', equipo: 'THE CATCHERS', numeroCamiseta: 5 },
  { nombre: 'Sofia', apellido: 'Sánchez', equipo: 'THE CATCHERS', numeroCamiseta: 6 },
  { nombre: 'Miguel', apellido: 'Ramírez', equipo: 'THE CATCHERS', numeroCamiseta: 12 },
  
  // THE DODGEBALL MONKEYS
  { nombre: 'Elena', apellido: 'Torres', equipo: 'THE DODGEBALL MONKEYS', numeroCamiseta: 13 },
  { nombre: 'Roberto', apellido: 'Flores', equipo: 'THE DODGEBALL MONKEYS', numeroCamiseta: 14 },
  { nombre: 'Carmen', apellido: 'Vargas', equipo: 'THE DODGEBALL MONKEYS', numeroCamiseta: 15 },
  { nombre: 'Andrés', apellido: 'Jiménez', equipo: 'THE DODGEBALL MONKEYS', numeroCamiseta: 16 },
  { nombre: 'Isabel', apellido: 'Morales', equipo: 'THE DODGEBALL MONKEYS', numeroCamiseta: 17 },
  { nombre: 'Fernando', apellido: 'Castro', equipo: 'THE DODGEBALL MONKEYS', numeroCamiseta: 18 },
  
  // LA NEOFARAFA
  { nombre: 'Valentina', apellido: 'Ruiz', equipo: 'LA NEOFARAFA', numeroCamiseta: 19 },
  { nombre: 'Sebastián', apellido: 'Díaz', equipo: 'LA NEOFARAFA', numeroCamiseta: 20 },
  { nombre: 'Natalia', apellido: 'Herrera', equipo: 'LA NEOFARAFA', numeroCamiseta: 21 },
  { nombre: 'Alejandro', apellido: 'Mendoza', equipo: 'LA NEOFARAFA', numeroCamiseta: 22 },
  { nombre: 'Gabriela', apellido: 'Silva', equipo: 'LA NEOFARAFA', numeroCamiseta: 23 },
  { nombre: 'Ricardo', apellido: 'Ortega', equipo: 'LA NEOFARAFA', numeroCamiseta: 24 }
];

async function verificarJugadoresFaltantes() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Verificando jugadores existentes...');
    
    // Obtener todos los jugadores existentes
    const jugadoresExistentes = await Jugador.find({})
      .populate('usuario', 'nombre email')
      .populate('estadisticasPorEquipo.equipo', 'nombre');
    
    console.log(`\n📈 Jugadores existentes: ${jugadoresExistentes.length}`);
    
    // Verificar cuáles faltan
    const jugadoresFaltantes = [];
    
    for (const jugadorEsperado of jugadoresEsperados) {
      const existe = jugadoresExistentes.find(j => 
        j.nombre === jugadorEsperado.nombre && 
        j.apellido === jugadorEsperado.apellido
      );
      
      if (!existe) {
        jugadoresFaltantes.push(jugadorEsperado);
      }
    }
    
    console.log(`\n❌ Jugadores faltantes: ${jugadoresFaltantes.length}`);
    
    if (jugadoresFaltantes.length > 0) {
      console.log('\n📋 Lista de jugadores faltantes:');
      jugadoresFaltantes.forEach((jugador, index) => {
        console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} (${jugador.equipo}) - #${jugador.numeroCamiseta}`);
      });
    } else {
      console.log('\n✅ Todos los jugadores esperados ya existen en la base de datos');
    }
    
    // Mostrar jugadores existentes
    console.log('\n📋 Jugadores existentes:');
    jugadoresExistentes.forEach((jugador, index) => {
      const equipos = jugador.estadisticasPorEquipo.map(est => est.nombreEquipo || 'Sin equipo').join(', ');
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta} (${equipos})`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificarJugadoresFaltantes();
