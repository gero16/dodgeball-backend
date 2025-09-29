const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerDestacados,
  actualizarStock
} = require('../controllers/productoController');
const { auth, adminAuth } = require('../middleware/auth');
const { validateProducto } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);
router.get('/categorias/lista', obtenerCategorias);
router.get('/destacados/lista', obtenerDestacados);

// Rutas protegidas (admin)
router.post('/crear', adminAuth, upload.array('imagenes', 5), handleUploadError, validateProducto, crearProducto);
router.put('/:id', adminAuth, upload.array('imagenes', 5), handleUploadError, validateProducto, actualizarProducto);
router.delete('/:id', adminAuth, eliminarProducto);
router.put('/:id/stock', adminAuth, actualizarStock);

module.exports = router;
