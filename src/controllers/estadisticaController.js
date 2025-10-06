const Estadistica = require('../models/Estadistica');
const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');

/**
 * Crear nueva estadística
 */
const crearEstadistica = async (req, res) => {
  try {
    const {
      equipo,
      jugador,
      setsJugados,
      tirosTotales,
      hits,
      quemados,
      asistencias,
      tirosRecibidos,
      hitsRecibidos,
      esquives,
      esquivesSinEsfuerzo,
      ponchado,
      catchesIntentados,
      catches,
      bloqueosIntentados,
      bloqueos,
      pisoLinea,
      catchesRecibidos,
      temporada
    } = req.body;

    // Validar que el equipo existe
    const equipoExiste = await Equipo.findById(equipo);
    if (!equipoExiste) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Validar que el jugador existe
    const jugadorExiste = await Jugador.findById(jugador);
    if (!jugadorExiste) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    // Verificar si ya existe una estadística para este jugador y equipo en esta temporada
    const estadisticaExistente = await Estadistica.findOne({
      equipo,
      jugador,
      temporada: temporada || '2024-2025'
    });

    if (estadisticaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una estadística para este jugador en este equipo para esta temporada'
      });
    }

    const estadistica = new Estadistica({
      equipo,
      jugador,
      setsJugados: setsJugados || 0,
      tirosTotales: tirosTotales || 0,
      hits: hits || 0,
      quemados: quemados || 0,
      asistencias: asistencias || 0,
      tirosRecibidos: tirosRecibidos || 0,
      hitsRecibidos: hitsRecibidos || 0,
      esquives: esquives || 0,
      esquivesSinEsfuerzo: esquivesSinEsfuerzo || 0,
      ponchado: ponchado || 0,
      catchesIntentados: catchesIntentados || 0,
      catches: catches || 0,
      bloqueosIntentados: bloqueosIntentados || 0,
      bloqueos: bloqueos || 0,
      pisoLinea: pisoLinea || 0,
      catchesRecibidos: catchesRecibidos || 0,
      temporada: temporada || '2024-2025'
    });

    await estadistica.save();

    // Poblar los datos relacionados
    await estadistica.populate('jugador', 'nombre apellido numeroCamiseta posicion');
    await estadistica.populate('equipo', 'nombre colorPrincipal colorSecundario');

    res.status(201).json({
      success: true,
      message: 'Estadística creada exitosamente',
      data: estadistica
    });

  } catch (error) {
    console.error('Error creando estadística:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener todas las estadísticas
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const { temporada = '2024-2025', equipo, jugador, limite = 50, pagina = 1 } = req.query;
    
    const filtros = { 
      activo: true,
      temporada 
    };

    if (equipo) filtros.equipo = equipo;
    if (jugador) filtros.jugador = jugador;

    const skip = (pagina - 1) * limite;

    const estadisticas = await Estadistica.find(filtros)
      .populate('jugador', 'nombre apellido numeroCamiseta posicion')
      .populate('equipo', 'nombre colorPrincipal colorSecundario')
      .sort({ indicePoder: -1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Estadistica.countDocuments(filtros);

    res.json({
      success: true,
      data: estadisticas,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        paginas: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estadística por ID
 */
const obtenerEstadisticaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const estadistica = await Estadistica.findById(id)
      .populate('jugador', 'nombre apellido numeroCamiseta posicion')
      .populate('equipo', 'nombre colorPrincipal colorSecundario');

    if (!estadistica) {
      return res.status(404).json({
        success: false,
        message: 'Estadística no encontrada'
      });
    }

    res.json({
      success: true,
      data: estadistica
    });

  } catch (error) {
    console.error('Error obteniendo estadística:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Actualizar estadística
 */
const actualizarEstadistica = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    // Remover campos que no deben ser actualizados directamente
    delete datosActualizacion._id;
    delete datosActualizacion.__v;
    delete datosActualizacion.fechaRegistro;
    delete datosActualizacion.porcentajeHits;
    delete datosActualizacion.porcentajeOuts;
    delete datosActualizacion.porcentajeCatches;
    delete datosActualizacion.porcentajeBloqueos;
    delete datosActualizacion.indiceAtaque;
    delete datosActualizacion.indiceDefensa;
    delete datosActualizacion.indicePoder;

    const estadistica = await Estadistica.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    )
    .populate('jugador', 'nombre apellido numeroCamiseta posicion')
    .populate('equipo', 'nombre colorPrincipal colorSecundario');

    if (!estadistica) {
      return res.status(404).json({
        success: false,
        message: 'Estadística no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estadística actualizada exitosamente',
      data: estadistica
    });

  } catch (error) {
    console.error('Error actualizando estadística:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar estadística (soft delete)
 */
const eliminarEstadistica = async (req, res) => {
  try {
    const { id } = req.params;

    const estadistica = await Estadistica.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!estadistica) {
      return res.status(404).json({
        success: false,
        message: 'Estadística no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estadística eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando estadística:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas por equipo
 */
const obtenerEstadisticasPorEquipo = async (req, res) => {
  try {
    const { equipoId } = req.params;
    const { temporada = '2024-2025' } = req.query;

    const estadisticas = await Estadistica.porEquipo(equipoId, temporada);

    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas por equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas por jugador
 */
const obtenerEstadisticasPorJugador = async (req, res) => {
  try {
    const { jugadorId } = req.params;
    const { temporada = '2024-2025' } = req.query;

    const estadisticas = await Estadistica.porJugador(jugadorId, temporada);

    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas por jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener ranking de jugadores
 */
const obtenerRanking = async (req, res) => {
  try {
    const { 
      criterio = 'indicePoder', 
      temporada = '2024-2025', 
      limite = 10 
    } = req.query;

    const ranking = await Estadistica.ranking(criterio, temporada, parseInt(limite));

    res.json({
      success: true,
      data: ranking,
      criterio,
      temporada
    });

  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas resumidas
 */
const obtenerResumen = async (req, res) => {
  try {
    const { temporada = '2024-2025' } = req.query;

    const resumen = await Estadistica.aggregate([
      { $match: { temporada, activo: true } },
      {
        $group: {
          _id: null,
          totalJugadores: { $sum: 1 },
          totalSets: { $sum: '$setsJugados' },
          totalTiros: { $sum: '$tirosTotales' },
          totalHits: { $sum: '$hits' },
          totalQuemados: { $sum: '$quemados' },
          totalAsistencias: { $sum: '$asistencias' },
          promedioIndicePoder: { $avg: '$indicePoder' },
          promedioIndiceAtaque: { $avg: '$indiceAtaque' },
          promedioIndiceDefensa: { $avg: '$indiceDefensa' }
        }
      }
    ]);

    res.json({
      success: true,
      data: resumen[0] || {},
      temporada
    });

  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearEstadistica,
  obtenerEstadisticas,
  obtenerEstadisticaPorId,
  actualizarEstadistica,
  eliminarEstadistica,
  obtenerEstadisticasPorEquipo,
  obtenerEstadisticasPorJugador,
  obtenerRanking,
  obtenerResumen
};
