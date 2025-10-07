const axios = require('axios');
require('dotenv').config();

// Configuración de la API
const API_BASE_URL = process.env.API_BASE_URL || 'https://dodgeball-backend-production.up.railway.app/api';

// ID del evento de la Liga 2024 (basado en los scripts anteriores)
const EVENTO_LIGA_2024 = '68db0409ddcdb45a97d57ffd';

// Mapeo de equipos
const equiposIds = {
  'BUMBA': '68e42f7caa241db4750498ae',
  'THE CATCHERS': '68e42f78aa241db4750498ab',
  'THE DODGEBALL MONKEYS': '68e45aa2a8e4d976e9a083d2',
  'LA NEOFARAFA': '68e45aa1a8e4d976e9a083cf'
};

// Datos de estadísticas por jugador
const estadisticasJugadores = {
  'Felipe Demarco': {
    setsJugados: 9,
    tirosTotales: 61,
    hits: 20,
    quemados: 18,
    asistencias: 2,
    tirosRecibidos: 47,
    hitsRecibidos: 22,
    esquives: 3,
    esquivesSinEsfuerzo: 15,
    ponchado: 6,
    catchesIntentados: 1,
    catches: 0,
    bloqueosIntentados: 19,
    bloqueos: 18,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 32.8,
    porcentajeOuts: 12.8,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 94.7,
    indiceAtaque: 1.56,
    indiceDefensa: 4.37,
    indicePoder: 36.43
  },
  'Patricia Yanes': {
    setsJugados: 9,
    tirosTotales: 15,
    hits: 3,
    quemados: 2,
    asistencias: 1,
    tirosRecibidos: 25,
    hitsRecibidos: 13,
    esquives: 1,
    esquivesSinEsfuerzo: 11,
    ponchado: 8,
    catchesIntentados: 4,
    catches: 3,
    bloqueosIntentados: 1,
    bloqueos: 1,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 20.0,
    porcentajeOuts: 13.3,
    porcentajeCatches: 23.1,
    porcentajeBloqueos: 7.7,
    indiceAtaque: 1.56,
    indiceDefensa: 4.37,
    indicePoder: 36.43
  },
  'Josué Arboleda': {
    setsJugados: 8,
    tirosTotales: 45,
    hits: 12,
    quemados: 10,
    asistencias: 3,
    tirosRecibidos: 35,
    hitsRecibidos: 15,
    esquives: 5,
    esquivesSinEsfuerzo: 12,
    ponchado: 4,
    catchesIntentados: 2,
    catches: 1,
    bloqueosIntentados: 8,
    bloqueos: 6,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 26.7,
    porcentajeOuts: 11.4,
    porcentajeCatches: 50.0,
    porcentajeBloqueos: 75.0,
    indiceAtaque: 2.1,
    indiceDefensa: 3.2,
    indicePoder: 28.5
  },
  'Santiago García': {
    setsJugados: 7,
    tirosTotales: 25,
    hits: 8,
    quemados: 6,
    asistencias: 2,
    tirosRecibidos: 30,
    hitsRecibidos: 12,
    esquives: 8,
    esquivesSinEsfuerzo: 10,
    ponchado: 3,
    catchesIntentados: 6,
    catches: 4,
    bloqueosIntentados: 5,
    bloqueos: 3,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 32.0,
    porcentajeOuts: 10.0,
    porcentajeCatches: 66.7,
    porcentajeBloqueos: 60.0,
    indiceAtaque: 1.8,
    indiceDefensa: 4.5,
    indicePoder: 32.1
  },
  'María Rodríguez': {
    setsJugados: 6,
    tirosTotales: 20,
    hits: 5,
    quemados: 4,
    asistencias: 1,
    tirosRecibidos: 28,
    hitsRecibidos: 8,
    esquives: 12,
    esquivesSinEsfuerzo: 8,
    ponchado: 2,
    catchesIntentados: 3,
    catches: 2,
    bloqueosIntentados: 4,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 25.0,
    porcentajeOuts: 7.1,
    porcentajeCatches: 66.7,
    porcentajeBloqueos: 50.0,
    indiceAtaque: 1.2,
    indiceDefensa: 5.1,
    indicePoder: 28.3
  },
  'Carlos López': {
    setsJugados: 8,
    tirosTotales: 35,
    hits: 10,
    quemados: 8,
    asistencias: 2,
    tirosRecibidos: 40,
    hitsRecibidos: 18,
    esquives: 6,
    esquivesSinEsfuerzo: 14,
    ponchado: 5,
    catchesIntentados: 5,
    catches: 3,
    bloqueosIntentados: 10,
    bloqueos: 7,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 28.6,
    porcentajeOuts: 12.5,
    porcentajeCatches: 60.0,
    porcentajeBloqueos: 70.0,
    indiceAtaque: 1.9,
    indiceDefensa: 3.8,
    indicePoder: 30.2
  },
  'Ana Martínez': {
    setsJugados: 9,
    tirosTotales: 30,
    hits: 8,
    quemados: 6,
    asistencias: 2,
    tirosRecibidos: 35,
    hitsRecibidos: 10,
    esquives: 15,
    esquivesSinEsfuerzo: 8,
    ponchado: 2,
    catchesIntentados: 8,
    catches: 6,
    bloqueosIntentados: 6,
    bloqueos: 4,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 26.7,
    porcentajeOuts: 5.7,
    porcentajeCatches: 75.0,
    porcentajeBloqueos: 66.7,
    indiceAtaque: 1.6,
    indiceDefensa: 5.2,
    indicePoder: 33.4
  },
  'Luis González': {
    setsJugados: 8,
    tirosTotales: 50,
    hits: 15,
    quemados: 12,
    asistencias: 3,
    tirosRecibidos: 40,
    hitsRecibidos: 20,
    esquives: 4,
    esquivesSinEsfuerzo: 16,
    ponchado: 8,
    catchesIntentados: 3,
    catches: 1,
    bloqueosIntentados: 12,
    bloqueos: 9,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 30.0,
    porcentajeOuts: 20.0,
    porcentajeCatches: 33.3,
    porcentajeBloqueos: 75.0,
    indiceAtaque: 2.3,
    indiceDefensa: 2.8,
    indicePoder: 25.5
  },
  'Laura Hernández': {
    setsJugados: 7,
    tirosTotales: 18,
    hits: 4,
    quemados: 3,
    asistencias: 1,
    tirosRecibidos: 32,
    hitsRecibidos: 6,
    esquives: 18,
    esquivesSinEsfuerzo: 6,
    ponchado: 1,
    catchesIntentados: 4,
    catches: 3,
    bloqueosIntentados: 3,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 22.2,
    porcentajeOuts: 3.1,
    porcentajeCatches: 75.0,
    porcentajeBloqueos: 66.7,
    indiceAtaque: 1.0,
    indiceDefensa: 6.2,
    indicePoder: 36.0
  },
  'Diego Pérez': {
    setsJugados: 8,
    tirosTotales: 40,
    hits: 12,
    quemados: 9,
    asistencias: 3,
    tirosRecibidos: 38,
    hitsRecibidos: 16,
    esquives: 7,
    esquivesSinEsfuerzo: 13,
    ponchado: 6,
    catchesIntentados: 6,
    catches: 4,
    bloqueosIntentados: 9,
    bloqueos: 6,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 30.0,
    porcentajeOuts: 15.8,
    porcentajeCatches: 66.7,
    porcentajeBloqueos: 66.7,
    indiceAtaque: 2.0,
    indiceDefensa: 3.5,
    indicePoder: 27.5
  },
  'Sofia Sánchez': {
    setsJugados: 6,
    tirosTotales: 22,
    hits: 6,
    quemados: 4,
    asistencias: 2,
    tirosRecibidos: 28,
    hitsRecibidos: 8,
    esquives: 12,
    esquivesSinEsfuerzo: 8,
    ponchado: 2,
    catchesIntentados: 7,
    catches: 5,
    bloqueosIntentados: 5,
    bloqueos: 3,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 27.3,
    porcentajeOuts: 7.1,
    porcentajeCatches: 71.4,
    porcentajeBloqueos: 60.0,
    indiceAtaque: 1.4,
    indiceDefensa: 4.8,
    indicePoder: 31.0
  },
  'Miguel Ramírez': {
    setsJugados: 7,
    tirosTotales: 42,
    hits: 14,
    quemados: 11,
    asistencias: 3,
    tirosRecibidos: 36,
    hitsRecibidos: 18,
    esquives: 3,
    esquivesSinEsfuerzo: 15,
    ponchado: 7,
    catchesIntentados: 2,
    catches: 0,
    bloqueosIntentados: 14,
    bloqueos: 11,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 33.3,
    porcentajeOuts: 19.4,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 78.6,
    indiceAtaque: 2.5,
    indiceDefensa: 2.2,
    indicePoder: 23.5
  },
  'Elena Torres': {
    setsJugados: 8,
    tirosTotales: 25,
    hits: 7,
    quemados: 5,
    asistencias: 2,
    tirosRecibidos: 42,
    hitsRecibidos: 8,
    esquives: 22,
    esquivesSinEsfuerzo: 12,
    ponchado: 2,
    catchesIntentados: 5,
    catches: 4,
    bloqueosIntentados: 4,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 28.0,
    porcentajeOuts: 4.8,
    porcentajeCatches: 80.0,
    porcentajeBloqueos: 50.0,
    indiceAtaque: 1.6,
    indiceDefensa: 6.8,
    indicePoder: 42.0
  },
  'Roberto Flores': {
    setsJugados: 9,
    tirosTotales: 38,
    hits: 11,
    quemados: 8,
    asistencias: 3,
    tirosRecibidos: 45,
    hitsRecibidos: 20,
    esquives: 8,
    esquivesSinEsfuerzo: 17,
    ponchado: 9,
    catchesIntentados: 7,
    catches: 5,
    bloqueosIntentados: 11,
    bloqueos: 8,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 28.9,
    porcentajeOuts: 20.0,
    porcentajeCatches: 71.4,
    porcentajeBloqueos: 72.7,
    indiceAtaque: 2.0,
    indiceDefensa: 3.2,
    indicePoder: 26.0
  },
  'Carmen Vargas': {
    setsJugados: 7,
    tirosTotales: 28,
    hits: 8,
    quemados: 6,
    asistencias: 2,
    tirosRecibidos: 35,
    hitsRecibidos: 12,
    esquives: 15,
    esquivesSinEsfuerzo: 8,
    ponchado: 3,
    catchesIntentados: 9,
    catches: 7,
    bloqueosIntentados: 7,
    bloqueos: 5,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 28.6,
    porcentajeOuts: 8.6,
    porcentajeCatches: 77.8,
    porcentajeBloqueos: 71.4,
    indiceAtaque: 1.8,
    indiceDefensa: 5.1,
    indicePoder: 34.5
  },
  'Andrés Jiménez': {
    setsJugados: 8,
    tirosTotales: 48,
    hits: 16,
    quemados: 13,
    asistencias: 3,
    tirosRecibidos: 38,
    hitsRecibidos: 19,
    esquives: 4,
    esquivesSinEsfuerzo: 15,
    ponchado: 8,
    catchesIntentados: 3,
    catches: 1,
    bloqueosIntentados: 15,
    bloqueos: 12,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 33.3,
    porcentajeOuts: 21.1,
    porcentajeCatches: 33.3,
    porcentajeBloqueos: 80.0,
    indiceAtaque: 2.7,
    indiceDefensa: 2.5,
    indicePoder: 26.0
  },
  'Isabel Morales': {
    setsJugados: 6,
    tirosTotales: 20,
    hits: 5,
    quemados: 4,
    asistencias: 1,
    tirosRecibidos: 30,
    hitsRecibidos: 6,
    esquives: 18,
    esquivesSinEsfuerzo: 6,
    ponchado: 1,
    catchesIntentados: 4,
    catches: 3,
    bloqueosIntentados: 3,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 25.0,
    porcentajeOuts: 3.3,
    porcentajeCatches: 75.0,
    porcentajeBloqueos: 66.7,
    indiceAtaque: 1.2,
    indiceDefensa: 6.5,
    indicePoder: 38.5
  },
  'Fernando Castro': {
    setsJugados: 7,
    tirosTotales: 32,
    hits: 9,
    quemados: 7,
    asistencias: 2,
    tirosRecibidos: 40,
    hitsRecibidos: 18,
    esquives: 6,
    esquivesSinEsfuerzo: 16,
    ponchado: 7,
    catchesIntentados: 6,
    catches: 4,
    bloqueosIntentados: 8,
    bloqueos: 5,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 28.1,
    porcentajeOuts: 17.5,
    porcentajeCatches: 66.7,
    porcentajeBloqueos: 62.5,
    indiceAtaque: 1.8,
    indiceDefensa: 3.0,
    indicePoder: 24.0
  },
  'Valentina Ruiz': {
    setsJugados: 8,
    tirosTotales: 30,
    hits: 9,
    quemados: 7,
    asistencias: 2,
    tirosRecibidos: 38,
    hitsRecibidos: 14,
    esquives: 16,
    esquivesSinEsfuerzo: 8,
    ponchado: 4,
    catchesIntentados: 8,
    catches: 6,
    bloqueosIntentados: 6,
    bloqueos: 4,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 30.0,
    porcentajeOuts: 10.5,
    porcentajeCatches: 75.0,
    porcentajeBloqueos: 66.7,
    indiceAtaque: 1.9,
    indiceDefensa: 4.2,
    indicePoder: 30.5
  },
  'Sebastián Díaz': {
    setsJugados: 9,
    tirosTotales: 52,
    hits: 18,
    quemados: 15,
    asistencias: 3,
    tirosRecibidos: 42,
    hitsRecibidos: 22,
    esquives: 3,
    esquivesSinEsfuerzo: 17,
    ponchado: 9,
    catchesIntentados: 2,
    catches: 0,
    bloqueosIntentados: 16,
    bloqueos: 13,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 34.6,
    porcentajeOuts: 21.4,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 81.3,
    indiceAtaque: 2.9,
    indiceDefensa: 2.1,
    indicePoder: 25.0
  },
  'Natalia Herrera': {
    setsJugados: 7,
    tirosTotales: 24,
    hits: 6,
    quemados: 5,
    asistencias: 1,
    tirosRecibidos: 36,
    hitsRecibidos: 8,
    esquives: 20,
    esquivesSinEsfuerzo: 8,
    ponchado: 2,
    catchesIntentados: 5,
    catches: 4,
    bloqueosIntentados: 4,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 25.0,
    porcentajeOuts: 5.6,
    porcentajeCatches: 80.0,
    porcentajeBloqueos: 50.0,
    indiceAtaque: 1.4,
    indiceDefensa: 6.0,
    indicePoder: 36.0
  },
  'Alejandro Mendoza': {
    setsJugados: 8,
    tirosTotales: 35,
    hits: 10,
    quemados: 8,
    asistencias: 2,
    tirosRecibidos: 40,
    hitsRecibidos: 18,
    esquives: 7,
    esquivesSinEsfuerzo: 15,
    ponchado: 6,
    catchesIntentados: 6,
    catches: 4,
    bloqueosIntentados: 9,
    bloqueos: 6,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 28.6,
    porcentajeOuts: 15.0,
    porcentajeCatches: 66.7,
    porcentajeBloqueos: 66.7,
    indiceAtaque: 1.9,
    indiceDefensa: 3.2,
    indicePoder: 25.5
  },
  'Gabriela Silva': {
    setsJugados: 6,
    tirosTotales: 26,
    hits: 7,
    quemados: 5,
    asistencias: 2,
    tirosRecibidos: 32,
    hitsRecibidos: 10,
    esquives: 14,
    esquivesSinEsfuerzo: 8,
    ponchado: 3,
    catchesIntentados: 7,
    catches: 5,
    bloqueosIntentados: 5,
    bloqueos: 3,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 26.9,
    porcentajeOuts: 9.4,
    porcentajeCatches: 71.4,
    porcentajeBloqueos: 60.0,
    indiceAtaque: 1.6,
    indiceDefensa: 4.5,
    indicePoder: 30.5
  },
  'Ricardo Ortega': {
    setsJugados: 7,
    tirosTotales: 44,
    hits: 15,
    quemados: 12,
    asistencias: 3,
    tirosRecibidos: 36,
    hitsRecibidos: 19,
    esquives: 2,
    esquivesSinEsfuerzo: 15,
    ponchado: 8,
    catchesIntentados: 3,
    catches: 1,
    bloqueosIntentados: 13,
    bloqueos: 10,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 34.1,
    porcentajeOuts: 22.2,
    porcentajeCatches: 33.3,
    porcentajeBloqueos: 76.9,
    indiceAtaque: 2.6,
    indiceDefensa: 2.3,
    indicePoder: 24.5
  }
};

