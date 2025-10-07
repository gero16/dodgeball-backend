require('dotenv').config();
const mongoose = require('mongoose');
const Jugador = require('../src/models/Jugador');
const Usuario = require('../src/models/Usuario');
const Estadistica = require('../src/models/Estadistica');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function limpiarJugadoresExtra() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Limpiando jugadores extra...');
    
    // Lista de jugadores originales que SÍ deben mantenerse
    const jugadoresOriginales = [
      'Felipe Demarco', 'Alejandro Rocca', 'Guzmán Demarco', 'Rafael García',
      'Valentino Gloodtdfosky', 'Salvador Méndez', 'Edewel Cremel', 'Gerónimo Nicola',
      'Agustín Giles', 'Santiago Giles', 'Diego Burrera', 'Pastor Pastor',
      'Santino Barreiro', 'Patricia Yanes', 'Josué Arboleda', 'Matheo Santos',
      'Ignacio Rodríguez', 'Santiago Gil', 'Agustín Sogliano', 'Mateo Alonso',
      'Facundo Alonso', 'Rodrigo Pérez', 'Tiago Pereira'
    ];
    
    // Obtener todos los jugadores
    const jugadores = await Jugador.find({});
    console.log(`📈 Total de jugadores antes de limpiar: ${jugadores.length}`);
    
    // Identificar jugadores a eliminar
    const jugadoresAEliminar = [];
    const jugadoresAMantener = [];
    
    jugadores.forEach(jugador => {
      const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`;
      if (jugadoresOriginales.includes(nombreCompleto)) {
        jugadoresAMantener.push(jugador);
      } else {
        jugadoresAEliminar.push(jugador);
      }
    });
    
    console.log(`✅ Jugadores a mantener: ${jugadoresAMantener.length}`);
    console.log(`🗑️  Jugadores a eliminar: ${jugadoresAEliminar.length}`);
    
    if (jugadoresAEliminar.length > 0) {
      console.log('\n📋 Jugadores que serán eliminados:');
      jugadoresAEliminar.forEach((jugador, index) => {
        console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta}`);
      });
      
      console.log('\n🗑️  Eliminando jugadores extra...');
      let jugadoresEliminados = 0;
      let usuariosEliminados = 0;
      let estadisticasEliminadas = 0;
      
      for (const jugador of jugadoresAEliminar) {
        try {
          // Eliminar estadísticas relacionadas
          const estadisticasDelJugador = await Estadistica.find({ jugador: jugador._id });
          if (estadisticasDelJugador.length > 0) {
            await Estadistica.deleteMany({ jugador: jugador._id });
            estadisticasEliminadas += estadisticasDelJugador.length;
            console.log(`  📊 Eliminadas ${estadisticasDelJugador.length} estadísticas de ${jugador.nombre} ${jugador.apellido}`);
          }
          
          // Eliminar usuario relacionado
          if (jugador.usuario) {
            await Usuario.findByIdAndDelete(jugador.usuario);
            usuariosEliminados++;
            console.log(`  👤 Usuario eliminado para ${jugador.nombre} ${jugador.apellido}`);
          }
          
          // Eliminar jugador
          await Jugador.findByIdAndDelete(jugador._id);
          jugadoresEliminados++;
          console.log(`  ✅ Jugador eliminado: ${jugador.nombre} ${jugador.apellido}`);
          
        } catch (error) {
          console.error(`❌ Error eliminando ${jugador.nombre} ${jugador.apellido}:`, error.message);
        }
      }
      
      console.log('\n📊 Resumen de la limpieza:');
      console.log(`✅ Jugadores eliminados: ${jugadoresEliminados}`);
      console.log(`👤 Usuarios eliminados: ${usuariosEliminados}`);
      console.log(`📊 Estadísticas eliminadas: ${estadisticasEliminadas}`);
    }
    
    // Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    const jugadoresFinales = await Jugador.find({});
    console.log(`📈 Total de jugadores después de limpiar: ${jugadoresFinales.length}`);
    
    // Verificar que todos los jugadores originales están presentes
    const jugadoresOriginalesEncontrados = [];
    const jugadoresOriginalesFaltantes = [];
    
    jugadoresOriginales.forEach(nombreCompleto => {
      const [nombre, apellido] = nombreCompleto.split(' ');
      const existe = jugadoresFinales.find(j => j.nombre === nombre && j.apellido === apellido);
      if (existe) {
        jugadoresOriginalesEncontrados.push(nombreCompleto);
      } else {
        jugadoresOriginalesFaltantes.push(nombreCompleto);
      }
    });
    
    console.log(`\n✅ Jugadores originales encontrados: ${jugadoresOriginalesEncontrados.length}/${jugadoresOriginales.length}`);
    if (jugadoresOriginalesFaltantes.length > 0) {
      console.log(`❌ Jugadores originales faltantes: ${jugadoresOriginalesFaltantes.length}`);
      jugadoresOriginalesFaltantes.forEach(jugador => console.log(`  - ${jugador}`));
    }
    
    // Mostrar jugadores finales
    console.log('\n📋 Jugadores finales:');
    jugadoresFinales.forEach((jugador, index) => {
      const equipo = jugador.estadisticasPorEquipo?.[0]?.nombreEquipo || 'Sin equipo';
      console.log(`${index + 1}. ${jugador.nombre} ${jugador.apellido} - #${jugador.numeroCamiseta} (${equipo})`);
    });
    
    console.log('\n✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

limpiarJugadoresExtra();
