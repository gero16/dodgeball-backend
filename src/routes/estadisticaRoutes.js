const express = require('express');
const {
  crearEstadistica,
  obtenerEstadisticas,
  obtenerEstadisticaPorId,
  actualizarEstadistica,
  eliminarEstadistica,
  obtenerEstadisticasPorEquipo,
  obtenerEstadisticasPorJugador,
  obtenerRanking,
  obtenerResumen
} = require('../controllers/estadisticaController');

const router = express.Router();

/**
 * @route POST /api/estadisticas
 * @desc Crear nueva estadística
 * @access Public (temporalmente para testing)
 */
router.post('/', crearEstadistica);

/**
 * @route GET /api/estadisticas
 * @desc Obtener todas las estadísticas
 * @access Public
 */
router.get('/', obtenerEstadisticas);

/**
 * @route GET /api/estadisticas/resumen
 * @desc Obtener resumen de estadísticas
 * @access Public
 */
router.get('/resumen', obtenerResumen);

/**
 * @route GET /api/estadisticas/ranking
 * @desc Obtener ranking de jugadores
 * @access Public
 */
router.get('/ranking', obtenerRanking);

/**
 * @route GET /api/estadisticas/equipo/:equipoId
 * @desc Obtener estadísticas por equipo
 * @access Public
 */
router.get('/equipo/:equipoId', obtenerEstadisticasPorEquipo);

/**
 * @route GET /api/estadisticas/jugador/:jugadorId
 * @desc Obtener estadísticas por jugador
 * @access Public
 */
router.get('/jugador/:jugadorId', obtenerEstadisticasPorJugador);

/**
 * @route GET /api/estadisticas/:id
 * @desc Obtener estadística por ID
 * @access Public
 */
router.get('/:id', obtenerEstadisticaPorId);

/**
 * @route PUT /api/estadisticas/:id
 * @desc Actualizar estadística
 * @access Public (temporalmente para testing)
 */
router.put('/:id', actualizarEstadistica);

/**
 * @route DELETE /api/estadisticas/:id
 * @desc Eliminar estadística
 * @access Public (temporalmente para testing)
 */
router.delete('/:id', eliminarEstadistica);

module.exports = router;
