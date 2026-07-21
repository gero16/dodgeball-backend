const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Sesion = require('../models/Sesion');

const parseDispositivo = (userAgent = '') => {
  const ua = String(userAgent || '').trim();
  if (!ua) return 'Dispositivo desconocido';

  let browser = 'Navegador';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  let os = 'Otro';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return `${browser} · ${os}`;
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || '';
};

const getJwtExpiresIn = () => {
  const raw = (process.env.JWT_EXPIRES_IN || '').toString().trim().toLowerCase();
  if (!raw || raw === 'never' || raw === '0' || raw === 'none') {
    return null;
  }
  return process.env.JWT_EXPIRES_IN;
};

/**
 * Crea una sesión en DB y emite un JWT ligado a ella (sin caducidad por defecto).
 */
const crearSesionYToken = async (usuario, req) => {
  const jti = crypto.randomUUID();
  const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);
  const ip = getClientIp(req);

  await Sesion.create({
    usuario: usuario._id,
    jti,
    dispositivo: parseDispositivo(userAgent),
    userAgent,
    ip,
    activa: true,
    ultimoUso: new Date()
  });

  const payload = {
    id: usuario._id,
    email: usuario.email,
    rol: usuario.rol,
    jti
  };

  const options = {};
  const expiresIn = getJwtExpiresIn();
  if (expiresIn) {
    options.expiresIn = expiresIn;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return { token, jti };
};

const revocarSesionPorJti = async (jti) => {
  if (!jti) return null;
  return Sesion.findOneAndUpdate(
    { jti, activa: true },
    { activa: false, revocadaEn: new Date() },
    { new: true }
  );
};

const revocarTodasLasSesiones = async (usuarioId, { exceptoJti = null } = {}) => {
  const filtro = { usuario: usuarioId, activa: true };
  if (exceptoJti) {
    filtro.jti = { $ne: exceptoJti };
  }
  const result = await Sesion.updateMany(filtro, {
    activa: false,
    revocadaEn: new Date()
  });
  return result.modifiedCount || 0;
};

const serializarSesion = (sesion, jtiActual = null) => {
  const obj = sesion.toObject ? sesion.toObject() : sesion;
  return {
    _id: obj._id,
    dispositivo: obj.dispositivo,
    ip: obj.ip,
    activa: obj.activa,
    ultimoUso: obj.ultimoUso,
    createdAt: obj.createdAt,
    revocadaEn: obj.revocadaEn,
    esActual: Boolean(jtiActual && obj.jti === jtiActual)
  };
};

module.exports = {
  parseDispositivo,
  getClientIp,
  getJwtExpiresIn,
  crearSesionYToken,
  revocarSesionPorJti,
  revocarTodasLasSesiones,
  serializarSesion
};
