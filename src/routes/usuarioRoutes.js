const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerUsuarios,
  eliminarUsuario
} = require('../controllers/usuarioController');
const { auth, adminAuth } = require('../middleware/auth');
const { validateUsuario, validateLogin } = require('../middleware/validation');

// Rutas públicas
router.post('/registrar', validateUsuario, registrarUsuario);
router.post('/iniciar-sesion', validateLogin, iniciarSesion);

// Rutas protegidas
router.get('/perfil', auth, obtenerPerfil);
router.put('/perfil', auth, actualizarPerfil);
router.put('/cambiar-password', auth, cambiarPassword);

// Rutas de administrador
router.get('/usuarios', adminAuth, obtenerUsuarios);
router.delete('/usuarios/:id', adminAuth, eliminarUsuario);

module.exports = router;
