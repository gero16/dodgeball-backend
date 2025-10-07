const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

const equiposFaltantes = [
  {
    nombre: 'LA NEOFARAFA',
    tipo: 'club',
    pais: 'Uruguay',
    ciudad: 'Montevideo',
    colorPrincipal: '#FF6B35',
    colorSecundario: '#FFFFFF',
    activo: true
  },
  {
    nombre: 'THE DODGEBALL MONKEYS',
    tipo: 'club',
    pais: 'Uruguay',
    ciudad: 'Montevideo',
    colorPrincipal: '#4A90E2',
    colorSecundario: '#FFFFFF',
    activo: true
  }
];

async function crearEquiposFaltantes() {
  try {
    console.log('🔄 Creando equipos faltantes...\n');

    let creados = 0;
    let errores = 0;

    for (const equipo of equiposFaltantes) {
      console.log(`🔄 Creando equipo: ${equipo.nombre}...`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/equipos`, equipo);
        console.log(`   ✅ Creado - ID: ${response.data.data._id}`);
        creados++;
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('ya existe')) {
          console.log(`   ⚠️  El equipo ${equipo.nombre} ya existe`);
        } else {
          console.error(`   ❌ Error creando ${equipo.nombre}: ${error.message}`);
          errores++;
        }
      }
    }

    console.log('\n📈 Resumen de la creación:');
    console.log(`   ✅ Creados: ${creados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesados: ${equiposFaltantes.length}`);

    // Verificar equipos finales
    console.log('\n🔍 Verificando equipos finales...');
    const equiposResponse = await axios.get(`${API_BASE_URL}/equipos`);
    const equipos = equiposResponse.data.data.equipos;

    console.log('\n🏆 Equipos disponibles:');
    equipos.forEach(equipo => {
      console.log(`   - ${equipo.nombre} (ID: ${equipo._id})`);
    });

    console.log('\n🎉 Creación de equipos completada!');
  } catch (error) {
    console.error('❌ Error en la creación:', error.message);
  } finally {
    console.log('✅ Script completado');
  }
}

crearEquiposFaltantes();
