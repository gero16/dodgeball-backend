const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  crearJugador,
  obtenerJugador,
  obtenerJugadores,
  actualizarJugador,
  eliminarJugador,
  obtenerEquiposJugador,
  actualizarEstadisticasJugador,
  obtenerEstadisticasJugador,
  obtenerRankingJugadores,
  agregarJugadorAEquipo,
  removerJugadorDeEquipo
} = require('../controllers/jugadorController');

// Rutas públicas (lectura)
router.get('/', obtenerJugadores);
router.get('/ranking/lista', obtenerRankingJugadores);
router.get('/:id/equipos', obtenerEquiposJugador);
router.get('/:id', obtenerJugador);
router.get('/:jugadorId/estadisticas', obtenerEstadisticasJugador);

// Rutas protegidas (admin)
router.post('/', adminAuth, crearJugador);
router.put('/:id', adminAuth, actualizarJugador);
router.delete('/:id', adminAuth, eliminarJugador);
router.put('/:jugadorId/partido/:partidoId/equipo/:equipoId/estadisticas', adminAuth, actualizarEstadisticasJugador);
router.post('/:jugadorId/equipos/:equipoId', adminAuth, agregarJugadorAEquipo);
router.delete('/:jugadorId/equipos/:equipoId', adminAuth, removerJugadorDeEquipo);

module.exports = router;
