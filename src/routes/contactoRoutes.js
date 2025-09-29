const express = require('express');
const router = express.Router();
const {
  enviarMensaje,
  obtenerMensajes,
  obtenerMensaje,
  actualizarEstado,
  responderMensaje,
  obtenerEstadisticas
} = require('../controllers/contactoController');
const { auth, adminAuth } = require('../middleware/auth');
const { validateContacto } = require('../middleware/validation');

// Rutas públicas
router.post('/enviar', validateContacto, enviarMensaje);

// Rutas protegidas (admin)
router.get('/mensajes', adminAuth, obtenerMensajes);
router.get('/mensajes/:id', adminAuth, obtenerMensaje);
router.put('/mensajes/:id/estado', adminAuth, actualizarEstado);
router.post('/mensajes/:id/responder', adminAuth, responderMensaje);
router.get('/estadisticas/obtener', adminAuth, obtenerEstadisticas);

module.exports = router;
