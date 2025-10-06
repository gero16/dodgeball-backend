/**
 * Script para procesar todos los jugadores con sus estadísticas
 * Formato: Equipo | Jugador | Sets | Tiros | Hits | Quemados | Asistencias | Tiros Recibidos | Hits Recibidos | Esquives | Esquives Sin Esfuerzo | Ponchado | Catches Intentados | Catches | Bloqueos Intentados | Bloqueos | Piso Línea | Catches Recibidos | % Hits | % Outs | % Catches | % Bloqueos | ATAQUE | DEFENSA | PODER
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos de todos los jugadores (formato: Equipo | Jugador | Sets | Tiros | Hits | Quemados | Asistencias | Tiros Recibidos | Hits Recibidos | Esquives | Esquives Sin Esfuerzo | Ponchado | Catches Intentados | Catches | Bloqueos Intentados | Bloqueos | Piso Línea | Catches Recibidos | % Hits | % Outs | % Catches | % Bloqueos | ATAQUE | DEFENSA | PODER)
const datosJugadores = [
  {
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
    catchesRecibidos: 0
  }
  // Agregar más jugadores aquí cuando tengas los datos
];

async function procesarTodosJugadores() {
  try {
    console.log('🔄 Procesando todos los jugadores...\n');

    // Obtener equipos y jugadores
    console.log('📋 Obteniendo datos de la base de datos...');
    const equiposResponse = await axios.get(`${API_BASE_URL}/api/equipos`);
    const jugadoresResponse = await axios.get(`${API_BASE_URL}/api/jugadores`);
    
    const equipos = equiposResponse.data.data.equipos || equiposResponse.data.data;
    const jugadores = jugadoresResponse.data.data.jugadores || jugadoresResponse.data.data;

    console.log(`✅ Encontrados ${equipos.length} equipos y ${jugadores.length} jugadores`);

    let exitosos = 0;
    let errores = 0;
    const resultados = [];

    for (let i = 0; i < datosJugadores.length; i++) {
      const datos = datosJugadores[i];
      try {
        console.log(`\n📊 Procesando jugador ${i + 1}/${datosJugadores.length}: ${datos.jugador}`);

        // Buscar equipo
        const equipo = equipos.find(e => 
          e.nombre && e.nombre.toLowerCase().includes(datos.equipo.toLowerCase())
        );
        
        if (!equipo) {
          console.log(`   ❌ Equipo no encontrado: ${datos.equipo}`);
          console.log(`   📋 Equipos disponibles: ${equipos.map(e => e.nombre).join(', ')}`);
          errores++;
          continue;
        }

        // Buscar jugador
        const jugador = jugadores.find(j => {
          if (!j.nombre || !j.apellido) return false;
          const nombreCompleto = `${j.nombre} ${j.apellido}`.toLowerCase();
          const datosNombre = datos.jugador.toLowerCase();
          return nombreCompleto.includes(datosNombre) || datosNombre.includes(nombreCompleto);
        });
        
        if (!jugador) {
          console.log(`   ❌ Jugador no encontrado: ${datos.jugador}`);
          console.log(`   📋 Jugadores disponibles: ${jugadores.map(j => `${j.nombre} ${j.apellido}`).join(', ')}`);
          errores++;
          continue;
        }

        console.log(`   ✅ Equipo: ${equipo.nombre} | Jugador: ${jugador.nombre} ${jugador.apellido}`);

        // Verificar si ya existe una estadística para este jugador y equipo
        const estadisticasResponse = await axios.get(`${API_BASE_URL}/api/estadisticas`);
        const estadisticasExistentes = estadisticasResponse.data.data.estadisticas || estadisticasResponse.data.data;
        
        const estadisticaExistente = estadisticasExistentes.find(e => 
          e.jugador && e.equipo && 
          e.jugador._id === jugador._id && 
          e.equipo._id === equipo._id
        );

        if (estadisticaExistente) {
          console.log(`   ⚠️  Ya existe una estadística para este jugador en este equipo`);
          console.log(`   🔄 Actualizando estadística existente...`);
          
          // Actualizar estadística existente
          const estadisticaData = {
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
            catchesRecibidos: datos.catchesRecibidos
          };

          await axios.put(`${API_BASE_URL}/api/estadisticas/${estadisticaExistente._id}`, estadisticaData);
          console.log(`   ✅ Estadística actualizada`);
          
        } else {
          // Crear nueva estadística
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

          const response = await axios.post(`${API_BASE_URL}/api/estadisticas`, estadisticaData);
          console.log(`   ✅ Estadística creada`);
          console.log(`   📈 Índices calculados: Ataque=${response.data.data.indiceAtaque}, Defensa=${response.data.data.indiceDefensa}, Poder=${response.data.data.indicePoder}`);
        }

        exitosos++;
        resultados.push({
          jugador: datos.jugador,
          equipo: datos.equipo,
          estado: 'exitoso'
        });

      } catch (error) {
        console.log(`   ❌ Error procesando ${datos.jugador}:`, error.response?.data?.message || error.message);
        errores++;
        resultados.push({
          jugador: datos.jugador,
          equipo: datos.equipo,
          estado: 'error',
          error: error.response?.data?.message || error.message
        });
      }
    }

    // Mostrar resumen
    console.log(`\n📈 Resumen del procesamiento:`);
    console.log(`   ✅ Exitosos: ${exitosos}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total: ${datosJugadores.length}`);

    if (errores > 0) {
      console.log(`\n❌ Jugadores con errores:`);
      resultados.filter(r => r.estado === 'error').forEach(r => {
        console.log(`   - ${r.jugador} (${r.equipo}): ${r.error}`);
      });
    }

    // Mostrar estadísticas finales
    console.log(`\n🔍 Verificando estadísticas finales...`);
    const estadisticasFinales = await axios.get(`${API_BASE_URL}/api/estadisticas`);
    const totalEstadisticas = estadisticasFinales.data.data.estadisticas || estadisticasFinales.data.data;
    console.log(`   📊 Total de estadísticas en la base de datos: ${totalEstadisticas.length}`);

    console.log('\n🎉 Procesamiento completado!');

  } catch (error) {
    console.error('❌ Error en procesamiento:', error.response?.data || error.message);
  }
}

// Función para agregar más jugadores al array
function agregarJugador(datosJugador) {
  datosJugadores.push(datosJugador);
  console.log(`✅ Jugador agregado: ${datosJugador.jugador}`);
}

// Ejecutar
if (require.main === module) {
  procesarTodosJugadores()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { procesarTodosJugadores, agregarJugador };
