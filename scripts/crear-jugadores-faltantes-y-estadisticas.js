const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app/api';
const EVENTO_LIGA_2024 = '68db0409ddcdb45a97d57ffd';

// Mapeo de equipos
const equiposIds = {
  'BUMBA': '68e42f7caa241db4750498ae',
  'THE CATCHERS': '68e42f78aa241db4750498ab',
  'THE DODGEBALL MONKEYS': '68e45aa2a8e4d976e9a083d2',
  'LA NEOFARAFA': '68e45aa1a8e4d976e9a083cf'
};

// Los 12 jugadores faltantes
const jugadoresFaltantes = [
  {
    nombre: 'Patricia',
    apellido: 'Yanes',
    equipo: 'LA NEOFARAFA',
    email: 'patricia.yanes@email.com',
    numeroCamiseta: 7,
    posicion: 'versatil',
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
  {
    nombre: 'Josué',
    apellido: 'Arboleda',
    equipo: 'LA NEOFARAFA',
    email: 'josue.arboleda@email.com',
    numeroCamiseta: 8,
    posicion: 'versatil',
    setsJugados: 8,
    tirosTotales: 21,
    hits: 2,
    quemados: 0,
    asistencias: 0,
    tirosRecibidos: 37,
    hitsRecibidos: 14,
    esquives: 13,
    esquivesSinEsfuerzo: 10,
    ponchado: 5,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 10,
    bloqueos: 9,
    pisoLinea: 0,
    catchesRecibidos: 1,
    porcentajeHits: 9.5,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 64.3,
    indiceAtaque: 0.19,
    indiceDefensa: 5.64,
    indicePoder: 35.27
  },
  {
    nombre: 'Matheo',
    apellido: 'Santos',
    equipo: 'THE DODGEBALL MONKEYS',
    email: 'matheo.santos@email.com',
    numeroCamiseta: 9,
    posicion: 'versatil',
    setsJugados: 11,
    tirosTotales: 8,
    hits: 2,
    quemados: 1,
    asistencias: 0,
    tirosRecibidos: 28,
    hitsRecibidos: 8,
    esquives: 5,
    esquivesSinEsfuerzo: 13,
    ponchado: 8,
    catchesIntentados: 4,
    catches: 2,
    bloqueosIntentados: 1,
    bloqueos: 1,
    pisoLinea: 1,
    catchesRecibidos: 1,
    porcentajeHits: 25.0,
    porcentajeOuts: 12.5,
    porcentajeCatches: 25.0,
    porcentajeBloqueos: 12.5,
    indiceAtaque: 0.55,
    indiceDefensa: 4.62,
    indicePoder: 32.10
  },
  {
    nombre: 'Diego',
    apellido: 'Burrera',
    equipo: 'BUMBA',
    email: 'diego.burrera@email.com',
    numeroCamiseta: 11,
    posicion: 'versatil',
    setsJugados: 9,
    tirosTotales: 29,
    hits: 7,
    quemados: 5,
    asistencias: 0,
    tirosRecibidos: 26,
    hitsRecibidos: 7,
    esquives: 7,
    esquivesSinEsfuerzo: 11,
    ponchado: 7,
    catchesIntentados: 1,
    catches: 0,
    bloqueosIntentados: 2,
    bloqueos: 1,
    pisoLinea: 1,
    catchesRecibidos: 0,
    porcentajeHits: 24.1,
    porcentajeOuts: 17.2,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 14.3,
    indiceAtaque: 2.98,
    indiceDefensa: 1.39,
    indicePoder: 29.23
  },
  {
    nombre: 'Rodrigo',
    apellido: 'Pérez',
    equipo: 'LA NEOFARAFA',
    email: 'rodrigo.perez@email.com',
    numeroCamiseta: 12,
    posicion: 'versatil',
    setsJugados: 10,
    tirosTotales: 16,
    hits: 7,
    quemados: 3,
    asistencias: 0,
    tirosRecibidos: 24,
    hitsRecibidos: 9,
    esquives: 6,
    esquivesSinEsfuerzo: 9,
    ponchado: 10,
    catchesIntentados: 1,
    catches: 1,
    bloqueosIntentados: 0,
    bloqueos: 0,
    pisoLinea: 1,
    catchesRecibidos: 0,
    porcentajeHits: 43.8,
    porcentajeOuts: 18.8,
    porcentajeCatches: 11.1,
    porcentajeBloqueos: 0.0,
    indiceAtaque: 2.26,
    indiceDefensa: 1.90,
    indicePoder: 27.82
  },
  {
    nombre: 'Tiago',
    apellido: 'Pereira',
    equipo: 'THE DODGEBALL MONKEYS',
    email: 'tiago.pereira@email.com',
    numeroCamiseta: 13,
    posicion: 'versatil',
    setsJugados: 11,
    tirosTotales: 18,
    hits: 7,
    quemados: 2,
    asistencias: 0,
    tirosRecibidos: 21,
    hitsRecibidos: 5,
    esquives: 4,
    esquivesSinEsfuerzo: 13,
    ponchado: 6,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 2,
    bloqueos: 1,
    pisoLinea: 0,
    catchesRecibidos: 2,
    porcentajeHits: 38.9,
    porcentajeOuts: 11.1,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 20.0,
    indiceAtaque: 1.48,
    indiceDefensa: 1.23,
    indicePoder: 20.18
  },
  {
    nombre: 'Facundo',
    apellido: 'Alonso',
    equipo: 'THE CATCHERS',
    email: 'facundo.alonso@email.com',
    numeroCamiseta: 14,
    posicion: 'versatil',
    setsJugados: 9,
    tirosTotales: 19,
    hits: 8,
    quemados: 1,
    asistencias: 1,
    tirosRecibidos: 20,
    hitsRecibidos: 8,
    esquives: 8,
    esquivesSinEsfuerzo: 3,
    ponchado: 8,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 1,
    bloqueos: 0,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 42.1,
    porcentajeOuts: 5.3,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 0.0,
    indiceAtaque: 2.07,
    indiceDefensa: 0.33,
    indicePoder: 18.85
  },
  {
    nombre: 'Ignacio',
    apellido: 'Rodríguez',
    equipo: 'THE DODGEBALL MONKEYS',
    email: 'ignacio.rodriguez@email.com',
    numeroCamiseta: 15,
    posicion: 'versatil',
    setsJugados: 11,
    tirosTotales: 4,
    hits: 3,
    quemados: 0,
    asistencias: 1,
    tirosRecibidos: 15,
    hitsRecibidos: 6,
    esquives: 3,
    esquivesSinEsfuerzo: 6,
    ponchado: 6,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 2,
    bloqueos: 2,
    pisoLinea: 0,
    catchesRecibidos: 2,
    porcentajeHits: 75.0,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 33.3,
    indiceAtaque: 0.53,
    indiceDefensa: 0.88,
    indicePoder: 13.16
  },
  {
    nombre: 'Santiago',
    apellido: 'Gil',
    equipo: 'LA NEOFARAFA',
    email: 'santiago.gil@email.com',
    numeroCamiseta: 16,
    posicion: 'versatil',
    setsJugados: 8,
    tirosTotales: 2,
    hits: 0,
    quemados: 0,
    asistencias: 1,
    tirosRecibidos: 19,
    hitsRecibidos: 10,
    esquives: 3,
    esquivesSinEsfuerzo: 6,
    ponchado: 8,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 5,
    bloqueos: 3,
    pisoLinea: 1,
    catchesRecibidos: 0,
    porcentajeHits: 0.0,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 30.0,
    indiceAtaque: 0.45,
    indiceDefensa: 0.20,
    indicePoder: 9.28
  },
  {
    nombre: 'Agustín',
    apellido: 'Sogliano',
    equipo: 'LA NEOFARAFA',
    email: 'agustin.sogliano@email.com',
    numeroCamiseta: 17,
    posicion: 'versatil',
    setsJugados: 9,
    tirosTotales: 7,
    hits: 2,
    quemados: 0,
    asistencias: 0,
    tirosRecibidos: 10,
    hitsRecibidos: 5,
    esquives: 4,
    esquivesSinEsfuerzo: 0,
    ponchado: 7,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 0,
    bloqueos: 0,
    pisoLinea: 1,
    catchesRecibidos: 1,
    porcentajeHits: 28.6,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 0.0,
    indiceAtaque: 0.20,
    indiceDefensa: -0.03,
    indicePoder: 6.72
  },
  {
    nombre: 'Mateo',
    apellido: 'Alonso',
    equipo: 'THE CATCHERS',
    email: 'mateo.alonso@email.com',
    numeroCamiseta: 18,
    posicion: 'versatil',
    setsJugados: 9,
    tirosTotales: 6,
    hits: 0,
    quemados: 0,
    asistencias: 1,
    tirosRecibidos: 15,
    hitsRecibidos: 7,
    esquives: 4,
    esquivesSinEsfuerzo: 3,
    ponchado: 8,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 1,
    bloqueos: 0,
    pisoLinea: 1,
    catchesRecibidos: 0,
    porcentajeHits: 0.0,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 0.0,
    indiceAtaque: 0.31,
    indiceDefensa: -0.46,
    indicePoder: 5.18
  },
  {
    nombre: 'Pastor',
    apellido: '',
    equipo: 'BUMBA',
    email: 'pastor@email.com',
    numeroCamiseta: 19,
    posicion: 'versatil',
    setsJugados: 9,
    tirosTotales: 4,
    hits: 0,
    quemados: 0,
    asistencias: 0,
    tirosRecibidos: 10,
    hitsRecibidos: 4,
    esquives: 0,
    esquivesSinEsfuerzo: 4,
    ponchado: 6,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 0,
    bloqueos: 0,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 0.0,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 0.0,
    indiceAtaque: 0.00,
    indiceDefensa: -0.57,
    indicePoder: 2.91
  },
  {
    nombre: 'Santino',
    apellido: 'Barreiro',
    equipo: 'BUMBA',
    email: 'santino.barreiro@email.com',
    numeroCamiseta: 20,
    posicion: 'versatil',
    setsJugados: 9,
    tirosTotales: 5,
    hits: 0,
    quemados: 0,
    asistencias: 0,
    tirosRecibidos: 6,
    hitsRecibidos: 5,
    esquives: 0,
    esquivesSinEsfuerzo: 1,
    ponchado: 5,
    catchesIntentados: 0,
    catches: 0,
    bloqueosIntentados: 0,
    bloqueos: 0,
    pisoLinea: 0,
    catchesRecibidos: 0,
    porcentajeHits: 0.0,
    porcentajeOuts: 0.0,
    porcentajeCatches: 0.0,
    porcentajeBloqueos: 0.0,
    indiceAtaque: 0.00,
    indiceDefensa: -1.14,
    indicePoder: 0.00
  }
];

async function crearJugadoresFaltantesYEstadisticas() {
  try {
    console.log('🔄 Creando jugadores faltantes y sus estadísticas...\n');

    let usuariosCreados = 0;
    let jugadoresCreados = 0;
    let estadisticasCreadas = 0;
    let errores = 0;

    for (const jugador of jugadoresFaltantes) {
      console.log(`🔄 Procesando ${jugador.nombre} ${jugador.apellido}...`);
      
      try {
        // 1. Crear usuario
        console.log(`   👤 Creando usuario...`);
        const usuarioData = {
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          email: jugador.email,
          password: 'password123',
          rol: 'jugador'
        };

        let usuario;
        try {
          const usuarioResponse = await axios.post(`${API_BASE_URL}/usuario/registrar`, usuarioData);
          usuario = usuarioResponse.data.data;
          console.log(`   ✅ Usuario creado: ${usuario._id}`);
          usuariosCreados++;
        } catch (error) {
          if (error.response?.data?.message?.includes('Ya existe un usuario con este email')) {
            console.log(`   ⚠️  Usuario ya existe, buscando...`);
            // Buscar usuario existente
            const usuariosResponse = await axios.get(`${API_BASE_URL}/usuario/usuarios`);
            const usuarios = usuariosResponse.data.data.usuarios || usuariosResponse.data.data;
            usuario = usuarios.find(u => u.email === jugador.email);
            if (!usuario) {
              console.log(`   ❌ Usuario no encontrado. Saltando.`);
              errores++;
              continue;
            }
            console.log(`   ✅ Usuario encontrado: ${usuario._id}`);
          } else {
            throw error;
          }
        }

        // 2. Crear jugador
        console.log(`   🏃 Creando perfil de jugador...`);
        const jugadorData = {
          usuario: usuario._id,
          equipo: equiposIds[jugador.equipo],
          numeroCamiseta: jugador.numeroCamiseta,
          posicion: jugador.posicion
        };

        let jugadorPerfil;
        try {
          const jugadorResponse = await axios.post(`${API_BASE_URL}/jugadores`, jugadorData);
          jugadorPerfil = jugadorResponse.data.data;
          console.log(`   ✅ Jugador creado: ${jugadorPerfil._id}`);
          jugadoresCreados++;
        } catch (error) {
          if (error.response?.data?.message?.includes('Ya existe un jugador con este usuario')) {
            console.log(`   ⚠️  Jugador ya existe, buscando...`);
            // Buscar jugador existente
            const jugadoresResponse = await axios.get(`${API_BASE_URL}/jugadores`);
            const jugadores = jugadoresResponse.data.data.jugadores || jugadoresResponse.data.data;
            jugadorPerfil = jugadores.find(j => j.usuario._id === usuario._id);
            if (!jugadorPerfil) {
              console.log(`   ❌ Jugador no encontrado. Saltando.`);
              errores++;
              continue;
            }
            console.log(`   ✅ Jugador encontrado: ${jugadorPerfil._id}`);
          } else {
            throw error;
          }
        }

        // 3. Crear estadística
        console.log(`   📊 Creando estadística...`);
        const estadisticaData = {
          equipo: equiposIds[jugador.equipo],
          jugador: jugadorPerfil._id,
          evento: EVENTO_LIGA_2024,
          setsJugados: jugador.setsJugados,
          tirosTotales: jugador.tirosTotales,
          hits: jugador.hits,
          quemados: jugador.quemados,
          asistencias: jugador.asistencias,
          tirosRecibidos: jugador.tirosRecibidos,
          hitsRecibidos: jugador.hitsRecibidos,
          esquives: jugador.esquives,
          esquivesSinEsfuerzo: jugador.esquivesSinEsfuerzo,
          ponchado: jugador.ponchado,
          catchesIntentados: jugador.catchesIntentados,
          catches: jugador.catches,
          bloqueosIntentados: jugador.bloqueosIntentados,
          bloqueos: jugador.bloqueos,
          pisoLinea: jugador.pisoLinea,
          catchesRecibidos: jugador.catchesRecibidos,
          porcentajeHits: jugador.porcentajeHits,
          porcentajeOuts: jugador.porcentajeOuts,
          porcentajeCatches: jugador.porcentajeCatches,
          porcentajeBloqueos: jugador.porcentajeBloqueos,
          indiceAtaque: jugador.indiceAtaque,
          indiceDefensa: jugador.indiceDefensa,
          indicePoder: jugador.indicePoder,
          temporada: '2024-2025',
          activo: true
        };

        const estadisticaResponse = await axios.post(`${API_BASE_URL}/estadisticas`, estadisticaData);
        console.log(`   ✅ Estadística creada - Poder: ${jugador.indicePoder}`);
        estadisticasCreadas++;

      } catch (error) {
        console.error(`   ❌ Error procesando ${jugador.nombre} ${jugador.apellido}: ${error.message}`);
        errores++;
      }
    }

    console.log('\n📈 Resumen del procesamiento:');
    console.log(`   👤 Usuarios creados: ${usuariosCreados}`);
    console.log(`   🏃 Jugadores creados: ${jugadoresCreados}`);
    console.log(`   📊 Estadísticas creadas: ${estadisticasCreadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesados: ${jugadoresFaltantes.length}`);

    // Verificar estadísticas finales
    console.log('\n🔍 Verificando estadísticas finales...');
    const estadisticasFinalesResponse = await axios.get(`${API_BASE_URL}/estadisticas?evento=${EVENTO_LIGA_2024}`);
    const estadisticasFinales = estadisticasFinalesResponse.data.data;

    console.log(`\n📊 Total de estadísticas en la BD: ${estadisticasFinales.length}`);

    console.log('\n🏆 Ranking final por índice de poder:');
    estadisticasFinales
      .sort((a, b) => b.indicePoder - a.indicePoder)
      .forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.jugador.nombre} ${e.jugador.apellido} - ${e.equipo.nombre} - Poder: ${e.indicePoder}`);
      });

    console.log('\n🎉 Procesamiento completado!');
  } catch (error) {
    console.error('❌ Error en el procesamiento:', error.message);
  } finally {
    console.log('✅ Script completado');
  }
}

crearJugadoresFaltantesYEstadisticas();
