/**
 * Script para probar el sistema de carga de archivos Excel en producción
 * Este script crea un archivo Excel y lo sube a la API de producción
 */

const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos de ejemplo para crear el archivo Excel (26 jugadores)
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
  },
  {
    'Nombre': 'Santiago',
    'Apellido': 'Nicotera',
    'Email': 'santiago.nicotera@email.com',
    'Teléfono': '+59899234567',
    'Fecha Nacimiento': '1992-08-22',
    'Posición': 'catcher',
    'Número Camiseta': 7,
    'Sets Jugados': 18,
    'Tiros Totales': 85,
    'Hits': 32,
    'Quemados': 25,
    'Asistencias': 22,
    'Tiros Recibidos': 95,
    'Hits Recibidos': 30,
    'Esquives': 45,
    'Esquives Exitosos': 38,
    'Ponchado': 5,
    'Catches Intentos': 40,
    'Catches': 32,
    'Catches Recibidos': 12,
    'Bloqueos Intentos': 35,
    'Bloqueos': 28,
    'Piso Línea': 2
  },
  {
    'Nombre': 'Martín',
    'Apellido': 'Rodríguez',
    'Email': 'martin.rodriguez@email.com',
    'Teléfono': '+59899345678',
    'Fecha Nacimiento': '1990-11-08',
    'Posición': 'versatil',
    'Número Camiseta': 5,
    'Sets Jugados': 20,
    'Tiros Totales': 95,
    'Hits': 38,
    'Quemados': 28,
    'Asistencias': 15,
    'Tiros Recibidos': 110,
    'Hits Recibidos': 35,
    'Esquives': 50,
    'Esquives Exitosos': 42,
    'Ponchado': 8,
    'Catches Intentos': 35,
    'Catches': 28,
    'Catches Recibidos': 10,
    'Bloqueos Intentos': 40,
    'Bloqueos': 32,
    'Piso Línea': 4
  },
  {
    'Nombre': 'Diego',
    'Apellido': 'González',
    'Email': 'diego.gonzalez@email.com',
    'Teléfono': '+59899456789',
    'Fecha Nacimiento': '1988-05-12',
    'Posición': 'defender',
    'Número Camiseta': 3,
    'Sets Jugados': 22,
    'Tiros Totales': 70,
    'Hits': 25,
    'Quemados': 18,
    'Asistencias': 12,
    'Tiros Recibidos': 125,
    'Hits Recibidos': 40,
    'Esquives': 60,
    'Esquives Exitosos': 50,
    'Ponchado': 10,
    'Catches Intentos': 45,
    'Catches': 36,
    'Catches Recibidos': 15,
    'Bloqueos Intentos': 50,
    'Bloqueos': 40,
    'Piso Línea': 5
  },
  {
    'Nombre': 'Lucas',
    'Apellido': 'Fernández',
    'Email': 'lucas.fernandez@email.com',
    'Teléfono': '+59899678901',
    'Fecha Nacimiento': '1994-02-14',
    'Posición': 'versatil',
    'Número Camiseta': 8,
    'Sets Jugados': 14,
    'Tiros Totales': 88,
    'Hits': 35,
    'Quemados': 26,
    'Asistencias': 16,
    'Tiros Recibidos': 90,
    'Hits Recibidos': 28,
    'Esquives': 40,
    'Esquives Exitosos': 33,
    'Ponchado': 6,
    'Catches Intentos': 30,
    'Catches': 24,
    'Catches Recibidos': 9,
    'Bloqueos Intentos': 35,
    'Bloqueos': 28,
    'Piso Línea': 3
  },
  {
    'Nombre': 'Gabriel',
    'Apellido': 'Silva',
    'Email': 'gabriel.silva@email.com',
    'Teléfono': '+59899789012',
    'Fecha Nacimiento': '1991-12-03',
    'Posición': 'catcher',
    'Número Camiseta': 12,
    'Sets Jugados': 19,
    'Tiros Totales': 75,
    'Hits': 28,
    'Quemados': 20,
    'Asistencias': 14,
    'Tiros Recibidos': 105,
    'Hits Recibidos': 32,
    'Esquives': 48,
    'Esquives Exitosos': 40,
    'Ponchado': 8,
    'Catches Intentos': 38,
    'Catches': 30,
    'Catches Recibidos': 11,
    'Bloqueos Intentos': 42,
    'Bloqueos': 34,
    'Piso Línea': 4
  },
  {
    'Nombre': 'Nicolás',
    'Apellido': 'Torres',
    'Email': 'nicolas.torres@email.com',
    'Teléfono': '+59899890123',
    'Fecha Nacimiento': '1989-07-18',
    'Posición': 'thrower',
    'Número Camiseta': 11,
    'Sets Jugados': 17,
    'Tiros Totales': 105,
    'Hits': 40,
    'Quemados': 29,
    'Asistencias': 19,
    'Tiros Recibidos': 85,
    'Hits Recibidos': 26,
    'Esquives': 32,
    'Esquives Exitosos': 27,
    'Ponchado': 6,
    'Catches Intentos': 22,
    'Catches': 17,
    'Catches Recibidos': 7,
    'Bloqueos Intentos': 28,
    'Bloqueos': 21,
    'Piso Línea': 3
  },
  {
    'Nombre': 'Sebastián',
    'Apellido': 'Vargas',
    'Email': 'sebastian.vargas@email.com',
    'Teléfono': '+59899901234',
    'Fecha Nacimiento': '1996-04-25',
    'Posición': 'versatil',
    'Número Camiseta': 6,
    'Sets Jugados': 13,
    'Tiros Totales': 82,
    'Hits': 31,
    'Quemados': 23,
    'Asistencias': 17,
    'Tiros Recibidos': 95,
    'Hits Recibidos': 29,
    'Esquives': 38,
    'Esquives Exitosos': 31,
    'Ponchado': 7,
    'Catches Intentos': 28,
    'Catches': 22,
    'Catches Recibidos': 8,
    'Bloqueos Intentos': 32,
    'Bloqueos': 25,
    'Piso Línea': 2
  },
  {
    'Nombre': 'Alejandro',
    'Apellido': 'Martínez',
    'Email': 'alejandro.martinez@email.com',
    'Teléfono': '+59899012345',
    'Fecha Nacimiento': '1993-09-30',
    'Posición': 'thrower',
    'Número Camiseta': 9,
    'Sets Jugados': 16,
    'Tiros Totales': 110,
    'Hits': 42,
    'Quemados': 30,
    'Asistencias': 20,
    'Tiros Recibidos': 75,
    'Hits Recibidos': 22,
    'Esquives': 30,
    'Esquives Exitosos': 25,
    'Ponchado': 6,
    'Catches Intentos': 20,
    'Catches': 15,
    'Catches Recibidos': 6,
    'Bloqueos Intentos': 25,
    'Bloqueos': 18,
    'Piso Línea': 2
  },
  {
    'Nombre': 'Carlos',
    'Apellido': 'López',
    'Email': 'carlos.lopez@email.com',
    'Teléfono': '+59899123456',
    'Fecha Nacimiento': '1987-01-15',
    'Posición': 'defender',
    'Número Camiseta': 4,
    'Sets Jugados': 21,
    'Tiros Totales': 65,
    'Hits': 22,
    'Quemados': 16,
    'Asistencias': 10,
    'Tiros Recibidos': 130,
    'Hits Recibidos': 42,
    'Esquives': 65,
    'Esquives Exitosos': 55,
    'Ponchado': 12,
    'Catches Intentos': 48,
    'Catches': 38,
    'Catches Recibidos': 16,
    'Bloqueos Intentos': 55,
    'Bloqueos': 44,
    'Piso Línea': 6
  }
];

