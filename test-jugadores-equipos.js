const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Usuario = require('./src/models/Usuario');
const Jugador = require('./src/models/Jugador');
const Equipo = require('./src/models/Equipo');

async function testJugadoresEquipos() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball');
    console.log('✅ Conectado a MongoDB');

    // Crear un usuario de prueba
    const usuario = new Usuario({
      nombre: 'Juan',
      email: 'juan@test.com',
      password: '123456'
    });
    await usuario.save();
    console.log('✅ Usuario creado:', usuario._id);

    // Crear un jugador
    const jugador = new Jugador({
      usuario: usuario._id,
      nombre: 'Juan',
      apellido: 'Pérez',
      posicion: 'thrower',
      numeroCamiseta: 10
    });
    await jugador.save();
    console.log('✅ Jugador creado:', jugador._id);

    // Crear equipos
    const seleccion = new Equipo({
      nombre: 'Selección Nacional',
      tipo: 'seleccion',
      pais: 'Chile',
      ciudad: 'Santiago'
    });
    await seleccion.save();
    console.log('✅ Selección creada:', seleccion._id);

    const club = new Equipo({
      nombre: 'Club Los Leones',
      tipo: 'club',
      ciudad: 'Santiago'
    });
    await club.save();
    console.log('✅ Club creado:', club._id);

    // Agregar jugador a ambos equipos
    seleccion.jugadores.push({
      jugador: jugador._id,
      numeroCamiseta: 10,
      posicion: 'thrower'
    });
    await seleccion.save();

    club.jugadores.push({
      jugador: jugador._id,
      numeroCamiseta: 7,
      posicion: 'versatil'
    });
    await club.save();
    console.log('✅ Jugador agregado a ambos equipos');

    // Simular estadísticas de partido
    const estadisticas = {
      hits: 5,
      hitsExitosos: 3,
      catches: 2,
      dodges: 4,
      puntos: 8
    };

    // Actualizar estadísticas para la selección
    jugador.estadisticasGenerales.partidosJugados += 1;
    jugador.estadisticasGenerales.hits += estadisticas.hits;
    jugador.estadisticasGenerales.hitsExitosos += estadisticas.hitsExitosos;
    jugador.estadisticasGenerales.catches += estadisticas.catches;
    jugador.estadisticasGenerales.dodges += estadisticas.dodges;
    jugador.estadisticasGenerales.puntos += estadisticas.puntos;

    // Agregar estadísticas por equipo
    jugador.estadisticasPorEquipo.push({
      equipo: seleccion._id,
      nombreEquipo: seleccion.nombre,
      tipoEquipo: seleccion.tipo,
      temporada: '2024',
      estadisticas: {
        partidosJugados: 1,
        hits: estadisticas.hits,
        catches: estadisticas.catches,
        dodges: estadisticas.dodges,
        puntos: estadisticas.puntos
      }
    });

    await jugador.save();
    console.log('✅ Estadísticas actualizadas');

    // Verificar resultados
    const jugadorCompleto = await Jugador.findById(jugador._id)
      .populate('usuario', 'nombre email')
      .populate('estadisticasPorEquipo.equipo', 'nombre tipo');

    console.log('\n📊 RESULTADOS:');
    console.log('Jugador:', jugadorCompleto.nombre, jugadorCompleto.apellido);
    console.log('Estadísticas generales:', jugadorCompleto.estadisticasGenerales);
    console.log('Equipos:', jugadorCompleto.estadisticasPorEquipo.length);
    console.log('Equipos del jugador:');
    jugadorCompleto.estadisticasPorEquipo.forEach(equipo => {
      console.log(`- ${equipo.nombreEquipo} (${equipo.tipoEquipo}): ${equipo.estadisticas.puntos} puntos`);
    });

    console.log('\n✅ Test completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar test
testJugadoresEquipos();
