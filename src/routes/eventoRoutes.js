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
  obtenerPartidoDetalle,
  obtenerEstadisticasEvento,
  procesarHojaCalculoEstadisticas,
  previsualizarHojaCalculoEstadisticas
} = require('../controllers/eventoController');

const { auth } = require('../middleware/auth');
const { validateEvento } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// Rutas públicas
router.get('/', obtenerEventos);
router.get('/tipos', obtenerTiposEventos);
router.get('/destacados', obtenerEventosDestacados);
router.get('/:id', obtenerEvento);

// Rutas de estadísticas específicas
router.get('/:id/estadisticas/liga', obtenerEstadisticasLiga);
router.get('/:id/estadisticas/campeonato', obtenerEstadisticasCampeonato);
router.get('/:id/estadisticas/participacion', obtenerEstadisticasParticipacion);
router.get('/:id/estadisticas/jugadores', obtenerEstadisticasEvento);

// Rutas específicas de campeonatos
router.get('/:id/fixture', obtenerFixtureCampeonato);
router.get('/:id/tabla', obtenerTablaCampeonato);

// Rutas protegidas (temporalmente sin auth para pruebas)
router.post('/', validateEvento, crearEvento);
router.put('/:id', validateEvento, actualizarEvento);
router.delete('/:id', eliminarEvento);
router.post('/:id/inscribir', inscribirUsuario);

// Nuevas rutas para edición de ligas (temporalmente sin auth para pruebas)
router.put('/:id/equipos', actualizarEquiposLiga);
router.put('/:id/fixture', actualizarFixtureLiga);
router.put('/:id/partidos/:partidoId/resultado', actualizarResultadoPartido);
router.put('/:id/partidos/:partidoId/estadisticas', actualizarEstadisticasPartido);
router.put('/:id/premios', actualizarPremiosLiga);
router.get('/:id/partidos/:partidoId', obtenerPartidoDetalle);
router.post('/:id/estadisticas/preview', upload.single('archivo'), previsualizarHojaCalculoEstadisticas);
router.post('/:id/estadisticas/upload', upload.single('archivo'), procesarHojaCalculoEstadisticas);

module.exports = router;
