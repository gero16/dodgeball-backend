const express = require('express');
const router = express.Router();
const {
  crearEquipo,
  obtenerEquipo,
  obtenerEquipos,
  actualizarEquipo,
  eliminarEquipo,
  obtenerJugadoresEquipo
} = require('../controllers/equipoController');

// Crear equipo
router.post('/', crearEquipo);

// Obtener equipo por ID
router.get('/:id', obtenerEquipo);

// Obtener todos los equipos
router.get('/', obtenerEquipos);

// Obtener jugadores de un equipo
router.get('/:id/jugadores', obtenerJugadoresEquipo);

// Actualizar equipo
router.put('/:id', actualizarEquipo);

// Eliminar equipo (desactivar)
router.delete('/:id', eliminarEquipo);

module.exports = router;
