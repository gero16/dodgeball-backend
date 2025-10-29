const express = require('express');
const router = express.Router();
const {
  obtenerHorariosPorFecha,
  crearHorario,
  agendarHorario,
  obtenerAgenda,
  actualizarHorario,
  eliminarHorario,
  crearHorariosRecurrentes
} = require('../controllers/horarioController');
const { auth, adminAuth } = require('../middleware/auth');

// Rutas públicas
router.get('/fechas/:fecha', obtenerHorariosPorFecha);

// Rutas protegidas
router.post('/agendar', auth, agendarHorario);

// Rutas públicas (temporalmente sin admin)
router.post('/crear', crearHorario);
router.post('/recurrente', crearHorariosRecurrentes);
router.get('/agenda', obtenerAgenda);
router.put('/:id', actualizarHorario);
router.delete('/:id', eliminarHorario);

module.exports = router;
