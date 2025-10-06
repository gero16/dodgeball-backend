/**
 * Script que simula exactamente lo que hace el frontend
 */

const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'https://dodgeball-backend-production.up.railway.app';

// Datos de ejemplo
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

async function crearArchivoExcel() {
  try {
    console.log('📊 Creando archivo Excel...');
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosEjemplo);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');

    const filename = 'test-frontend.xlsx';
    XLSX.writeFile(workbook, filename);
    
    console.log(`✅ Archivo creado: ${filename}`);
    return filename;

  } catch (error) {
    console.error('❌ Error creando archivo Excel:', error);
    return null;
  }
}

async function simularFrontend(filename) {
  try {
    console.log('🌐 Simulando envío desde frontend...');
    
    // Simular exactamente lo que hace el frontend
    const formData = new FormData();
    formData.append('excelFile', fs.createReadStream(filename), {
      filename: filename,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('📤 Enviando a:', `${API_BASE_URL}/api/excel/upload`);
    console.log('📁 Campo:', 'excelFile');
    console.log('📄 Archivo:', filename);

    const response = await axios.post(`${API_BASE_URL}/api/excel/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000
    });

    console.log('✅ Respuesta recibida:', response.status);
    return response.data;

  } catch (error) {
    console.error('❌ Error en simulación frontend:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function probarSimulacionFrontend() {
  try {
    console.log('🔄 Iniciando simulación de frontend...\n');

    // 1. Crear archivo Excel
    const filename = await crearArchivoExcel();
    if (!filename) return;

    // 2. Simular envío desde frontend
    const resultado = await simularFrontend(filename);
    if (!resultado) return;

    // 3. Mostrar resultados
    console.log('\n📈 Resultados:');
    console.log(JSON.stringify(resultado, null, 2));

    // 4. Limpiar
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
      console.log(`\n🗑️ Archivo eliminado: ${filename}`);
    }

    console.log('\n🎉 Simulación completada!');

  } catch (error) {
    console.error('❌ Error en simulación:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  probarSimulacionFrontend()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = probarSimulacionFrontend;
