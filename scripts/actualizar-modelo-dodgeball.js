const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
require('dotenv').config();

async function actualizarModeloDodgeball() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar todos los eventos con datos de liga
    const eventos = await Evento.find({ 
      'datosEspecificos.liga': { $exists: true } 
    });

    console.log(`Actualizando ${eventos.length} eventos de liga`);

    for (const evento of eventos) {
      const liga = evento.datosEspecificos.liga;
      
      // Actualizar equipos con terminología de dodgeball
      if (liga.equipos && liga.equipos.length > 0) {
        liga.equipos = liga.equipos.map(equipo => ({
          ...equipo,
          setsFavor: equipo.setsFavor || equipo.golesFavor || 0,
          setsContra: equipo.setsContra || equipo.golesContra || 0,
          diferenciaSets: equipo.diferenciaSets || equipo.diferenciaGoles || 0,
          eliminaciones: equipo.eliminaciones || 0,
          setsGanados: equipo.setsGanados || 0,
          setsPerdidos: equipo.setsPerdidos || 0
        }));
      }

      // Actualizar partidos con terminología de dodgeball
      if (liga.partidos && liga.partidos.length > 0) {
        liga.partidos = liga.partidos.map(partido => ({
          ...partido,
          setsLocal: partido.setsLocal || partido.golesLocal || 0,
          setsVisitante: partido.setsVisitante || partido.golesVisitante || 0,
          eliminacionesLocal: partido.eliminacionesLocal || 0,
          eliminacionesVisitante: partido.eliminacionesVisitante || 0
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

    console.log(`\nActualizando ${eventosParticipacion.length} eventos de participación`);

    for (const evento of eventosParticipacion) {
      const participacion = evento.datosEspecificos.participacion;
      
      // Actualizar estadísticas con terminología de dodgeball
      if (participacion.estadisticas) {
        participacion.estadisticas = {
          ...participacion.estadisticas,
          setsFavor: participacion.estadisticas.setsFavor || participacion.estadisticas.golesFavor || 0,
          setsContra: participacion.estadisticas.setsContra || participacion.estadisticas.golesContra || 0,
          setsGanados: participacion.estadisticas.setsGanados || 0,
          setsPerdidos: participacion.estadisticas.setsPerdidos || 0,
          eliminaciones: participacion.estadisticas.eliminaciones || 0
        };
      }

      // Actualizar el evento
      await Evento.findByIdAndUpdate(evento._id, {
        $set: { 'datosEspecificos.participacion': participacion }
      });

      console.log(`✅ Actualizado: ${evento.titulo}`);
    }

    console.log('\n✅ Actualización del modelo completada');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

actualizarModeloDodgeball();
