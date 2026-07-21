const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Sesion = require('../models/Sesion');
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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const mensaje = err.name === 'TokenExpiredError'
        ? 'Sesión expirada. Volvé a iniciar sesión.'
        : 'Token inválido';
      return res.status(401).json({
        success: false,
        message: mensaje
      });
    }

    // Tokens nuevos llevan jti y deben existir como sesión activa en DB
    if (decoded.jti) {
      const sesion = await Sesion.findOne({ jti: decoded.jti, activa: true });
      if (!sesion) {
        return res.status(401).json({
          success: false,
          message: 'Sesión cerrada o inválida. Volvé a iniciar sesión.'
        });
      }

      // Actualizar último uso de forma diferida (no bloquea la request)
      const hace5Min = Date.now() - 5 * 60 * 1000;
      if (!sesion.ultimoUso || new Date(sesion.ultimoUso).getTime() < hace5Min) {
        Sesion.updateOne(
          { _id: sesion._id },
          { ultimoUso: new Date() }
        ).catch(() => {});
      }

      req.sesion = sesion;
      req.jti = decoded.jti;
    }

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
