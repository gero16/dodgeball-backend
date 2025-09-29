const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en middleware auth:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Error en middleware adminAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = { auth, adminAuth };
