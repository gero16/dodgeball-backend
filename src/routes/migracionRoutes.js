const express = require('express');
const router = express.Router();
const { migrarEstadisticas, verificarEstadoMigracion } = require('../controllers/migracionController');

/**
 * @route POST /api/migrar-estadisticas
 * @desc Ejecutar migración de estadísticas
 * @access Public
 */
router.post('/migrar-estadisticas', migrarEstadisticas);

/**
 * @route GET /api/migrar-estadisticas/status
 * @desc Verificar estado de la migración
 * @access Public
 */
router.get('/migrar-estadisticas/status', verificarEstadoMigracion);

module.exports = router;
