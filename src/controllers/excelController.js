const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');
const Usuario = require('../models/Usuario');
const { calcularEstadisticasCompletas } = require('../utils/estadisticas');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/excel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'jugadores-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('📁 Archivo recibido:', file.fieldname, file.originalname);
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

/**
 * Procesar archivo Excel y crear jugadores
 */
const procesarArchivoExcel = async (req, res) => {
  try {
    console.log('🔍 Debug - req.files:', req.files);
    console.log('🔍 Debug - req.file:', req.file);
    
    // Manejar req.files.excelFile[0] o req.file
    const file = req.file || (req.files && req.files.excelFile && req.files.excelFile[0]);
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    console.log('📊 Procesando archivo Excel:', file.filename);

    // Leer el archivo Excel
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📋 Encontradas ${data.length} filas en el archivo`);
    
    // Debug: Mostrar las primeras filas para diagnosticar
    console.log('🔍 Debug - Primera fila del Excel:', data[0]);
    console.log('🔍 Debug - Columnas disponibles:', Object.keys(data[0] || {}));
    
    if (data.length > 1) {
      console.log('🔍 Debug - Segunda fila del Excel:', data[1]);
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El archivo Excel está vacío'
      });
    }

    // Obtener equipos existentes
    const equipos = await Equipo.find({ activo: true });
    if (equipos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay equipos disponibles. Crea equipos primero.'
      });
    }

    const resultados = {
      totalFilas: data.length,
      jugadoresCreados: 0,
      jugadoresActualizados: 0,
      errores: 0,
      detalles: []
    };

    // Función para mapear columnas automáticamente
    const mapearColumnas = (fila) => {
      const columnas = Object.keys(fila);
      const mapeo = {};
      
      // Buscar columnas que contengan palabras clave
      columnas.forEach(col => {
        const colLower = col.toLowerCase();
        
        // Mapear nombres
        if (colLower.includes('nombre') && !colLower.includes('apellido')) {
          mapeo.nombre = fila[col];
        }
        if (colLower.includes('apellido')) {
          mapeo.apellido = fila[col];
        }
        if (colLower.includes('email') || colLower.includes('correo')) {
          mapeo.email = fila[col];
        }
        if (colLower.includes('teléfono') || colLower.includes('telefono') || colLower.includes('tel')) {
          mapeo.telefono = fila[col];
        }
        if (colLower.includes('fecha') && colLower.includes('nacimiento')) {
          mapeo.fechaNacimiento = fila[col];
        }
        if (colLower.includes('posición') || colLower.includes('posicion')) {
          mapeo.posicion = fila[col];
        }
        if (colLower.includes('número') && colLower.includes('camiseta')) {
          mapeo.numeroCamiseta = fila[col];
        }
        if (colLower.includes('sets') && colLower.includes('jugados')) {
          mapeo.setsJugados = fila[col];
        }
        if (colLower.includes('tiros') && colLower.includes('totales')) {
          mapeo.tirosTotales = fila[col];
        }
        if (colLower.includes('hits') && !colLower.includes('recibidos')) {
          mapeo.hits = fila[col];
        }
        if (colLower.includes('quemados')) {
          mapeo.quemados = fila[col];
        }
        if (colLower.includes('asistencias')) {
          mapeo.asistencias = fila[col];
        }
        if (colLower.includes('tiros') && colLower.includes('recibidos')) {
          mapeo.tirosRecibidos = fila[col];
        }
        if (colLower.includes('hits') && colLower.includes('recibidos')) {
          mapeo.hitsRecibidos = fila[col];
        }
        if (colLower.includes('esquives') && !colLower.includes('exitosos')) {
          mapeo.esquives = fila[col];
        }
        if (colLower.includes('esquives') && colLower.includes('exitosos')) {
          mapeo.esquivesExitosos = fila[col];
        }
        if (colLower.includes('ponchado')) {
          mapeo.ponchado = fila[col];
        }
        if (colLower.includes('catches') && colLower.includes('intentos')) {
          mapeo.catchesIntentos = fila[col];
        }
        if (colLower.includes('catches') && !colLower.includes('intentos') && !colLower.includes('recibidos')) {
          mapeo.catches = fila[col];
        }
        if (colLower.includes('catches') && colLower.includes('recibidos')) {
          mapeo.catchesRecibidos = fila[col];
        }
        if (colLower.includes('bloqueos') && colLower.includes('intentos')) {
          mapeo.bloqueosIntentos = fila[col];
        }
        if (colLower.includes('bloqueos') && !colLower.includes('intentos')) {
          mapeo.bloqueos = fila[col];
        }
        if (colLower.includes('piso') && colLower.includes('línea')) {
          mapeo.pisoLinea = fila[col];
        }
      });
      
      return mapeo;
    };

    // Procesar cada fila del Excel
    for (let i = 0; i < data.length; i++) {
      const fila = data[i];
      const datosMapeados = mapearColumnas(fila);
      
      try {
        console.log(`👤 Procesando fila ${i + 1}: ${datosMapeados.nombre || 'Sin nombre'}`);
        console.log(`🔍 Datos mapeados:`, datosMapeados);

        // Validar datos requeridos
        if (!datosMapeados.nombre || !datosMapeados.apellido) {
          resultados.errores++;
          resultados.detalles.push({
            fila: i + 1,
            jugador: `${datosMapeados.nombre || ''} ${datosMapeados.apellido || ''}`,
            estado: 'error',
            error: 'Faltan nombre o apellido'
          });
          continue;
        }

        // Buscar o crear usuario
        let usuario = await Usuario.findOne({ 
          email: datosMapeados.email || `${datosMapeados.nombre.toLowerCase()}.${datosMapeados.apellido.toLowerCase()}@email.com` 
        });

        if (!usuario) {
          usuario = new Usuario({
            nombre: datosMapeados.nombre,
            apellido: datosMapeados.apellido,
            email: datosMapeados.email || `${datosMapeados.nombre.toLowerCase()}.${datosMapeados.apellido.toLowerCase()}@email.com`,
            password: '123456', // Password por defecto
            rol: 'jugador'
          });
          await usuario.save();
        }

        // Buscar jugador existente
        let jugador = await Jugador.findOne({ usuario: usuario._id });

        // Preparar estadísticas usando datos mapeados
        const estadisticasGenerales = {
          setsJugados: parseInt(datosMapeados.setsJugados) || 0,
          tirosTotales: parseInt(datosMapeados.tirosTotales) || 0,
          hits: parseInt(datosMapeados.hits) || 0,
          quemados: parseInt(datosMapeados.quemados) || 0,
          asistencias: parseInt(datosMapeados.asistencias) || 0,
          tirosRecibidos: parseInt(datosMapeados.tirosRecibidos) || 0,
          hitsRecibidos: parseInt(datosMapeados.hitsRecibidos) || 0,
          esquives: parseInt(datosMapeados.esquives) || 0,
          esquivesExitosos: parseInt(datosMapeados.esquivesExitosos) || 0,
          ponchado: parseInt(datosMapeados.ponchado) || 0,
          catchesIntentos: parseInt(datosMapeados.catchesIntentos) || 0,
          catches: parseInt(datosMapeados.catches) || 0,
          catchesRecibidos: parseInt(datosMapeados.catchesRecibidos) || 0,
          bloqueosIntentos: parseInt(datosMapeados.bloqueosIntentos) || 0,
          bloqueos: parseInt(datosMapeados.bloqueos) || 0,
          pisoLinea: parseInt(datosMapeados.pisoLinea) || 0
        };

        // Calcular porcentajes e índices
        const estadisticasCompletas = calcularEstadisticasCompletas(estadisticasGenerales);

        if (jugador) {
          // Actualizar jugador existente
          jugador.estadisticasGenerales = estadisticasCompletas;
          await jugador.save();
          resultados.jugadoresActualizados++;
          resultados.detalles.push({
            fila: i + 1,
            jugador: `${datosMapeados.nombre} ${datosMapeados.apellido}`,
            estado: 'actualizado',
            estadisticas: {
              indicePoder: estadisticasCompletas.indicePoder,
              indiceAtaque: estadisticasCompletas.indiceAtaque,
              indiceDefensa: estadisticasCompletas.indiceDefensa
            }
          });
        } else {
          // Crear nuevo jugador
          const equipoIndex = i % equipos.length;
          const equipo = equipos[equipoIndex];

          jugador = new Jugador({
            usuario: usuario._id,
            nombre: datosMapeados.nombre,
            apellido: datosMapeados.apellido,
            fechaNacimiento: datosMapeados.fechaNacimiento ? new Date(datosMapeados.fechaNacimiento) : null,
            posicion: datosMapeados.posicion || 'versatil',
            numeroCamiseta: parseInt(datosMapeados.numeroCamiseta) || (i + 1),
            email: datosMapeados.email,
            telefono: datosMapeados.telefono,
            equipo: equipo._id,
            estadisticasGenerales: estadisticasCompletas,
            activo: true
          });

          await jugador.save();
          resultados.jugadoresCreados++;
          resultados.detalles.push({
            fila: i + 1,
            jugador: `${datosMapeados.nombre} ${datosMapeados.apellido}`,
            estado: 'creado',
            equipo: equipo.nombre,
            estadisticas: {
              indicePoder: estadisticasCompletas.indicePoder,
              indiceAtaque: estadisticasCompletas.indiceAtaque,
              indiceDefensa: estadisticasCompletas.indiceDefensa
            }
          });
        }

        console.log(`✅ ${datosMapeados.nombre} ${datosMapeados.apellido} procesado correctamente`);

      } catch (error) {
        console.error(`❌ Error procesando fila ${i + 1}:`, error.message);
        resultados.errores++;
        resultados.detalles.push({
          fila: i + 1,
          jugador: `${fila.Nombre || ''} ${fila.Apellido || ''}`,
          estado: 'error',
          error: error.message
        });
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(file.path);

    console.log('\n📈 Resumen del procesamiento:');
    console.log(`✅ Jugadores creados: ${resultados.jugadoresCreados}`);
    console.log(`🔄 Jugadores actualizados: ${resultados.jugadoresActualizados}`);
    console.log(`❌ Errores: ${resultados.errores}`);

    res.json({
      success: true,
      message: 'Archivo Excel procesado exitosamente',
      ...resultados
    });

  } catch (error) {
    console.error('❌ Error procesando archivo Excel:', error);
    
    // Limpiar archivo temporal si existe
    const file = req.file || (req.files && req.files.excelFile && req.files.excelFile[0]);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error procesando archivo Excel',
      error: error.message
    });
  }
};

/**
 * Obtener plantilla de Excel para descargar
 */
const descargarPlantilla = async (req, res) => {
  try {
    // Crear datos de ejemplo para la plantilla
    const datosEjemplo = [
      {
        'Nombre': 'Felipe',
        'Apellido': 'Demarco',
        'Email': 'felipe.demarco@email.com',
        'Teléfono': '+59899123456',
        'Fecha Nacimiento': '1995-03-15',
        'Posición': 'thrower',
        'Número Camiseta': 10,
        'Sets Jugados': 15,
        'Tiros Totales': 120,
        'Hits': 45,
        'Quemados': 32,
        'Asistencias': 18,
        'Tiros Recibidos': 80,
        'Hits Recibidos': 25,
        'Esquives': 35,
        'Esquives Exitosos': 28,
        'Ponchado': 7,
        'Catches Intentos': 25,
        'Catches': 18,
        'Catches Recibidos': 8,
        'Bloqueos Intentos': 30,
        'Bloqueos': 22,
        'Piso Línea': 3
      }
    ];

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosEjemplo);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 25 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 15 }, // Fecha Nacimiento
      { wch: 12 }, // Posición
      { wch: 15 }, // Número Camiseta
      { wch: 12 }, // Sets Jugados
      { wch: 12 }, // Tiros Totales
      { wch: 8 },  // Hits
      { wch: 10 }, // Quemados
      { wch: 12 }, // Asistencias
      { wch: 15 }, // Tiros Recibidos
      { wch: 15 }, // Hits Recibidos
      { wch: 10 }, // Esquives
      { wch: 15 }, // Esquives Exitosos
      { wch: 10 }, // Ponchado
      { wch: 15 }, // Catches Intentos
      { wch: 10 }, // Catches
      { wch: 15 }, // Catches Recibidos
      { wch: 15 }, // Bloqueos Intentos
      { wch: 10 }, // Bloqueos
      { wch: 12 }  // Piso Línea
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="plantilla-jugadores.xlsx"');
    res.send(buffer);

  } catch (error) {
    console.error('❌ Error generando plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando plantilla',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  procesarArchivoExcel,
  descargarPlantilla
};
