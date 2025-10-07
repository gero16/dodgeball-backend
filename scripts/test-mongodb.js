const mongoose = require('mongoose');

// Configuración de MongoDB - puedes cambiar esta URL por la de MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dodgeball-club';

async function testMongoDB() {
  try {
    console.log('🔍 Probando conexión a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conexión exitosa a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Puerto:', mongoose.connection.port);
    
    // Probar operaciones básicas
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Colecciones encontradas: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Colecciones:');
      collections.forEach(col => console.log(`  - ${col.name}`));
    }
    
    console.log('\n✅ Prueba de conexión completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Asegúrate de que MongoDB esté ejecutándose localmente');
      console.log('2. O configura MongoDB Atlas en tu archivo .env');
      console.log('3. Ejecuta: sudo systemctl start mongod (en Linux)');
      console.log('4. O instala MongoDB: https://docs.mongodb.com/manual/installation/');
    }
    
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testMongoDB();
