const mongoose = require('mongoose');

const publicacionInstagramSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'La URL de Instagram es obligatoria'],
    trim: true
  },
  titulo: {
    type: String,
    trim: true,
    maxlength: [120, 'El título no puede tener más de 120 caracteres'],
    default: ''
  },
  orden: {
    type: Number,
    default: 0
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

publicacionInstagramSchema.index({ activa: 1, orden: 1 });

module.exports = mongoose.model('PublicacionInstagram', publicacionInstagramSchema);
