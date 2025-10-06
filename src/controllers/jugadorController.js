const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');
const Evento = require('../models/Evento');

// Crear nuevo jugador
const crearJugador = async (req, res) => {
  try {
    const { usuario, nombre, apellido, fechaNacimiento, posicion, numeroCamiseta, email, telefono, equipo, estadisticasGenerales, estadisticasPorEquipo, activo } = req.body;

    // Si se proporciona un usuario, verificar que existe
    if (usuario) {
      const Usuario = require('../models/Usuario');
      const usuarioExiste = await Usuario.findById(usuario);
      if (!usuarioExiste) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que no existe ya un jugador para este usuario
      const jugadorExistente = await Jugador.findOne({ usuario });
      if (jugadorExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un perfil de jugador para este usuario'
        });
      }
    }

    const jugador = new Jugador({
      usuario,
      nombre,
      apellido,
      fechaNacimiento,
      posicion,
      numeroCamiseta,
      email,
      telefono,
      equipo,
      estadisticasGenerales,
      estadisticasPorEquipo,
      activo
    });

    await jugador.save();

    res.status(201).json({
      success: true,
      message: 'Jugador creado exitosamente',
      data: { jugador }
    });

  } catch (error) {
    console.error('Error creando jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener jugador por ID
const obtenerJugador = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await Jugador.findById(id)
      .populate('usuario', 'nombre email')
      .populate('estadisticasPorEquipo.equipo', 'nombre tipo pais ciudad');

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      data: { jugador }
    });

  } catch (error) {
    console.error('Error obteniendo jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los jugadores
const obtenerJugadores = async (req, res) => {
  try {
    const { activo, equipo, posicion, limite = 20, pagina = 1 } = req.query;

    let query = {};
    
    if (activo !== undefined) {
      query.activo = activo === 'true';
    }
    
    if (posicion) {
      query.posicion = posicion;
    }

    if (equipo) {
      query['estadisticasPorEquipo.equipo'] = equipo;
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const jugadores = await Jugador.find(query)
      .populate('usuario', 'nombre email')
      .populate('estadisticasPorEquipo.equipo', 'nombre tipo')
      .sort({ 'estadisticasGenerales.puntos': -1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Jugador.countDocuments(query);

    res.json({
      success: true,
      data: { 
        jugadores,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          paginas: Math.ceil(total / parseInt(limite))
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estadísticas de un jugador en un partido
const actualizarEstadisticasJugador = async (req, res) => {
  try {
    const { jugadorId, partidoId, equipoId } = req.params;
    const { estadisticas } = req.body;

    // Buscar el jugador
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    // Buscar el partido
    const evento = await Evento.findById(partidoId);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }

    // Buscar el equipo
    const equipo = await Equipo.findById(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Actualizar estadísticas generales
    const statsGenerales = jugador.estadisticasGenerales;
    statsGenerales.partidosJugados += 1;
    statsGenerales.hits += estadisticas.hits || 0;
    statsGenerales.hitsExitosos += estadisticas.hitsExitosos || 0;
    statsGenerales.catches += estadisticas.catches || 0;
    statsGenerales.catchesExitosos += estadisticas.catchesExitosos || 0;
    statsGenerales.dodges += estadisticas.dodges || 0;
    statsGenerales.dodgesExitosos += estadisticas.dodgesExitosos || 0;
    statsGenerales.bloqueos += estadisticas.bloqueos || 0;
    statsGenerales.bloqueosExitosos += estadisticas.bloqueosExitosos || 0;
    statsGenerales.tarjetasAmarillas += estadisticas.tarjetasAmarillas || 0;
    statsGenerales.tarjetasRojas += estadisticas.tarjetasRojas || 0;
    statsGenerales.eliminaciones += estadisticas.eliminaciones || 0;
    statsGenerales.vecesEliminado += estadisticas.vecesEliminado || 0;
    statsGenerales.minutosJugados += estadisticas.minutosJugados || 0;
    statsGenerales.puntos += estadisticas.puntos || 0;

    // Actualizar estadísticas por equipo
    let statsEquipo = jugador.estadisticasPorEquipo.find(
      stat => stat.equipo.toString() === equipoId
    );

    if (!statsEquipo) {
      // Si no existe, crear nueva entrada
      statsEquipo = {
        equipo: equipoId,
        nombreEquipo: equipo.nombre,
        tipoEquipo: equipo.tipo,
        temporada: new Date().getFullYear().toString(),
        estadisticas: {
          partidosJugados: 0,
          hits: 0,
          catches: 0,
          dodges: 0,
          bloqueos: 0,
          puntos: 0
        }
      };
      jugador.estadisticasPorEquipo.push(statsEquipo);
    }

    // Actualizar estadísticas del equipo específico
    statsEquipo.estadisticas.partidosJugados += 1;
    statsEquipo.estadisticas.hits += estadisticas.hits || 0;
    statsEquipo.estadisticas.catches += estadisticas.catches || 0;
    statsEquipo.estadisticas.dodges += estadisticas.dodges || 0;
    statsEquipo.estadisticas.bloqueos += estadisticas.bloqueos || 0;
    statsEquipo.estadisticas.puntos += estadisticas.puntos || 0;

    // Agregar al historial
    jugador.historialPartidos.push({
      partido: partidoId,
      equipo: statsEquipo.nombreEquipo,
      fecha: new Date(),
      estadisticas: estadisticas
    });

    await jugador.save();

    res.json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      data: { jugador }
    });

  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de un jugador
const obtenerEstadisticasJugador = async (req, res) => {
  try {
    const { jugadorId } = req.params;
    const { equipoId, temporada } = req.query;

    const jugador = await Jugador.findById(jugadorId)
      .populate('usuario', 'nombre email')
      .populate('estadisticasPorEquipo.equipo', 'nombre tipo pais ciudad');

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    let estadisticas = jugador.estadisticasGenerales;

    // Si se especifica un equipo, devolver estadísticas de ese equipo
    if (equipoId) {
      const statsEquipo = jugador.estadisticasPorEquipo.find(
        stat => stat.equipo.toString() === equipoId
      );
      if (statsEquipo) {
        estadisticas = statsEquipo.estadisticas;
      }
    }

    res.json({
      success: true,
      data: {
        jugador: {
          id: jugador._id,
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          posicion: jugador.posicion
        },
        estadisticas,
        equipos: jugador.estadisticasPorEquipo
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener ranking de jugadores
const obtenerRankingJugadores = async (req, res) => {
  try {
    const { equipoId, temporada, limite = 10, posicion } = req.query;

    let query = { activo: true };
    
    if (equipoId) {
      query['estadisticasPorEquipo.equipo'] = equipoId;
    }

    if (posicion) {
      query.posicion = posicion;
    }

    const jugadores = await Jugador.find(query)
      .populate('usuario', 'nombre email')
      .populate('estadisticasPorEquipo.equipo', 'nombre tipo')
      .sort({ 'estadisticasGenerales.puntos': -1 })
      .limit(parseInt(limite));

    res.json({
      success: true,
      data: { jugadores }
    });

  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar jugador a un equipo
const agregarJugadorAEquipo = async (req, res) => {
  try {
    const { jugadorId, equipoId } = req.params;
    const { numeroCamiseta, posicion } = req.body;

    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    const equipo = await Equipo.findById(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Verificar si el jugador ya está en el equipo
    const yaEnEquipo = equipo.jugadores.find(
      j => j.jugador.toString() === jugadorId
    );

    if (yaEnEquipo) {
      return res.status(400).json({
        success: false,
        message: 'El jugador ya está en este equipo'
      });
    }

    // Agregar jugador al equipo
    equipo.jugadores.push({
      jugador: jugadorId,
      numeroCamiseta: numeroCamiseta || null,
      posicion: posicion || jugador.posicion,
      fechaIngreso: new Date(),
      activo: true
    });

    await equipo.save();

    res.json({
      success: true,
      message: 'Jugador agregado al equipo exitosamente',
      data: { equipo }
    });

  } catch (error) {
    console.error('Error agregando jugador al equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Remover jugador de un equipo
const removerJugadorDeEquipo = async (req, res) => {
  try {
    const { jugadorId, equipoId } = req.params;

    const equipo = await Equipo.findById(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Remover jugador del equipo
    equipo.jugadores = equipo.jugadores.filter(
      j => j.jugador.toString() !== jugadorId
    );

    await equipo.save();

    res.json({
      success: true,
      message: 'Jugador removido del equipo exitosamente',
      data: { equipo }
    });

  } catch (error) {
    console.error('Error removiendo jugador del equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearJugador,
  obtenerJugador,
  obtenerJugadores,
  actualizarEstadisticasJugador,
  obtenerEstadisticasJugador,
  obtenerRankingJugadores,
  agregarJugadorAEquipo,
  removerJugadorDeEquipo
};
