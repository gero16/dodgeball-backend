/**
 * Script para probar el sistema de carga de archivos Excel
 * Este script crea un archivo Excel de ejemplo y lo procesa
 */

const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos de ejemplo para crear el archivo Excel
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
  }
];

async function crearArchivoExcel() {
  try {
    console.log('📊 Creando archivo Excel de ejemplo...');
    
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
    const filename = 'jugadores-ejemplo.xlsx';
    XLSX.writeFile(workbook, filename);
    
    console.log(`✅ Archivo creado: ${filename}`);
    return filename;

  } catch (error) {
    console.error('❌ Error creando archivo Excel:', error);
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
      timeout: 30000 // 30 segundos timeout
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
    jugadores.forEach((jugador, index) => {
      if (jugador.estadisticasGenerales.setsJugados > 0) {
        console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - ${jugador.estadisticasGenerales.setsJugados} sets - Índice Poder: ${jugador.estadisticasGenerales.indicePoder.toFixed(2)}`);
      }
    });

    return jugadores;

  } catch (error) {
    console.error('❌ Error verificando jugadores:', error.response?.data || error.message);
    return [];
  }
}

async function probarSistemaExcel() {
  try {
    console.log('🔄 Iniciando prueba del sistema Excel...\n');

    // 1. Crear archivo Excel
    const filename = await crearArchivoExcel();
    if (!filename) return;

    // 2. Subir archivo
    const resultado = await subirArchivoExcel(filename);
    if (!resultado) return;

    // 3. Mostrar resultados
    console.log('\n📈 Resultados del procesamiento:');
    console.log(`✅ Total filas procesadas: ${resultado.totalFilas}`);
    console.log(`✅ Jugadores creados: ${resultado.jugadoresCreados}`);
    console.log(`🔄 Jugadores actualizados: ${resultado.jugadoresActualizados}`);
    console.log(`❌ Errores: ${resultado.errores}`);

    // 4. Verificar jugadores
    await verificarJugadores();

    // 5. Limpiar archivo temporal
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
      console.log(`🗑️ Archivo temporal eliminado: ${filename}`);
    }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  probarSistemaExcel()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = probarSistemaExcel;
