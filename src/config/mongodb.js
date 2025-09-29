const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    // Para Railway, usar las variables de entorno específicas de MongoDB
    let mongoUri;
    
    if (process.env.MONGODB_URI) {
      // Si MONGODB_URI está configurada, usarla
      mongoUri = process.env.MONGODB_URI;
    } else if (process.env.MONGO_URL) {
      // Railway usa MONGO_URL por defecto
      mongoUri = process.env.MONGO_URL;
    } else if (process.env.MONGOHOST && process.env.MONGOUSER && process.env.MONGOPASSWORD) {
      // Construir URL desde variables individuales de Railway
      const host = process.env.MONGOHOST;
      const port = process.env.MONGOPORT || '27017';
      const user = process.env.MONGOUSER;
      const password = process.env.MONGOPASSWORD;
      const database = process.env.MONGODATABASE || 'dodgeball-club';
      
      mongoUri = `mongodb://${user}:${password}@${host}:${port}/${database}`;
    } else {
      throw new Error('No se encontró configuración de MongoDB. Verifica las variables de entorno.');
    }

    console.log('🔗 Conectando a MongoDB...');
    console.log('📍 Host:', process.env.MONGOHOST || 'No especificado');
    console.log('🗄️  Base de datos:', process.env.MONGODATABASE || 'dodgeball-club');

    // Opciones de conexión optimizadas para Railway
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    };

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    
    // En producción, reintentar conexión
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Reintentando conexión en 5 segundos...');
      setTimeout(() => {
        conectarDB();
      }, 5000);
    } else {
      console.log('💡 Variables de entorno disponibles:');
      console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
      console.log('- MONGO_URL:', process.env.MONGO_URL ? 'Configurada' : 'No configurada');
      console.log('- MONGOHOST:', process.env.MONGOHOST || 'No configurada');
      console.log('- MONGOUSER:', process.env.MONGOUSER || 'No configurada');
      console.log('- MONGOPASSWORD:', process.env.MONGOPASSWORD ? 'Configurada' : 'No configurada');
      process.exit(1);
    }
  }
};

module.exports = conectarDB;
