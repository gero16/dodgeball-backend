const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinaryLib = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Crear directorio de uploads si no existe
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Determinar si Cloudinary está configurado
const isCloudinaryEnabled = !!(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

let storage;

if (isCloudinaryEnabled) {
  // Configurar Cloudinary
  cloudinaryLib.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  // Almacenar en Cloudinary con carpeta por tipo
  storage = new CloudinaryStorage({
    cloudinary: cloudinaryLib,
    params: async (req, file) => {
      let subfolder = process.env.CLOUDINARY_FOLDER || 'dodgeball/uploads';
      if (req.route?.path?.includes('publicaciones')) {
        subfolder = `${subfolder}/publicaciones`;
      } else if (req.route?.path?.includes('eventos')) {
        subfolder = `${subfolder}/eventos`;
      } else if (req.route?.path?.includes('productos')) {
        subfolder = `${subfolder}/productos`;
      } else if (req.route?.path?.includes('usuarios')) {
        subfolder = `${subfolder}/usuarios`;
      }

      return {
        folder: subfolder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        use_filename: true,
        unique_filename: true,
        overwrite: false
      };
    }
  });
} else {
  // Fallback: almacenamiento local
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let subfolder = 'general';
      
      // Determinar subcarpeta según el tipo de archivo
      if (req.route?.path?.includes('publicaciones')) {
        subfolder = 'publicaciones';
      } else if (req.route?.path?.includes('eventos')) {
        subfolder = 'eventos';
      } else if (req.route?.path?.includes('productos')) {
        subfolder = 'productos';
      } else if (req.route?.path?.includes('usuarios')) {
        subfolder = 'usuarios';
      }
      
      const fullPath = path.join(uploadDir, subfolder);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      // Generar nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
}

// Filtro de archivos (limitado a imágenes si Cloudinary está habilitado)
const fileFilter = (req, file, cb) => {
  if (isCloudinaryEnabled) {
    const allowedImage = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImage.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImage.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    return cb(new Error('Tipo de archivo no permitido. Solo imágenes (jpg, jpeg, png, gif, webp).'));
  }

  // Local: permitir también documentos
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/csv';

  if (mimetype && extname) return cb(null, true);
  cb(new Error('Tipo de archivo no permitido.'));
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
    files: 5 // Máximo 5 archivos por request
  },
  fileFilter: fileFilter
});

// Middleware para manejar errores de multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo permitido: 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo permitido: 5 archivos'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleUploadError
};
