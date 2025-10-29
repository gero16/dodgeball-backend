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

// Rutas de administrador
router.post('/crear', adminAuth, crearHorario);
router.post('/recurrente', adminAuth, crearHorariosRecurrentes);
router.get('/agenda', adminAuth, obtenerAgenda);
router.put('/:id', adminAuth, actualizarHorario);
router.delete('/:id', adminAuth, eliminarHorario);

module.exports = router;
