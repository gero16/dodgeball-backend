const mongoose = require('mongoose');

const donacionSchema = new mongoose.Schema({
  donante: {
    nombre: {
      type: String,
      required: [true, 'El nombre del donante es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email del donante es obligatorio'],
      lowercase: true,
      trim: true
    },
    telefono: {
      type: String,
      trim: true
    },
    anonimo: {
      type: Boolean,
      default: false
    }
  },
  monto: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
    min: [1, 'El monto debe ser mayor a 0']
  },
  moneda: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'MXN', 'CLP', 'ARS', 'UYU']
  },
  metodoPago: {
    type: String,
    required: [true, 'El método de pago es obligatorio'],
    enum: ['paypal', 'stripe', 'transferencia', 'mercadopago']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'completada', 'fallida', 'cancelada'],
    default: 'pendiente'
  },
  transaccionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paypalOrderId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Datos de Mercado Pago
  mercadoPagoPreferenceId: {
    type: String,
    index: true
  },
  mercadoPagoPaymentId: {
    type: String,
    index: true
  },
  mercadoPagoStatus: {
    type: String
  },
  mensaje: {
    type: String,
    maxlength: [500, 'El mensaje no puede tener más de 500 caracteres']
  },
  proposito: {
    type: String,
    enum: ['equipamiento', 'instalaciones', 'eventos', 'general'],
    default: 'general'
  },
  fechaPago: {
    type: Date
  },
  comprobante: {
    type: String
  },
  procesado: {
    type: Boolean,
    default: false
  },
  fechaProcesamiento: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
donacionSchema.index({ 'donante.email': 1 });
donacionSchema.index({ estado: 1, fechaPago: -1 });
// Removemos el índice duplicado de transaccionId ya que está definido como unique arriba

module.exports = mongoose.model('Donacion', donacionSchema);
