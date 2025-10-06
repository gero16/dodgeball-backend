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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    console.log('📊 Procesando archivo Excel:', req.file.filename);

    // Leer el archivo Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📋 Encontradas ${data.length} filas en el archivo`);

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

    // Procesar cada fila del Excel
    for (let i = 0; i < data.length; i++) {
      const fila = data[i];
      try {
        console.log(`👤 Procesando fila ${i + 1}: ${fila.Nombre || 'Sin nombre'}`);

        // Validar datos requeridos
        if (!fila.Nombre || !fila.Apellido) {
          resultados.errores++;
          resultados.detalles.push({
            fila: i + 1,
            jugador: `${fila.Nombre || ''} ${fila.Apellido || ''}`,
            estado: 'error',
            error: 'Faltan nombre o apellido'
          });
          continue;
        }

        // Buscar o crear usuario
        let usuario = await Usuario.findOne({ 
          email: fila.Email || `${fila.Nombre.toLowerCase()}.${fila.Apellido.toLowerCase()}@email.com` 
        });

        if (!usuario) {
          usuario = new Usuario({
            nombre: fila.Nombre,
            apellido: fila.Apellido,
            email: fila.Email || `${fila.Nombre.toLowerCase()}.${fila.Apellido.toLowerCase()}@email.com`,
            password: '123456', // Password por defecto
            rol: 'jugador'
          });
          await usuario.save();
        }

        // Buscar jugador existente
        let jugador = await Jugador.findOne({ usuario: usuario._id });

        // Preparar estadísticas
        const estadisticasGenerales = {
          setsJugados: parseInt(fila['Sets Jugados']) || 0,
          tirosTotales: parseInt(fila['Tiros Totales']) || 0,
          hits: parseInt(fila['Hits']) || 0,
          quemados: parseInt(fila['Quemados']) || 0,
          asistencias: parseInt(fila['Asistencias']) || 0,
          tirosRecibidos: parseInt(fila['Tiros Recibidos']) || 0,
          hitsRecibidos: parseInt(fila['Hits Recibidos']) || 0,
          esquives: parseInt(fila['Esquives']) || 0,
          esquivesExitosos: parseInt(fila['Esquives Exitosos']) || 0,
          ponchado: parseInt(fila['Ponchado']) || 0,
          catchesIntentos: parseInt(fila['Catches Intentos']) || 0,
          catches: parseInt(fila['Catches']) || 0,
          catchesRecibidos: parseInt(fila['Catches Recibidos']) || 0,
          bloqueosIntentos: parseInt(fila['Bloqueos Intentos']) || 0,
          bloqueos: parseInt(fila['Bloqueos']) || 0,
          pisoLinea: parseInt(fila['Piso Línea']) || 0
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
            jugador: `${fila.Nombre} ${fila.Apellido}`,
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
            nombre: fila.Nombre,
            apellido: fila.Apellido,
            fechaNacimiento: fila['Fecha Nacimiento'] ? new Date(fila['Fecha Nacimiento']) : null,
            posicion: fila.Posicion || 'versatil',
            numeroCamiseta: parseInt(fila['Número Camiseta']) || (i + 1),
            email: fila.Email,
            telefono: fila.Teléfono,
            equipo: equipo._id,
            estadisticasGenerales: estadisticasCompletas,
            activo: true
          });

          await jugador.save();
          resultados.jugadoresCreados++;
          resultados.detalles.push({
            fila: i + 1,
            jugador: `${fila.Nombre} ${fila.Apellido}`,
            estado: 'creado',
            equipo: equipo.nombre,
            estadisticas: {
              indicePoder: estadisticasCompletas.indicePoder,
              indiceAtaque: estadisticasCompletas.indiceAtaque,
              indiceDefensa: estadisticasCompletas.indiceDefensa
            }
          });
        }

        console.log(`✅ ${fila.Nombre} ${fila.Apellido} procesado correctamente`);

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
    fs.unlinkSync(req.file.path);

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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
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
