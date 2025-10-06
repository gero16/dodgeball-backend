/**
 * Script para procesar datos de jugadores desde el formato proporcionado
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos del primer jugador como ejemplo
const datosJugador = {
  equipo: 'BUMBA',
  jugador: 'Felipe Demarco',
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
  porcentajeOuts: 29.5,
  porcentajeCatches: 0.0,
  porcentajeBloqueos: 81.8,
  indiceAtaque: 10.08,
  indiceDefensa: 5.79,
  indicePoder: 90.62
};

async function procesarDatosJugadores() {
  try {
    console.log('🔄 Procesando datos de jugadores...\n');

    // 1. Primero necesitamos obtener los IDs de equipos y jugadores
    console.log('📋 Obteniendo equipos disponibles...');
    const equiposResponse = await axios.get(`${API_BASE_URL}/api/equipos`);
    const equipos = equiposResponse.data.data.equipos || equiposResponse.data.data;
    console.log(`✅ Encontrados ${equipos.length} equipos`);

    // 2. Buscar el equipo BUMBA
    const equipoBumba = equipos.find(e => e.nombre && e.nombre.toLowerCase().includes('bumba'));
    if (!equipoBumba) {
      console.log('❌ No se encontró el equipo BUMBA. Equipos disponibles:');
      equipos.forEach(e => console.log(`   - ${e.nombre}`));
      return;
    }
    console.log(`✅ Equipo encontrado: ${equipoBumba.nombre} (ID: ${equipoBumba._id})`);

    // 3. Obtener jugadores
    console.log('\n👥 Obteniendo jugadores...');
    const jugadoresResponse = await axios.get(`${API_BASE_URL}/api/jugadores`);
    const jugadores = jugadoresResponse.data.data.jugadores || jugadoresResponse.data.data;
    console.log(`✅ Encontrados ${jugadores.length} jugadores`);

    // 4. Buscar el jugador Felipe Demarco
    const jugadorFelipe = jugadores.find(j => 
      j.nombre && j.apellido && 
      j.nombre.toLowerCase().includes('felipe') && 
      j.apellido.toLowerCase().includes('demarco')
    );
    
    if (!jugadorFelipe) {
      console.log('❌ No se encontró el jugador Felipe Demarco. Jugadores disponibles:');
      jugadores.forEach(j => console.log(`   - ${j.nombre} ${j.apellido}`));
      return;
    }
    console.log(`✅ Jugador encontrado: ${jugadorFelipe.nombre} ${jugadorFelipe.apellido} (ID: ${jugadorFelipe._id})`);

    // 5. Crear la estadística
    console.log('\n📊 Creando estadística...');
    const estadisticaData = {
      equipo: equipoBumba._id,
      jugador: jugadorFelipe._id,
      setsJugados: datosJugador.setsJugados,
      tirosTotales: datosJugador.tirosTotales,
      hits: datosJugador.hits,
      quemados: datosJugador.quemados,
      asistencias: datosJugador.asistencias,
      tirosRecibidos: datosJugador.tirosRecibidos,
      hitsRecibidos: datosJugador.hitsRecibidos,
      esquives: datosJugador.esquives,
      esquivesSinEsfuerzo: datosJugador.esquivesSinEsfuerzo,
      ponchado: datosJugador.ponchado,
      catchesIntentados: datosJugador.catchesIntentados,
      catches: datosJugador.catches,
      bloqueosIntentados: datosJugador.bloqueosIntentados,
      bloqueos: datosJugador.bloqueos,
      pisoLinea: datosJugador.pisoLinea,
      catchesRecibidos: datosJugador.catchesRecibidos,
      temporada: '2024-2025'
    };

    const estadisticaResponse = await axios.post(`${API_BASE_URL}/api/estadisticas`, estadisticaData);
    console.log('✅ Estadística creada exitosamente');
    console.log('📈 Datos calculados automáticamente:');
    console.log(`   - % Hits: ${estadisticaResponse.data.data.porcentajeHits}%`);
    console.log(`   - % Outs: ${estadisticaResponse.data.data.porcentajeOuts}%`);
    console.log(`   - % Catches: ${estadisticaResponse.data.data.porcentajeCatches}%`);
    console.log(`   - % Bloqueos: ${estadisticaResponse.data.data.porcentajeBloqueos}%`);
    console.log(`   - Índice Ataque: ${estadisticaResponse.data.data.indiceAtaque}`);
    console.log(`   - Índice Defensa: ${estadisticaResponse.data.data.indiceDefensa}`);
    console.log(`   - Índice Poder: ${estadisticaResponse.data.data.indicePoder}`);

    // 6. Verificar que se creó correctamente
    console.log('\n🔍 Verificando estadística creada...');
    const verificacionResponse = await axios.get(`${API_BASE_URL}/api/estadisticas`);
    const estadisticas = verificacionResponse.data.data.estadisticas || verificacionResponse.data.data;
    const estadisticaCreada = estadisticas.find(e => 
      e.jugador && e.jugador._id === jugadorFelipe._id
    );
    
    if (estadisticaCreada) {
      console.log('✅ Estadística verificada correctamente');
      console.log(`   - Jugador: ${estadisticaCreada.jugador.nombre} ${estadisticaCreada.jugador.apellido}`);
      console.log(`   - Equipo: ${estadisticaCreada.equipo.nombre}`);
      console.log(`   - Sets Jugados: ${estadisticaCreada.setsJugados}`);
      console.log(`   - Tiros Totales: ${estadisticaCreada.tirosTotales}`);
      console.log(`   - Hits: ${estadisticaCreada.hits}`);
    }

    console.log('\n🎉 Procesamiento completado exitosamente!');

  } catch (error) {
    console.error('❌ Error procesando datos:', error.response?.data || error.message);
  }
}

// Función para procesar múltiples jugadores desde un array
async function procesarMultipleJugadores(datosJugadores) {
  try {
    console.log(`🔄 Procesando ${datosJugadores.length} jugadores...\n`);

    // Obtener equipos y jugadores una sola vez
    const equiposResponse = await axios.get(`${API_BASE_URL}/api/equipos`);
    const jugadoresResponse = await axios.get(`${API_BASE_URL}/api/jugadores`);
    
    const equipos = equiposResponse.data.data.equipos || equiposResponse.data.data;
    const jugadores = jugadoresResponse.data.data.jugadores || jugadoresResponse.data.data;

    let exitosos = 0;
    let errores = 0;

    for (let i = 0; i < datosJugadores.length; i++) {
      const datos = datosJugadores[i];
      try {
        console.log(`📊 Procesando jugador ${i + 1}/${datosJugadores.length}: ${datos.jugador}`);

        // Buscar equipo y jugador
        const equipo = equipos.find(e => 
          e.nombre && e.nombre.toLowerCase().includes(datos.equipo.toLowerCase())
        );
        const jugador = jugadores.find(j => 
          j.nombre && j.apellido && 
          j.nombre.toLowerCase().includes(datos.jugador.split(' ')[0].toLowerCase()) &&
          j.apellido.toLowerCase().includes(datos.jugador.split(' ')[1].toLowerCase())
        );

        if (!equipo) {
          console.log(`   ❌ Equipo no encontrado: ${datos.equipo}`);
          errores++;
          continue;
        }

        if (!jugador) {
          console.log(`   ❌ Jugador no encontrado: ${datos.jugador}`);
          errores++;
          continue;
        }

        // Crear estadística
        const estadisticaData = {
          equipo: equipo._id,
          jugador: jugador._id,
          setsJugados: datos.setsJugados,
          tirosTotales: datos.tirosTotales,
          hits: datos.hits,
          quemados: datos.quemados,
          asistencias: datos.asistencias,
          tirosRecibidos: datos.tirosRecibidos,
          hitsRecibidos: datos.hitsRecibidos,
          esquives: datos.esquives,
          esquivesSinEsfuerzo: datos.esquivesSinEsfuerzo,
          ponchado: datos.ponchado,
          catchesIntentados: datos.catchesIntentados,
          catches: datos.catches,
          bloqueosIntentados: datos.bloqueosIntentados,
          bloqueos: datos.bloqueos,
          pisoLinea: datos.pisoLinea,
          catchesRecibidos: datos.catchesRecibidos,
          temporada: '2024-2025'
        };

        await axios.post(`${API_BASE_URL}/api/estadisticas`, estadisticaData);
        console.log(`   ✅ ${datos.jugador} procesado correctamente`);
        exitosos++;

      } catch (error) {
        console.log(`   ❌ Error procesando ${datos.jugador}:`, error.response?.data?.message || error.message);
        errores++;
      }
    }

    console.log(`\n📈 Resumen del procesamiento:`);
    console.log(`   ✅ Exitosos: ${exitosos}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total: ${datosJugadores.length}`);

  } catch (error) {
    console.error('❌ Error en procesamiento múltiple:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  procesarDatosJugadores()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { procesarDatosJugadores, procesarMultipleJugadores };
