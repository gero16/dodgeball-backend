const Usuario = require('../models/Usuario');
const Sesion = require('../models/Sesion');
const { ROLES, ROLES_VALIDOS, isSuperAdmin } = require('../utils/roles');
const {
  crearSesionYToken,
  revocarSesionPorJti,
  revocarTodasLasSesiones,
  serializarSesion
} = require('../utils/sesionHelper');

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono, fechaNacimiento } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    const usuario = new Usuario({
      nombre,
      email,
      password,
      telefono,
      fechaNacimiento
    });

    await usuario.save();

    const { token } = await crearSesionYToken(usuario, req);

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

    const usuario = await Usuario.findOne({ email, activo: true });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    usuario.ultimoAcceso = new Date();
    await usuario.save();

    const { token } = await crearSesionYToken(usuario, req);

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

// Cerrar sesión actual (revoca en servidor)
const cerrarSesion = async (req, res) => {
  try {
    if (req.jti) {
      await revocarSesionPorJti(req.jti);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Listar sesiones propias
const obtenerMisSesiones = async (req, res) => {
  try {
    const sesiones = await Sesion.find({
      usuario: req.usuario._id,
      activa: true
    }).sort({ ultimoUso: -1 });

    res.json({
      success: true,
      data: {
        sesiones: sesiones.map((s) => serializarSesion(s, req.jti))
      }
    });
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Revocar una sesión propia
const revocarMiSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const sesion = await Sesion.findOne({
      _id: id,
      usuario: req.usuario._id,
      activa: true
    });

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    sesion.activa = false;
    sesion.revocadaEn = new Date();
    await sesion.save();

    res.json({
      success: true,
      message: sesion.jti === req.jti
        ? 'Sesión actual cerrada'
        : 'Sesión cerrada en ese dispositivo',
      data: {
        eraActual: sesion.jti === req.jti
      }
    });
  } catch (error) {
    console.error('Error al revocar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Revocar todas las sesiones propias (opcionalmente mantener la actual)
const revocarMisSesiones = async (req, res) => {
  try {
    const mantenerActual = req.query.mantenerActual !== 'false';
    const exceptoJti = mantenerActual ? req.jti : null;
    const cantidad = await revocarTodasLasSesiones(req.usuario._id, { exceptoJti });

    res.json({
      success: true,
      message: mantenerActual
        ? `Se cerraron ${cantidad} sesión(es) en otros dispositivos`
        : `Se cerraron ${cantidad} sesión(es)`,
      data: { cantidad, cerroActual: !mantenerActual }
    });
  } catch (error) {
    console.error('Error al revocar sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Superadmin: listar sesiones de un usuario
const obtenerSesionesUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select('_id nombre email');
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const incluirInactivas = req.query.todas === 'true';
    const filtro = { usuario: id };
    if (!incluirInactivas) {
      filtro.activa = true;
    }

    const sesiones = await Sesion.find(filtro).sort({ ultimoUso: -1 }).limit(50);

    res.json({
      success: true,
      data: {
        usuario: { _id: usuario._id, nombre: usuario.nombre, email: usuario.email },
        sesiones: sesiones.map((s) => serializarSesion(s, null))
      }
    });
  } catch (error) {
    console.error('Error al obtener sesiones de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Superadmin: revocar una sesión de cualquier usuario
const revocarSesionUsuario = async (req, res) => {
  try {
    const { id, sesionId } = req.params;
    const sesion = await Sesion.findOne({ _id: sesionId, usuario: id, activa: true });

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    sesion.activa = false;
    sesion.revocadaEn = new Date();
    await sesion.save();

    res.json({
      success: true,
      message: 'Conexión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error al revocar sesión de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Superadmin: revocar todas las sesiones de un usuario
const revocarTodasSesionesUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const cantidad = await revocarTodasLasSesiones(id);

    res.json({
      success: true,
      message: `Se cerraron ${cantidad} conexión(es) de ${usuario.nombre}`,
      data: { cantidad }
    });
  } catch (error) {
    console.error('Error al revocar todas las sesiones:', error);
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

    const passwordValida = await usuario.compararPassword(passwordActual);
    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    usuario.password = passwordNueva;
    await usuario.save();

    // Cerrar sesiones en otros dispositivos por seguridad
    const cantidad = await revocarTodasLasSesiones(usuarioId, { exceptoJti: req.jti });

    res.json({
      success: true,
      message: cantidad > 0
        ? `Contraseña actualizada. Se cerraron ${cantidad} sesión(es) en otros dispositivos`
        : 'Contraseña actualizada exitosamente',
      data: { sesionesCerradas: cantidad }
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

    // Si se desactiva la cuenta, cerrar todas sus sesiones
    let sesionesCerradas = 0;
    if (activo === false) {
      sesionesCerradas = await revocarTodasLasSesiones(id);
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { usuario: usuario.toJSON(), sesionesCerradas }
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

    usuario.activo = false;
    await usuario.save();
    await revocarTodasLasSesiones(id);

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
};