async function crearArchivoExcel() {
  try {
    console.log('📊 Creando archivo Excel con 26 jugadores...');
    
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosEjemplo);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 8 },
      { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 10 }, { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');

    // Guardar archivo
    const filename = 'jugadores-26.xlsx';
    XLSX.writeFile(workbook, filename);
    
    console.log(`✅ Archivo creado: ${filename}`);
    return filename;

  } catch (error) {
    console.error('❌ Error creando archivo Excel:', error);
    return null;
  }
}

async function descargarPlantilla() {
  try {
    console.log('📥 Descargando plantilla de Excel...');
    
    const response = await axios.get(`${API_BASE_URL}/api/excel/plantilla`, {
      responseType: 'arraybuffer'
    });

    // Guardar plantilla
    const filename = 'plantilla-jugadores.xlsx';
    fs.writeFileSync(filename, response.data);
    
    console.log(`✅ Plantilla descargada: ${filename}`);
    return filename;

  } catch (error) {
    console.error('❌ Error descargando plantilla:', error.response?.data || error.message);
    return null;
  }
}

async function subirArchivoExcel(filename) {
  try {
    console.log('📤 Subiendo archivo Excel...');
    
    const formData = new FormData();
    formData.append('archivo', fs.createReadStream(filename));

    const response = await axios.post(`${API_BASE_URL}/api/excel/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000 // 60 segundos timeout
    });

    console.log('✅ Archivo subido exitosamente');
    return response.data;

  } catch (error) {
    console.error('❌ Error subiendo archivo:', error.response?.data || error.message);
    return null;
  }
}

async function verificarJugadores() {
  try {
    console.log('👥 Verificando jugadores creados...');
    
    const response = await axios.get(`${API_BASE_URL}/api/jugadores`);
    const jugadores = response.data.data.jugadores;
    
    console.log(`📊 Total de jugadores: ${jugadores.length}`);
    
    // Mostrar jugadores con estadísticas
    let jugadoresConEstadisticas = 0;
    jugadores.forEach((jugador, index) => {
      if (jugador.estadisticasGenerales.setsJugados > 0) {
        jugadoresConEstadisticas++;
        console.log(`${jugadoresConEstadisticas}. ${jugador.nombre} ${jugador.apellido} - ${jugador.estadisticasGenerales.setsJugados} sets - Índice Poder: ${jugador.estadisticasGenerales.indicePoder.toFixed(2)}`);
      }
    });

    console.log(`\n📈 Jugadores con estadísticas reales: ${jugadoresConEstadisticas}`);
    return jugadores;

  } catch (error) {
    console.error('❌ Error verificando jugadores:', error.response?.data || error.message);
    return [];
  }
}

async function probarSistemaExcelProduccion() {
  try {
    console.log('🔄 Iniciando prueba del sistema Excel en producción...\n');

    // 1. Descargar plantilla
    await descargarPlantilla();

    // 2. Crear archivo Excel
    const filename = await crearArchivoExcel();
    if (!filename) return;

    // 3. Subir archivo
    const resultado = await subirArchivoExcel(filename);
    if (!resultado) return;

    // 4. Mostrar resultados
    console.log('\n📈 Resultados del procesamiento:');
    console.log(`✅ Total filas procesadas: ${resultado.totalFilas}`);
    console.log(`✅ Jugadores creados: ${resultado.jugadoresCreados}`);
    console.log(`🔄 Jugadores actualizados: ${resultado.jugadoresActualizados}`);
    console.log(`❌ Errores: ${resultado.errores}`);

    // 5. Verificar jugadores
    await verificarJugadores();

    // 6. Limpiar archivos temporales
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
      console.log(`\n🗑️ Archivo temporal eliminado: ${filename}`);
    }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  probarSistemaExcelProduccion()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = probarSistemaExcelProduccion;
