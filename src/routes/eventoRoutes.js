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
  obtenerEstadisticasEventoCalculadas,
  procesarHojaCalculoEstadisticas,
  previsualizarHojaCalculoEstadisticas,
  obtenerJugadoresEvento,
  actualizarEstadisticasLigaManual,
  upsertEstadisticasJugadores,
  migrarEstadisticasLigaAEstadistica,
  recalcularEstadisticasLiga
} = require('../controllers/eventoController');

const { adminAuth } = require('../middleware/auth');
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
router.get('/:id/estadisticas/jugadores-calculadas', obtenerEstadisticasEventoCalculadas);
router.post('/:id/estadisticas/recalcular', recalcularEstadisticasLiga);

// Rutas específicas de campeonatos
router.get('/:id/fixture', obtenerFixtureCampeonato);
router.get('/:id/tabla', obtenerTablaCampeonato);

// Rutas protegidas (admin)
router.post('/', adminAuth, validateEvento, crearEvento);
router.put('/:id', adminAuth, validateEvento, actualizarEvento);
router.delete('/:id', adminAuth, eliminarEvento);
router.post('/:id/inscribir', adminAuth, inscribirUsuario);

// Nuevas rutas para edición de ligas (admin)
router.put('/:id/equipos', adminAuth, actualizarEquiposLiga);
router.put('/:id/fixture', adminAuth, actualizarFixtureLiga);
router.put('/:id/partidos/:partidoId/resultado', adminAuth, actualizarResultadoPartido);
router.put('/:id/partidos/:partidoId/estadisticas', adminAuth, actualizarEstadisticasPartido);
router.put('/:id/premios', adminAuth, actualizarPremiosLiga);
router.get('/:id/partidos/:partidoId', obtenerPartidoDetalle);
router.post('/:id/estadisticas/preview', adminAuth, upload.single('archivo'), previsualizarHojaCalculoEstadisticas);
router.post('/:id/estadisticas/upload', adminAuth, upload.single('archivo'), procesarHojaCalculoEstadisticas);
router.get('/:id/jugadores', adminAuth, obtenerJugadoresEvento);
router.put('/:id/estadisticas/liga-manual', adminAuth, actualizarEstadisticasLigaManual);
router.put('/:id/estadisticas/jugadores', adminAuth, upsertEstadisticasJugadores);
router.post('/:id/estadisticas/jugadores/migrar', adminAuth, migrarEstadisticasLigaAEstadistica);

module.exports = router;
