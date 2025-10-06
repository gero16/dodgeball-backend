const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const productoRoutes = require('./routes/productoRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const partidoRoutes = require('./routes/partidoRoutes');

const app = express();

// Confiar en proxies (necesario para Railway, Heroku, etc.)
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(helmet());

// Middleware de compresión
app.use(compression());

// Middleware de logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);

// Configuración de CORS para permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:5173',    // Vite dev server
  'http://localhost:3000',    // React dev server
  'http://localhost:8080',    // Otro puerto común
  'https://dodgeball-kappa.vercel.app',  // Tu dominio de producción en Vercel
  'https://tu-frontend.com',  // Tu dominio de producción
  process.env.FRONTEND_URL     // Variable de entorno
].filter(Boolean); // Eliminar valores undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    // En desarrollo, ser más permisivo
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api/usuario', usuarioRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API del Dodgeball Club',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuario',
      publicaciones: '/api/publicaciones',
      eventos: '/api/eventos',
      productos: '/api/productos',
      donaciones: '/api/donaciones',
      horarios: '/api/horarios',
      contacto: '/api/contacto',
      jugadores: '/api/jugadores',
      equipos: '/api/equipos',
      partidos: '/api/partidos',
      salud: '/api/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Error de CORS
  if (error.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origen no permitido por CORS'
    });
  }
  
  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    const mensajes = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: mensajes
    });
  }

  // Error de duplicado de Mongoose
  if (error.code === 11000) {
    const campo = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${campo} ya existe`
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

module.exports = app;
