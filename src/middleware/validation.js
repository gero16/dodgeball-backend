const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para usuario
const validateUsuario = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('telefono')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Formato de teléfono inválido'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
  
  handleValidationErrors
];

// Validaciones para publicaciones
const validatePublicacion = [
  body('titulo')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  
  body('contenido')
    .trim()
    .isLength({ min: 10 })
    .withMessage('El contenido debe tener al menos 10 caracteres'),
  
  body('categoria')
    .isIn(['noticias', 'eventos', 'torneos', 'entrenamientos', 'general'])
    .withMessage('Categoría inválida'),
  
  body('etiquetas')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
  
  handleValidationErrors
];

// Validaciones para eventos
const validateEvento = [
  body('titulo')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  
  body('descripcion')
    .trim()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  body('horaInicio')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido (HH:MM)'),
  
  body('horaFin')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido (HH:MM)'),
  
  body('tipo')
    .isIn(['torneo', 'entrenamiento', 'liga', 'social', 'benefico', 'campeonato', 'practica', 'casual', 'no-deportivo'])
    .withMessage('Tipo de evento inválido'),
  
  body('cupoMaximo')
    .isInt({ min: 1 })
    .withMessage('El cupo máximo debe ser un número mayor a 0'),
  
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('El precio no puede ser negativo'),

  // Campos opcionales adicionales
  body('tipoJuego')
    .optional()
    .isIn(['foam', 'cloth'])
    .withMessage('El tipo de juego debe ser "foam" o "cloth"'),

  body('dificultad')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La dificultad debe ser baja, media o alta'),

  body('requisitos')
    .optional()
    .isArray()
    .withMessage('Los requisitos deben ser un arreglo'),
  body('requisitos.*')
    .optional()
    .isString()
    .withMessage('Cada requisito debe ser texto'),
  
  handleValidationErrors
];

// Validaciones para productos
const validateProducto = [
  body('nombre')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('descripcion')
    .trim()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('El precio no puede ser negativo'),
  
  body('categoria')
    .isIn(['camisetas', 'pelotas', 'accesorios', 'equipamiento', 'merchandising'])
    .withMessage('Categoría inválida'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock no puede ser negativo'),
  
  handleValidationErrors
];

// Validaciones para donaciones
const validateDonacion = [
  body('donante.nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del donante debe tener entre 2 y 100 caracteres'),
  
  body('donante.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('monto')
    .isFloat({ min: 1 })
    .withMessage('El monto debe ser mayor a 0'),
  
  body('metodoPago')
    .isIn(['paypal', 'stripe', 'transferencia'])
    .withMessage('Método de pago inválido'),
  
  body('mensaje')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El mensaje no puede tener más de 500 caracteres'),
  
  handleValidationErrors
];

// Validaciones para contacto
const validateContacto = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('asunto')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El asunto debe tener entre 5 y 200 caracteres'),
  
  body('mensaje')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('El mensaje debe tener entre 5 y 2000 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['consulta', 'sugerencia', 'queja', 'soporte', 'general'])
    .withMessage('Tipo de mensaje inválido'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUsuario,
  validateLogin,
  validatePublicacion,
  validateEvento,
  validateProducto,
  validateDonacion,
  validateContacto
};