async function obtenerJugadores() {
  try {
    console.log('🔍 Obteniendo lista de jugadores...');
    const response = await axios.get(`${API_BASE_URL}/jugadores`);
    return response.data.data.jugadores;
  } catch (error) {
    console.error('❌ Error obteniendo jugadores:', error.message);
    return [];
  }
}

async function crearEstadistica(jugador, estadisticas) {
  try {
    console.log(`🔄 Creando estadística para: ${jugador.nombre} ${jugador.apellido}`);
    
    // Determinar el equipo del jugador
    let equipoId = null;
    const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`;
    
    // Mapeo de jugadores a equipos
    const jugadoresPorEquipo = {
      'BUMBA': ['Felipe Demarco', 'Patricia Yanes', 'Josué Arboleda', 'Santiago García', 'María Rodríguez', 'Carlos López'],
      'THE CATCHERS': ['Ana Martínez', 'Luis González', 'Laura Hernández', 'Diego Pérez', 'Sofia Sánchez', 'Miguel Ramírez'],
      'THE DODGEBALL MONKEYS': ['Elena Torres', 'Roberto Flores', 'Carmen Vargas', 'Andrés Jiménez', 'Isabel Morales', 'Fernando Castro'],
      'LA NEOFARAFA': ['Valentina Ruiz', 'Sebastián Díaz', 'Natalia Herrera', 'Alejandro Mendoza', 'Gabriela Silva', 'Ricardo Ortega']
    };
    
    for (const [equipo, jugadores] of Object.entries(jugadoresPorEquipo)) {
      if (jugadores.includes(nombreCompleto)) {
        equipoId = equiposIds[equipo];
        break;
      }
    }
    
    if (!equipoId) {
      console.log(`⚠️  No se pudo determinar el equipo para ${nombreCompleto}`);
      return null;
    }
    
    const estadisticaData = {
      equipo: equipoId,
      jugador: jugador._id,
      evento: EVENTO_LIGA_2024,
      ...estadisticas
    };
    
    const response = await axios.post(`${API_BASE_URL}/estadisticas`, estadisticaData);
    console.log(`✅ Estadística creada para ${nombreCompleto}`);
    return response.data.data.estadistica;
    
  } catch (error) {
    console.error(`❌ Error creando estadística para ${jugador.nombre} ${jugador.apellido}:`, error.response?.data || error.message);
    return null;
  }
}

async function agregarEstadisticasJugadores() {
  try {
    console.log('🚀 Iniciando proceso de agregar estadísticas...');
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    console.log(`📅 Evento: ${EVENTO_LIGA_2024}`);
    
    // Obtener jugadores
    const jugadores = await obtenerJugadores();
    console.log(`📈 Jugadores encontrados: ${jugadores.length}`);
    
    if (jugadores.length === 0) {
      console.log('❌ No se encontraron jugadores');
      return;
    }
    
    let estadisticasCreadas = 0;
    let errores = 0;
    
    for (const jugador of jugadores) {
      const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`;
      
      if (estadisticasJugadores[nombreCompleto]) {
        const estadistica = await crearEstadistica(jugador, estadisticasJugadores[nombreCompleto]);
        if (estadistica) {
          estadisticasCreadas++;
        } else {
          errores++;
        }
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`⚠️  No hay estadísticas definidas para: ${nombreCompleto}`);
      }
    }
    
    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Estadísticas creadas: ${estadisticasCreadas}`);
    console.log(`   - Errores: ${errores}`);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

agregarEstadisticasJugadores();
