const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  precioDescuento: {
    type: Number,
    min: [0, 'El precio de descuento no puede ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['camisetas', 'pelotas', 'accesorios', 'equipamiento', 'merchandising']
  },
  tallas: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  }],
  colores: [{
    nombre: String,
    codigo: String
  }],
  imagenes: [{
    type: String
  }],
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  etiquetas: [{
    type: String,
    trim: true
  }],
  activo: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  },
  peso: {
    type: Number,
    min: [0, 'El peso no puede ser negativo']
  },
  dimensiones: {
    largo: Number,
    ancho: Number,
    alto: Number
  }
}, {
  timestamps: true
});

// Índices
productoSchema.index({ nombre: 'text', descripcion: 'text', etiquetas: 'text' });
productoSchema.index({ categoria: 1, activo: 1 });
productoSchema.index({ precio: 1 });

module.exports = mongoose.model('Producto', productoSchema);
