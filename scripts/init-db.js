const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const Usuario = require('../src/models/Usuario');
const Publicacion = require('../src/models/Publicacion');
const Evento = require('../src/models/Evento');
const Producto = require('../src/models/Producto');

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

const inicializarDatos = async () => {
  try {
    // Crear usuario administrador
    const adminExiste = await Usuario.findOne({ email: 'admin@dodgeball.com' });
    if (!adminExiste) {
      const admin = new Usuario({
        nombre: 'Administrador',
        email: 'admin@dodgeball.com',
        password: 'admin123',
        rol: 'admin',
        telefono: '+1234567890'
      });
      await admin.save();
      console.log('Usuario administrador creado');
    }

    // Crear publicaciones de ejemplo
    const publicacionesExistentes = await Publicacion.countDocuments();
    if (publicacionesExistentes === 0) {
      const admin = await Usuario.findOne({ email: 'admin@dodgeball.com' });
      
      const publicaciones = [
        {
          titulo: 'Bienvenidos al Dodgeball Club',
          contenido: '¡Bienvenidos a nuestro club de dodgeball! Aquí encontrarás toda la información sobre entrenamientos, eventos y torneos.',
          resumen: 'Mensaje de bienvenida al club',
          categoria: 'noticias',
          etiquetas: ['bienvenida', 'club'],
          autor: admin._id,
          destacada: true
        },
        {
          titulo: 'Próximo Torneo de Primavera',
          contenido: 'El torneo de primavera se realizará el próximo mes. ¡Inscríbete ya!',
          resumen: 'Información sobre el torneo de primavera',
          categoria: 'torneos',
          etiquetas: ['torneo', 'primavera'],
          autor: admin._id,
          destacada: true
        }
      ];

      for (const pub of publicaciones) {
        const publicacion = new Publicacion(pub);
        await publicacion.save();
      }
      console.log('Publicaciones de ejemplo creadas');
    }

    // Crear eventos de ejemplo
    const eventosExistentes = await Evento.countDocuments();
    if (eventosExistentes === 0) {
      const admin = await Usuario.findOne({ email: 'admin@dodgeball.com' });
      
      const eventos = [
        {
          titulo: 'Entrenamiento Semanal',
          descripcion: 'Entrenamiento regular todos los miércoles',
          fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próxima semana
          horaInicio: '18:00',
          horaFin: '20:00',
          ubicacion: {
            nombre: 'Cancha Principal',
            direccion: '123 Calle Principal'
          },
          tipo: 'entrenamiento',
          cupoMaximo: 20,
          cupoDisponible: 20,
          precio: 10,
          organizador: admin._id
        },
        {
          titulo: 'Torneo de Verano',
          descripcion: 'Gran torneo de verano con premios',
          fecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // En un mes
          horaInicio: '09:00',
          horaFin: '17:00',
          ubicacion: {
            nombre: 'Complejo Deportivo',
            direccion: '456 Avenida Deportiva'
          },
          tipo: 'torneo',
          cupoMaximo: 50,
          cupoDisponible: 50,
          precio: 25,
          organizador: admin._id,
          destacado: true
        }
      ];

      for (const evt of eventos) {
        const evento = new Evento(evt);
        await evento.save();
      }
      console.log('Eventos de ejemplo creados');
    }

    // Crear productos de ejemplo
    const productosExistentes = await Producto.countDocuments();
    if (productosExistentes === 0) {
      const productos = [
        {
          nombre: 'Camiseta Oficial',
          descripcion: 'Camiseta oficial del Dodgeball Club',
          precio: 25.99,
          categoria: 'camisetas',
          tallas: ['S', 'M', 'L', 'XL'],
          colores: [
            { nombre: 'Azul', codigo: '#0066CC' },
            { nombre: 'Rojo', codigo: '#CC0000' }
          ],
          stock: 50,
          sku: 'CAM-001',
          etiquetas: ['oficial', 'club'],
          destacado: true
        },
        {
          nombre: 'Pelota de Dodgeball',
          descripcion: 'Pelota oficial de dodgeball',
          precio: 15.99,
          categoria: 'pelotas',
          stock: 30,
          sku: 'PEL-001',
          etiquetas: ['oficial', 'pelota'],
          destacado: true
        }
      ];

      for (const prod of productos) {
        const producto = new Producto(prod);
        await producto.save();
      }
      console.log('Productos de ejemplo creados');
    }

    console.log('Inicialización completada');
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
};

const main = async () => {
  await conectarDB();
  await inicializarDatos();
  process.exit(0);
};

main();
