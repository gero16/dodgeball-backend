/**
 * Script para probar el sistema de carga de archivos Excel localmente
 * Este script simula el procesamiento de un archivo Excel
 */

const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Equipo = require('../src/models/Equipo');
const Usuario = require('../src/models/Usuario');
const { calcularEstadisticasCompletas } = require('../src/utils/estadisticas');
require('dotenv').config();

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

async function procesarArchivoExcel(filename) {
  try {
    console.log('📖 Procesando archivo Excel...');
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📋 Encontradas ${data.length} filas en el archivo`);

    if (data.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }

    // Obtener equipos existentes
    const equipos = await Equipo.find({ activo: true });
    if (equipos.length === 0) {
      throw new Error('No hay equipos disponibles. Crea equipos primero.');
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
            posicion: fila.Posición || 'versatil',
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

    return resultados;

  } catch (error) {
    console.error('❌ Error procesando archivo Excel:', error);
    throw error;
  }
}

async function verificarJugadores() {
  try {
    console.log('👥 Verificando jugadores creados...');
    
    const jugadores = await Jugador.find({}).populate('usuario', 'nombre email');
    
    console.log(`📊 Total de jugadores: ${jugadores.length}`);
    
    // Mostrar jugadores con estadísticas
    jugadores.forEach((jugador, index) => {
      if (jugador.estadisticasGenerales.setsJugados > 0) {
        console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - ${jugador.estadisticasGenerales.setsJugados} sets - Índice Poder: ${jugador.estadisticasGenerales.indicePoder.toFixed(2)}`);
      }
    });

    return jugadores;

  } catch (error) {
    console.error('❌ Error verificando jugadores:', error);
    return [];
  }
}

async function probarSistemaExcelLocal() {
  try {
    console.log('🔄 Iniciando prueba del sistema Excel local...\n');

    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball');
    console.log('✅ Conectado a MongoDB\n');

    // 1. Crear archivo Excel
    const filename = await crearArchivoExcel();
    if (!filename) return;

    // 2. Procesar archivo
    const resultado = await procesarArchivoExcel(filename);
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
    if (require('fs').existsSync(filename)) {
      require('fs').unlinkSync(filename);
      console.log(`\n🗑️ Archivo temporal eliminado: ${filename}`);
    }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  probarSistemaExcelLocal()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = probarSistemaExcelLocal;
