/**
 * Script para crear datos de prueba de jugadores con estadísticas
 * Este script crea jugadores de ejemplo para probar la migración de estadísticas
 */

const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Equipo = require('../src/models/Equipo');
require('dotenv').config();

async function crearDatosPrueba() {
  try {
    console.log('🔄 Creando datos de prueba...');
    
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball');
    console.log('✅ Conectado a MongoDB');

    // Crear equipos de prueba
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
      const equipo = new Equipo(equipoData);
      await equipo.save();
      equiposCreados.push(equipo);
      console.log(`✅ Equipo creado: ${equipo.nombre}`);
    }

    // Crear jugadores de prueba con estadísticas
    const jugadores = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '+59899123456',
        fechaNacimiento: '1995-03-15',
        posicion: 'thrower',
        equipo: equiposCreados[0]._id,
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
        estadisticasPorEquipo: [
          {
            equipo: equiposCreados[0]._id,
            estadisticas: {
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
              indiceAtaque: 28.5,
              indiceDefensa: 22.3,
              indicePoder: 50.8
            }
          }
        ],
        activo: true
      },
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@email.com',
        telefono: '+59899234567',
        fechaNacimiento: '1998-07-22',
        posicion: 'catcher',
        equipo: equiposCreados[1]._id,
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
        estadisticasPorEquipo: [
          {
            equipo: equiposCreados[1]._id,
            estadisticas: {
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
              indiceAtaque: 22.0,
              indiceDefensa: 35.2,
              indicePoder: 57.2
            }
          }
        ],
        activo: true
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@email.com',
        telefono: '+59899345678',
        fechaNacimiento: '1992-11-08',
        posicion: 'defender',
        equipo: equiposCreados[0]._id,
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
        estadisticasPorEquipo: [
          {
            equipo: equiposCreados[0]._id,
            estadisticas: {
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
              indiceAtaque: 19.0,
              indiceDefensa: 42.5,
              indicePoder: 61.5
            }
          }
        ],
        activo: true
      }
    ];

    for (const jugadorData of jugadores) {
      const jugador = new Jugador(jugadorData);
      await jugador.save();
      console.log(`✅ Jugador creado: ${jugador.nombre} ${jugador.apellido}`);
    }

    console.log('\n📈 Resumen de datos creados:');
    console.log(`✅ Equipos creados: ${equiposCreados.length}`);
    console.log(`✅ Jugadores creados: ${jugadores.length}`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearDatosPrueba()
    .then(() => {
      console.log('🎉 Datos de prueba creados exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = crearDatosPrueba;
