const express = require('express');
const router = express.Router();
const {
  obtenerPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  obtenerCategorias,
  obtenerDestacadas,
  agregarComentario
} = require('../controllers/publicacionController');
const { auth } = require('../middleware/auth');
const { validatePublicacion } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

// Rutas públicas
router.get('/traer-publicaciones', obtenerPublicaciones);
router.get('/:id', obtenerPublicacion);
router.get('/categorias/lista', obtenerCategorias);
router.get('/destacadas/lista', obtenerDestacadas);

// Rutas protegidas
router.post('/crear', auth, upload.single('imagen'), handleUploadError, validatePublicacion, crearPublicacion);
router.put('/:id', auth, upload.single('imagen'), handleUploadError, validatePublicacion, actualizarPublicacion);
router.delete('/:id', auth, eliminarPublicacion);
router.post('/:id/comentarios', auth, agregarComentario);

module.exports = router;
