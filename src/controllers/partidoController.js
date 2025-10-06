const Partido = require('../models/Partido');
const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');
const Evento = require('../models/Evento');
const { calcularEstadisticasCompletas, agregarEstadisticasPartido, generarReporteJugador } = require('../utils/estadisticas');

/**
 * Crear un nuevo partido
 */
const crearPartido = async (req, res) => {
  try {
    const {
      evento,
      fecha,
      equipoLocal,
      equipoVisitante,
      estadisticasJugadores,
      duracion,
      arbitro,
      observaciones
    } = req.body;

    // Validar que el evento existe
    const eventoExiste = await Evento.findById(evento);
    if (!eventoExiste) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    // Validar que los equipos existen
    const [equipoLocalData, equipoVisitanteData] = await Promise.all([
      Equipo.findById(equipoLocal),
      Equipo.findById(equipoVisitante)
    ]);

    if (!equipoLocalData || !equipoVisitanteData) {
      return res.status(404).json({ mensaje: 'Uno o ambos equipos no encontrados' });
    }

    // Crear el partido
    const partido = new Partido({
      evento,
      fecha: new Date(fecha),
      equipoLocal,
      equipoVisitante,
      estadisticasJugadores,
      duracion,
      arbitro,
      observaciones,
      estado: 'finalizado'
    });

    // Calcular resultado del partido
    const resultado = calcularResultadoPartido(estadisticasJugadores, equipoLocal, equipoVisitante);
    partido.resultado = resultado;

    await partido.save();

    // Actualizar estadísticas de jugadores
    await actualizarEstadisticasJugadores(estadisticasJugadores);

    res.status(201).json({
      mensaje: 'Partido creado exitosamente',
      partido
    });

  } catch (error) {
    console.error('Error al crear partido:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * Obtener todos los partidos
 */
const obtenerPartidos = async (req, res) => {
  try {
    const { evento, equipo, fecha, limit = 10, page = 1 } = req.query;
    
    const filtros = {};
    if (evento) filtros.evento = evento;
    if (equipo) {
      filtros.$or = [
        { equipoLocal: equipo },
        { equipoVisitante: equipo }
      ];
    }
    if (fecha) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);
      filtros.fecha = { $gte: fechaInicio, $lt: fechaFin };
    }

    const partidos = await Partido.find(filtros)
      .populate('evento', 'titulo tipo')
      .populate('equipoLocal', 'nombre logo')
      .populate('equipoVisitante', 'nombre logo')
      .populate('estadisticasJugadores.jugador', 'nombre apellido numeroCamiseta')
      .sort({ fecha: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Partido.countDocuments(filtros);

    res.json({
      partidos,
      total,
      paginas: Math.ceil(total / limit),
      paginaActual: parseInt(page)
    });

  } catch (error) {
    console.error('Error al obtener partidos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * Obtener un partido por ID
 */
const obtenerPartidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await Partido.findById(id)
      .populate('evento', 'titulo tipo descripcion')
      .populate('equipoLocal', 'nombre logo colorPrincipal')
      .populate('equipoVisitante', 'nombre logo colorPrincipal')
      .populate('estadisticasJugadores.jugador', 'nombre apellido numeroCamiseta posicion');

    if (!partido) {
      return res.status(404).json({ mensaje: 'Partido no encontrado' });
    }

    res.json(partido);

  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * Obtener estadísticas de un jugador en un partido específico
 */
const obtenerEstadisticasJugadorPartido = async (req, res) => {
  try {
    const { partidoId, jugadorId } = req.params;

    const partido = await Partido.findById(partidoId)
      .populate('estadisticasJugadores.jugador', 'nombre apellido numeroCamiseta posicion');

    if (!partido) {
      return res.status(404).json({ mensaje: 'Partido no encontrado' });
    }

    const estadisticasJugador = partido.estadisticasJugadores.find(
      stat => stat.jugador._id.toString() === jugadorId
    );

    if (!estadisticasJugador) {
      return res.status(404).json({ mensaje: 'Jugador no participó en este partido' });
    }

    res.json(estadisticasJugador);

  } catch (error) {
    console.error('Error al obtener estadísticas del jugador:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * Obtener ranking de jugadores por índice de poder
 */
const obtenerRankingJugadores = async (req, res) => {
  try {
    const { limit = 20, equipo, posicion } = req.query;

    const filtros = { activo: true };
    if (equipo) filtros['estadisticasPorEquipo.equipo'] = equipo;
    if (posicion) filtros.posicion = posicion;

    const jugadores = await Jugador.find(filtros)
      .select('nombre apellido numeroCamiseta posicion estadisticasGenerales')
      .sort({ 'estadisticasGenerales.indicePoder': -1 })
      .limit(parseInt(limit));

    const ranking = jugadores.map((jugador, index) => ({
      posicion: index + 1,
      jugador: {
        id: jugador._id,
        nombre: `${jugador.nombre} ${jugador.apellido}`,
        numeroCamiseta: jugador.numeroCamiseta,
        posicion: jugador.posicion
      },
      estadisticas: {
        indicePoder: jugador.estadisticasGenerales.indicePoder,
        indiceAtaque: jugador.estadisticasGenerales.indiceAtaque,
        indiceDefensa: jugador.estadisticasGenerales.indiceDefensa,
        partidosJugados: jugador.estadisticasGenerales.partidosJugados,
        porcentajeHits: jugador.estadisticasGenerales.porcentajeHits,
        porcentajeCatches: jugador.estadisticasGenerales.porcentajeCatches
      }
    }));

    res.json(ranking);

  } catch (error) {
    console.error('Error al obtener ranking:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * Obtener reporte completo de un jugador
 */
const obtenerReporteJugador = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await Jugador.findById(id)
      .populate('usuario', 'email')
      .populate('estadisticasPorEquipo.equipo', 'nombre tipo');

    if (!jugador) {
      return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    }

    const reporte = generarReporteJugador(jugador);

    res.json(reporte);

  } catch (error) {
    console.error('Error al obtener reporte del jugador:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * Función auxiliar para calcular el resultado de un partido
 */
function calcularResultadoPartido(estadisticasJugadores, equipoLocal, equipoVisitante) {
  // Esta es una implementación básica
  // En un caso real, necesitarías lógica más compleja basada en las reglas del dodgeball
  const setsLocal = Math.floor(Math.random() * 3) + 1; // Simulado
  const setsVisitante = Math.floor(Math.random() * 3) + 1; // Simulado
  
  return {
    setsLocal,
    setsVisitante,
    ganador: setsLocal > setsVisitante ? equipoLocal : equipoVisitante
  };
}

/**
 * Función auxiliar para actualizar estadísticas de jugadores
 */
async function actualizarEstadisticasJugadores(estadisticasJugadores) {
  for (const estadistica of estadisticasJugadores) {
    const jugador = await Jugador.findById(estadistica.jugador);
    if (jugador) {
      const nuevasEstadisticas = agregarEstadisticasPartido(
        jugador.estadisticasGenerales,
        estadistica
      );
      
      jugador.estadisticasGenerales = nuevasEstadisticas;
      
      // Agregar al historial de partidos
      jugador.historialPartidos.push({
        partido: estadistica.partido,
        equipo: estadistica.equipo,
        fecha: new Date(),
        estadisticas: estadistica
      });
      
      await jugador.save();
    }
  }
}

module.exports = {
  crearPartido,
  obtenerPartidos,
  obtenerPartidoPorId,
  obtenerEstadisticasJugadorPartido,
  obtenerRankingJugadores,
  obtenerReporteJugador
};
