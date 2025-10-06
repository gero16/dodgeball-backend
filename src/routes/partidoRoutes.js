const express = require('express');
const router = express.Router();
const {
  crearPartido,
  obtenerPartidos,
  obtenerPartidoPorId,
  obtenerEstadisticasJugadorPartido,
  obtenerRankingJugadores,
  obtenerReporteJugador
} = require('../controllers/partidoController');
const { validarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(validarToken);

/**
 * @route POST /api/partidos
 * @desc Crear un nuevo partido
 * @access Private
 */
router.post('/', crearPartido);

/**
 * @route GET /api/partidos
 * @desc Obtener todos los partidos con filtros opcionales
 * @access Private
 * @query {String} evento - ID del evento
 * @query {String} equipo - ID del equipo
 * @query {String} fecha - Fecha del partido (YYYY-MM-DD)
 * @query {Number} limit - Límite de resultados (default: 10)
 * @query {Number} page - Página actual (default: 1)
 */
router.get('/', obtenerPartidos);

/**
 * @route GET /api/partidos/:id
 * @desc Obtener un partido específico por ID
 * @access Private
 */
router.get('/:id', obtenerPartidoPorId);

/**
 * @route GET /api/partidos/:partidoId/jugador/:jugadorId
 * @desc Obtener estadísticas de un jugador en un partido específico
 * @access Private
 */
router.get('/:partidoId/jugador/:jugadorId', obtenerEstadisticasJugadorPartido);

/**
 * @route GET /api/partidos/ranking/jugadores
 * @desc Obtener ranking de jugadores por índice de poder
 * @access Private
 * @query {Number} limit - Límite de resultados (default: 20)
 * @query {String} equipo - ID del equipo para filtrar
 * @query {String} posicion - Posición del jugador para filtrar
 */
router.get('/ranking/jugadores', obtenerRankingJugadores);

/**
 * @route GET /api/partidos/jugador/:id/reporte
 * @desc Obtener reporte completo de estadísticas de un jugador
 * @access Private
 */
router.get('/jugador/:id/reporte', obtenerReporteJugador);

module.exports = router;
