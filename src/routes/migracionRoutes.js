const express = require('express');
const router = express.Router();
const { migrarEstadisticas, verificarEstadoMigracion } = require('../controllers/migracionController');
const { adminAuth } = require('../middleware/auth');

/**
 * @route POST /api/migrar-estadisticas
 * @desc Ejecutar migración de estadísticas (solo admin)
 * @access Private (Admin)
 */
router.post('/migrar-estadisticas', adminAuth, migrarEstadisticas);

/**
 * @route GET /api/migrar-estadisticas/status
 * @desc Verificar estado de la migración
 * @access Private (Admin)
 */
router.get('/migrar-estadisticas/status', adminAuth, verificarEstadoMigracion);

module.exports = router;
