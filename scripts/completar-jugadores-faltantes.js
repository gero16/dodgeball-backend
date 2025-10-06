/**
 * Script para completar los jugadores faltantes
 * Este script agrega los jugadores que no se pudieron crear anteriormente
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Jugadores faltantes que necesitamos agregar
const jugadoresFaltantes = [
  {
    nombre: 'Diego',
    apellido: 'González',
    email: 'diego.gonzalez@email.com',
    telefono: '+59899456789',
    fechaNacimiento: '1988-05-12',
    posicion: 'defender',
    numeroCamiseta: 3,
    estadisticasGenerales: {
      setsJugados: 22,
      tirosTotales: 70,
      hits: 25,
      quemados: 18,
      asistencias: 12,
      tirosRecibidos: 125,
      hitsRecibidos: 40,
      esquives: 60,
      esquivesExitosos: 50,
      ponchado: 10,
      catchesIntentos: 45,
      catches: 36,
      catchesRecibidos: 15,
      bloqueosIntentos: 50,
      bloqueos: 40,
      pisoLinea: 5,
      porcentajeHits: 35.7,
      porcentajeOuts: 8.0,
      porcentajeCatches: 80.0,
      porcentajeBloqueos: 80.0,
      indiceAtaque: 22.0,
      indiceDefensa: 42.0,
      indicePoder: 64.0
    }
  },
  {
    nombre: 'Lucas',
    apellido: 'Fernández',
    email: 'lucas.fernandez@email.com',
    telefono: '+59899678901',
    fechaNacimiento: '1994-02-14',
    posicion: 'versatil',
    numeroCamiseta: 8,
    estadisticasGenerales: {
      setsJugados: 14,
      tirosTotales: 88,
      hits: 35,
      quemados: 26,
      asistencias: 16,
      tirosRecibidos: 90,
      hitsRecibidos: 28,
      esquives: 40,
      esquivesExitosos: 33,
      ponchado: 6,
      catchesIntentos: 30,
      catches: 24,
      catchesRecibidos: 9,
      bloqueosIntentos: 35,
      bloqueos: 28,
      pisoLinea: 3,
      porcentajeHits: 39.8,
      porcentajeOuts: 6.67,
      porcentajeCatches: 80.0,
      porcentajeBloqueos: 80.0,
      indiceAtaque: 29.2,
      indiceDefensa: 30.4,
      indicePoder: 59.6
    }
  },
  {
    nombre: 'Gabriel',
    apellido: 'Silva',
    email: 'gabriel.silva@email.com',
    telefono: '+59899789012',
    fechaNacimiento: '1991-12-03',
    posicion: 'catcher',
    numeroCamiseta: 12,
    estadisticasGenerales: {
      setsJugados: 19,
      tirosTotales: 75,
      hits: 28,
      quemados: 20,
      asistencias: 14,
      tirosRecibidos: 105,
      hitsRecibidos: 32,
      esquives: 48,
      esquivesExitosos: 40,
      ponchado: 8,
      catchesIntentos: 38,
      catches: 30,
      catchesRecibidos: 11,
      bloqueosIntentos: 42,
      bloqueos: 34,
      pisoLinea: 4,
      porcentajeHits: 37.3,
      porcentajeOuts: 7.62,
      porcentajeCatches: 78.9,
      porcentajeBloqueos: 81.0,
      indiceAtaque: 25.6,
      indiceDefensa: 32.8,
      indicePoder: 58.4
    }
  },
  {
    nombre: 'Nicolás',
    apellido: 'Torres',
    email: 'nicolas.torres@email.com',
    telefono: '+59899890123',
    fechaNacimiento: '1989-07-18',
    posicion: 'thrower',
    numeroCamiseta: 11,
    estadisticasGenerales: {
      setsJugados: 17,
      tirosTotales: 105,
      hits: 40,
      quemados: 29,
      asistencias: 19,
      tirosRecibidos: 85,
      hitsRecibidos: 26,
      esquives: 32,
      esquivesExitosos: 27,
      ponchado: 6,
      catchesIntentos: 22,
      catches: 17,
      catchesRecibidos: 7,
      bloqueosIntentos: 28,
      bloqueos: 21,
      pisoLinea: 3,
      porcentajeHits: 38.1,
      porcentajeOuts: 7.06,
      porcentajeCatches: 77.3,
      porcentajeBloqueos: 75.0,
      indiceAtaque: 32.8,
      indiceDefensa: 26.4,
      indicePoder: 59.2
    }
  },
  {
    nombre: 'Sebastián',
    apellido: 'Vargas',
    email: 'sebastian.vargas@email.com',
    telefono: '+59899901234',
    fechaNacimiento: '1996-04-25',
    posicion: 'versatil',
    numeroCamiseta: 6,
    estadisticasGenerales: {
      setsJugados: 13,
      tirosTotales: 82,
      hits: 31,
      quemados: 23,
      asistencias: 17,
      tirosRecibidos: 95,
      hitsRecibidos: 29,
      esquives: 38,
      esquivesExitosos: 31,
      ponchado: 7,
      catchesIntentos: 28,
      catches: 22,
      catchesRecibidos: 8,
      bloqueosIntentos: 32,
      bloqueos: 25,
      pisoLinea: 2,
      porcentajeHits: 37.8,
      porcentajeOuts: 7.37,
      porcentajeCatches: 78.6,
      porcentajeBloqueos: 78.1,
      indiceAtaque: 27.6,
      indiceDefensa: 28.8,
      indicePoder: 56.4
    }
  }
];

async function crearUsuario(nombre, apellido, email) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/usuario/registrar`, {
      nombre,
      apellido,
      email,
      password: '123456',
      rol: 'jugador'
    });
    return response.data.data.usuario;
  } catch (error) {
    console.error(`Error creando usuario ${nombre}:`, error.response?.data || error.message);
    return null;
  }
}

async function obtenerEquipos() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/equipos`);
    return response.data.data.equipos;
  } catch (error) {
    console.error('Error obteniendo equipos:', error.response?.data || error.message);
    return [];
  }
}

async function crearJugador(jugadorData, usuarioId, equipoId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/jugadores`, {
      ...jugadorData,
      usuario: usuarioId,
      equipo: equipoId
    });
    return response.data.data.jugador;
  } catch (error) {
    console.error(`Error creando jugador ${jugadorData.nombre}:`, error.response?.data || error.message);
    return null;
  }
}

async function ejecutarMigracion() {
  try {
    console.log('🔄 Ejecutando migración de estadísticas...');
    const response = await axios.post(`${API_BASE_URL}/api/migrar-estadisticas`, {});
    return response.data;
  } catch (error) {
    console.error('Error ejecutando migración:', error.response?.data || error.message);
    return null;
  }
}

async function verificarEstadoMigracion() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/migrar-estadisticas/status`);
    return response.data;
  } catch (error) {
    console.error('Error verificando estado:', error.response?.data || error.message);
    return null;
  }
}

async function completarJugadoresFaltantes() {
  try {
    console.log('🔄 Completando jugadores faltantes...');
    
    // 1. Obtener equipos existentes
    console.log('\n🏆 Obteniendo equipos existentes...');
    const equipos = await obtenerEquipos();
    console.log(`✅ Encontrados ${equipos.length} equipos`);
    
    if (equipos.length === 0) {
      console.log('❌ No hay equipos disponibles');
      return;
    }

    // 2. Crear usuarios y jugadores faltantes
    console.log('\n👥 Creando jugadores faltantes...');
    const jugadoresCreados = [];
    
    for (let i = 0; i < jugadoresFaltantes.length; i++) {
      const jugadorData = jugadoresFaltantes[i];
      const equipoIndex = i % equipos.length;
      const equipo = equipos[equipoIndex];
      
      console.log(`\n📝 Procesando: ${jugadorData.nombre} ${jugadorData.apellido}`);
      
      // Crear usuario
      const usuario = await crearUsuario(jugadorData.nombre, jugadorData.apellido, jugadorData.email);
      if (!usuario) {
        console.log(`❌ No se pudo crear usuario para ${jugadorData.nombre}`);
        continue;
      }
      
      // Crear jugador
      const jugador = await crearJugador(jugadorData, usuario._id, equipo._id);
      if (jugador) {
        jugadoresCreados.push(jugador);
        console.log(`✅ Jugador creado: ${jugador.nombre} ${jugador.apellido} (${equipo.nombre})`);
      } else {
        console.log(`❌ No se pudo crear jugador ${jugadorData.nombre}`);
      }
    }

    // 3. Ejecutar migración
    console.log('\n🔄 Ejecutando migración de estadísticas...');
    const resultadoMigracion = await ejecutarMigracion();
    if (resultadoMigracion) {
      console.log('📈 Resultado de la migración:');
      console.log(`✅ Total jugadores: ${resultadoMigracion.totalJugadores}`);
      console.log(`✅ Jugadores actualizados: ${resultadoMigracion.jugadoresActualizados}`);
      console.log(`❌ Errores: ${resultadoMigracion.errores}`);
    }

    // 4. Verificar estado final
    console.log('\n📊 Verificando estado final...');
    const estadoFinal = await verificarEstadoMigracion();
    if (estadoFinal) {
      console.log(`Total jugadores: ${estadoFinal.totalJugadores}`);
      console.log(`Jugadores migrados: ${estadoFinal.jugadoresConNuevosCampos}`);
      console.log(`Porcentaje migrado: ${estadoFinal.porcentajeMigrado}%`);
    }

    console.log('\n🎉 Proceso completado!');
    console.log(`✅ Jugadores nuevos creados: ${jugadoresCreados.length}`);
    console.log(`📊 Total jugadores en el sistema: ${estadoFinal?.totalJugadores || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  completarJugadoresFaltantes()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = completarJugadoresFaltantes;
