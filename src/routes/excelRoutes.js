const express = require('express');
const router = express.Router();
const { upload, procesarArchivoExcel, descargarPlantilla } = require('../controllers/excelController');

// Middleware de debug para ver qué campos llegan
const debugMiddleware = (req, res, next) => {
  console.log('🔍 Debug - Headers:', req.headers);
  console.log('🔍 Debug - Content-Type:', req.headers['content-type']);
  next();
};

/**
 * @route POST /api/excel/upload
 * @desc Subir archivo Excel con datos de jugadores
 * @access Public
 */
router.post('/upload', debugMiddleware, upload.fields([{ name: 'excelFile', maxCount: 1 }]), procesarArchivoExcel);

/**
 * @route GET /api/excel/plantilla
 * @desc Descargar plantilla de Excel para jugadores
 * @access Public
 */
router.get('/plantilla', descargarPlantilla);

module.exports = router;
