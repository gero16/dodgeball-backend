const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { hasMinRole, ROLES } = require('../utils/roles');

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

/** Exige al menos el rol indicado (jerarquía: usuario < admin < superadmin) */
const requireRole = (minRole) => async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!hasMinRole(req.usuario.rol, minRole)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere rol ${minRole} o superior`
        });
      }
      next();
    });
  } catch (error) {
    console.error('Error en middleware requireRole:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/** Admin o superadmin (operaciones del club) */
const adminAuth = requireRole(ROLES.ADMIN);

/** Solo superadmin (usuarios y roles) */
const superAdminAuth = requireRole(ROLES.SUPERADMIN);

module.exports = { auth, adminAuth, superAdminAuth, requireRole };
