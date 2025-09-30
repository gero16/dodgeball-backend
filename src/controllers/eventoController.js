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
      tipoJuego, // Nuevo campo
      categoria,
      precio,
      cupoMaximo,
      cupoDisponible,
      imagen,
      requisitos,
      datosEspecificos
    } = req.body;

    // Validar que tipoJuego sea válido
    if (tipoJuego && !['foam', 'cloth'].includes(tipoJuego)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de juego debe ser "foam" o "cloth"'
      });
    }

    const nuevoEvento = new Evento({
      titulo,
      descripcion,
      fecha,
      fechaFin,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      tipoJuego: tipoJuego || 'foam', // Default a 'foam' si no se especifica
      categoria,
      precio,
      cupoMaximo,
      cupoDisponible,
      imagen,
      requisitos,
      datosEspecificos,
      organizador: req.user.id
    });

    const eventoGuardado = await nuevoEvento.save();
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: eventoGuardado
    });

  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un evento
const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      fecha,
      fechaFin,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      tipoJuego, // Nuevo campo
      categoria,
      precio,
      cupoMaximo,
      cupoDisponible,
      imagen,
      requisitos,
      datosEspecificos
    } = req.body;

    // Validar que tipoJuego sea válido si se proporciona
    if (tipoJuego && !['foam', 'cloth'].includes(tipoJuego)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de juego debe ser "foam" o "cloth"'
      });
    }

    const eventoActualizado = await Evento.findByIdAndUpdate(
      id,
      {
        titulo,
        descripcion,
        fecha,
        fechaFin,
        horaInicio,
        horaFin,
        ubicacion,
        tipo,
        tipoJuego, // Incluir en la actualización
        categoria,
        precio,
        cupoMaximo,
        cupoDisponible,
        imagen,
        requisitos,
        datosEspecificos
      },
      { new: true, runValidators: true }
    );

    if (!eventoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: eventoActualizado
    });

  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
    const tipos = await Evento.distinct('tipo');
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
    .sort({ fecha: 1 })
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

