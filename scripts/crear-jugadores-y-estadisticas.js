/**
 * Script para crear jugadores y procesar sus estadísticas
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos de los jugadores a crear
const jugadoresACrear = [
  {
    nombre: 'Alejandro',
    apellido: 'Rocca',
    email: 'alejandro.rocca.estadisticas@email.com',
    equipo: 'The Dodgeball Monkey',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 68,
      hits: 26,
      quemados: 19,
      asistencias: 2,
      tirosRecibidos: 22,
      hitsRecibidos: 15,
      esquives: 4,
      esquivesSinEsfuerzo: 3,
      ponchado: 6,
      catchesIntentados: 1,
      catches: 1,
      bloqueosIntentados: 10,
      bloqueos: 8,
      pisoLinea: 0,
      catchesRecibidos: 0
    }
  },
  {
    nombre: 'Guzmán',
    apellido: 'Demarco',
    email: 'guzman.demarco.estadisticas@email.com',
    equipo: 'The Catchers',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 63,
      hits: 23,
      quemados: 20,
      asistencias: 4,
      tirosRecibidos: 20,
      hitsRecibidos: 7,
      esquives: 6,
      esquivesSinEsfuerzo: 4,
      ponchado: 6,
      catchesIntentados: 2,
      catches: 0,
      bloqueosIntentados: 2,
      bloqueos: 2,
      pisoLinea: 0,
      catchesRecibidos: 0
    }
  },
  {
    nombre: 'Rafael',
    apellido: 'García',
    email: 'rafael.garcia.estadisticas@email.com',
    equipo: 'The Dodgeball Monkey',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 73,
      hits: 21,
      quemados: 14,
      asistencias: 1,
      tirosRecibidos: 35,
      hitsRecibidos: 14,
      esquives: 5,
      esquivesSinEsfuerzo: 16,
      ponchado: 8,
      catchesIntentados: 2,
      catches: 2,
      bloqueosIntentados: 6,
      bloqueos: 6,
      pisoLinea: 1,
      catchesRecibidos: 1
    }
  },
  {
    nombre: 'Valentino',
    apellido: 'Gloodtdfosky',
    email: 'valentino.gloodtdfosky.estadisticas@email.com',
    equipo: 'The Dodgeball Monkey',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 63,
      hits: 23,
      quemados: 18,
      asistencias: 1,
      tirosRecibidos: 20,
      hitsRecibidos: 5,
      esquives: 5,
      esquivesSinEsfuerzo: 9,
      ponchado: 5,
      catchesIntentados: 2,
      catches: 1,
      bloqueosIntentados: 2,
      bloqueos: 2,
      pisoLinea: 0,
      catchesRecibidos: 1
    }
  },
  {
    nombre: 'Salvador',
    apellido: 'Méndez',
    email: 'salvador.mendez.estadisticas@email.com',
    equipo: 'The Dodgeball Monkey',
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 28,
      hits: 8,
      quemados: 8,
      asistencias: 1,
      tirosRecibidos: 32,
      hitsRecibidos: 8,
      esquives: 7,
      esquivesSinEsfuerzo: 17,
      ponchado: 5,
      catchesIntentados: 1,
      catches: 1,
      bloqueosIntentados: 4,
      bloqueos: 4,
      pisoLinea: 1,
      catchesRecibidos: 0
    }
  },
  {
    nombre: 'Edewel',
    apellido: 'Cremel',
    email: 'edewel.cremel.estadisticas@email.com',
    equipo: 'The Catchers',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 34,
      hits: 12,
      quemados: 3,
      asistencias: 2,
      tirosRecibidos: 34,
      hitsRecibidos: 10,
      esquives: 7,
      esquivesSinEsfuerzo: 16,
      ponchado: 8,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 5,
      bloqueos: 5,
      pisoLinea: 0,
      catchesRecibidos: 1
    }
  },
  {
    nombre: 'Gerónimo',
    apellido: 'Nicola',
    email: 'geronimo.nicola.estadisticas@email.com',
    equipo: 'The Dodgeball Monkey', // Usando equipo existente temporalmente
    estadisticas: {
      setsJugados: 11,
      tirosTotales: 49,
      hits: 16,
      quemados: 9,
      asistencias: 3,
      tirosRecibidos: 15,
      hitsRecibidos: 10,
      esquives: 0,
      esquivesSinEsfuerzo: 5,
      ponchado: 8,
      catchesIntentados: 1,
      catches: 1,
      bloqueosIntentados: 2,
      bloqueos: 1,
      pisoLinea: 0,
      catchesRecibidos: 1
    }
  },
  {
    nombre: 'Agustín',
    apellido: 'Giles',
    email: 'agustin.giles.estadisticas@email.com',
    equipo: 'Bumba',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 35,
      hits: 8,
      quemados: 7,
      asistencias: 1,
      tirosRecibidos: 18,
      hitsRecibidos: 7,
      esquives: 3,
      esquivesSinEsfuerzo: 8,
      ponchado: 7,
      catchesIntentados: 1,
      catches: 1,
      bloqueosIntentados: 1,
      bloqueos: 1,
      pisoLinea: 0,
      catchesRecibidos: 0
    }
  },
  {
    nombre: 'Santiago',
    apellido: 'Giles',
    email: 'santiago.giles.estadisticas@email.com',
    equipo: 'Bumba',
    estadisticas: {
      setsJugados: 9,
      tirosTotales: 19,
      hits: 8,
      quemados: 8,
      asistencias: 2,
      tirosRecibidos: 14,
      hitsRecibidos: 6,
      esquives: 3,
      esquivesSinEsfuerzo: 4,
      ponchado: 5,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 2,
      bloqueos: 2,
      pisoLinea: 0,
      catchesRecibidos: 0
    }
  }
];

async function crearJugadoresYEstadisticas() {
  try {
    console.log('🔄 Creando jugadores y procesando estadísticas...\n');

    // Obtener equipos
    console.log('📋 Obteniendo equipos...');
    const equiposResponse = await axios.get(`${API_BASE_URL}/api/equipos`);
    const equipos = equiposResponse.data.data.equipos || equiposResponse.data.data;
    console.log(`✅ Encontrados ${equipos.length} equipos`);

    let exitosos = 0;
    let errores = 0;

    for (let i = 0; i < jugadoresACrear.length; i++) {
      const datosJugador = jugadoresACrear[i];
      try {
        console.log(`\n👤 Procesando jugador ${i + 1}/${jugadoresACrear.length}: ${datosJugador.nombre} ${datosJugador.apellido}`);

        // Buscar equipo
        const equipo = equipos.find(e => 
          e.nombre && e.nombre.toLowerCase().includes(datosJugador.equipo.toLowerCase())
        );
        
        if (!equipo) {
          console.log(`   ❌ Equipo no encontrado: ${datosJugador.equipo}`);
          errores++;
          continue;
        }

        console.log(`   ✅ Equipo encontrado: ${equipo.nombre}`);

        // Crear usuario
        console.log(`   👤 Creando usuario...`);
        const usuarioData = {
          nombre: datosJugador.nombre,
          apellido: datosJugador.apellido,
          email: datosJugador.email,
          password: '123456',
          rol: 'jugador'
        };

        const usuarioResponse = await axios.post(`${API_BASE_URL}/api/usuario/registrar`, usuarioData);
        const usuario = usuarioResponse.data.data.usuario;
        console.log(`   ✅ Usuario creado: ${usuario.nombre} ${usuario.apellido}`);

        // Crear jugador
        console.log(`   🏃 Creando jugador...`);
        const jugadorData = {
          usuario: usuario._id,
          nombre: datosJugador.nombre,
          apellido: datosJugador.apellido,
          email: datosJugador.email,
          equipo: equipo._id,
          posicion: 'versatil',
          numeroCamiseta: Math.floor(Math.random() * 99) + 1,
          activo: true
        };

        const jugadorResponse = await axios.post(`${API_BASE_URL}/api/jugadores`, jugadorData);
        const jugador = jugadorResponse.data.data.jugador;
        console.log(`   ✅ Jugador creado: ${jugador.nombre} ${jugador.apellido}`);

        // Crear estadística
        console.log(`   📊 Creando estadística...`);
        const estadisticaData = {
          equipo: equipo._id,
          jugador: jugador._id,
          ...datosJugador.estadisticas,
          temporada: '2024-2025'
        };

        const estadisticaResponse = await axios.post(`${API_BASE_URL}/api/estadisticas`, estadisticaData);
        console.log(`   ✅ Estadística creada`);
        console.log(`   📈 Índices: Ataque=${estadisticaResponse.data.data.indiceAtaque}, Defensa=${estadisticaResponse.data.data.indiceDefensa}, Poder=${estadisticaResponse.data.data.indicePoder}`);

        exitosos++;

      } catch (error) {
        console.log(`   ❌ Error procesando ${datosJugador.nombre} ${datosJugador.apellido}:`, error.response?.data?.message || error.message);
        errores++;
      }
    }

    // Mostrar resumen
    console.log(`\n📈 Resumen del procesamiento:`);
    console.log(`   ✅ Exitosos: ${exitosos}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total: ${jugadoresACrear.length}`);

    // Verificar estadísticas finales
    console.log(`\n🔍 Verificando estadísticas finales...`);
    const estadisticasResponse = await axios.get(`${API_BASE_URL}/api/estadisticas`);
    const estadisticas = estadisticasResponse.data.data.estadisticas || estadisticasResponse.data.data;
    console.log(`   📊 Total de estadísticas en la base de datos: ${estadisticas.length}`);

    // Mostrar ranking
    console.log(`\n🏆 Ranking de jugadores por índice de poder:`);
    const rankingResponse = await axios.get(`${API_BASE_URL}/api/estadisticas/ranking?criterio=indicePoder&limite=10`);
    const ranking = rankingResponse.data.data;
    ranking.forEach((estadistica, index) => {
      console.log(`   ${index + 1}. ${estadistica.jugador?.nombre || 'N/A'} ${estadistica.jugador?.apellido || 'N/A'} - Poder: ${estadistica.indicePoder}`);
    });

    console.log('\n🎉 Procesamiento completado!');

  } catch (error) {
    console.error('❌ Error en procesamiento:', error.response?.data || error.message);
  }
}

// Ejecutar
if (require.main === module) {
  crearJugadoresYEstadisticas()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { crearJugadoresYEstadisticas };
