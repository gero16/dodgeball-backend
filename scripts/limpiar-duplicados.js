require('dotenv').config();
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function limpiarDuplicados() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n🔍 Buscando duplicados...');
    
    // Buscar duplicados por nombre y apellido
    const jugadores = await Jugador.find({});
    const nombresCompletos = jugadores.map(j => `${j.nombre} ${j.apellido}`);
    const duplicados = nombresCompletos.filter((nombre, index) => nombresCompletos.indexOf(nombre) !== index);
    
    if (duplicados.length > 0) {
      console.log(`⚠️  Duplicados encontrados: ${duplicados.length}`);
      duplicados.forEach(duplicado => console.log(`  - ${duplicado}`));
      
      // Eliminar duplicados
      console.log('\n🗑️  Eliminando duplicados...');
      for (const duplicado of duplicados) {
        const [nombre, apellido] = duplicado.split(' ');
        const jugadoresDuplicados = await Jugador.find({ nombre, apellido });
        if (jugadoresDuplicados.length > 1) {
          // Mantener el primero, eliminar el resto
          for (let i = 1; i < jugadoresDuplicados.length; i++) {
            const jugadorAEliminar = jugadoresDuplicados[i];
            // Eliminar también el usuario asociado
            if (jugadorAEliminar.usuario) {
              await Usuario.findByIdAndDelete(jugadorAEliminar.usuario);
            }
            await Jugador.findByIdAndDelete(jugadorAEliminar._id);
            console.log(`✅ Duplicado eliminado: ${duplicado}`);
          }
        }
      }
    } else {
      console.log('✅ No se encontraron duplicados');
    }
    
    // Mostrar resumen final
    console.log('\n📊 Resumen final:');
    const jugadoresFinales = await Jugador.find({});
    console.log(`📈 Total de jugadores: ${jugadoresFinales.length}`);
    
    // Agrupar por equipo
    const resumenEquipos = {};
    jugadoresFinales.forEach(jugador => {
      // Obtener el equipo del jugador (asumiendo que está en estadisticasPorEquipo)
      const equipos = jugador.estadisticasPorEquipo || [];
      if (equipos.length > 0) {
        const equipo = equipos[0].nombreEquipo || 'Sin equipo';
        if (!resumenEquipos[equipo]) {
          resumenEquipos[equipo] = 0;
        }
        resumenEquipos[equipo]++;
      }
    });
    
    console.log('\n📋 Jugadores por equipo:');
    Object.entries(resumenEquipos).forEach(([equipo, cantidad]) => {
      console.log(`  ${equipo}: ${cantidad} jugadores`);
    });
    
    console.log('\n📋 Lista de jugadores:');
    jugadoresFinales.forEach((jugador, index) => {
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta}`);
    });
    
    console.log('\n✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

limpiarDuplicados();
