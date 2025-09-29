const express = require('express');
const router = express.Router();
const {
  obtenerEventos,
  obtenerEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  obtenerTiposEventos,
  obtenerEventosDestacados,
  inscribirUsuario,
  obtenerEstadisticasLiga,
  obtenerEstadisticasCampeonato,
  obtenerFixtureCampeonato,
  obtenerTablaCampeonato,
  obtenerEstadisticasParticipacion
} = require('../controllers/eventoController');

const { auth } = require('../middleware/auth');
const { validateEvento } = require('../middleware/validation');

// Rutas públicas
router.get('/', obtenerEventos);
router.get('/tipos', obtenerTiposEventos);
router.get('/destacados', obtenerEventosDestacados);
router.get('/:id', obtenerEvento);

// Rutas de estadísticas específicas
router.get('/:id/estadisticas/liga', obtenerEstadisticasLiga);
router.get('/:id/estadisticas/campeonato', obtenerEstadisticasCampeonato);
router.get('/:id/estadisticas/participacion', obtenerEstadisticasParticipacion);

// Rutas específicas de campeonatos
router.get('/:id/fixture', obtenerFixtureCampeonato);
router.get('/:id/tabla', obtenerTablaCampeonato);

// Rutas protegidas
router.post('/', auth, validateEvento, crearEvento);
router.put('/:id', auth, validateEvento, actualizarEvento);
router.delete('/:id', auth, eliminarEvento);
router.post('/:id/inscribir', auth, inscribirUsuario);

module.exports = router;
