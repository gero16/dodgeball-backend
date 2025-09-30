const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
require('dotenv').config();

async function actualizarTerminologiaDodgeball() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar eventos con datos de liga
    const eventos = await Evento.find({ 
      'datosEspecificos.liga': { $exists: true } 
    });

    console.log(`Encontrados ${eventos.length} eventos de liga`);

    for (const evento of eventos) {
      const liga = evento.datosEspecificos.liga;
      
      // Actualizar equipos
      if (liga.equipos && liga.equipos.length > 0) {
        liga.equipos = liga.equipos.map(equipo => ({
          ...equipo,
          setsFavor: equipo.golesFavor || 0,
          setsContra: equipo.golesContra || 0,
          diferenciaSets: equipo.diferenciaGoles || 0
        }));
      }

      // Actualizar partidos
      if (liga.partidos && liga.partidos.length > 0) {
        liga.partidos = liga.partidos.map(partido => ({
          ...partido,
          setsLocal: partido.golesLocal || 0,
          setsVisitante: partido.golesVisitante || 0
        }));
      }

      // Actualizar el evento
      await Evento.findByIdAndUpdate(evento._id, {
        $set: { 'datosEspecificos.liga': liga }
      });

      console.log(`✅ Actualizado: ${evento.titulo}`);
    }

    // Buscar eventos con datos de participación
    const eventosParticipacion = await Evento.find({ 
      'datosEspecificos.participacion': { $exists: true } 
    });

    console.log(`\nEncontrados ${eventosParticipacion.length} eventos de participación`);

    for (const evento of eventosParticipacion) {
      const participacion = evento.datosEspecificos.participacion;
      
      // Actualizar estadísticas
      if (participacion.estadisticas) {
        participacion.estadisticas = {
          ...participacion.estadisticas,
          setsFavor: participacion.estadisticas.golesFavor || 0,
          setsContra: participacion.estadisticas.golesContra || 0
        };
      }

      // Actualizar el evento
      await Evento.findByIdAndUpdate(evento._id, {
        $set: { 'datosEspecificos.participacion': participacion }
      });

      console.log(`✅ Actualizado: ${evento.titulo}`);
    }

    console.log('\n✅ Actualización de terminología completada');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

actualizarTerminologiaDodgeball();
