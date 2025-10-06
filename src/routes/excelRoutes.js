const express = require('express');
const router = express.Router();
const { upload, procesarArchivoExcel, descargarPlantilla } = require('../controllers/excelController');

/**
 * @route POST /api/excel/upload
 * @desc Subir archivo Excel con datos de jugadores
 * @access Public
 */
router.post('/upload', upload.single('archivo'), procesarArchivoExcel);

/**
 * @route GET /api/excel/plantilla
 * @desc Descargar plantilla de Excel para jugadores
 * @access Public
 */
router.get('/plantilla', descargarPlantilla);

module.exports = router;
