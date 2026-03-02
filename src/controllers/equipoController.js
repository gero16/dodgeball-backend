const mongoose = require('mongoose');
const Equipo = require('../models/Equipo');
const Jugador = require('../models/Jugador');
const Evento = require('../models/Evento');
const Estadistica = require('../models/Estadistica');

// Crear nuevo equipo
const crearEquipo = async (req, res) => {
  try {
    const { nombre, tipo, pais, ciudad, logo, fotoPortada, fotoPortadaPosicion, fotoInfo, fotoInfoPosicion, galeria, colorPrincipal, colorSecundario, activo } = req.body;

    const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const equipoExistente = await Equipo.findOne({
      nombre: { $regex: new RegExp('^' + escapeRegex(nombre || '') + '$', 'i') }
    });
    if (equipoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un equipo con este nombre'
      });
    }

    const equipo = new Equipo({
      nombre: (nombre || '').trim(),
      tipo: tipo || 'club',
      pais: pais || '',
      ciudad: ciudad || '',
      logo: logo || '',
      fotoPortada: fotoPortada || '',
      fotoPortadaPosicion: fotoPortadaPosicion || 'center',
      fotoInfo: fotoInfo || '',
      fotoInfoPosicion: fotoInfoPosicion || 'center',
      galeria: Array.isArray(galeria) ? galeria : [],
      colorPrincipal: colorPrincipal || '#000000',
      colorSecundario: colorSecundario || '#FFFFFF',
      activo: activo !== false
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

// Obtener equipo por nombre (para detalle en front, usa modelo global Equipo)
const obtenerEquipoPorNombre = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre || '').trim();
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Nombre requerido' });
    }
    const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const equipo = await Equipo.findOne({
      nombre: { $regex: new RegExp('^' + escapeRegex(nombre) + '$', 'i') },
      activo: true
    })
      .populate('jugadores.jugador', 'nombre apellido posicion')
      .lean();

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
    console.error('Error obteniendo equipo por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener partidos y estadísticas agregadas de un equipo en todos los eventos
const obtenerPartidosYEstadisticasEquipo = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre || '').trim();
    const eventoIdPref = (req.query.eventoId || '').toString().trim();
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Nombre requerido' });
    }

    const norm = (s) => (s || '').toString().trim().toLowerCase();
    const nombreNorm = norm(nombre);

    // Top 3: usar Estadistica (agregada por jugador en todos los eventos del equipo)
    let topJugadores = [];
    const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const equipoDoc = await Equipo.findOne({
      nombre: { $regex: new RegExp('^' + escapeRegex(nombre) + '$', 'i') },
      activo: true
    })
      .select('_id')
      .sort({ _id: 1 })
      .lean();
    if (equipoDoc) {
      const topAgg = await Estadistica.aggregate([
        { $match: { equipo: equipoDoc._id, activo: true, jugador: { $ne: null } } },
        { $group: {
          _id: '$jugador',
          hits: { $sum: '$hits' },
          quemados: { $sum: '$quemados' },
          catches: { $sum: '$catches' },
          bloqueos: { $sum: '$bloqueos' },
          esquives: { $sum: '$esquives' },
          indicePoder: { $avg: '$indicePoder' }
        }},
        { $sort: { indicePoder: -1, hits: -1, quemados: -1, catches: -1, _id: 1 } },
        { $limit: 3 }
      ]);
      const jugadorIds = topAgg.map((r) => r._id).filter(Boolean);
      const jugadores = jugadorIds.length > 0
        ? await Jugador.find({ _id: { $in: jugadorIds } }).select('nombre apellido').lean()
        : [];
      const jugadorMap = new Map(jugadores.map((j) => [j._id.toString(), [j.nombre, j.apellido].filter(Boolean).join(' ').trim() || 'Jugador']));
      topJugadores = topAgg.map((r) => ({
        nombreJugador: jugadorMap.get(r._id?.toString()) || 'Jugador',
        hits: Number(r.hits) || 0,
        quemados: Number(r.quemados) || 0,
        catches: Number(r.catches) || 0,
        bloqueos: Number(r.bloqueos) || 0,
        esquives: Number(r.esquives) || 0,
        poderLiga: Number(r.indicePoder) || 0
      }));
    }

    const eventos = await Evento.find({ activo: true })
      .select('titulo datosEspecificos')
      .lean();

    const partidosTodos = [];
    const equiposPorEvento = {};
    const statsAcum = {
      puntos: 0,
      partidosJugados: 0,
      partidosGanados: 0,
      partidosEmpatados: 0,
      partidosPerdidos: 0,
      golesFavor: 0,
      golesContra: 0,
      // Estadísticas detalladas (Hits, Catches, etc.) agregadas desde estadisticasLiga
      hits: 0,
      catches: 0,
      esquives: 0,
      bloqueos: 0,
      quemados: 0,
      asistencias: 0,
      tirosTotales: 0,
      tirosRecibidos: 0,
      hitsRecibidos: 0,
      catchesIntentos: 0,
      catchesRecibidos: 0,
      bloqueosIntentos: 0
    };

    for (const ev of eventos) {
      const liga = ev.datosEspecificos?.liga;
      const campeonato = ev.datosEspecificos?.campeonato;
      const torneo = ev.datosEspecificos?.torneo;
      const equipos = liga?.equipos || campeonato?.equipos || torneo?.equipos || [];
      const partidos = liga?.partidos || campeonato?.partidos || torneo?.partidos || [];

      const equipoEnEvento = equipos.find((e) => norm(e.nombre) === nombreNorm);
      if (!equipoEnEvento) continue;

      equiposPorEvento[ev._id.toString()] = equipos;

      const partidosDelEquipo = (partidos || []).filter(
        (p) => !p.libre && (
          norm(p.equipoLocal) === nombreNorm || norm(p.equipoVisitante) === nombreNorm
        )
      );

      for (const p of partidosDelEquipo) {
        partidosTodos.push({
          ...p,
          _eventoId: ev._id.toString(),
          _eventoTitulo: ev.titulo || ''
        });
      }

      const eq = equipoEnEvento;
      statsAcum.puntos += Number(eq.puntos) || 0;
      statsAcum.partidosJugados += Number(eq.partidosJugados) || 0;
      statsAcum.partidosGanados += Number(eq.partidosGanados) || 0;
      statsAcum.partidosEmpatados += Number(eq.partidosEmpatados) || 0;
      statsAcum.partidosPerdidos += Number(eq.partidosPerdidos) || 0;
      statsAcum.golesFavor += Number(eq.golesFavor) || 0;
      statsAcum.golesContra += Number(eq.golesContra) || 0;

      const ligaStats = liga?.estadisticasLiga || campeonato?.estadisticasLiga || torneo?.estadisticasLiga || [];
      if (ligaStats.length > 0) {
        // Agregar estadísticas detalladas del equipo (suma de todos los jugadores)
        const jugadoresStats = ligaStats.filter((j) => norm(j.equipoNombre) === nombreNorm);
        for (const j of jugadoresStats) {
          statsAcum.hits += Number(j.hits) || 0;
          statsAcum.catches += Number(j.catches) || 0;
          statsAcum.esquives += Number(j.esquives) || 0;
          statsAcum.bloqueos += Number(j.bloqueos) || 0;
          statsAcum.quemados += Number(j.quemados) || 0;
          statsAcum.asistencias += Number(j.asistencias) || 0;
          statsAcum.tirosTotales += Number(j.tirosTotales) || 0;
          statsAcum.tirosRecibidos += Number(j.tirosRecibidos) || 0;
          statsAcum.hitsRecibidos += Number(j.hitsRecibidos) || 0;
          statsAcum.catchesIntentos += Number(j.catchesIntentos) || 0;
          statsAcum.catchesRecibidos += Number(j.catchesRecibidos) || 0;
          statsAcum.bloqueosIntentos += Number(j.bloqueosIntentos) || 0;
        }
      }
    }

    if (eventoIdPref && mongoose.Types.ObjectId.isValid(eventoIdPref) && equipoDoc) {
      const stats = await Estadistica.find({
        evento: new mongoose.Types.ObjectId(eventoIdPref),
        equipo: equipoDoc._id,
        activo: true
      }).lean();
      const tieneStatsDetalladas = statsAcum.hits > 0 || statsAcum.catches > 0 || statsAcum.tirosTotales > 0;
      if (!tieneStatsDetalladas && stats.length > 0) {
        for (const s of stats) {
            statsAcum.hits += Number(s.hits) || 0;
            statsAcum.catches += Number(s.catches) || 0;
            statsAcum.esquives += Number(s.esquives) || 0;
            statsAcum.bloqueos += Number(s.bloqueos) || 0;
            statsAcum.quemados += Number(s.quemados) || 0;
            statsAcum.asistencias += Number(s.asistencias) || 0;
            statsAcum.tirosTotales += Number(s.tirosTotales) || 0;
            statsAcum.tirosRecibidos += Number(s.tirosRecibidos) || 0;
            statsAcum.hitsRecibidos += Number(s.hitsRecibidos) || 0;
            statsAcum.catchesIntentos += Number(s.catchesIntentos || s.catchesIntentados) || 0;
            statsAcum.catchesRecibidos += Number(s.catchesRecibidos) || 0;
            statsAcum.bloqueosIntentos += Number(s.bloqueosIntentos || s.bloqueosIntentados) || 0;
        }
      }
    }

    partidosTodos.sort((a, b) => {
      const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
      return fb - fa;
    });

    res.json({
      success: true,
      data: {
        partidos: partidosTodos,
        estadisticas: statsAcum,
        equiposPorEvento,
        topJugadores
      }
    });
  } catch (error) {
    console.error('Error obteniendo partidos y estadísticas del equipo:', error);
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
      .populate('jugadores.jugador', 'nombre apellido posicion');

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
        select: 'nombre apellido posicion'
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
  obtenerEquipoPorNombre,
  obtenerPartidosYEstadisticasEquipo,
  actualizarEquipo,
  eliminarEquipo,
  obtenerJugadoresEquipo
};