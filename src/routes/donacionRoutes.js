const express = require('express');
const router = express.Router();
const {
  crearDonacion,
  obtenerDonaciones,
  obtenerDonacion,
  actualizarEstado,
  obtenerEstadisticas,
  procesarPagoPayPal,
  crearPreferenciaMercadoPago,
  webhookMercadoPago,
  listarDonacionesMPPublic,
  statsDonacionesMPPublic
} = require('../controllers/donacionController');
const { auth, adminAuth } = require('../middleware/auth');
const { validateDonacion } = require('../middleware/validation');

// Rutas públicas
router.post('/crear', validateDonacion, crearDonacion);
router.post('/procesar-paypal', procesarPagoPayPal);
router.post('/mercadopago/crear-preferencia', crearPreferenciaMercadoPago);
router.post('/mercadopago/webhook', webhookMercadoPago);
router.get('/mercadopago/webhook', webhookMercadoPago);
router.get('/mercadopago/listar', listarDonacionesMPPublic);
router.get('/mercadopago/estadisticas', statsDonacionesMPPublic);

// Rutas protegidas (admin)
router.get('/', adminAuth, obtenerDonaciones);
router.get('/:id', adminAuth, obtenerDonacion);
router.put('/:id/estado', adminAuth, actualizarEstado);
router.get('/estadisticas/obtener', adminAuth, obtenerEstadisticas);

module.exports = router;
