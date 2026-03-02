const Equipo = require('../models/Equipo');
const Jugador = require('../models/Jugador');
const Evento = require('../models/Evento');

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
      .populate('jugadores.jugador', 'nombre apellido posicion estadisticasGenerales')
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
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Nombre requerido' });
    }

    const norm = (s) => (s || '').toString().trim().toLowerCase();
    const nombreNorm = norm(nombre);

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
      golesContra: 0
    };
    const jugadoresMap = new Map();

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
      for (const j of ligaStats) {
        if (norm(j.equipoNombre) !== nombreNorm) continue;
        const nombreJug = (j.nombreJugador || '').toString().trim();
        if (!nombreJug) continue;
        const key = norm(nombreJug);
        const acc = jugadoresMap.get(key) || { nombreJugador: nombreJug, hits: 0, catches: 0, partidosJugados: 0 };
        acc.hits += Number(j.hits) || 0;
        acc.catches += Number(j.catches) || 0;
        acc.partidosJugados += Number(j.partidosJugados) || 0;
        jugadoresMap.set(key, acc);
      }
    }

    const topJugadores = Array.from(jugadoresMap.values())
      .sort((a, b) => (b.hits || 0) - (a.hits || 0))
      .slice(0, 3);

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
  obtenerEquipoPorNombre,
  obtenerPartidosYEstadisticasEquipo,
  actualizarEquipo,
  eliminarEquipo,
  obtenerJugadoresEquipo
};
