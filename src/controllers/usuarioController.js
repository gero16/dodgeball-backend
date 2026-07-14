const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { ROLES, ROLES_VALIDOS, isSuperAdmin } = require('../utils/roles');

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
    const { pagina = 1, limite = 10, busqueda = '', rol = '', activo = 'true' } = req.query;
    const skip = (pagina - 1) * limite;

    let filtros = {};

    if (activo === 'true') {
      filtros.activo = true;
    } else if (activo === 'false') {
      filtros.activo = false;
    }
    // activo === 'todos' → sin filtro de activo

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
      .select('-password -tokenRecuperacion -expiracionToken')
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

// Obtener un usuario por ID (admin)
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select('-password -tokenRecuperacion -expiracionToken');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { usuario }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar usuario (superadmin): rol y/o estado activo
const actualizarUsuarioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, activo } = req.body;
    const esMismoUsuario = String(req.usuario._id) === String(id);

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (rol !== undefined) {
      if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({
          success: false,
          message: `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`
        });
      }
      if (esMismoUsuario && !isSuperAdmin(rol)) {
        return res.status(400).json({
          success: false,
          message: 'No podés quitarte el rol de super administrador a vos mismo'
        });
      }
      if (isSuperAdmin(usuario.rol) && !isSuperAdmin(rol)) {
        const otrosSuper = await Usuario.countDocuments({
          rol: ROLES.SUPERADMIN,
          activo: true,
          _id: { $ne: usuario._id }
        });
        if (otrosSuper === 0) {
          return res.status(400).json({
            success: false,
            message: 'No podés quitar el rol al único super administrador activo'
          });
        }
      }
      usuario.rol = rol;
    }

    if (activo !== undefined) {
      if (typeof activo !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'El campo activo debe ser booleano'
        });
      }
      if (esMismoUsuario && activo === false) {
        return res.status(400).json({
          success: false,
          message: 'No podés desactivar tu propia cuenta'
        });
      }
      if (isSuperAdmin(usuario.rol) && activo === false && !esMismoUsuario) {
        const otrosSuper = await Usuario.countDocuments({
          rol: ROLES.SUPERADMIN,
          activo: true,
          _id: { $ne: usuario._id }
        });
        if (otrosSuper === 0) {
          return res.status(400).json({
            success: false,
            message: 'No podés desactivar al único super administrador activo'
          });
        }
      }
      usuario.activo = activo;
    }

    await usuario.save();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { usuario: usuario.toJSON() }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar usuario (superadmin)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.usuario._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'No podés desactivar tu propia cuenta'
      });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (isSuperAdmin(usuario.rol)) {
      const otrosSuper = await Usuario.countDocuments({
        rol: ROLES.SUPERADMIN,
        activo: true,
        _id: { $ne: usuario._id }
      });
      if (otrosSuper === 0) {
        return res.status(400).json({
          success: false,
          message: 'No podés desactivar al único super administrador activo'
        });
      }
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
  obtenerUsuarioPorId,
  actualizarUsuarioAdmin,
  eliminarUsuario
};
