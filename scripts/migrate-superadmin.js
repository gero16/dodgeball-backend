/**
 * Migra roles admin → superadmin.
 * Los admins existentes pasan a superadmin; el rol admin queda
 * disponible para operadores con menos permisos.
 *
 * Uso: npm run migrate-superadmin
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Usuario = require('../src/models/Usuario');

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGODB_URI);
    console.log('MongoDB conectado');

    const result = await Usuario.updateMany(
      { rol: 'admin' },
      { $set: { rol: 'superadmin' } }
    );

    console.log(`Migrados ${result.modifiedCount} usuario(s) de admin → superadmin`);
    console.log('Listo. Pediles a esos usuarios que cierren sesión y vuelvan a entrar.');
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

main();
