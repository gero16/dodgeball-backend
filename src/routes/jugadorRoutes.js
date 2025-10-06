const express = require('express');
const router = express.Router();
const {
  crearJugador,
  obtenerJugador,
  obtenerJugadores,
  actualizarEstadisticasJugador,
  obtenerEstadisticasJugador,
  obtenerRankingJugadores,
  agregarJugadorAEquipo,
  removerJugadorDeEquipo
} = require('../controllers/jugadorController');

// Crear jugador
router.post('/', crearJugador);

// Obtener jugador por ID
router.get('/:id', obtenerJugador);

// Obtener todos los jugadores
router.get('/', obtenerJugadores);

// Obtener estadísticas de jugador
router.get('/:jugadorId/estadisticas', obtenerEstadisticasJugador);

// Obtener ranking de jugadores
router.get('/ranking/lista', obtenerRankingJugadores);

// Actualizar estadísticas de jugador en partido
router.put('/:jugadorId/partido/:partidoId/equipo/:equipoId/estadisticas', actualizarEstadisticasJugador);

// Agregar jugador a equipo
router.post('/:jugadorId/equipos/:equipoId', agregarJugadorAEquipo);

// Remover jugador de equipo
router.delete('/:jugadorId/equipos/:equipoId', removerJugadorDeEquipo);

module.exports = router;
