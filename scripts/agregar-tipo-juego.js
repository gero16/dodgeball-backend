const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo de Evento
const Evento = require('../src/models/Evento');

async function agregarTipoJuego() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball-uruguay');
    console.log('Conectado a MongoDB');

    // Actualizar todos los eventos existentes para agregar tipoJuego: 'foam'
    const resultado = await Evento.updateMany(
      { tipoJuego: { $exists: false } }, // Buscar eventos que no tengan el campo tipoJuego
      { $set: { tipoJuego: 'foam' } }    // Agregar tipoJuego: 'foam'
    );

    console.log(`✅ Actualizados ${resultado.modifiedCount} eventos con tipoJuego: 'foam'`);

    // Verificar que todos los eventos ahora tienen el campo tipoJuego
    const eventosSinTipoJuego = await Evento.countDocuments({ tipoJuego: { $exists: false } });
    console.log(`📊 Eventos sin tipoJuego: ${eventosSinTipoJuego}`);

    // Mostrar algunos ejemplos de eventos actualizados
    const eventosEjemplo = await Evento.find({}, { titulo: 1, tipoJuego: 1, tipo: 1 }).limit(5);
    console.log('\n📋 Ejemplos de eventos actualizados:');
    eventosEjemplo.forEach(evento => {
      console.log(`- ${evento.titulo} (${evento.tipo}) - Tipo: ${evento.tipoJuego}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
agregarTipoJuego();
