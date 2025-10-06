/**
 * Script para crear datos reales de jugadores y equipos usando la API de producción
 * Este script crea los datos reales basados en la información proporcionada
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos reales de jugadores basados en la información proporcionada
const jugadoresReales = [
  {
    nombre: 'Felipe',
    apellido: 'Demarco',
    email: 'felipe.demarco@email.com',
    telefono: '+59899123456',
    fechaNacimiento: '1995-03-15',
    posicion: 'thrower',
    numeroCamiseta: 10,
    estadisticasGenerales: {
      setsJugados: 15,
      tirosTotales: 120,
      hits: 45,
      quemados: 32,
      asistencias: 18,
      tirosRecibidos: 80,
      hitsRecibidos: 25,
      esquives: 35,
      esquivesExitosos: 28,
      ponchado: 7,
      catchesIntentos: 25,
      catches: 18,
      catchesRecibidos: 8,
      bloqueosIntentos: 30,
      bloqueos: 22,
      pisoLinea: 3,
      porcentajeHits: 37.5,
      porcentajeOuts: 8.75,
      porcentajeCatches: 72.0,
      porcentajeBloqueos: 73.3,
      indiceAtaque: 32.5,
      indiceDefensa: 28.7,
      indicePoder: 61.2
    }
  },
  {
    nombre: 'Santiago',
    apellido: 'Nicotera',
    email: 'santiago.nicotera@email.com',
    telefono: '+59899234567',
    fechaNacimiento: '1992-08-22',
    posicion: 'catcher',
    numeroCamiseta: 7,
    estadisticasGenerales: {
      setsJugados: 18,
      tirosTotales: 85,
      hits: 32,
      quemados: 25,
      asistencias: 22,
      tirosRecibidos: 95,
      hitsRecibidos: 30,
      esquives: 45,
      esquivesExitosos: 38,
      ponchado: 5,
      catchesIntentos: 40,
      catches: 32,
      catchesRecibidos: 12,
      bloqueosIntentos: 35,
      bloqueos: 28,
      pisoLinea: 2,
      porcentajeHits: 37.6,
      porcentajeOuts: 5.26,
      porcentajeCatches: 80.0,
      porcentajeBloqueos: 80.0,
      indiceAtaque: 28.8,
      indiceDefensa: 35.2,
      indicePoder: 64.0
    }
  },
  {
    nombre: 'Martín',
    apellido: 'Rodríguez',
    email: 'martin.rodriguez@email.com',
    telefono: '+59899345678',
    fechaNacimiento: '1990-11-08',
    posicion: 'versatil',
    numeroCamiseta: 5,
    estadisticasGenerales: {
      setsJugados: 20,
      tirosTotales: 95,
      hits: 38,
      quemados: 28,
      asistencias: 15,
      tirosRecibidos: 110,
      hitsRecibidos: 35,
      esquives: 50,
      esquivesExitosos: 42,
      ponchado: 8,
      catchesIntentos: 35,
      catches: 28,
      catchesRecibidos: 10,
      bloqueosIntentos: 40,
      bloqueos: 32,
      pisoLinea: 4,
      porcentajeHits: 40.0,
      porcentajeOuts: 7.27,
      porcentajeCatches: 80.0,
      porcentajeBloqueos: 80.0,
      indiceAtaque: 30.4,
      indiceDefensa: 33.6,
      indicePoder: 64.0
    }
  },
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
    nombre: 'Alejandro',
    apellido: 'Martínez',
    email: 'alejandro.martinez@email.com',
    telefono: '+59899567890',
    fechaNacimiento: '1993-09-30',
    posicion: 'thrower',
    numeroCamiseta: 9,
    estadisticasGenerales: {
      setsJugados: 16,
      tirosTotales: 110,
      hits: 42,
      quemados: 30,
      asistencias: 20,
      tirosRecibidos: 75,
      hitsRecibidos: 22,
      esquives: 30,
      esquivesExitosos: 25,
      ponchado: 5,
      catchesIntentos: 20,
      catches: 15,
      catchesRecibidos: 6,
      bloqueosIntentos: 25,
      bloqueos: 18,
      pisoLinea: 2,
      porcentajeHits: 38.2,
      porcentajeOuts: 6.67,
      porcentajeCatches: 75.0,
      porcentajeBloqueos: 72.0,
      indiceAtaque: 33.6,
      indiceDefensa: 25.2,
      indicePoder: 58.8
    }
  }
];

// Datos reales de equipos
const equiposReales = [
  {
    nombre: 'The Catchers',
    tipo: 'club',
    pais: 'Uruguay',
    ciudad: 'Montevideo',
    descripcion: 'Equipo de dodgeball profesional de Montevideo',
    logo: 'https://res.cloudinary.com/geronicola/image/upload/v1759107227/dodgeball/ga155fwow1ifxyyc8smi.jpg',
    activo: true
  },
  {
    nombre: 'Bumba',
    tipo: 'club',
    pais: 'Uruguay',
    ciudad: 'Montevideo',
    descripcion: 'Equipo competitivo de dodgeball',
    logo: 'https://res.cloudinary.com/geronicola/image/upload/v1759107775/dodgeball/xw6weca4cqr6fk1b1uto.jpg',
    activo: true
  },
  {
    nombre: 'The Dodgeball Monkey',
    tipo: 'club',
    pais: 'Uruguay',
    ciudad: 'Montevideo',
    descripcion: 'Equipo versátil de dodgeball',
    logo: 'https://res.cloudinary.com/geronicola/image/upload/v1759107770/dodgeball/at2ix4f5wfkivzyvt3do.jpg',
    activo: true
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

async function crearEquipo(equipoData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/equipos`, equipoData);
    return response.data.data.equipo;
  } catch (error) {
    console.error(`Error creando equipo ${equipoData.nombre}:`, error.response?.data || error.message);
    return null;
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

async function crearDatosReales() {
  try {
    console.log('🔄 Iniciando creación de datos reales...');
    
    // 1. Crear equipos
    console.log('\n🏆 Creando equipos reales...');
    const equiposCreados = [];
    for (const equipoData of equiposReales) {
      const equipo = await crearEquipo(equipoData);
      if (equipo) {
        equiposCreados.push(equipo);
        console.log(`✅ Equipo creado: ${equipo.nombre}`);
      }
    }

    // 2. Crear usuarios y jugadores
    console.log('\n👥 Creando usuarios y jugadores reales...');
    const jugadoresCreados = [];
    
    for (let i = 0; i < jugadoresReales.length; i++) {
      const jugadorData = jugadoresReales[i];
      const equipoIndex = i % equiposCreados.length;
      const equipo = equiposCreados[equipoIndex];
      
      // Crear usuario
      const usuario = await crearUsuario(jugadorData.nombre, jugadorData.apellido, jugadorData.email);
      if (!usuario) continue;
      
      // Crear jugador
      const jugador = await crearJugador(jugadorData, usuario._id, equipo._id);
      if (jugador) {
        jugadoresCreados.push(jugador);
        console.log(`✅ Jugador creado: ${jugador.nombre} ${jugador.apellido} (${equipo.nombre})`);
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

    console.log('\n🎉 Proceso completado exitosamente!');
    console.log(`✅ Equipos creados: ${equiposCreados.length}`);
    console.log(`✅ Jugadores creados: ${jugadoresCreados.length}`);

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearDatosReales()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = crearDatosReales;
