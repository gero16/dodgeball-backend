/**
 * Script para agregar un partido de demostración con estadísticas
 * Útil para probar las nuevas funcionalidades después de la migración
 */

const express = require('express');
const mongoose = require('mongoose');
const Partido = require('../src/models/Partido');
const Jugador = require('../src/models/Jugador');
const Equipo = require('../src/models/Equipo');
const Evento = require('../src/models/Evento');
require('dotenv').config();

const app = express();
const PORT = process.env.DEMO_PORT || 3002;

// Middleware
app.use(express.json());

// Conectar a MongoDB
async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball-club');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

// Endpoint para crear un partido de demostración
app.post('/api/partido-demo', async (req, res) => {
  try {
    console.log('🏀 Creando partido de demostración...');

    // Obtener jugadores y equipos existentes
    const jugadores = await Jugador.find({ activo: true }).limit(10);
    const equipos = await Equipo.find({ activo: true }).limit(2);
    const eventos = await Evento.find({ activo: true }).limit(1);

    if (jugadores.length < 4) {
      return res.status(400).json({
        success: false,
        mensaje: 'Se necesitan al menos 4 jugadores para crear un partido'
      });
    }

    if (equipos.length < 2) {
      return res.status(400).json({
        success: false,
        mensaje: 'Se necesitan al menos 2 equipos para crear un partido'
      });
    }

    if (eventos.length < 1) {
      return res.status(400).json({
        success: false,
        mensaje: 'Se necesita al menos 1 evento para crear un partido'
      });
    }

    // Dividir jugadores en dos equipos
    const equipoLocal = equipos[0];
    const equipoVisitante = equipos[1];
    const jugadoresLocal = jugadores.slice(0, Math.ceil(jugadores.length / 2));
    const jugadoresVisitante = jugadores.slice(Math.ceil(jugadores.length / 2));

    // Generar estadísticas simuladas para cada jugador
    const estadisticasJugadores = [];

    // Estadísticas para jugadores del equipo local
    jugadoresLocal.forEach((jugador, index) => {
      const stats = generarEstadisticasSimuladas(index, 'local');
      estadisticasJugadores.push({
        jugador: jugador._id,
        equipo: equipoLocal._id,
        ...stats
      });
    });

    // Estadísticas para jugadores del equipo visitante
    jugadoresVisitante.forEach((jugador, index) => {
      const stats = generarEstadisticasSimuladas(index, 'visitante');
      estadisticasJugadores.push({
        jugador: jugador._id,
        equipo: equipoVisitante._id,
        ...stats
      });
    });

    // Crear el partido
    const partido = new Partido({
      evento: eventos[0]._id,
      fecha: new Date(),
      equipoLocal: equipoLocal._id,
      equipoVisitante: equipoVisitante._id,
      estadisticasJugadores,
      duracion: 60, // 60 minutos
      arbitro: 'Árbitro Demo',
      observaciones: 'Partido de demostración con estadísticas simuladas',
      estado: 'finalizado'
    });

    // Calcular resultado del partido
    const resultado = calcularResultadoPartido(estadisticasJugadores, equipoLocal._id, equipoVisitante._id);
    partido.resultado = resultado;

    await partido.save();

    // Actualizar estadísticas de jugadores
    await actualizarEstadisticasJugadores(estadisticasJugadores);

    res.json({
      success: true,
      mensaje: 'Partido de demostración creado exitosamente',
      partido: {
        id: partido._id,
        fecha: partido.fecha,
        equipoLocal: equipoLocal.nombre,
        equipoVisitante: equipoVisitante.nombre,
        resultado: partido.resultado,
        jugadoresParticipantes: estadisticasJugadores.length
      }
    });

  } catch (error) {
    console.error('❌ Error creando partido demo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error creando partido de demostración',
      error: error.message
    });
  }
});

// Función para generar estadísticas simuladas
function generarEstadisticasSimuladas(index, equipo) {
  const baseStats = {
    setsJugados: Math.floor(Math.random() * 3) + 1,
    tirosTotales: Math.floor(Math.random() * 20) + 10,
    hits: Math.floor(Math.random() * 8) + 2,
    quemados: Math.floor(Math.random() * 6) + 1,
    asistencias: Math.floor(Math.random() * 3),
    tirosRecibidos: Math.floor(Math.random() * 15) + 5,
    hitsRecibidos: Math.floor(Math.random() * 6) + 1,
    esquives: Math.floor(Math.random() * 8) + 2,
    esquivesExitosos: Math.floor(Math.random() * 6) + 1,
    ponchado: Math.floor(Math.random() * 4),
    catchesIntentos: Math.floor(Math.random() * 5) + 1,
    catches: Math.floor(Math.random() * 3),
    catchesRecibidos: Math.floor(Math.random() * 2),
    bloqueosIntentos: Math.floor(Math.random() * 10) + 3,
    bloqueos: Math.floor(Math.random() * 8) + 2,
    pisoLinea: Math.floor(Math.random() * 2),
    tarjetasAmarillas: Math.floor(Math.random() * 2),
    tarjetasRojas: Math.floor(Math.random() * 2),
    eliminaciones: Math.floor(Math.random() * 8) + 2,
    vecesEliminado: Math.floor(Math.random() * 4) + 1,
    minutosJugados: Math.floor(Math.random() * 30) + 30,
    puntos: Math.floor(Math.random() * 15) + 5
  };

  return baseStats;
}

