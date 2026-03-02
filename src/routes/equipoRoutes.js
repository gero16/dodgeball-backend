const express = require('express');
const router = express.Router();
const {
  crearEquipo,
  obtenerEquipo,
  obtenerEquipos,
  obtenerEquipoPorNombre,
  actualizarEquipo,
  eliminarEquipo,
  obtenerJugadoresEquipo
} = require('../controllers/equipoController');

// Crear equipo
router.post('/', crearEquipo);

// Obtener todos los equipos
router.get('/', obtenerEquipos);

// Obtener equipo por nombre (debe ir antes de /:id)
router.get('/by-name/:nombre', obtenerEquipoPorNombre);

// Obtener equipo por ID
router.get('/:id', obtenerEquipo);

// Obtener jugadores de un equipo
router.get('/:id/jugadores', obtenerJugadoresEquipo);

// Actualizar equipo
router.put('/:id', actualizarEquipo);

// Eliminar equipo (desactivar)
router.delete('/:id', eliminarEquipo);

module.exports = router;
