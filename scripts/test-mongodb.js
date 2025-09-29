const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión a MongoDB (Railway)...');
    
    // Verificar variables de entorno disponibles
    console.log('\n📋 Variables de entorno disponibles:');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurada' : '❌ No configurada');
    console.log('- MONGO_URL:', process.env.MONGO_URL ? '✅ Configurada' : '❌ No configurada');
    console.log('- MONGOHOST:', process.env.MONGOHOST || '❌ No configurada');
    console.log('- MONGOUSER:', process.env.MONGOUSER || '❌ No configurada');
    console.log('- MONGOPASSWORD:', process.env.MONGOPASSWORD ? '✅ Configurada' : '❌ No configurada');
    console.log('- MONGOPORT:', process.env.MONGOPORT || '27017 (default)');
    console.log('- MONGODATABASE:', process.env.MONGODATABASE || 'dodgeball-club (default)');
    
    // Determinar qué URL usar
    let mongoUri;
    
    if (process.env.MONGODB_URI) {
      mongoUri = process.env.MONGODB_URI;
      console.log('\n🔗 Usando MONGODB_URI');
    } else if (process.env.MONGO_URL) {
      mongoUri = process.env.MONGO_URL;
      console.log('\n🔗 Usando MONGO_URL');
    } else if (process.env.MONGOHOST && process.env.MONGOUSER && process.env.MONGOPASSWORD) {
      const host = process.env.MONGOHOST;
      const port = process.env.MONGOPORT || '27017';
      const user = process.env.MONGOUSER;
      const password = process.env.MONGOPASSWORD;
      const database = process.env.MONGODATABASE || 'dodgeball-club';
      
      mongoUri = `mongodb://${user}:${password}@${host}:${port}/${database}`;
      console.log('\n🔗 Construyendo URL desde variables individuales');
    } else {
      throw new Error('No se encontró configuración de MongoDB');
    }

    console.log('\n🚀 Conectando...');
    
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Base de datos: ${conn.connection.name}`);
    console.log(`🔗 Estado: ${conn.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);

    // Probar una operación simple
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📋 Colecciones encontradas: ${collections.length}`);

    await mongoose.disconnect();
    console.log('✅ Conexión cerrada correctamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Sugerencia: Verifica que MONGOHOST esté configurado correctamente');
    } else if (error.message.includes('Authentication failed')) {
      console.log('💡 Sugerencia: Verifica MONGOUSER y MONGOPASSWORD');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Sugerencia: Verifica que el servicio MongoDB esté ejecutándose en Railway');
    } else if (error.message.includes('No se encontró configuración')) {
      console.log('💡 Sugerencia: Configura las variables de entorno de MongoDB en Railway');
    }
    
    process.exit(1);
  }
};

testConnection();
