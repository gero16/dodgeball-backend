const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerMisSesiones,
  revocarMiSesion,
  revocarMisSesiones,
  obtenerSesionesUsuario,
  revocarSesionUsuario,
  revocarTodasSesionesUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuarioAdmin,
  eliminarUsuario
} = require('../controllers/usuarioController');
const { auth, superAdminAuth } = require('../middleware/auth');
const { validateUsuario, validateLogin } = require('../middleware/validation');

// Rutas públicas
router.post('/registrar', validateUsuario, registrarUsuario);
router.post('/iniciar-sesion', validateLogin, iniciarSesion);

// Rutas protegidas (cuenta propia)
router.get('/perfil', auth, obtenerPerfil);
router.put('/perfil', auth, actualizarPerfil);
router.put('/cambiar-password', auth, cambiarPassword);
router.post('/cerrar-sesion', auth, cerrarSesion);
router.get('/sesiones', auth, obtenerMisSesiones);
router.delete('/sesiones/:id', auth, revocarMiSesion);
router.delete('/sesiones', auth, revocarMisSesiones);

// Rutas de superadmin (gestión de usuarios y roles)
router.get('/usuarios', superAdminAuth, obtenerUsuarios);
router.get('/usuarios/:id/sesiones', superAdminAuth, obtenerSesionesUsuario);
router.delete('/usuarios/:id/sesiones/:sesionId', superAdminAuth, revocarSesionUsuario);
router.delete('/usuarios/:id/sesiones', superAdminAuth, revocarTodasSesionesUsuario);
router.get('/usuarios/:id', superAdminAuth, obtenerUsuarioPorId);
router.put('/usuarios/:id', superAdminAuth, actualizarUsuarioAdmin);
router.delete('/usuarios/:id', superAdminAuth, eliminarUsuario);

module.exports = router;
