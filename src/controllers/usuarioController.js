const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono, fechaNacimiento } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear nuevo usuario
    const usuario = new Usuario({
      nombre,
      email,
      password,
      telefono,
      fechaNacimiento
    });

    await usuario.save();

    // Generar token JWT
    const token = usuario.generarJWT();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: usuario.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Iniciar sesión
const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email, activo: true });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Generar token JWT
    const token = usuario.generarJWT();

    res.json({
      success: true,
      message: 'Sesión iniciada exitosamente',
      data: {
        usuario: usuario.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    
    res.json({
      success: true,
      data: { usuario }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, telefono, fechaNacimiento } = req.body;
    const usuarioId = req.usuario.id;

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (fechaNacimiento) usuario.fechaNacimiento = fechaNacimiento;

    await usuario.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { usuario: usuario.toJSON() }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuarioId = req.usuario.id;

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await usuario.compararPassword(passwordActual);
    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    usuario.password = passwordNueva;
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los usuarios (admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', rol = '' } = req.query;
    const skip = (pagina - 1) * limite;

    let filtros = { activo: true };
    
    if (busqueda) {
      filtros.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { email: { $regex: busqueda, $options: 'i' } }
      ];
    }
    
    if (rol) {
      filtros.rol = rol;
    }

    const usuarios = await Usuario.find(filtros)
      .select('-password')
      .sort({ fechaRegistro: -1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Usuario.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        usuarios,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar usuario (admin)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Desactivar usuario en lugar de eliminarlo
    usuario.activo = false;
    await usuario.save();

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerUsuarios,
  eliminarUsuario
};
