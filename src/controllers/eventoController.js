const Evento = require('../models/Evento');

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      tipo = '', 
      busqueda = '', 
      proximos = false,
      pasados = false
    } = req.query;
    
    const skip = (pagina - 1) * limite;
    let filtros = { activo: true };
    let sort = { fecha: 1 };

    // Filtros
    if (tipo) filtros.tipo = tipo;
    
    if (busqueda) {
      filtros.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } }
      ];
    }

    // Filtros de fecha
    const ahora = new Date();
    if (proximos === 'true') {
      filtros.fecha = { $gte: ahora };
      sort = { fecha: 1 };
    } else if (pasados === 'true') {
      filtros.fecha = { $lt: ahora };
      sort = { fecha: -1 };
    }

    const eventos = await Evento.find(filtros)
      .populate('organizador', 'nombre email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Evento.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        eventos,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de una liga
const obtenerEstadisticasLiga = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findById(id);
    if (!evento || evento.tipo !== 'liga') {
      return res.status(404).json({
        success: false,
        message: 'Liga no encontrada'
      });
    }

    const liga = evento.datosEspecificos?.liga;
    if (!liga) {
      return res.status(404).json({
        success: false,
        message: 'Datos de liga no disponibles'
      });
    }

    // Ordenar equipos por puntos
    const equiposOrdenados = [...liga.equipos].sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return b.diferenciaGoles - a.diferenciaGoles;
    });

    res.json({
      success: true,
      data: {
        liga: {
          temporada: liga.temporada,
          division: liga.division,
          formato: liga.formato,
          equipos: equiposOrdenados,
          partidos: liga.partidos,
          reglas: liga.reglas,
          premios: liga.premios
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de liga:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de un campeonato
const obtenerEstadisticasCampeonato = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findById(id);
    if (!evento || evento.tipo !== 'campeonato') {
      return res.status(404).json({
        success: false,
        message: 'Campeonato no encontrado'
      });
    }

    const campeonato = evento.datosEspecificos?.campeonato;
    if (!campeonato) {
      return res.status(404).json({
        success: false,
        message: 'Datos de campeonato no disponibles'
      });
    }

    // Ordenar equipos por puntos (si hay grupos)
    let equiposOrdenados = campeonato.equipos || [];
    if (equiposOrdenados.length > 0) {
      equiposOrdenados = [...equiposOrdenados].sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        return b.diferenciaGoles - a.diferenciaGoles;
      });
    }

    // Obtener todos los partidos
    const todosPartidos = [];
    if (campeonato.grupos) {
      campeonato.grupos.forEach(grupo => {
        todosPartidos.push(...grupo.partidos.map(p => ({ ...p, fase: grupo.nombre })));
      });
    }
    if (campeonato.eliminatorias) {
      campeonato.eliminatorias.forEach(eliminatoria => {
        todosPartidos.push(...eliminatoria.partidos.map(p => ({ ...p, fase: eliminatoria.fase })));
      });
    }

    res.json({
      success: true,
      data: {
        campeonato: {
          formato: campeonato.formato,
          equipos: equiposOrdenados,
          grupos: campeonato.grupos || [],
          eliminatorias: campeonato.eliminatorias || [],
          bracket: campeonato.bracket || {},
          todosPartidos: todosPartidos,
          reglas: campeonato.reglas || [],
          premios: campeonato.premios || []
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de campeonato:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener fixture de un campeonato
const obtenerFixtureCampeonato = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findById(id);
    if (!evento || evento.tipo !== 'campeonato') {
      return res.status(404).json({
        success: false,
        message: 'Campeonato no encontrado'
      });
    }

    const campeonato = evento.datosEspecificos?.campeonato;
    if (!campeonato) {
      return res.status(404).json({
        success: false,
        message: 'Datos de campeonato no disponibles'
      });
    }

    // Organizar partidos por fecha
    const partidosPorFecha = {};
    const todosPartidos = [];

    if (campeonato.grupos) {
      campeonato.grupos.forEach(grupo => {
        grupo.partidos.forEach(partido => {
          const fecha = new Date(partido.fecha).toISOString().split('T')[0];
          if (!partidosPorFecha[fecha]) {
            partidosPorFecha[fecha] = [];
          }
          partidosPorFecha[fecha].push({
            ...partido,
            fase: grupo.nombre,
            grupo: grupo.nombre
          });
          todosPartidos.push({
            ...partido,
            fase: grupo.nombre,
            grupo: grupo.nombre
          });
        });
      });
    }

    if (campeonato.eliminatorias) {
      campeonato.eliminatorias.forEach(eliminatoria => {
        eliminatoria.partidos.forEach(partido => {
          const fecha = new Date(partido.fecha).toISOString().split('T')[0];
          if (!partidosPorFecha[fecha]) {
            partidosPorFecha[fecha] = [];
          }
          partidosPorFecha[fecha].push({
            ...partido,
            fase: eliminatoria.fase
          });
          todosPartidos.push({
            ...partido,
            fase: eliminatoria.fase
          });
        });
      });
    }

    res.json({
      success: true,
      data: {
        fixture: {
          partidosPorFecha,
          todosPartidos: todosPartidos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener fixture:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener tabla de posiciones de un campeonato
const obtenerTablaCampeonato = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findById(id);
    if (!evento || evento.tipo !== 'campeonato') {
      return res.status(404).json({
        success: false,
        message: 'Campeonato no encontrado'
      });
    }

    const campeonato = evento.datosEspecificos?.campeonato;
    if (!campeonato) {
      return res.status(404).json({
        success: false,
        message: 'Datos de campeonato no disponibles'
      });
    }

    // Organizar equipos por grupo
    const equiposPorGrupo = {};
    if (campeonato.equipos) {
      campeonato.equipos.forEach(equipo => {
        const grupo = equipo.grupo || 'General';
        if (!equiposPorGrupo[grupo]) {
          equiposPorGrupo[grupo] = [];
        }
        equiposPorGrupo[grupo].push(equipo);
      });
    }

    // Ordenar equipos por puntos en cada grupo
    Object.keys(equiposPorGrupo).forEach(grupo => {
      equiposPorGrupo[grupo].sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        return b.diferenciaGoles - a.diferenciaGoles;
      });
    });

    res.json({
      success: true,
      data: {
        tabla: {
          equiposPorGrupo,
          formato: campeonato.formato
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener tabla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de participación internacional
const obtenerEstadisticasParticipacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findById(id);
    if (!evento || evento.rol !== 'participante') {
      return res.status(404).json({
        success: false,
        message: 'Participación no encontrada'
      });
    }

    const participacion = evento.datosEspecificos?.participacion;
    if (!participacion) {
      return res.status(404).json({
        success: false,
        message: 'Datos de participación no disponibles'
      });
    }

    res.json({
      success: true,
      data: {
        participacion: {
          pais: participacion.pais,
          ciudad: participacion.ciudad,
          organizador: participacion.organizador,
          categoria: participacion.categoria,
          posicion: participacion.posicion,
          totalParticipantes: participacion.totalParticipantes,
          resultados: participacion.resultados,
          estadisticas: participacion.estadisticas,
          logros: participacion.logros,
          medallas: participacion.medallas
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de participación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un evento por ID
const obtenerEvento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findById(id).populate('organizador', 'nombre email');
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      data: { evento }
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo evento
const crearEvento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      fecha,
      fechaFin,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      categoria,
      rol,
      precio,
      cupoMaximo,
      requisitos,
      organizador,
      datosEspecificos
    } = req.body;

    const evento = new Evento({
      titulo,
      descripcion,
      fecha,
      fechaFin,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      categoria,
      rol,
      precio,
      cupoMaximo,
      cupoDisponible: cupoMaximo,
      requisitos,
      organizador,
      datosEspecificos
    });

    await evento.save();
    await evento.populate('organizador', 'nombre email');

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar un evento
const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const evento = await Evento.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('organizador', 'nombre email');

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar un evento
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener tipos de eventos
const obtenerTiposEventos = async (req, res) => {
  try {
    const tipos = await Evento.distinct('tipo', { activo: true });
    res.json({
      success: true,
      data: { tipos }
    });
  } catch (error) {
    console.error('Error al obtener tipos de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener eventos destacados
const obtenerEventosDestacados = async (req, res) => {
  try {
    const eventos = await Evento.find({
      activo: true,
      destacado: true
    })
    .populate('organizador', 'nombre email')
    .sort({ fecha: -1 })
    .limit(6);

    res.json({
      success: true,
      data: { eventos }
    });
  } catch (error) {
    console.error('Error al obtener eventos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Inscribir usuario a evento
const inscribirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, datosInscripcion } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (evento.cupoDisponible <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay cupos disponibles'
      });
    }

    // Verificar si ya está inscrito
    const yaInscrito = evento.inscripciones.some(
      inscripcion => inscripcion.usuario.toString() === usuarioId
    );

    if (yaInscrito) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás inscrito en este evento'
      });
    }

    // Agregar inscripción
    evento.inscripciones.push({
      usuario: usuarioId,
      datosInscripcion,
      fechaInscripcion: new Date()
    });

    evento.cupoDisponible -= 1;
    await evento.save();

    res.json({
      success: true,
      message: 'Inscripción exitosa',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerEventos,
  obtenerEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  obtenerTiposEventos,
  obtenerEventosDestacados,
  inscribirUsuario,
  obtenerEstadisticasLiga,
  obtenerEstadisticasCampeonato,
  obtenerFixtureCampeonato,
  obtenerTablaCampeonato,
  obtenerEstadisticasParticipacion
};
