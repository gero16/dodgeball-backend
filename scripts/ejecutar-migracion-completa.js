#!/usr/bin/env node

/**
 * Script maestro para ejecutar la migración completa
 * Este script ejecuta todos los pasos necesarios para migrar las estadísticas
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando migración completa de estadísticas...\n');

// Función para ejecutar un comando
function ejecutarComando(comando, args = [], cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Ejecutando: ${comando} ${args.join(' ')}`);
    
    const proceso = spawn(comando, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    proceso.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Comando completado exitosamente\n`);
        resolve();
      } else {
        console.log(`❌ Comando falló con código ${code}\n`);
        reject(new Error(`Comando falló con código ${code}`));
      }
    });

    proceso.on('error', (error) => {
      console.log(`❌ Error ejecutando comando: ${error.message}\n`);
      reject(error);
    });
  });
}

// Función para mostrar instrucciones
function mostrarInstrucciones() {
  console.log(`
🎯 INSTRUCCIONES PARA COMPLETAR LA MIGRACIÓN:

📋 PASO 1: Ejecutar el servidor de migración
   cd /home/gero/Desktop/dodgeball-general/dodgeball-backend
   node scripts/migrar-via-api.js

📋 PASO 2: Usar Postman para ejecutar la migración
   1. Abrir Postman
   2. Crear nueva colección "Migración Estadísticas"
   3. Agregar los siguientes requests:

   🔍 Health Check:
   - Método: GET
   - URL: http://localhost:3001/api/migrar-estadisticas/health

   📊 Status Check:
   - Método: GET  
   - URL: http://localhost:3001/api/migrar-estadisticas/status

   🚀 Ejecutar Migración:
   - Método: POST
   - URL: http://localhost:3001/api/migrar-estadisticas
   - Headers: Content-Type: application/json
   - Body: {}

   ✅ Verificar Resultado:
   - Método: GET
   - URL: http://localhost:3001/api/migrar-estadisticas/status

📋 PASO 3: (Opcional) Crear partido de demostración
   cd /home/gero/Desktop/dodgeball-general/dodgeball-backend
   node scripts/agregar-partido-demo.js

   Luego en Postman:
   - Método: POST
   - URL: http://localhost:3002/api/partido-demo
   - Body: {}

   - Método: GET
   - URL: http://localhost:3002/api/partido-demo/ranking

📋 PASO 4: Verificar que todo funciona
   - Los jugadores deberían tener nuevos campos de estadísticas
   - Los porcentajes e índices deberían calcularse automáticamente
   - El ranking debería mostrar jugadores ordenados por índice de poder

📚 DOCUMENTACIÓN:
   - MIGRACION_POSTMAN.md: Instrucciones detalladas para Postman
   - ESTADISTICAS_AVANZADAS.md: Documentación de las nuevas funcionalidades

🎉 ¡Una vez completada la migración, tendrás acceso a todas las estadísticas avanzadas!
`);
}

// Función principal
async function main() {
  try {
    console.log('🔍 Verificando archivos necesarios...\n');

    // Verificar que los archivos necesarios existen
    const archivosNecesarios = [
      'src/models/Jugador.js',
      'src/models/Partido.js', 
      'src/utils/estadisticas.js',
      'src/controllers/partidoController.js',
      'src/routes/partidoRoutes.js',
      'scripts/migrar-via-api.js',
      'scripts/agregar-partido-demo.js'
    ];

    const fs = require('fs');
    for (const archivo of archivosNecesarios) {
      if (!fs.existsSync(archivo)) {
        console.log(`❌ Archivo faltante: ${archivo}`);
        process.exit(1);
      }
    }

    console.log('✅ Todos los archivos necesarios están presentes\n');

    // Verificar dependencias
    console.log('📦 Verificando dependencias...\n');
    
    try {
      await ejecutarComando('npm', ['list', '--depth=0']);
    } catch (error) {
      console.log('⚠️  Algunas dependencias pueden estar faltando, pero continuando...\n');
    }

    // Mostrar instrucciones
    mostrarInstrucciones();

    console.log('🎯 La migración está lista para ejecutarse siguiendo las instrucciones anteriores.\n');

  } catch (error) {
    console.error('❌ Error en la preparación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = main;
