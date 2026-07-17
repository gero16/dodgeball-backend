const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');
const Evento = require('../models/Evento');
const Estadistica = require('../models/Estadistica');

// Crear nuevo jugador
const crearJugador = async (req, res) => {
  try {
    const { usuario, nombre, apellido, fechaNacimiento, posicion, numeroCamiseta, email, telefono, equipo, activo } = req.body;

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
      .populate('usuario', 'nombre email');

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

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    if (equipo) {
      const equipoDoc = await Equipo.findById(equipo).select('jugadores').lean();
      const jugadorIds = (equipoDoc?.jugadores || []).map((j) => j.jugador).filter(Boolean);
      query._id = jugadorIds.length > 0 ? { $in: jugadorIds } : { $in: [] };
    }

    const jugadores = await Jugador.find(query)
      .populate('usuario', 'nombre email')
      .sort({ nombre: 1, apellido: 1 })
      .skip(skip)
      .limit(parseInt(limite))
      .lean();

    const total = await Jugador.countDocuments(query);

    // Obtener equipos (cuadros) a los que pertenece cada jugador
    const jugadorIds = jugadores.map((j) => j._id.toString());
    const equiposDocs = await Equipo.find({
      'jugadores.jugador': { $in: jugadores.map((j) => j._id) },
      activo: true
    })
      .select('nombre tipo jugadores')
      .lean();

    const equiposPorJugador = {};
    for (const eq of equiposDocs) {
      for (const j of eq.jugadores || []) {
        const jid = (j.jugador && j.jugador.toString ? j.jugador.toString() : String(j.jugador));
        if (jid && jugadorIds.includes(jid)) {
          if (!equiposPorJugador[jid]) equiposPorJugador[jid] = [];
          equiposPorJugador[jid].push({ nombre: eq.nombre, tipo: eq.tipo });
        }
      }
    }

    const jugadoresConEquipos = jugadores.map((j) => ({
      ...j,
      equipos: equiposPorJugador[j._id.toString()] || []
    }));

    res.json({
      success: true,
      data: { 
        jugadores: jugadoresConEquipos,
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

// Actualizar estadísticas de un jugador en un partido (usa tabla Estadistica)
const actualizarEstadisticasJugador = async (req, res) => {
  try {
    const { jugadorId, partidoId, equipoId } = req.params;
    const { estadisticas } = req.body;

    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
      return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }
    const evento = await Evento.findById(partidoId);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Partido no encontrado' });
    }
    const equipo = await Equipo.findById(equipoId);
    if (!equipo) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    const temporada = evento?.datosEspecificos?.liga?.temporada || new Date().getFullYear().toString();
    const update = {
      setsJugados: estadisticas.setsJugados || 1,
      hits: estadisticas.hits || 0,
      quemados: estadisticas.quemados || estadisticas.outs || 0,
      asistencias: estadisticas.asistencias || 0,
      tirosRecibidos: estadisticas.tirosRecibidos || 0,
      hitsRecibidos: estadisticas.hitsRecibidos || 0,
      esquives: estadisticas.esquives || estadisticas.dodges || 0,
      esquivesSinEsfuerzo: estadisticas.esquivesExitosos || estadisticas.dodgesExitosos || 0,
      ponchado: estadisticas.ponchado || 0,
      catchesIntentados: estadisticas.catchesIntentos || 0,
      catches: estadisticas.catches || 0,
      bloqueosIntentados: estadisticas.bloqueosIntentos || 0,
      bloqueos: estadisticas.bloqueos || 0,
      pisoLinea: estadisticas.pisoLinea || 0,
      catchesRecibidos: estadisticas.catchesRecibidos || 0,
      tirosTotales: estadisticas.tirosTotales || 0
    };

    const estadistica = await Estadistica.findOneAndUpdate(
      { jugador: jugadorId, equipo: equipoId, evento: partidoId },
      { $set: { ...update, temporada, activo: true } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      data: { estadistica }
    });
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de un jugador (agregadas + desglose por evento/partido)
const obtenerEstadisticasJugador = async (req, res) => {
  try {
    const { jugadorId } = req.params;
    const { equipoId, eventoId } = req.query;
    const { displayName, normalizeName, isMembershipActive } = require('../utils/plantelSync');

    const jugador = await Jugador.findById(jugadorId)
      .populate('usuario', 'nombre email');

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    const emptyStats = () => ({
      setsJugados: 0,
      tirosTotales: 0,
      hits: 0,
      quemados: 0,
      asistencias: 0,
      tirosRecibidos: 0,
      hitsRecibidos: 0,
      esquives: 0,
      esquivesExitosos: 0,
      ponchado: 0,
      catchesIntentados: 0,
      catches: 0,
      bloqueosIntentados: 0,
      bloqueos: 0,
      pisoLinea: 0,
      catchesRecibidos: 0,
      partidosJugados: 0
    });

    const addRowToStats = (target, j) => {
      target.setsJugados += parseInt(j.setsJugados, 10) || 0;
      target.tirosTotales += parseInt(j.tirosTotales, 10) || 0;
      target.hits += parseInt(j.hits, 10) || 0;
      target.quemados += parseInt(j.quemados, 10) || 0;
      target.asistencias += parseInt(j.asistencias, 10) || 0;
      target.tirosRecibidos += parseInt(j.tirosRecibidos, 10) || 0;
      target.hitsRecibidos += parseInt(j.hitsRecibidos, 10) || 0;
      target.esquives += parseInt(j.dodges || j.esquives, 10) || 0;
      target.esquivesExitosos += parseInt(j.esquivesExitosos || j.esquivesSinEsfuerzo, 10) || 0;
      target.ponchado += parseInt(j.ponchado, 10) || 0;
      target.catchesIntentados += parseInt(j.catchesIntentos || j.catchesIntentados, 10) || 0;
      target.catches += parseInt(j.catches, 10) || 0;
      target.bloqueosIntentados += parseInt(j.bloqueosIntentos || j.bloqueosIntentados, 10) || 0;
      target.bloqueos += parseInt(j.bloqueos, 10) || 0;
      target.pisoLinea += parseInt(j.pisoLinea, 10) || 0;
      target.catchesRecibidos += parseInt(j.catchesRecibidos, 10) || 0;
    };

    const match = { jugador: jugadorId, activo: true };
    if (equipoId) match.equipo = equipoId;
    if (eventoId) match.evento = eventoId;

    const agg = await Estadistica.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        setsJugados: { $sum: '$setsJugados' },
        tirosTotales: { $sum: '$tirosTotales' },
        hits: { $sum: '$hits' },
        quemados: { $sum: '$quemados' },
        asistencias: { $sum: '$asistencias' },
        tirosRecibidos: { $sum: '$tirosRecibidos' },
        hitsRecibidos: { $sum: '$hitsRecibidos' },
        esquives: { $sum: '$esquives' },
        esquivesExitosos: { $sum: '$esquivesSinEsfuerzo' },
        ponchado: { $sum: '$ponchado' },
        catchesIntentados: { $sum: '$catchesIntentados' },
        catches: { $sum: '$catches' },
        bloqueosIntentados: { $sum: '$bloqueosIntentados' },
        bloqueos: { $sum: '$bloqueos' },
        catchesRecibidos: { $sum: '$catchesRecibidos' },
        partidosJugados: { $sum: '$partidosJugados' }
      }}
    ]);

    const fromCollection = agg[0] ? {
      ...emptyStats(),
      setsJugados: agg[0].setsJugados || 0,
      tirosTotales: agg[0].tirosTotales || 0,
      hits: agg[0].hits || 0,
      quemados: agg[0].quemados || 0,
      asistencias: agg[0].asistencias || 0,
      tirosRecibidos: agg[0].tirosRecibidos || 0,
      hitsRecibidos: agg[0].hitsRecibidos || 0,
      esquives: agg[0].esquives || 0,
      esquivesExitosos: agg[0].esquivesExitosos || 0,
      ponchado: agg[0].ponchado || 0,
      catchesIntentados: agg[0].catchesIntentados || 0,
      catches: agg[0].catches || 0,
      bloqueosIntentados: agg[0].bloqueosIntentados || 0,
      bloqueos: agg[0].bloqueos || 0,
      catchesRecibidos: agg[0].catchesRecibidos || 0,
      partidosJugados: agg[0].partidosJugados || 0
    } : emptyStats();

    // Desglose desde partidos embebidos en eventos (carga por sets / pegado)
    const nameKey = normalizeName(displayName(jugador));
    const fromEventos = emptyStats();
    const porEventoMap = new Map(); // eventoId -> { ... }

    try {
      const eventosQuery = eventoId
        ? Evento.find({ _id: eventoId }).select('titulo fechaInicio fechaFin datosEspecificos').lean()
        : Evento.find({}).select('titulo fechaInicio fechaFin datosEspecificos').lean();
      const eventos = await eventosQuery;

      for (const ev of eventos || []) {
        const ds = ev?.datosEspecificos || {};
        const partidos = ds.liga?.partidos || ds.campeonato?.partidos || ds.torneo?.partidos || [];
        const evId = String(ev._id);
        let eventoBucket = porEventoMap.get(evId);

        for (const p of partidos) {
          const rows = Array.isArray(p?.estadisticasJugadores) ? p.estadisticasJugadores : [];
          const matchedRows = rows.filter((j) => normalizeName(j?.nombreJugador) === nameKey);
          if (!matchedRows.length) continue;

          const partidoStats = emptyStats();
          let lado = null;
          for (const j of matchedRows) {
            addRowToStats(fromEventos, j);
            addRowToStats(partidoStats, j);
            if (!lado && j.equipo) lado = j.equipo === 'visitante' ? 'visitante' : 'local';
          }
          partidoStats.partidosJugados = 1;
          fromEventos.partidosJugados += 1;

          if (!eventoBucket) {
            eventoBucket = {
              eventoId: evId,
              titulo: ev.titulo || 'Evento',
              fechaInicio: ev.fechaInicio || null,
              fechaFin: ev.fechaFin || null,
              estadisticas: emptyStats(),
              partidos: []
            };
            porEventoMap.set(evId, eventoBucket);
          }

          for (const k of Object.keys(partidoStats)) {
            if (k === 'partidosJugados') {
              eventoBucket.estadisticas.partidosJugados += partidoStats.partidosJugados;
            } else {
              eventoBucket.estadisticas[k] += partidoStats[k] || 0;
            }
          }

          eventoBucket.partidos.push({
            partidoId: p._id ? String(p._id) : null,
            fecha: p.fecha || null,
            hora: p.hora || null,
            equipoLocal: p.equipoLocal || '',
            equipoVisitante: p.equipoVisitante || '',
            golesLocal: p.golesLocal ?? null,
            golesVisitante: p.golesVisitante ?? null,
            estado: p.estado || null,
            lado: lado || null,
            equipoDelJugador: lado === 'visitante'
              ? (p.equipoVisitante || '')
              : (lado === 'local' ? (p.equipoLocal || '') : ''),
            estadisticas: partidoStats
          });
        }
      }
    } catch (evErr) {
      console.warn('No se pudieron sumar stats desde eventos:', evErr?.message);
    }

    // Preferir la fuente más rica por campo (evitar doble conteo cuando ambas existen)
    const estadisticas = emptyStats();
    for (const k of Object.keys(estadisticas)) {
      estadisticas[k] = Math.max(fromCollection[k] || 0, fromEventos[k] || 0);
    }
    estadisticas.fuente = (fromEventos.tirosTotales + fromEventos.setsJugados) >= (fromCollection.tirosTotales + fromCollection.setsJugados)
      ? 'eventos'
      : 'estadistica';

    const porEvento = Array.from(porEventoMap.values())
      .map((ev) => ({
        ...ev,
        partidos: [...ev.partidos].sort((a, b) => {
          const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
          const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
          return fb - fa;
        })
      }))
      .sort((a, b) => {
        const fa = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
        const fb = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
        if (fb !== fa) return fb - fa;
        return String(a.titulo || '').localeCompare(String(b.titulo || ''), 'es');
      });

    const equiposDocs = await Equipo.find({ 'jugadores.jugador': jugadorId, activo: true })
      .select('nombre tipo pais ciudad jugadores')
      .lean();

    const equipos = equiposDocs.map((e) => {
      const row = (e.jugadores || []).find((j) => j.jugador?.toString() === jugadorId);
      return {
        _id: e._id,
        nombre: e.nombre,
        tipo: e.tipo,
        pais: e.pais,
        ciudad: e.ciudad,
        activo: isMembershipActive(row),
        fechaIngreso: row?.fechaIngreso || null,
        fechaHasta: row?.fechaHasta || null
      };
    });

    res.json({
      success: true,
      data: {
        jugador: {
          id: jugador._id,
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          nombreCompleto: displayName(jugador),
          posicion: jugador.posicion,
          numeroCamiseta: jugador.numeroCamiseta || null,
          activo: jugador.activo !== false
        },
        estadisticas,
        porEvento,
        equipos
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

// Obtener ranking de jugadores (agregado desde Estadistica)
const obtenerRankingJugadores = async (req, res) => {
  try {
    const { equipoId, eventoId, limite = 10, posicion } = req.query;

    const match = { activo: true };
    if (equipoId) match.equipo = equipoId;
    if (eventoId) match.evento = eventoId;

    const topAgg = await Estadistica.aggregate([
      { $match: match },
      { $group: {
        _id: '$jugador',
        indicePoder: { $avg: '$indicePoder' },
        hits: { $sum: '$hits' }
      }},
      { $sort: { indicePoder: -1 } },
      { $limit: parseInt(limite) || 10 }
    ]);

    const jugadorIds = topAgg.map((r) => r._id).filter(Boolean);
    if (jugadorIds.length === 0) {
      return res.json({ success: true, data: { jugadores: [] } });
    }

    let jugadorQuery = { _id: { $in: jugadorIds }, activo: true };
    if (posicion) jugadorQuery.posicion = posicion;

    const jugadores = await Jugador.find(jugadorQuery)
      .populate('usuario', 'nombre email')
      .lean();

    const ordenMap = new Map(topAgg.map((r, i) => [r._id.toString(), i]));
    const jugadoresOrdenados = jugadores
      .sort((a, b) => (ordenMap.get(a._id.toString()) ?? 999) - (ordenMap.get(b._id.toString()) ?? 999) );

    res.json({
      success: true,
      data: { jugadores: jugadoresOrdenados }
    });
  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener equipos de un jugador
const obtenerEquiposJugador = async (req, res) => {
  try {
    const { id } = req.params;
    const { historial } = req.query;
    const { isMembershipActive } = require('../utils/plantelSync');

    const equipos = await Equipo.find({
      'jugadores.jugador': id,
      activo: true
    })
      .select('nombre tipo ciudad logo jugadores')
      .lean();

    const equiposConDetalle = [];
    for (const eq of equipos) {
      const entradas = (eq.jugadores || []).filter((j) => j.jugador?.toString() === id);
      for (const entrada of entradas) {
        const activa = isMembershipActive(entrada);
        if (!historial && !activa) continue;
        equiposConDetalle.push({
          _id: eq._id,
          nombre: eq.nombre,
          tipo: eq.tipo,
          ciudad: eq.ciudad,
          logo: eq.logo,
          numeroCamiseta: entrada?.numeroCamiseta,
          posicion: entrada?.posicion,
          activo: activa,
          fechaIngreso: entrada?.fechaIngreso || null,
          fechaHasta: entrada?.fechaHasta || null
        });
      }
    }

    res.json({
      success: true,
      data: { equipos: equiposConDetalle }
    });
  } catch (error) {
    console.error('Error obteniendo equipos del jugador:', error);
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
      fechaHasta: null,
      activo: true
    });

    // Espejo aditivo en plantelNombres (compat UI / eventos)
    const {
      mirrorJugadorNameIntoPlantel,
      uniquePlantelNames,
      propagatePlantelNombresToEventos
    } = require('../utils/plantelSync');
    await mirrorJugadorNameIntoPlantel(equipo, jugador);
    await equipo.save();

    // Propagar nombre a planteles de eventos (unión, no replace)
    try {
      await propagatePlantelNombresToEventos(equipo);
    } catch (propErr) {
      console.warn('No se pudo propagar jugador a eventos:', propErr?.message);
      try {
      const Evento = require('../models/Evento');
      const name = `${jugador.nombre || ''} ${jugador.apellido || ''}`.trim();
      const clubKey = (equipo.nombre || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      const eventos = await Evento.find({}).select('datosEspecificos');
      for (const ev of eventos) {
        if (!ev.datosEspecificos) continue;
        const ds = ev.datosEspecificos;
        const tipo = ds.liga ? 'liga' : ds.campeonato ? 'campeonato' : ds.torneo ? 'torneo' : null;
        if (!tipo || !Array.isArray(ds[tipo]?.equipos)) continue;
        let changed = false;
        ds[tipo].equipos = ds[tipo].equipos.map((eq) => {
          const n = (eq?.nombre || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
          if (n !== clubKey) return eq;
          changed = true;
          const base = (eq && typeof eq.toObject === 'function') ? eq.toObject() : { ...eq };
          return {
            ...base,
            plantelNombres: uniquePlantelNames([
              ...(Array.isArray(base.plantelNombres) ? base.plantelNombres : []),
              name
            ])
          };
        });
        if (changed) {
          ev.markModified('datosEspecificos');
          await ev.save();
        }
      }
      } catch (_) { /* ignore */ }
    }

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

// Actualizar jugador
const actualizarJugador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, posicion, numeroCamiseta, activo } = req.body;

    const jugador = await Jugador.findByIdAndUpdate(
      id,
      {
        ...(nombre !== undefined && { nombre: String(nombre).trim() }),
        ...(apellido !== undefined && { apellido: String(apellido).trim() }),
        ...(posicion !== undefined && { posicion }),
        ...(numeroCamiseta !== undefined && { numeroCamiseta: numeroCamiseta || null }),
        ...(activo !== undefined && { activo: activo !== false })
      },
      { new: true, runValidators: true }
    )
      .populate('usuario', 'nombre email');

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Jugador actualizado exitosamente',
      data: { jugador }
    });
  } catch (error) {
    console.error('Error actualizando jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar jugador (soft delete - desactivar)
const eliminarJugador = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await Jugador.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Jugador desactivado exitosamente',
      data: { jugador }
    });
  } catch (error) {
    console.error('Error eliminando jugador:', error);
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

    const jugador = await Jugador.findById(jugadorId);
    const { removeJugadorNameFromPlantel, isMembershipActive, propagatePlantelNombresToEventos } = require('../utils/plantelSync');

    // Baja con fecha (historial), no borrado duro
    const now = new Date();
    let found = false;
    for (const row of equipo.jugadores || []) {
      if (row.jugador.toString() !== jugadorId) continue;
      if (!isMembershipActive(row, now)) continue;
      row.activo = false;
      row.fechaHasta = now;
      found = true;
    }
    if (!found) {
      // Compat: si no hay fila activa, quitar restos
      equipo.jugadores = (equipo.jugadores || []).filter(
        (j) => j.jugador.toString() !== jugadorId
      );
    }

    if (jugador) {
      await removeJugadorNameFromPlantel(equipo, jugador);
    }
    equipo.markModified('jugadores');
    await equipo.save();
    try {
      await propagatePlantelNombresToEventos(equipo);
    } catch (e) {
      console.warn('No se pudo propagar plantel tras baja:', e?.message);
    }

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

/** POST transferir con fecha (cierra origen, abre destino, historial). */
const transferirJugadorController = async (req, res) => {
  try {
    const { jugadorId } = req.params;
    const {
      haciaEquipoId,
      desdeEquipoId,
      fecha,
      motivo,
      numeroCamiseta,
      posicion
    } = req.body || {};

    if (!haciaEquipoId) {
      return res.status(400).json({
        success: false,
        message: 'haciaEquipoId es requerido'
      });
    }

    const { transferirJugador } = require('../utils/plantelSync');
    const result = await transferirJugador({
      jugadorId,
      haciaEquipoId,
      desdeEquipoId: desdeEquipoId || null,
      fecha: fecha || new Date(),
      motivo: motivo || '',
      creadoPor: req.usuario?._id || null,
      numeroCamiseta: numeroCamiseta ?? null,
      posicion: posicion || null
    });

    res.json({
      success: true,
      message: 'Transferencia registrada',
      data: result
    });
  } catch (error) {
    console.error('Error en transferencia:', error);
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

const listarTransferenciasJugador = async (req, res) => {
  try {
    const { jugadorId } = req.params;
    const Transferencia = require('../models/Transferencia');
    const rows = await Transferencia.find({ jugador: jugadorId })
      .sort({ fecha: -1 })
      .populate('desdeEquipo', 'nombre')
      .populate('haciaEquipo', 'nombre')
      .populate('jugador', 'nombre apellido')
      .lean();

    res.json({
      success: true,
      data: { transferencias: rows }
    });
  } catch (error) {
    console.error('Error listando transferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const listarTransferencias = async (req, res) => {
  try {
    const Transferencia = require('../models/Transferencia');
    const limite = Math.min(parseInt(req.query.limite, 10) || 50, 200);
    const rows = await Transferencia.find({})
      .sort({ fecha: -1 })
      .limit(limite)
      .populate('desdeEquipo', 'nombre')
      .populate('haciaEquipo', 'nombre')
      .populate('jugador', 'nombre apellido')
      .lean();

    res.json({
      success: true,
      data: { transferencias: rows }
    });
  } catch (error) {
    console.error('Error listando transferencias:', error);
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
  actualizarJugador,
  eliminarJugador,
  obtenerEquiposJugador,
  actualizarEstadisticasJugador,
  obtenerEstadisticasJugador,
  obtenerRankingJugadores,
  agregarJugadorAEquipo,
  removerJugadorDeEquipo,
  transferirJugadorController,
  listarTransferenciasJugador,
  listarTransferencias
};
