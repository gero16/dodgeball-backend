const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
require('dotenv').config();

async function corregirDatosFinal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar eventos de torneo con datos de participación
    const eventos = await Evento.find({ 
      tipo: 'torneo', 
      'datosEspecificos.participacion': { $exists: true } 
    });

    console.log(`Encontrados ${eventos.length} eventos de participación`);

    for (const evento of eventos) {
      const participacion = evento.datosEspecificos.participacion;
      
      // Determinar el equipo local basado en el país
      const equipoLocal = participacion.pais === 'Uruguay' ? 'Uruguay' : participacion.pais;
      
      console.log(`\nProcesando: ${evento.titulo}`);
      console.log(`País: ${participacion.pais}`);
      console.log(`Equipo Local: ${equipoLocal}`);
      
      // Actualizar los resultados preservando todos los campos existentes
      if (participacion.resultados && participacion.resultados.length > 0) {
        participacion.resultados = participacion.resultados.map(resultado => {
          return {
            ...resultado,
            equipoLocal: equipoLocal
          };
        });
      }

      // Agregar campo equipoLocal a nivel de participación
      participacion.equipoLocal = equipoLocal;

      // Actualizar el evento
      await Evento.findByIdAndUpdate(evento._id, {
        $set: { 'datosEspecificos.participacion': participacion }
      });

      console.log(`✅ Actualizado: ${evento.titulo}`);
    }

    console.log('\n✅ Corrección final completada');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

corregirDatosFinal();
