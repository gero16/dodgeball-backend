const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');
const Equipo = require('../src/models/Equipo');
const Estadistica = require('../src/models/Estadistica');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball-club';

// Datos completos de los jugadores con estadísticas
const jugadoresCompletos = [
  // BUMBA
  {
    nombre: 'Felipe',
    apellido: 'Demarco',
    equipo: 'BUMBA',
    numeroCamiseta: 1,
    posicion: 'versatil',
    email: 'felipe.demarco@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Patricia',
    apellido: 'Yanes',
    equipo: 'BUMBA',
    numeroCamiseta: 7,
    posicion: 'versatil',
    email: 'patricia.yanes@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Josué',
    apellido: 'Arboleda',
    equipo: 'BUMBA',
    numeroCamiseta: 8,
    posicion: 'thrower',
    email: 'josue.arboleda@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Santiago',
    apellido: 'García',
    equipo: 'BUMBA',
    numeroCamiseta: 9,
    posicion: 'catcher',
    email: 'santiago.garcia@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'María',
    apellido: 'Rodríguez',
    equipo: 'BUMBA',
    numeroCamiseta: 10,
    posicion: 'dodger',
    email: 'maria.rodriguez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Carlos',
    apellido: 'López',
    equipo: 'BUMBA',
    numeroCamiseta: 11,
    posicion: 'versatil',
    email: 'carlos.lopez@email.com',
    estadisticas: {
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
    }
  },
  
  // THE CATCHERS
  {
    nombre: 'Ana',
    apellido: 'Martínez',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 2,
    posicion: 'catcher',
    email: 'ana.martinez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Luis',
    apellido: 'González',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 3,
    posicion: 'thrower',
    email: 'luis.gonzalez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Laura',
    apellido: 'Hernández',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 4,
    posicion: 'dodger',
    email: 'laura.hernandez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Diego',
    apellido: 'Pérez',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 5,
    posicion: 'versatil',
    email: 'diego.perez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Sofia',
    apellido: 'Sánchez',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 6,
    posicion: 'catcher',
    email: 'sofia.sanchez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Miguel',
    apellido: 'Ramírez',
    equipo: 'THE CATCHERS',
    numeroCamiseta: 12,
    posicion: 'thrower',
    email: 'miguel.ramirez@email.com',
    estadisticas: {
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
    }
  },
  
  // THE DODGEBALL MONKEYS
  {
    nombre: 'Elena',
    apellido: 'Torres',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 13,
    posicion: 'dodger',
    email: 'elena.torres@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Roberto',
    apellido: 'Flores',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 14,
    posicion: 'versatil',
    email: 'roberto.flores@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Carmen',
    apellido: 'Vargas',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 15,
    posicion: 'catcher',
    email: 'carmen.vargas@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Andrés',
    apellido: 'Jiménez',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 16,
    posicion: 'thrower',
    email: 'andres.jimenez@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Isabel',
    apellido: 'Morales',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 17,
    posicion: 'dodger',
    email: 'isabel.morales@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Fernando',
    apellido: 'Castro',
    equipo: 'THE DODGEBALL MONKEYS',
    numeroCamiseta: 18,
    posicion: 'versatil',
    email: 'fernando.castro@email.com',
    estadisticas: {
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
    }
  },
  
  // LA NEOFARAFA
  {
    nombre: 'Valentina',
    apellido: 'Ruiz',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 19,
    posicion: 'catcher',
    email: 'valentina.ruiz@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Sebastián',
    apellido: 'Díaz',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 20,
    posicion: 'thrower',
    email: 'sebastian.diaz@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Natalia',
    apellido: 'Herrera',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 21,
    posicion: 'dodger',
    email: 'natalia.herrera@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Alejandro',
    apellido: 'Mendoza',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 22,
    posicion: 'versatil',
    email: 'alejandro.mendoza@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Gabriela',
    apellido: 'Silva',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 23,
    posicion: 'catcher',
    email: 'gabriela.silva@email.com',
    estadisticas: {
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
    }
  },
  {
    nombre: 'Ricardo',
    apellido: 'Ortega',
    equipo: 'LA NEOFARAFA',
    numeroCamiseta: 24,
    posicion: 'thrower',
    email: 'ricardo.ortega@email.com',
    estadisticas: {
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
  }
];

// Mapeo de equipos
const equiposIds = {
  'BUMBA': '68e42f7caa241db4750498ae',
  'THE CATCHERS': '68e42f78aa241db4750498ab',
  'THE DODGEBALL MONKEYS': '68e45aa2a8e4d976e9a083d2',
  'LA NEOFARAFA': '68e45aa1a8e4d976e9a083cf'
};

async function agregarJugadoresFaltantes() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Verificando jugadores existentes...');
    
    // Obtener todos los jugadores existentes
    const jugadoresExistentes = await Jugador.find({});
    console.log(`📈 Jugadores existentes: ${jugadoresExistentes.length}`);
    
    // Verificar cuáles faltan
    const jugadoresFaltantes = [];
    
    for (const jugadorCompleto of jugadoresCompletos) {
      const existe = jugadoresExistentes.find(j => 
        j.nombre === jugadorCompleto.nombre && 
        j.apellido === jugadorCompleto.apellido
      );
      
      if (!existe) {
        jugadoresFaltantes.push(jugadorCompleto);
      }
    }
    
    console.log(`\n❌ Jugadores faltantes: ${jugadoresFaltantes.length}`);
    
    if (jugadoresFaltantes.length === 0) {
      console.log('\n✅ Todos los jugadores ya existen en la base de datos');
      return;
    }
    
    console.log('\n📋 Lista de jugadores faltantes:');
    jugadoresFaltantes.forEach((jugador, index) => {
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} (${jugador.equipo}) - #${jugador.numeroCamiseta}`);
    });
    
    console.log('\n🔄 Creando jugadores faltantes...');
    
    for (const jugadorData of jugadoresFaltantes) {
      try {
        // Crear usuario primero
        const usuario = new Usuario({
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          email: jugadorData.email,
          password: 'password123', // Contraseña temporal
          rol: 'jugador',
          telefono: '+1234567890'
        });
        
        await usuario.save();
        console.log(`✅ Usuario creado: ${jugadorData.nombre} ${jugadorData.apellido}`);
        
        // Crear jugador
        const jugador = new Jugador({
          usuario: usuario._id,
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          numeroCamiseta: jugadorData.numeroCamiseta,
          posicion: jugadorData.posicion,
          activo: true,
          estadisticasGenerales: jugadorData.estadisticas
        });
        
        await jugador.save();
        console.log(`✅ Jugador creado: ${jugadorData.nombre} ${jugadorData.apellido}`);
        
        // Crear estadística si hay un evento específico
        // Nota: Necesitarías el ID del evento para crear estadísticas específicas
        
      } catch (error) {
        console.error(`❌ Error creando ${jugadorData.nombre} ${jugadorData.apellido}:`, error.message);
      }
    }
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

agregarJugadoresFaltantes();
