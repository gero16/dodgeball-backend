/**
 * Script para ejecutar migración de estadísticas en producción via API
 * Este script crea datos de prueba y ejecuta la migración usando la API de producción
 */

const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

async function crearJugadorPrueba(jugadorData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/jugadores`, jugadorData);
    return response.data;
  } catch (error) {
    console.error('Error creando jugador:', error.response?.data || error.message);
    return null;
  }
}

async function crearEquipoPrueba(equipoData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/equipos`, equipoData);
    return response.data;
  } catch (error) {
    console.error('Error creando equipo:', error.response?.data || error.message);
    return null;
  }
}

async function ejecutarMigracion() {
  try {
    console.log('🔄 Ejecutando migración via API...');
    
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

async function crearDatosYEjecutarMigracion() {
  try {
    console.log('🔄 Iniciando proceso completo de migración...');
    
    // 1. Verificar estado inicial
    console.log('\n📊 Verificando estado inicial...');
    const estadoInicial = await verificarEstadoMigracion();
    if (estadoInicial) {
      console.log(`Total jugadores: ${estadoInicial.totalJugadores}`);
      console.log(`Jugadores migrados: ${estadoInicial.jugadoresConNuevosCampos}`);
      console.log(`Porcentaje migrado: ${estadoInicial.porcentajeMigrado}%`);
    }

    // 2. Crear equipos de prueba
    console.log('\n🏆 Creando equipos de prueba...');
    const equipos = [
      {
        nombre: 'The Catchers',
        descripcion: 'Equipo de dodgeball profesional',
        logo: 'https://res.cloudinary.com/geronicola/image/upload/v1759107227/dodgeball/ga155fwow1ifxyyc8smi.jpg',
        categoria: 'mixto',
        activo: true
      },
      {
        nombre: 'Bumba',
        descripcion: 'Equipo competitivo de dodgeball',
        logo: 'https://res.cloudinary.com/geronicola/image/upload/v1759107775/dodgeball/xw6weca4cqr6fk1b1uto.jpg',
        categoria: 'mixto',
        activo: true
      }
    ];

    const equiposCreados = [];
    for (const equipoData of equipos) {
      const equipo = await crearEquipoPrueba(equipoData);
      if (equipo && equipo.success) {
        equiposCreados.push(equipo.data);
        console.log(`✅ Equipo creado: ${equipo.data.nombre}`);
      }
    }

    // 3. Crear jugadores de prueba
    console.log('\n👥 Creando jugadores de prueba...');
    const jugadores = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '+59899123456',
        fechaNacimiento: '1995-03-15',
        posicion: 'thrower',
        equipo: equiposCreados[0]?._id,
        estadisticasGenerales: {
          setsJugados: 10,
          tirosTotales: 45,
          hits: 18,
          quemados: 12,
          asistencias: 8,
          tirosRecibidos: 30,
          hitsRecibidos: 8,
          esquives: 15,
          esquivesExitosos: 12,
          ponchado: 3,
          catchesIntentos: 20,
          catches: 15,
          catchesRecibidos: 5,
          bloqueosIntentos: 25,
          bloqueos: 18,
          pisoLinea: 2,
          porcentajeHits: 40.0,
          porcentajeOuts: 10.0,
          porcentajeCatches: 75.0,
          porcentajeBloqueos: 72.0,
          indiceAtaque: 28.5,
          indiceDefensa: 22.3,
          indicePoder: 50.8
        },
        activo: true
      },
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@email.com',
        telefono: '+59899234567',
        fechaNacimiento: '1998-07-22',
        posicion: 'catcher',
        equipo: equiposCreados[1]?._id,
        estadisticasGenerales: {
          setsJugados: 8,
          tirosTotales: 25,
          hits: 10,
          quemados: 6,
          asistencias: 12,
          tirosRecibidos: 35,
          hitsRecibidos: 12,
          esquives: 20,
          esquivesExitosos: 18,
          ponchado: 2,
          catchesIntentos: 30,
          catches: 25,
          catchesRecibidos: 8,
          bloqueosIntentos: 15,
          bloqueos: 12,
          pisoLinea: 1,
          porcentajeHits: 40.0,
          porcentajeOuts: 5.7,
          porcentajeCatches: 83.3,
          porcentajeBloqueos: 80.0,
          indiceAtaque: 22.0,
          indiceDefensa: 35.2,
          indicePoder: 57.2
        },
        activo: true
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@email.com',
        telefono: '+59899345678',
        fechaNacimiento: '1992-11-08',
        posicion: 'defender',
        equipo: equiposCreados[0]?._id,
        estadisticasGenerales: {
          setsJugados: 12,
          tirosTotales: 30,
          hits: 12,
          quemados: 8,
          asistencias: 5,
          tirosRecibidos: 40,
          hitsRecibidos: 15,
          esquives: 25,
          esquivesExitosos: 20,
          ponchado: 5,
          catchesIntentos: 35,
          catches: 28,
          catchesRecibidos: 10,
          bloqueosIntentos: 40,
          bloqueos: 32,
          pisoLinea: 3,
          porcentajeHits: 40.0,
          porcentajeOuts: 12.5,
          porcentajeCatches: 80.0,
          porcentajeBloqueos: 80.0,
          indiceAtaque: 19.0,
          indiceDefensa: 42.5,
          indicePoder: 61.5
        },
        activo: true
      }
    ];

    const jugadoresCreados = [];
    for (const jugadorData of jugadores) {
      const jugador = await crearJugadorPrueba(jugadorData);
      if (jugador && jugador.success) {
        jugadoresCreados.push(jugador.data);
        console.log(`✅ Jugador creado: ${jugador.data.nombre} ${jugador.data.apellido}`);
      }
    }

    // 4. Ejecutar migración
    console.log('\n🔄 Ejecutando migración de estadísticas...');
    const resultadoMigracion = await ejecutarMigracion();
    if (resultadoMigracion) {
      console.log('📈 Resultado de la migración:');
      console.log(`✅ Total jugadores: ${resultadoMigracion.totalJugadores}`);
      console.log(`✅ Jugadores actualizados: ${resultadoMigracion.jugadoresActualizados}`);
      console.log(`❌ Errores: ${resultadoMigracion.errores}`);
    }

    // 5. Verificar estado final
    console.log('\n📊 Verificando estado final...');
    const estadoFinal = await verificarEstadoMigracion();
    if (estadoFinal) {
      console.log(`Total jugadores: ${estadoFinal.totalJugadores}`);
      console.log(`Jugadores migrados: ${estadoFinal.jugadoresConNuevosCampos}`);
      console.log(`Porcentaje migrado: ${estadoFinal.porcentajeMigrado}%`);
    }

    console.log('\n🎉 Proceso de migración completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearDatosYEjecutarMigracion()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = crearDatosYEjecutarMigracion;
