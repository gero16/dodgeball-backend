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
  obtenerEstadisticasParticipacion,
  // Nuevas rutas para edición de ligas
  actualizarEquiposLiga,
  actualizarFixtureLiga,
  actualizarResultadoPartido,
  actualizarEstadisticasPartido,
  actualizarPremiosLiga,
  obtenerPartidoDetalle
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

// Nuevas rutas para edición de ligas (protegidas)
router.put('/:id/equipos', auth, actualizarEquiposLiga);
router.put('/:id/fixture', auth, actualizarFixtureLiga);
router.put('/:id/partidos/:partidoId/resultado', auth, actualizarResultadoPartido);
router.put('/:id/partidos/:partidoId/estadisticas', auth, actualizarEstadisticasPartido);
router.put('/:id/premios', auth, actualizarPremiosLiga);
router.get('/:id/partidos/:partidoId', auth, obtenerPartidoDetalle);

module.exports = router;