// Función para calcular resultado del partido
function calcularResultadoPartido(estadisticasJugadores, equipoLocalId, equipoVisitanteId) {
  const jugadoresLocal = estadisticasJugadores.filter(j => j.equipo.toString() === equipoLocalId.toString());
  const jugadoresVisitante = estadisticasJugadores.filter(j => j.equipo.toString() === equipoVisitanteId.toString());

  const puntosLocal = jugadoresLocal.reduce((sum, j) => sum + (j.puntos || 0), 0);
  const puntosVisitante = jugadoresVisitante.reduce((sum, j) => sum + (j.puntos || 0), 0);

  return {
    setsLocal: puntosLocal > puntosVisitante ? 2 : 1,
    setsVisitante: puntosVisitante > puntosLocal ? 2 : 1,
    ganador: puntosLocal > puntosVisitante ? equipoLocalId : equipoVisitanteId
  };
}

// Función para actualizar estadísticas de jugadores
async function actualizarEstadisticasJugadores(estadisticasJugadores) {
  const { agregarEstadisticasPartido } = require('../src/utils/estadisticas');

  for (const estadistica of estadisticasJugadores) {
    const jugador = await Jugador.findById(estadistica.jugador);
    if (jugador) {
      const nuevasEstadisticas = agregarEstadisticasPartido(
        jugador.estadisticasGenerales,
        estadistica
      );
      
      jugador.estadisticasGenerales = nuevasEstadisticas;
      
      // Agregar al historial de partidos
      jugador.historialPartidos.push({
        partido: estadistica.partido,
        equipo: estadistica.equipo,
        fecha: new Date(),
        estadisticas: estadistica
      });
      
      await jugador.save();
    }
  }
}

// Endpoint para obtener ranking de jugadores
app.get('/api/partido-demo/ranking', async (req, res) => {
  try {
    const jugadores = await Jugador.find({ activo: true })
      .select('nombre apellido numeroCamiseta posicion estadisticasGenerales')
      .sort({ 'estadisticasGenerales.indicePoder': -1 })
      .limit(20);

    const ranking = jugadores.map((jugador, index) => ({
      posicion: index + 1,
      jugador: {
        id: jugador._id,
        nombre: `${jugador.nombre} ${jugador.apellido}`,
        numeroCamiseta: jugador.numeroCamiseta,
        posicion: jugador.posicion
      },
      estadisticas: {
        indicePoder: jugador.estadisticasGenerales.indicePoder,
        indiceAtaque: jugador.estadisticasGenerales.indiceAtaque,
        indiceDefensa: jugador.estadisticasGenerales.indiceDefensa,
        partidosJugados: jugador.estadisticasGenerales.partidosJugados,
        porcentajeHits: jugador.estadisticasGenerales.porcentajeHits,
        porcentajeCatches: jugador.estadisticasGenerales.porcentajeCatches
      }
    }));

    res.json({
      success: true,
      ranking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint de salud
app.get('/api/partido-demo/health', (req, res) => {
  res.json({
    success: true,
    mensaje: 'Servidor de partidos demo funcionando',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
async function iniciarServidor() {
  await conectarDB();
  
  app.listen(PORT, () => {
    console.log(`🏀 Servidor de partidos demo ejecutándose en puerto ${PORT}`);
    console.log(`📡 Endpoints disponibles:`);
    console.log(`   POST http://localhost:${PORT}/api/partido-demo - Crear partido demo`);
    console.log(`   GET  http://localhost:${PORT}/api/partido-demo/ranking - Ver ranking`);
    console.log(`   GET  http://localhost:${PORT}/api/partido-demo/health - Salud del servidor`);
  });
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor de partidos demo...');
  await mongoose.disconnect();
  process.exit(0);
});

// Ejecutar si se llama directamente
if (require.main === module) {
  iniciarServidor().catch(error => {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  });
}

module.exports = app;
