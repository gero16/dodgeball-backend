const express = require('express');
const router = express.Router();
const {
  obtenerEventos,
  obtenerEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  inscribirseEvento,
  obtenerProximos,
  obtenerPasados
} = require('../controllers/eventoController');
const { auth } = require('../middleware/auth');
const { validateEvento } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

// Rutas públicas
router.get('/', obtenerEventos);
router.get('/:id', obtenerEvento);
router.get('/proximos/lista', obtenerProximos);
router.get('/pasados/lista', obtenerPasados);

// Rutas protegidas
router.post('/crear', auth, upload.single('imagen'), handleUploadError, validateEvento, crearEvento);
router.put('/:id', auth, upload.single('imagen'), handleUploadError, validateEvento, actualizarEvento);
router.delete('/:id', auth, eliminarEvento);
router.post('/:id/inscribirse', auth, inscribirseEvento);

module.exports = router;
