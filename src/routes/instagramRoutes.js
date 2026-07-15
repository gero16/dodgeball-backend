const express = require('express');
const router = express.Router();
const {
  obtenerPublicaciones,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion
} = require('../controllers/instagramController');
const { adminAuth } = require('../middleware/auth');

// Público: posts activos. Con ?todas=true exige admin.
router.get('/', (req, res, next) => {
  if (req.query.todas === 'true') return adminAuth(req, res, next);
  next();
}, obtenerPublicaciones);

router.post('/', adminAuth, crearPublicacion);
router.put('/:id', adminAuth, actualizarPublicacion);
router.delete('/:id', adminAuth, eliminarPublicacion);

module.exports = router;
