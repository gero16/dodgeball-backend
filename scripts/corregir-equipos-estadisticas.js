const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Mapeo de equipos correctos
const equiposCorrectos = {
  'BUMBA': '68e42f7caa241db4750498ae',
  'THE CATCHERS': '68e42f78aa241db4750498ab', 
  'THE DODGEBALL MONKEYS': '68e45aa2a8e4d976e9a083d2',
  'LA NEOFARAFA': '68e45aa1a8e4d976e9a083cf'
};

// Jugadores que necesitan corrección de equipo
const correccionesEquipos = [
  { nombre: 'Rafael', apellido: 'García', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Gerónimo', apellido: 'Nicola', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Patricia', apellido: 'Yanes', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Josué', apellido: 'Arboleda', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Rodrigo', apellido: 'Pérez', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Santiago', apellido: 'Gil', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Agustín', apellido: 'Sogliano', equipoCorrecto: 'LA NEOFARAFA' },
  { nombre: 'Alejandro', apellido: 'Rocca', equipoCorrecto: 'THE DODGEBALL MONKEYS' },
  { nombre: 'Valentino', apellido: 'Gloodtdfosky', equipoCorrecto: 'THE DODGEBALL MONKEYS' },
  { nombre: 'Salvador', apellido: 'Méndez', equipoCorrecto: 'THE DODGEBALL MONKEYS' },
  { nombre: 'Matheo', apellido: 'Santos', equipoCorrecto: 'THE DODGEBALL MONKEYS' },
  { nombre: 'Tiago', apellido: 'Pereira', equipoCorrecto: 'THE DODGEBALL MONKEYS' },
  { nombre: 'Ignacio', apellido: 'Rodríguez', equipoCorrecto: 'THE DODGEBALL MONKEYS' }
];

async function corregirEquiposEstadisticas() {
  try {
    console.log('🔄 Corrigiendo equipos en las estadísticas...\n');

    // 1. Obtener todas las estadísticas
    console.log('📊 Obteniendo estadísticas existentes...');
    const estadisticasResponse = await axios.get(`${API_BASE_URL}/estadisticas`);
    const estadisticas = estadisticasResponse.data.data;
    console.log(`✅ Encontradas ${estadisticas.length} estadísticas\n`);

    let corregidas = 0;
    let errores = 0;

    // 2. Corregir cada jugador
    for (const correccion of correccionesEquipos) {
      const estadistica = estadisticas.find(
        (e) =>
          e.jugador.nombre === correccion.nombre &&
          e.jugador.apellido === correccion.apellido
      );

      if (estadistica) {
        console.log(`🔄 Corrigiendo ${correccion.nombre} ${correccion.apellido} → ${correccion.equipoCorrecto}...`);
        
        try {
          const equipoId = equiposCorrectos[correccion.equipoCorrecto];
          if (!equipoId) {
            console.log(`   ❌ ID de equipo no encontrado para ${correccion.equipoCorrecto}`);
            errores++;
            continue;
          }

          await axios.put(`${API_BASE_URL}/estadisticas/${estadistica._id}`, {
            equipo: equipoId
          });
          
          console.log(`   ✅ Corregido - Equipo: ${correccion.equipoCorrecto}`);
          corregidas++;
        } catch (error) {
          console.error(`   ❌ Error corrigiendo ${correccion.nombre} ${correccion.apellido}: ${error.message}`);
          errores++;
        }
      } else {
        console.log(`   ⚠️  Estadística no encontrada para ${correccion.nombre} ${correccion.apellido}`);
      }
    }

    console.log('\n📈 Resumen de las correcciones:');
    console.log(`   ✅ Corregidas: ${corregidas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesadas: ${correccionesEquipos.length}`);

    // 3. Verificar estadísticas por equipo
    console.log('\n🔍 Verificando estadísticas por equipo...');
    const estadisticasFinalesResponse = await axios.get(`${API_BASE_URL}/estadisticas?evento=68db0409ddcdb45a97d57ffd`);
    const estadisticasFinales = estadisticasFinalesResponse.data.data;

    const equiposAgrupados = {};
    estadisticasFinales.forEach(estadistica => {
      const equipoNombre = estadistica.equipo.nombre;
      if (!equiposAgrupados[equipoNombre]) {
        equiposAgrupados[equipoNombre] = [];
      }
      equiposAgrupados[equipoNombre].push(estadistica);
    });

    console.log('\n🏆 Estadísticas por equipo:');
    Object.keys(equiposAgrupados).forEach(equipo => {
      console.log(`\n   📊 ${equipo}:`);
      equiposAgrupados[equipo]
        .sort((a, b) => b.indicePoder - a.indicePoder)
        .forEach((estadistica, index) => {
          console.log(`      ${index + 1}. ${estadistica.jugador.nombre} ${estadistica.jugador.apellido} - Poder: ${estadistica.indicePoder}`);
        });
    });

    console.log('\n🎉 Corrección de equipos completada!');
  } catch (error) {
    console.error('❌ Error en la corrección:', error.message);
  } finally {
    console.log('✅ Script completado');
  }
}

corregirEquiposEstadisticas();
