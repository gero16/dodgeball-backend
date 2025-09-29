const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
const Publicacion = require('../src/models/Publicacion');
require('dotenv').config();

async function migrarEventos() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar publicaciones que son eventos
    const publicacionesEventos = await Publicacion.find({ 
      categoria: 'eventos',
      activa: true 
    });

    console.log(`Encontradas ${publicacionesEventos.length} publicaciones de eventos para migrar`);

    for (const publicacion of publicacionesEventos) {
      // Crear evento basado en la publicacion
      const eventoData = {
        titulo: publicacion.titulo,
        descripcion: publicacion.contenido,
        fecha: new Date(publicacion.fechaPublicacion),
        fechaFin: publicacion.fechaFin ? new Date(publicacion.fechaFin) : new Date(publicacion.fechaPublicacion),
        horaInicio: '09:00', // Hora por defecto
        horaFin: '18:00',    // Hora por defecto
        ubicacion: {
          nombre: publicacion.ubicacion || 'Por definir',
          direccion: 'Por definir',
          coordenadas: {
            lat: -34.9011, // Montevideo por defecto
            lng: -56.1645
          }
        },
        tipo: 'evento',
        categoria: 'mixto',
        precio: 0,
        cupoMaximo: 100,
        cupoDisponible: 100,
        imagen: publicacion.imagen,
        destacado: publicacion.destacada,
        activo: true,
        requisitos: [],
        organizador: publicacion.autor
      };

      // Crear el evento
      const evento = new Evento(eventoData);
      await evento.save();
      
      console.log(`✅ Migrado: ${publicacion.titulo}`);

      // Marcar la publicacion como inactiva para evitar duplicados
      await Publicacion.findByIdAndUpdate(publicacion._id, { 
        activa: false,
        migrado: true 
      });
    }

    console.log('✅ Migración completada exitosamente');
    
    // Mostrar resumen
    const totalEventos = await Evento.countDocuments({ activo: true });
    console.log(`Total de eventos activos: ${totalEventos}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

migrarEventos();
