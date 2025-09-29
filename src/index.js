const app = require('./app');
const conectarDB = require('./config/mongodb');
const http = require('http');
const { Server } = require('socket.io');

// Conectar a la base de datos
conectarDB();

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Manejar conexiones de Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a una sala específica
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Usuario ${socket.id} se unió a la sala ${room}`);
  });

  // Salir de una sala
  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`Usuario ${socket.id} salió de la sala ${room}`);
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Hacer io disponible globalmente
app.set('io', io);

// Obtener puerto del entorno o usar 3000 por defecto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🗄️  Base de datos: ${process.env.MONGODB_URI ? 'Configurada' : 'No configurada'}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.error('Error no manejado:', err);
  if (process.env.NODE_ENV === 'production') {
    console.log('Reiniciando servidor...');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  } else {
    server.close(() => {
      process.exit(1);
    });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  if (process.env.NODE_ENV === 'production') {
    console.log('Reiniciando servidor...');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  } else {
    process.exit(1);
  }
});

// Manejar cierre graceful del servidor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
