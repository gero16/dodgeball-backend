const axios = require('axios');
require('dotenv').config();

// Configuración de la API
const API_BASE_URL = process.env.API_BASE_URL || 'https://dodgeball-backend-production.up.railway.app/api';

// ID del evento de la Liga 2024
const EVENTO_LIGA_2024 = '68db0409ddcdb45a97d57ffd';

// Mapeo de equipos
const equiposIds = {
  'BUMBA': '68e42f7caa241db4750498ae',
  'THE CATCHERS': '68e42f78aa241db4750498ab',
  'THE DODGEBALL MONKEYS': '68e45aa2a8e4d976e9a083d2',
  'LA NEOFARAFA': '68e45aa1a8e4d976e9a083cf'
};

// Función para generar estadísticas aleatorias pero realistas
function generarEstadisticasRealistas() {
  const setsJugados = Math.floor(Math.random() * 8) + 3; // 3-10 sets
  const tirosTotales = Math.floor(Math.random() * 40) + 10; // 10-50 tiros
  const hits = Math.floor(tirosTotales * (Math.random() * 0.4 + 0.1)); // 10-50% hits
  const quemados = Math.floor(hits * (Math.random() * 0.3 + 0.7)); // 70-100% de hits son quemados
  const asistencias = Math.floor(Math.random() * 5); // 0-5 asistencias
  
  const tirosRecibidos = Math.floor(Math.random() * 50) + 20; // 20-70 tiros recibidos
  const hitsRecibidos = Math.floor(tirosRecibidos * (Math.random() * 0.5 + 0.2)); // 20-70% hits recibidos
  const esquives = Math.floor(tirosRecibidos * (Math.random() * 0.4 + 0.3)); // 30-70% esquives
  const esquivesSinEsfuerzo = Math.floor(esquives * (Math.random() * 0.5 + 0.3)); // 30-80% esquives sin esfuerzo
  const ponchado = Math.floor(hitsRecibidos * (Math.random() * 0.3 + 0.1)); // 10-40% ponchados
  
  const catchesIntentados = Math.floor(Math.random() * 8) + 2; // 2-10 catches intentados
  const catches = Math.floor(catchesIntentados * (Math.random() * 0.6 + 0.2)); // 20-80% catches exitosos
  
  const bloqueosIntentados = Math.floor(Math.random() * 15) + 5; // 5-20 bloqueos intentados
  const bloqueos = Math.floor(bloqueosIntentados * (Math.random() * 0.7 + 0.3)); // 30-100% bloqueos exitosos
  
  // Calcular porcentajes
  const porcentajeHits = tirosTotales > 0 ? (hits / tirosTotales) * 100 : 0;
  const porcentajeOuts = tirosRecibidos > 0 ? (ponchado / tirosRecibidos) * 100 : 0;
  const porcentajeCatches = catchesIntentados > 0 ? (catches / catchesIntentados) * 100 : 0;
  const porcentajeBloqueos = bloqueosIntentados > 0 ? (bloqueos / bloqueosIntentados) * 100 : 0;
  
  // Calcular índices
  const indiceAtaque = (hits * 2) + (quemados * 3) + (asistencias * 1) + (porcentajeHits * 0.1);
  const indiceDefensa = (catches * 2) + (bloqueos * 1.5) + (esquives * 1) + (porcentajeCatches * 0.1) + (porcentajeBloqueos * 0.05);
  const indicePoder = indiceAtaque + indiceDefensa;
  
  return {
    setsJugados,
    tirosTotales,
    hits,
    quemados,
    asistencias,
    tirosRecibidos,
    hitsRecibidos,
    esquives,
    esquivesSinEsfuerzo,
    ponchado,
    catchesIntentados,
    catches,
    bloqueosIntentados,
    bloqueos,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: Math.round(porcentajeHits * 100) / 100,
    porcentajeOuts: Math.round(porcentajeOuts * 100) / 100,
    porcentajeCatches: Math.round(porcentajeCatches * 100) / 100,
    porcentajeBloqueos: Math.round(porcentajeBloqueos * 100) / 100,
    indiceAtaque: Math.round(indiceAtaque * 100) / 100,
    indiceDefensa: Math.round(indiceDefensa * 100) / 100,
    indicePoder: Math.round(indicePoder * 100) / 100
  };
}

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
    
    // Asignar equipo aleatorio
    const equipos = Object.values(equiposIds);
    const equipoId = equipos[Math.floor(Math.random() * equipos.length)];
    
    const estadisticaData = {
      equipo: equipoId,
      jugador: jugador._id,
      evento: EVENTO_LIGA_2024,
      ...estadisticas
    };
    
    const response = await axios.post(`${API_BASE_URL}/estadisticas`, estadisticaData);
    console.log(`✅ Estadística creada para ${jugador.nombre} ${jugador.apellido}`);
    return response.data.data.estadistica;
    
  } catch (error) {
    console.error(`❌ Error creando estadística para ${jugador.nombre} ${jugador.apellido}:`, error.response?.data || error.message);
    return null;
  }
}

async function agregarEstadisticasGenericas() {
  try {
    console.log('🚀 Iniciando proceso de agregar estadísticas genéricas...');
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
      const estadisticas = generarEstadisticasRealistas();
      const estadistica = await crearEstadistica(jugador, estadisticas);
      
      if (estadistica) {
        estadisticasCreadas++;
      } else {
        errores++;
      }
      
      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Estadísticas creadas: ${estadisticasCreadas}`);
    console.log(`   - Errores: ${errores}`);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

agregarEstadisticasGenericas();
