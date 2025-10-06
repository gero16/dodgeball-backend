const Equipo = require('../models/Equipo');
const Jugador = require('../models/Jugador');

// Crear nuevo equipo
const crearEquipo = async (req, res) => {
  try {
    const { nombre, tipo, pais, ciudad, logo, colorPrincipal, colorSecundario } = req.body;

    // Verificar que no existe un equipo con el mismo nombre
    const equipoExistente = await Equipo.findOne({ nombre });
    if (equipoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un equipo con este nombre'
      });
    }

    const equipo = new Equipo({
      nombre,
      tipo,
      pais,
      ciudad,
      logo,
      colorPrincipal,
      colorSecundario
    });

    await equipo.save();

    res.status(201).json({
      success: true,
      message: 'Equipo creado exitosamente',
      data: { equipo }
    });

  } catch (error) {
    console.error('Error creando equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener equipo por ID
const obtenerEquipo = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await Equipo.findById(id)
      .populate('jugadores.jugador', 'nombre apellido posicion estadisticasGenerales');

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    res.json({
      success: true,
      data: { equipo }
    });

  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los equipos
const obtenerEquipos = async (req, res) => {
  try {
    const { tipo, activo, limite = 20, pagina = 1 } = req.query;

    let query = {};
    
    if (tipo) {
      query.tipo = tipo;
    }
    
    if (activo !== undefined) {
      query.activo = activo === 'true';
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const equipos = await Equipo.find(query)
      .populate('jugadores.jugador', 'nombre apellido posicion')
      .sort({ nombre: 1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Equipo.countDocuments(query);

    res.json({
      success: true,
      data: { 
        equipos,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          paginas: Math.ceil(total / parseInt(limite))
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar equipo
const actualizarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const equipo = await Equipo.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Equipo actualizado exitosamente',
      data: { equipo }
    });

  } catch (error) {
    console.error('Error actualizando equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar equipo
const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await Equipo.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Equipo desactivado exitosamente',
      data: { equipo }
    });

  } catch (error) {
    console.error('Error eliminando equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener jugadores de un equipo
const obtenerJugadoresEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.query;

    const equipo = await Equipo.findById(id)
      .populate({
        path: 'jugadores.jugador',
        match: activo !== undefined ? { activo: activo === 'true' } : {},
        select: 'nombre apellido posicion estadisticasGenerales'
      });

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Filtrar jugadores nulos (si no coinciden con el match)
    const jugadores = equipo.jugadores.filter(j => j.jugador !== null);

    res.json({
      success: true,
      data: { 
        equipo: {
          id: equipo._id,
          nombre: equipo.nombre,
          tipo: equipo.tipo
        },
        jugadores
      }
    });

  } catch (error) {
    console.error('Error obteniendo jugadores del equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearEquipo,
  obtenerEquipo,
  obtenerEquipos,
  actualizarEquipo,
  eliminarEquipo,
  obtenerJugadoresEquipo
};
