const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
require('dotenv').config();

async function crearEventosPanamericanos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const eventosPanamericanos = [
      {
        titulo: "Panamericano de Dodgeball 2023 - Argentina",
        descripcion: "Uruguay participó en el Campeonato Panamericano de Dodgeball 2023 celebrado en Buenos Aires, Argentina. Este fue un evento histórico para el deporte en nuestro país, ya que fue la primera participación oficial de Uruguay en un torneo internacional de esta magnitud. El equipo nacional compitió en las categorías de foam masculino y femenino, enfrentándose a equipos de Argentina, Brasil, Chile, Colombia, México y Estados Unidos. Aunque no logramos medallas, la experiencia fue invaluable para el desarrollo del deporte y establecimos importantes contactos con otras federaciones del continente.",
        fecha: new Date('2023-06-15'),
        fechaFin: new Date('2023-06-18'),
        horaInicio: '09:00',
        horaFin: '18:00',
        ubicacion: {
          nombre: 'Polideportivo Municipal',
          direccion: 'Buenos Aires, Argentina',
          coordenadas: {
            lat: -34.6037,
            lng: -58.3816
          }
        },
        tipo: 'torneo',
        categoria: 'mixto',
        precio: 0,
        cupoMaximo: 100,
        cupoDisponible: 100,
        imagen: 'https://res.cloudinary.com/geronicola/image/upload/v1759184213/dodgeball/qrsakyltv6uuk2esyecg.jpg',
        destacado: true,
        activo: true,
        requisitos: [
          'Ser miembro de la selección nacional',
          'Certificado médico vigente',
          'Equipamiento deportivo oficial'
        ]
      },
      {
        titulo: "Panamericano de Dodgeball 2025 - Colombia",
        descripcion: "Uruguay participó en el Campeonato Panamericano de Dodgeball 2025 en Chía-Sopó, Colombia, mostrando una notable evolución respecto a su primera participación en 2023. El equipo nacional compitió en las categorías de foam masculino y femenino, además de participar en la categoría de foam mixto. En esta edición, nuestro equipo masculino logró clasificar a octavos de final, superando las expectativas y demostrando el crecimiento del deporte en Uruguay. El torneo contó con la participación de 12 países del continente americano.",
        fecha: new Date('2025-01-08'),
        fechaFin: new Date('2025-01-12'),
        horaInicio: '09:00',
        horaFin: '18:00',
        ubicacion: {
          nombre: 'Coliseo Deportivo',
          direccion: 'Chía-Sopó, Colombia',
          coordenadas: {
            lat: 4.6097,
            lng: -74.0817
          }
        },
        tipo: 'torneo',
        categoria: 'mixto',
        precio: 0,
        cupoMaximo: 100,
        cupoDisponible: 100,
        imagen: 'https://res.cloudinary.com/geronicola/image/upload/v1759184336/dodgeball/jwh57qwy7wplfqeuf9zi.jpg',
        destacado: true,
        activo: true,
        requisitos: [
          'Ser miembro de la selección nacional',
          'Certificado médico vigente',
          'Equipamiento deportivo oficial'
        ]
      }
    ];

    for (const eventoData of eventosPanamericanos) {
      // Verificar si ya existe
      const existe = await Evento.findOne({ titulo: eventoData.titulo });
      if (existe) {
        console.log(`⚠️  Ya existe: ${eventoData.titulo}`);
        continue;
      }

      const evento = new Evento(eventoData);
      await evento.save();
      console.log(`✅ Creado: ${eventoData.titulo}`);
    }

    // Mostrar resumen
    const totalEventos = await Evento.countDocuments({ activo: true });
    console.log(`\n✅ Total de eventos activos: ${totalEventos}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

crearEventosPanamericanos();
