/**
 * Carga las publicaciones de Instagram que estaban hardcodeadas en Index.jsx.
 * Idempotente: no duplica URLs ya existentes.
 *
 * Uso: node scripts/seed-instagram.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const PublicacionInstagram = require('../src/models/PublicacionInstagram');

const SEED = [
  { url: 'https://www.instagram.com/p/DYvK1QjRgn2/', orden: 0, titulo: '' },
  { url: 'https://www.instagram.com/p/DYl69DURw4c/', orden: 1, titulo: '' },
  { url: 'https://www.instagram.com/reel/DXZmOoWEaMq/', orden: 2, titulo: '' }
];

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGODB_URI);
    console.log('MongoDB conectado');

    let creadas = 0;
    let existentes = 0;

    for (const item of SEED) {
      const found = await PublicacionInstagram.findOne({ url: item.url });
      if (found) {
        existentes += 1;
        if (!found.activa) {
          found.activa = true;
          found.orden = item.orden;
          await found.save();
          console.log(`Reactivada: ${item.url}`);
        } else {
          console.log(`Ya existe: ${item.url}`);
        }
        continue;
      }
      await PublicacionInstagram.create({ ...item, activa: true });
      creadas += 1;
      console.log(`Creada: ${item.url}`);
    }

    console.log(`Listo. Creadas: ${creadas}, existentes: ${existentes}`);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

main();
