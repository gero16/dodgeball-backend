/**
 * Script para verificar el formato del archivo Excel
 */

const XLSX = require('xlsx');
const axios = require('axios');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

async function verificarFormatoExcel() {
  try {
    console.log('🔍 Verificando formato de archivo Excel...\n');

    // Crear un archivo de prueba con el formato correcto
    const datosCorrectos = [
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

    console.log('📊 Columnas esperadas:');
    Object.keys(datosCorrectos[0]).forEach((col, index) => {
      console.log(`${index + 1}. ${col}`);
    });

    console.log('\n📋 Datos de ejemplo:');
    console.log(JSON.stringify(datosCorrectos[0], null, 2));

    // Crear archivo Excel de prueba
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosCorrectos);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');

    const filename = 'formato-correcto.xlsx';
    XLSX.writeFile(workbook, filename);
    
    console.log(`\n✅ Archivo de ejemplo creado: ${filename}`);
    console.log('\n📝 Instrucciones para tu archivo Excel:');
    console.log('1. Asegúrate de que la primera fila contenga los nombres de las columnas');
    console.log('2. Los nombres de las columnas deben coincidir exactamente con los mostrados arriba');
    console.log('3. No debe haber filas vacías al inicio');
    console.log('4. La primera fila de datos debe estar en la fila 2 (no en la fila 1)');

    return filename;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Ejecutar
if (require.main === module) {
  verificarFormatoExcel()
    .then(() => {
      console.log('\n🎉 Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = verificarFormatoExcel;
