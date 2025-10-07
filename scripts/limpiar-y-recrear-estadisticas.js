require('dotenv').config();
const mongoose = require('mongoose');
const Estadistica = require('../src/models/Estadistica');
const Jugador = require('../src/models/Jugador');
const Equipo = require('../src/models/Equipo');
const Evento = require('../src/models/Evento');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/dodgeball-club';

async function limpiarYRecrearEstadisticas() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Limpiando y recreando estadísticas...');
    
    // 1. Eliminar todas las estadísticas existentes
    console.log('\n🗑️  Eliminando estadísticas existentes...');
    const estadisticasEliminadas = await Estadistica.deleteMany({});
    console.log(`✅ Estadísticas eliminadas: ${estadisticasEliminadas.deletedCount}`);
    
    // 2. Obtener jugadores con equipos asignados
    const jugadores = await Jugador.find({
      'estadisticasPorEquipo.0': { $exists: true }
    });
    console.log(`\n👥 Jugadores encontrados: ${jugadores.length}`);
    
    // 3. Obtener equipos
    const equipos = await Equipo.find({});
    console.log(`🏆 Equipos encontrados: ${equipos.length}`);
    
    // 4. Obtener eventos
    const eventos = await Evento.find({});
    console.log(`📅 Eventos encontrados: ${eventos.length}`);
    
    if (eventos.length === 0) {
      console.log('⚠️  No hay eventos en la base de datos. Creando evento de ejemplo...');
      
      const eventoEjemplo = new Evento({
        titulo: 'Torneo Dodgeball 2024',
        descripcion: 'Torneo principal de dodgeball',
        tipo: 'torneo',
        fechaInicio: new Date('2024-10-01'),
        fechaFin: new Date('2024-10-31'),
        ubicacion: 'Gimnasio Principal',
        activo: true
      });
      
      await eventoEjemplo.save();
      console.log(`✅ Evento creado: ${eventoEjemplo._id}`);
      eventos.push(eventoEjemplo);
    }
    
    // 5. Crear estadísticas para cada jugador
    console.log('\n📊 Creando estadísticas...');
    let estadisticasCreadas = 0;
    let errores = 0;
    
    for (const jugador of jugadores) {
      try {
        const equipoInfo = jugador.estadisticasPorEquipo[0];
        if (!equipoInfo) continue;
        
        // Buscar el equipo en la base de datos
        const equipo = equipos.find(e => e.nombre === equipoInfo.nombreEquipo);
        if (!equipo) {
          console.log(`⚠️  Equipo no encontrado: ${equipoInfo.nombreEquipo}`);
          continue;
        }
        
        // Crear estadística para cada evento
        for (const evento of eventos) {
          const estadistica = new Estadistica({
            jugador: jugador._id,
            equipo: equipo._id,
            evento: evento._id,
            temporada: '2024-2025',
            setsJugados: jugador.estadisticasGenerales?.setsJugados || 0,
            tirosTotales: jugador.estadisticasGenerales?.tirosTotales || 0,
            hits: jugador.estadisticasGenerales?.hits || 0,
            quemados: jugador.estadisticasGenerales?.quemados || 0,
            asistencias: jugador.estadisticasGenerales?.asistencias || 0,
            tirosRecibidos: jugador.estadisticasGenerales?.tirosRecibidos || 0,
            hitsRecibidos: jugador.estadisticasGenerales?.hitsRecibidos || 0,
            esquives: jugador.estadisticasGenerales?.esquives || 0,
            esquivesSinEsfuerzo: jugador.estadisticasGenerales?.esquivesSinEsfuerzo || 0,
            ponchado: jugador.estadisticasGenerales?.ponchado || 0,
            catchesIntentados: jugador.estadisticasGenerales?.catchesIntentados || 0,
            catches: jugador.estadisticasGenerales?.catches || 0,
            bloqueosIntentados: jugador.estadisticasGenerales?.bloqueosIntentados || 0,
            bloqueos: jugador.estadisticasGenerales?.bloqueos || 0,
            pisoLinea: jugador.estadisticasGenerales?.pisoLinea || 0,
            catchesRecibidos: jugador.estadisticasGenerales?.catchesRecibidos || 0,
            porcentajeHits: jugador.estadisticasGenerales?.porcentajeHits || 0,
            porcentajeOuts: jugador.estadisticasGenerales?.porcentajeOuts || 0,
            porcentajeCatches: jugador.estadisticasGenerales?.porcentajeCatches || 0,
            porcentajeBloqueos: jugador.estadisticasGenerales?.porcentajeBloqueos || 0,
            indiceAtaque: jugador.estadisticasGenerales?.indiceAtaque || 0,
            indiceDefensa: jugador.estadisticasGenerales?.indiceDefensa || 0,
            indicePoder: jugador.estadisticasGenerales?.indicePoder || 0,
            activo: true
          });
          
          await estadistica.save();
          estadisticasCreadas++;
        }
        
        console.log(`✅ Estadísticas creadas para ${jugador.nombre} ${jugador.apellido}`);
        
      } catch (error) {
        errores++;
        console.error(`❌ Error creando estadísticas para ${jugador.nombre} ${jugador.apellido}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumen del procesamiento:');
    console.log(`✅ Estadísticas creadas: ${estadisticasCreadas}`);
    console.log(`❌ Errores: ${errores}`);
    
    // 6. Verificar las estadísticas creadas
    console.log('\n🔍 Verificando estadísticas creadas...');
    const estadisticasVerificacion = await Estadistica.find({})
      .populate('jugador', 'nombre apellido')
      .populate('equipo', 'nombre')
      .populate('evento', 'titulo');
    
    console.log(`📈 Total de estadísticas: ${estadisticasVerificacion.length}`);
    
    // Agrupar por equipo
    const estadisticasPorEquipo = {};
    estadisticasVerificacion.forEach(est => {
      const equipoNombre = est.equipo?.nombre || 'Sin equipo';
      if (!estadisticasPorEquipo[equipoNombre]) {
        estadisticasPorEquipo[equipoNombre] = 0;
      }
      estadisticasPorEquipo[equipoNombre]++;
    });
    
    console.log('\n📋 Estadísticas por equipo:');
    Object.entries(estadisticasPorEquipo).forEach(([equipo, cantidad]) => {
      console.log(`  ${equipo}: ${cantidad} estadísticas`);
    });
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

limpiarYRecrearEstadisticas();
