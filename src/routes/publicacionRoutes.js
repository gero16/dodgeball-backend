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

// Permitir omitir auth para crear publicaciones si ALLOW_UNAUTH_PUBLICATIONS=true (solo desarrollo)
const allowUnauthCreate = process.env.ALLOW_UNAUTH_PUBLICATIONS === 'true';
const authOrBypassCreate = (req, res, next) => allowUnauthCreate ? next() : auth(req, res, next);
const validateOrBypassPublicacion = (req, res, next) => allowUnauthCreate ? next() : validatePublicacion(req, res, next);

// Rutas protegidas (bypass si ALLOW_UNAUTH_PUBLICATIONS=true)
router.post('/crear', authOrBypassCreate, upload.single('imagen'), handleUploadError, validateOrBypassPublicacion, crearPublicacion);

router.put('/:id', authOrBypassCreate, upload.single('imagen'), handleUploadError, validateOrBypassPublicacion, actualizarPublicacion);

router.delete('/:id', authOrBypassCreate, eliminarPublicacion);
router.post('/:id/comentarios', auth, agregarComentario);

module.exports = router;