// Inscribir usuario a un evento
const inscribirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar si hay cupo disponible
    if (evento.inscritos.length >= evento.cupoMaximo) {
      return res.status(400).json({
        success: false,
        message: 'No hay cupo disponible'
      });
    }

    // Verificar si el usuario ya está inscrito
    if (evento.inscritos.includes(usuarioId)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está inscrito en este evento'
      });
    }

    evento.inscritos.push(usuarioId);
    evento.cupoDisponible = evento.cupoMaximo - evento.inscritos.length;
    await evento.save();

    res.json({
      success: true,
      message: 'Usuario inscrito exitosamente'
    });
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de liga
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

    const ligaData = evento.datosEspecificos?.liga;
    if (!ligaData) {
      return res.status(404).json({
        success: false,
        message: 'Datos de liga no encontrados'
      });
    }

    res.json({
      success: true,
      data: {
        equipos: ligaData.equipos || [],
        partidos: ligaData.partidos || [],
        tabla: ligaData.tabla || []
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

// Obtener estadísticas de campeonato
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

    const campeonatoData = evento.datosEspecificos?.campeonato;
    if (!campeonatoData) {
      return res.status(404).json({
        success: false,
        message: 'Datos de campeonato no encontrados'
      });
    }

    res.json({
      success: true,
      data: {
        equipos: campeonatoData.equipos || [],
        partidos: campeonatoData.partidos || [],
        tabla: campeonatoData.tabla || []
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

// Obtener fixture de campeonato
const obtenerFixtureCampeonato = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findById(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const fixtureData = evento.datosEspecificos?.liga?.partidos || 
                       evento.datosEspecificos?.campeonato?.partidos || [];

    res.json({
      success: true,
      data: { partidos: fixtureData }
    });
  } catch (error) {
    console.error('Error al obtener fixture:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener tabla de campeonato
const obtenerTablaCampeonato = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findById(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const tablaData = evento.datosEspecificos?.liga?.equipos || 
                     evento.datosEspecificos?.campeonato?.equipos || [];

    res.json({
      success: true,
      data: { equipos: tablaData }
    });
  } catch (error) {
    console.error('Error al obtener tabla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de participación
const obtenerEstadisticasParticipacion = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findById(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        inscritos: evento.inscritos?.length || 0,
        cupoMaximo: evento.cupoMaximo || 0,
        cupoDisponible: evento.cupoDisponible || 0
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

// Actualizar equipos de liga
const actualizarEquiposLiga = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipos } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (!evento.datosEspecificos) {
      evento.datosEspecificos = {};
    }
    if (!evento.datosEspecificos.liga) {
      evento.datosEspecificos.liga = {};
    }

    evento.datosEspecificos.liga.equipos = equipos;
    await evento.save();

    res.json({
      success: true,
      message: 'Equipos actualizados exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al actualizar equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar fixture de liga
const actualizarFixtureLiga = async (req, res) => {
  try {
    const { id } = req.params;
    const { partidos } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (!evento.datosEspecificos) {
      evento.datosEspecificos = {};
    }
    if (!evento.datosEspecificos.liga) {
      evento.datosEspecificos.liga = {};
    }

    evento.datosEspecificos.liga.partidos = partidos;
    await evento.save();

    res.json({
      success: true,
      message: 'Fixture actualizado exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al actualizar fixture:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar resultado de partido
const actualizarResultadoPartido = async (req, res) => {
  try {
    const { id, partidoId } = req.params;
    const { golesLocal, golesVisitante } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const partidos = evento.datosEspecificos?.liga?.partidos || [];
    const partidoIndex = partidos.findIndex(p => p._id?.toString() === partidoId);
    
    if (partidoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }

    partidos[partidoIndex].golesLocal = golesLocal;
    partidos[partidoIndex].golesVisitante = golesVisitante;
    partidos[partidoIndex].estado = 'finalizado';

    // Recalcular tabla de posiciones
    await recalcularTablaPosiciones(evento, partidos);

    await evento.save();

    res.json({
      success: true,
      message: 'Resultado actualizado exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al actualizar resultado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estadísticas de partido
const actualizarEstadisticasPartido = async (req, res) => {
  try {
    const { id, partidoId } = req.params;
    const { estadisticas } = req.body;

    console.log('🔍 DEBUG - ID del evento:', id);
    console.log('🔍 DEBUG - ID del partido:', partidoId);
    console.log('🔍 DEBUG - Estadísticas recibidas:', JSON.stringify(estadisticas, null, 2));

    const evento = await Evento.findById(id);
    if (!evento) {
      console.log('❌ DEBUG - Evento no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Crear una copia profunda de los datos específicos
    const datosEspecificos = JSON.parse(JSON.stringify(evento.datosEspecificos || {}));
    const partidos = datosEspecificos.liga?.partidos || [];
    
    console.log('🔍 DEBUG - Partidos encontrados:', partidos.length);
    console.log('🔍 DEBUG - IDs de partidos:', partidos.map(p => p._id?.toString()));

    const partidoIndex = partidos.findIndex(p => p._id?.toString() === partidoId);
    console.log('🔍 DEBUG - Índice del partido encontrado:', partidoIndex);
    
    if (partidoIndex === -1) {
      console.log('❌ DEBUG - Partido no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }

    console.log('🔍 DEBUG - Partido antes de actualizar:', JSON.stringify(partidos[partidoIndex], null, 2));
    
    // Asignar las estadísticas directamente
    partidos[partidoIndex].estadisticas = estadisticas;
    
    // Actualizar el evento con los nuevos datos
    evento.datosEspecificos = datosEspecificos;
    
    console.log('🔍 DEBUG - Partido después de actualizar:', JSON.stringify(partidos[partidoIndex], null, 2));
    
    await evento.save();
    console.log('✅ DEBUG - Evento guardado exitosamente');

    res.json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('❌ DEBUG - Error al actualizar estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar premios de liga
const actualizarPremiosLiga = async (req, res) => {
  try {
    const { id } = req.params;
    const { premios } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    if (!evento.datosEspecificos) {
      evento.datosEspecificos = {};
    }
    if (!evento.datosEspecificos.liga) {
      evento.datosEspecificos.liga = {};
    }

    evento.datosEspecificos.liga.premios = premios;
    await evento.save();

    res.json({
      success: true,
      message: 'Premios actualizados exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al actualizar premios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener detalle de partido
const obtenerPartidoDetalle = async (req, res) => {
  try {
    const { id, partidoId } = req.params;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const partidos = evento.datosEspecificos?.liga?.partidos || [];
    const partido = partidos.find(p => p._id?.toString() === partidoId);
    
    if (!partido) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }

    res.json({
      success: true,
      data: { partido }
    });
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función auxiliar para recalcular tabla de posiciones
const recalcularTablaPosiciones = async (evento, partidos) => {
  const equipos = evento.datosEspecificos?.liga?.equipos || [];
  
  // Resetear estadísticas de equipos
  equipos.forEach(equipo => {
    equipo.puntos = 0;
    equipo.partidosJugados = 0;
    equipo.partidosGanados = 0;
    equipo.partidosEmpatados = 0;
    equipo.partidosPerdidos = 0;
    equipo.golesFavor = 0;
    equipo.golesContra = 0;
    equipo.diferenciaGoles = 0;
  });

  // Procesar partidos finalizados
  partidos.forEach(partido => {
    if (partido.estado === 'finalizado' && partido.golesLocal !== undefined && partido.golesVisitante !== undefined) {
      const equipoLocal = equipos.find(e => e.nombre === partido.equipoLocal);
      const equipoVisitante = equipos.find(e => e.nombre === partido.equipoVisitante);

      if (equipoLocal && equipoVisitante) {
        // Actualizar partidos jugados
        equipoLocal.partidosJugados++;
        equipoVisitante.partidosJugados++;

        // Actualizar goles
        equipoLocal.golesFavor += partido.golesLocal;
        equipoLocal.golesContra += partido.golesVisitante;
        equipoVisitante.golesFavor += partido.golesVisitante;
        equipoVisitante.golesContra += partido.golesLocal;

        // Calcular diferencia de goles
        equipoLocal.diferenciaGoles = equipoLocal.golesFavor - equipoLocal.golesContra;
        equipoVisitante.diferenciaGoles = equipoVisitante.golesFavor - equipoVisitante.golesContra;

        // Determinar resultado y asignar puntos
        if (partido.golesLocal > partido.golesVisitante) {
          equipoLocal.partidosGanados++;
          equipoLocal.puntos += 3;
          equipoVisitante.partidosPerdidos++;
        } else if (partido.golesLocal < partido.golesVisitante) {
          equipoVisitante.partidosGanados++;
          equipoVisitante.puntos += 3;
          equipoLocal.partidosPerdidos++;
        } else {
          equipoLocal.partidosEmpatados++;
          equipoLocal.puntos += 1;
          equipoVisitante.partidosEmpatados++;
          equipoVisitante.puntos += 1;
        }
      }
    }
  });
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
  obtenerEstadisticasParticipacion,
  actualizarEquiposLiga,
  actualizarFixtureLiga,
  actualizarResultadoPartido,
  actualizarEstadisticasPartido,
  actualizarPremiosLiga,
  obtenerPartidoDetalle
};
