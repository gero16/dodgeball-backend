const Evento = require('../models/Evento');
const Estadistica = require('../models/Estadistica');
const Horario = require('../models/Horario');
const XLSX = require('xlsx');
const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');
const fs = require('fs');
const path = require('path');

// Utilidad: construir resumen por categoría/equipo/jugador a partir de filas crudas
function buildSummaryFromRows(rows) {
  // Mapeo de alias -> clave canónica
  const metricAliases = {
    // Métricas existentes
    hits: ['Hits', 'hits', 'Local Hits', 'Visitante Hits', 'Hits Local', 'Hits Visitante', 'Tiros acertados', 'Tiros acertados (incluye bloqueos)'],
    catches: ['Catches', 'catches', 'Local Catches', 'Visitante Catches', 'Catches Local', 'Catches Visitante'],
    dodges: ['Dodges', 'dodges', 'Esquives', 'esquives', 'Local Dodges', 'Visitante Dodges'],
    bloqueos: ['Bloqueos', 'bloqueos', 'Local Bloqueos', 'Visitante Bloqueos', 'Bloqueos realizados'],
    quemados: ['Quemados', 'quemados', 'Outs', 'outs', 'Local Quemados', 'Visitante Quemados', 'Tiros con Outs', 'Tiros con Outs (manchar)'],
    tarjetasAmarillas: ['Tarjetas Amarillas', 'tarjetasAmarillas'],
    tarjetasRojas: ['Tarjetas Rojas', 'tarjetasRojas'],

    // Nuevas del Excel enviado
    tirosTotales: ['Tiros totales'],
    asistencias: ['Asistencia', 'Asistencias'],
    tirosRecibidos: ['Tiros recibidos'],
    tirosRecibidosAcertados: ['Tiros recibidos acertados'],
    esquivesSinEsfuerzo: ['Esquive pero que no tuvimos que h', 'Esquive sin esfuerzo'],
    ponchado: ['Ponchado'],
    catchesIntentos: ['Intentos de catches'],
    bloqueosIntentos: ['Bloqueos intentados'],
    pisoLinea: ['Piso linea', 'Piso línea'],
    catchesRecibidos: ['Catches Recibidos'],
    setsJugados: ['Jugo set', 'Jugó set', 'Sets jugados'],
    indiceAtaque: ['ATAQUE'],
    indiceDefensa: ['DEFENSA'],
    ponderadorSet: ['Ponderador set']
  };

  const aliasToKey = new Map();
  Object.entries(metricAliases).forEach(([key, aliases]) => {
    aliases.forEach(a => aliasToKey.set(a.toLowerCase(), key));
  });

  const toInt = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  };

  const getField = (row, names) => {
    for (const name of names) {
      const v = row[name];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
  };

  const categories = {};

  for (const row of rows) {
    const categoria = (getField(row, ['Categoria', 'categoria', 'Category']) || 'General').toString().trim() || 'General';
    const equipo = (getField(row, ['Equipo', 'equipo', 'Team', 'team', 'Equipo Local', 'Equipo Visitante']) || 'Sin Equipo').toString().trim() || 'Sin Equipo';
    const jugador = (getField(row, ['Jugador', 'jugador', 'Nombre', 'nombre', 'Player', 'player']) || '').toString().trim();

    // Inicializar contenedores
    if (!categories[categoria]) categories[categoria] = { equipos: {}, jugadores: {} };
    if (!categories[categoria].equipos[equipo]) categories[categoria].equipos[equipo] = { totals: {} };
    if (jugador && !categories[categoria].jugadores[jugador]) categories[categoria].jugadores[jugador] = { equipo, totals: {} };

    // Recorrer columnas del row y acumular si son métricas conocidas
    for (const [colName, value] of Object.entries(row)) {
      const key = aliasToKey.get(colName.toLowerCase());
      if (!key) continue;
      const amount = toInt(value);
      categories[categoria].equipos[equipo].totals[key] = (categories[categoria].equipos[equipo].totals[key] || 0) + amount;
      if (jugador) {
        categories[categoria].jugadores[jugador].totals[key] = (categories[categoria].jugadores[jugador].totals[key] || 0) + amount;
      }
    }
  }

  return { categories };
}

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

    const eventosDocs = await Evento.find(filtros)
      .populate('organizador', 'nombre email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limite));

    // Calcular próxima fecha por evento basándonos en Horarios vinculados
    const ahoraISO = new Date();
    const eventos = await Promise.all(eventosDocs.map(async (ev) => {
      try {
        const next = await Horario.findOne({
          evento: ev._id,
          activo: true,
          fecha: { $gte: ahoraISO }
        }).sort({ fecha: 1, horaInicio: 1 }).lean();
        const evObj = ev.toObject();
        if (next?.fecha) evObj.proximaFecha = next.fecha;
        return evObj;
      } catch {
        return ev;
      }
    }));

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
    const { incluirEstadisticas = false } = req.query;
    
    const eventoDoc = await Evento.findById(id).populate('organizador', 'nombre email');
    
    if (!eventoDoc) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Incorporar próxima fecha desde Horarios
    let evento = eventoDoc.toObject();
    try {
      const next = await Horario.findOne({
        evento: id,
        activo: true,
        fecha: { $gte: new Date() }
      }).sort({ fecha: 1, horaInicio: 1 }).lean();
      if (next?.fecha) evento.proximaFecha = next.fecha;
    } catch {}

    // Si se solicita incluir estadísticas y es un evento de liga
    if (incluirEstadisticas === 'true' && evento.tipo === 'liga') {
      try {
        // Obtener estadísticas de jugadores para este evento
        const estadisticas = await Estadistica.find({ 
          evento: id, 
          activo: true 
        })
        .populate('jugador', 'nombre apellido numeroCamiseta posicion')
        .populate('equipo', 'nombre colorPrincipal colorSecundario')
        .sort({ indicePoder: -1 });

        // Agrupar estadísticas por equipo
        const estadisticasPorEquipo = {};
        estadisticas.forEach(estadistica => {
          const equipoId = estadistica.equipo._id.toString();
          if (!estadisticasPorEquipo[equipoId]) {
            estadisticasPorEquipo[equipoId] = {
              equipo: estadistica.equipo,
              jugadores: []
            };
          }
          estadisticasPorEquipo[equipoId].jugadores.push(estadistica);
        });

        // Agregar estadísticas al evento
        evento.datosEspecificos = evento.datosEspecificos || {};
        evento.datosEspecificos.estadisticasJugadores = {
          totalJugadores: estadisticas.length,
          rankingGeneral: estadisticas.slice(0, 10), // Top 10
          porEquipo: Object.values(estadisticasPorEquipo)
        };
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        // Si hay error obteniendo estadísticas, continuar sin ellas
        evento.datosEspecificos = evento.datosEspecificos || {};
        evento.datosEspecificos.estadisticasJugadores = {
          error: 'No se pudieron cargar las estadísticas'
        };
      }
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
      genero,
      precio,
      cupoMaximo,
      cupoDisponible,
      imagen,
      dificultad,
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
      genero,
      precio,
      cupoMaximo,
      cupoDisponible,
      imagen,
      dificultad,
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
      genero,
      dificultad,
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
        genero,
        precio,
        cupoMaximo,
        cupoDisponible,
        imagen,
        dificultad,
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

// Obtener estadísticas de jugadores de un evento
const obtenerEstadisticasEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipo, limite = 50, pagina = 1 } = req.query;
    
    // Verificar que el evento existe
    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Si existen estadísticas de liga manuales, usarlas como fuente principal
    const ligaStats = evento?.datosEspecificos?.liga?.estadisticasLiga;
    let rankingGeneral = [];
    let porEquipoArray = [];
    let total = 0;

    if (Array.isArray(ligaStats) && ligaStats.length > 0) {
      const equiposLiga = (evento.datosEspecificos?.liga?.equipos || []);
      const equipoNameToDoc = new Map(equiposLiga.map(e => [String(e.nombre || '').toLowerCase().trim(), e]));
      const toId = (s) => Buffer.from(String(s || '').toLowerCase().trim()).toString('hex').slice(0, 24) || undefined;
      const splitName = (full) => {
        const parts = String(full || '').trim().split(/\s+/);
        if (parts.length === 0) return { nombre: '', apellido: '' };
        if (parts.length === 1) return { nombre: parts[0], apellido: '' };
        return { nombre: parts.slice(0, -1).join(' '), apellido: parts[parts.length - 1] };
      };
      const norm = (s) => String(s || '').toLowerCase().trim();
      const calcPct = (num, den) => den > 0 ? (num / den) * 100 : 0;

      const mapped = ligaStats.map((j) => {
        const equipoNombre = j.equipoNombre || '';
        const equipoKey = norm(equipoNombre);
        const equipoDoc = equipoNameToDoc.get(equipoKey) || { nombre: equipoNombre, logo: '' };
        const { nombre, apellido } = splitName(j.nombreJugador || '');
        const _id = toId(`${equipoNombre}|${j.nombreJugador}`);
        return {
          _id, // para keys en frontend
          jugador: { _id, nombre, apellido, numeroCamiseta: null },
          equipo: { _id: toId(equipoNombre) || equipoKey, nombre: equipoDoc.nombre, logo: equipoDoc.logo || '' },
          setsJugados: j.setsJugados || 0,
          tirosTotales: j.tirosTotales || 0,
          hits: j.hits || 0,
          quemados: j.quemados || 0,
          asistencias: j.asistencias || 0,
          tirosRecibidos: j.tirosRecibidos || 0,
          hitsRecibidos: j.hitsRecibidos || 0,
          esquives: j.esquives || 0,
          esquivesSinEsfuerzo: j.esquivesExitosos || 0,
          ponchado: j.ponchado || 0,
          catchesIntentados: j.catchesIntentos || 0,
          catches: j.catches || 0,
          bloqueosIntentados: j.bloqueosIntentos || 0,
          bloqueos: j.bloqueos || 0,
          pisoLinea: j.pisoLinea || 0,
          catchesRecibidos: j.catchesRecibidos || 0,
          porcentajeHits: calcPct(j.hits || 0, j.tirosTotales || 0),
          porcentajeOuts: calcPct(j.ponchado || 0, j.tirosRecibidos || 0),
          porcentajeCatches: calcPct(j.catches || 0, j.catchesIntentos || 0),
          porcentajeBloqueos: calcPct(j.bloqueos || 0, j.bloqueosIntentos || 0),
          indiceAtaque: 0,
          indiceDefensa: 0,
          indicePoder: Number(j.poderLiga || 0)
        };
      });

      // Filtro por equipo (si viene como id, también lo soportamos comparando nombre)
      const filtroEq = equipo ? String(equipo) : '';
      if (filtroEq) {
        rankingGeneral = mapped.filter(m => (m.equipo._id?.toString?.() === filtroEq) || (m.equipo._id === filtroEq));
      } else {
        rankingGeneral = mapped;
      }

      // Orden por poder
      rankingGeneral.sort((a, b) => (b.indicePoder || 0) - (a.indicePoder || 0));
      total = rankingGeneral.length;

      // Agrupar por equipo
      const porEquipo = new Map();
      for (const r of rankingGeneral) {
        const key = r.equipo._id || norm(r.equipo.nombre);
        if (!porEquipo.has(key)) {
          porEquipo.set(key, { equipo: r.equipo, jugadores: [], totalJugadores: 0, promedioPoder: 0, totalHits: 0 });
        }
        const acc = porEquipo.get(key);
        acc.jugadores.push(r);
        acc.totalJugadores++;
        acc.totalHits += r.hits || 0;
      }
      porEquipoArray = Array.from(porEquipo.values()).map(e => ({
        ...e,
        promedioPoder: e.totalJugadores > 0 ? (e.jugadores.reduce((s, j) => s + (j.indicePoder || 0), 0) / e.totalJugadores) : 0,
        promedioHits: e.totalJugadores > 0 ? (e.totalHits / e.totalJugadores) : 0,
        totalTiros: e.jugadores.reduce((s, j) => s + (j.tirosTotales || 0), 0)
      }));
    } else {
      // Construir filtros (fuente Estadistica)
      const filtros = { evento: id, activo: true };
      if (equipo) filtros.equipo = equipo;
      const skip = (pagina - 1) * limite;

      const estadisticas = await Estadistica.find(filtros)
        .populate('jugador', 'nombre apellido numeroCamiseta posicion')
        .populate('equipo', 'nombre colorPrincipal colorSecundario logo')
        .sort({ indicePoder: -1 })
        .skip(skip)
        .limit(parseInt(limite));
      total = await Estadistica.countDocuments(filtros);

      rankingGeneral = estadisticas;
      const estadisticasPorEquipo = {};
      estadisticas.forEach(estadistica => {
        const equipoId = estadistica.equipo._id.toString();
        if (!estadisticasPorEquipo[equipoId]) {
          estadisticasPorEquipo[equipoId] = {
            equipo: estadistica.equipo,
            jugadores: [],
            totalJugadores: 0,
            promedioPoder: 0,
            totalHits: 0,
            totalTiros: 0
          };
        }
        estadisticasPorEquipo[equipoId].jugadores.push(estadistica);
        estadisticasPorEquipo[equipoId].totalJugadores++;
        estadisticasPorEquipo[equipoId].totalHits += estadistica.hits;
        estadisticasPorEquipo[equipoId].totalTiros += estadistica.tirosTotales;
      });
      Object.values(estadisticasPorEquipo).forEach(equipo => {
        if (equipo.totalJugadores > 0) {
          equipo.promedioPoder = equipo.jugadores.reduce((sum, j) => sum + j.indicePoder, 0) / equipo.totalJugadores;
          equipo.promedioHits = equipo.totalHits / equipo.totalJugadores;
          equipo.promedioTiros = equipo.totalTiros / equipo.totalJugadores;
        }
      });
      porEquipoArray = Object.values(estadisticasPorEquipo);
    }

    res.json({
      success: true,
      data: {
        evento: {
          _id: evento._id,
          titulo: evento.titulo,
          tipo: evento.tipo
        },
        estadisticas: {
          totalJugadores: total,
          rankingGeneral,
          porEquipo: porEquipoArray,
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total,
            paginas: Math.ceil(total / limite)
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del evento:', error);
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

    // Actualizar partidos
    evento.datosEspecificos.liga.partidos = partidos;
    
    // Recalcular tabla de posiciones después de actualizar partidos
    await recalcularTablaPosiciones(evento, partidos);
    
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
    const { estadisticas, estadisticasJugadores } = req.body;

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
    
    // Asignar las estadísticas de equipo
    partidos[partidoIndex].estadisticas = estadisticas;
    // Asignar estadísticas individuales si vienen
    if (Array.isArray(estadisticasJugadores)) {
      const norm = (s) => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}+/gu, '').toLowerCase().trim();
      const localN = norm(partidos[partidoIndex].equipoLocal || '');
      const visN = norm(partidos[partidoIndex].equipoVisitante || '');
      partidos[partidoIndex].estadisticasJugadores = estadisticasJugadores.map((j) => {
        const equipoInput = (j.equipo || j.equipoNombre || '').toString();
        const eqN = norm(equipoInput);
        const mapped = j.equipo === 'visitante' || eqN === visN ? 'visitante' : (j.equipo === 'local' || eqN === localN ? 'local' : 'local');
        return {
          nombreJugador: (j.nombreJugador || j.nombre || '').toString(),
          equipo: mapped,
          tirosTotales: parseInt(j.tirosTotales) || 0,
        hits: parseInt(j.hits) || 0,
          tirosRecibidos: parseInt(j.tirosRecibidos) || 0,
          hitsRecibidos: parseInt(j.hitsRecibidos) || 0,
          asistencias: parseInt(j.asistencias) || 0,
        catches: parseInt(j.catches) || 0,
          catchesIntentos: parseInt(j.catchesIntentos) || 0,
          catchesRecibidos: parseInt(j.catchesRecibidos) || 0,
          		dodges: parseInt(j.dodges) || 0,
          esquivesExitosos: parseInt(j.esquivesExitosos) || 0,
        bloqueos: parseInt(j.bloqueos) || 0,
          bloqueosIntentos: parseInt(j.bloqueosIntentos) || 0,
        quemados: parseInt(j.quemados) || 0,
          ponchado: parseInt(j.ponchado) || 0,
          pisoLinea: parseInt(j.pisoLinea) || 0,
          setsJugados: parseInt(j.setsJugados) || 0,
        tarjetasAmarillas: parseInt(j.tarjetasAmarillas) || 0,
        tarjetasRojas: parseInt(j.tarjetasRojas) || 0
        };
      });
    }
    
    // Sincronizar roster del evento (plantelNombres) con los jugadores cargados en este partido
    try {
      const liga = datosEspecificos.liga || {};
      const equiposLiga = Array.isArray(liga.equipos) ? liga.equipos : [];
      const equipoLocalNombre = partidos[partidoIndex].equipoLocal;
      const equipoVisitanteNombre = partidos[partidoIndex].equipoVisitante;

      const normalizar = (s) => (s || '').toString().trim();
      const toLower = (s) => normalizar(s).toLowerCase();

      // Recolectar nombres por lado
      const jugadoresLocales = (partidos[partidoIndex].estadisticasJugadores || [])
        .filter(j => j.equipo === 'local')
        .map(j => normalizar(j.nombreJugador))
        .filter(Boolean);
      const jugadoresVisitantes = (partidos[partidoIndex].estadisticasJugadores || [])
        .filter(j => j.equipo === 'visitante')
        .map(j => normalizar(j.nombreJugador))
        .filter(Boolean);

      // Helper para mergear evitando duplicados (case-insensitive)
      const mergeNombres = (existentes = [], nuevos = []) => {
        const setLc = new Set(existentes.map(n => toLower(n)));
        const out = [...existentes];
        for (const n of nuevos) {
          const key = toLower(n);
          if (!setLc.has(key)) {
            setLc.add(key);
            out.push(n);
          }
        }
        return out;
      };

      // Aplicar merge a equipos de la liga del evento
      for (let i = 0; i < equiposLiga.length; i++) {
        const eq = equiposLiga[i] || {};
        if (!eq || !eq.nombre) continue;
        if (eq.nombre === equipoLocalNombre) {
          eq.plantelNombres = mergeNombres(eq.plantelNombres || [], jugadoresLocales);
        } else if (eq.nombre === equipoVisitanteNombre) {
          eq.plantelNombres = mergeNombres(eq.plantelNombres || [], jugadoresVisitantes);
        }
        equiposLiga[i] = eq;
      }

      // Guardar de vuelta en datosEspecificos
      if (!datosEspecificos.liga) datosEspecificos.liga = {};
      datosEspecificos.liga.equipos = equiposLiga;
    } catch (e) {
      console.warn('⚠️ No se pudo sincronizar plantelNombres desde estadísticas del partido:', e?.message);
    }
    
    // Calcular estadísticas de equipo agregando estadísticas de jugadores
    try {
      const jugadoresPartido = Array.isArray(partidos[partidoIndex].estadisticasJugadores)
        ? partidos[partidoIndex].estadisticasJugadores
        : [];
      const init = () => ({
        tirosTotales: 0,
        hits: 0,
        quemados: 0,
        asistencias: 0,
        tirosRecibidos: 0,
        hitsRecibidos: 0,
        esquives: 0,
        esquivesExitosos: 0,
        ponchado: 0,
        catchesIntentos: 0,
        catches: 0,
        bloqueosIntentos: 0,
        bloqueos: 0,
        pisoLinea: 0,
        catchesRecibidos: 0,
        setsJugados: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0
      });
      const sum = { local: init(), visitante: init() };
      const add = (side, key, val) => { sum[side][key] += (parseInt(val) || 0); };
      for (const j of jugadoresPartido) {
        const side = (j.equipo === 'visitante') ? 'visitante' : 'local';
        add(side, 'tirosTotales', j.tirosTotales);
        add(side, 'hits', j.hits);
        add(side, 'quemados', j.quemados);
        add(side, 'asistencias', j.asistencias);
        add(side, 'tirosRecibidos', j.tirosRecibidos);
        add(side, 'hitsRecibidos', j.hitsRecibidos);
        add(side, 'esquives', j.dodges); // "dodges" a nivel jugador → "esquives" agregado
        add(side, 'esquivesExitosos', j.esquivesExitosos);
        add(side, 'ponchado', j.ponchado);
        add(side, 'catchesIntentos', j.catchesIntentos);
        add(side, 'catches', j.catches);
        add(side, 'bloqueosIntentos', j.bloqueosIntentos);
        add(side, 'bloqueos', j.bloqueos);
        add(side, 'pisoLinea', j.pisoLinea);
        add(side, 'catchesRecibidos', j.catchesRecibidos);
        add(side, 'setsJugados', j.setsJugados);
        add(side, 'tarjetasAmarillas', j.tarjetasAmarillas);
        add(side, 'tarjetasRojas', j.tarjetasRojas);
      }
      partidos[partidoIndex].estadisticas = sum;
    } catch (e) {
      console.warn('⚠️ No se pudo agregar estadísticas de equipo desde jugadores:', e?.message);
    }

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

// Guardar estadísticas de liga (manual, por jugador/agregado de liga)
const actualizarEstadisticasLigaManual = async (req, res) => {
  try {
    const { id } = req.params;
    const { jugadores } = req.body; // arreglo de objetos por jugador a nivel liga

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    if (!evento.datosEspecificos) evento.datosEspecificos = {};
    if (!evento.datosEspecificos.liga) evento.datosEspecificos.liga = {};

    const normalizeInt = (v) => {
      if (v === null || v === undefined) return 0;
      const str = String(v).replace('%', '').replace(',', '.');
      const n = parseFloat(str);
      return isNaN(n) ? 0 : Math.round(n);
    };
    const normalizeFloat = (v) => {
      if (v === null || v === undefined) return 0;
      const str = String(v).replace('%', '').replace(',', '.');
      const n = parseFloat(str);
      return isNaN(n) ? 0 : n;
    };

    const sanitized = Array.isArray(jugadores) ? jugadores.map((j) => ({
      equipoNombre: (j.equipoNombre || j.equipo || '').toString(),
      nombreJugador: (j.nombreJugador || j.jugador || '').toString(),
      partidosJugados: normalizeInt(j.partidosJugados),
      setsJugados: normalizeInt(j.setsJugados),
      tirosTotales: normalizeInt(j.tirosTotales),
      hits: normalizeInt(j.hits),
      quemados: normalizeInt(j.quemados),
      asistencias: normalizeInt(j.asistencias),
      tirosRecibidos: normalizeInt(j.tirosRecibidos),
      hitsRecibidos: normalizeInt(j.hitsRecibidos),
      esquives: normalizeInt(j.esquives),
      esquivesExitosos: normalizeInt(j.esquivesExitosos),
      ponchado: normalizeInt(j.ponchado),
      catchesIntentos: normalizeInt(j.catchesIntentos),
      catches: normalizeInt(j.catches),
      bloqueosIntentos: normalizeInt(j.bloqueosIntentos),
      bloqueos: normalizeInt(j.bloqueos),
      pisoLinea: normalizeInt(j.pisoLinea),
      catchesRecibidos: normalizeInt(j.catchesRecibidos),
      poderLiga: normalizeFloat(j.poderLiga)
    })) : [];

    evento.datosEspecificos.liga.estadisticasLiga = sanitized;
    await evento.save();

    return res.json({ success: true, message: 'Estadísticas de liga guardadas', data: { evento } });
  } catch (error) {
    console.error('Error al guardar estadísticas de liga:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
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
  console.log('🔄 Recalculando tabla de posiciones...');
  
  if (!evento.datosEspecificos) {
    evento.datosEspecificos = {};
  }
  if (!evento.datosEspecificos.liga) {
    evento.datosEspecificos.liga = {};
  }
  if (!evento.datosEspecificos.liga.equipos) {
    evento.datosEspecificos.liga.equipos = [];
  }
  
  const equipos = evento.datosEspecificos.liga.equipos;
  
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

  console.log('📊 Equipos reseteados:', equipos.length);

  // Procesar partidos finalizados
  partidos.forEach(partido => {
    if (partido.estado === 'finalizado' && partido.golesLocal !== undefined && partido.golesVisitante !== undefined) {
      console.log('⚽ Procesando partido:', partido.equipoLocal, 'vs', partido.equipoVisitante, partido.golesLocal, '-', partido.golesVisitante);
      
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
          console.log('🏆', equipoLocal.nombre, 'ganó (+3 puntos)');
        } else if (partido.golesLocal < partido.golesVisitante) {
          equipoVisitante.partidosGanados++;
          equipoVisitante.puntos += 3;
          equipoLocal.partidosPerdidos++;
          console.log('🏆', equipoVisitante.nombre, 'ganó (+3 puntos)');
        } else {
          equipoLocal.partidosEmpatados++;
          equipoLocal.puntos += 1;
          equipoVisitante.partidosEmpatados++;
          equipoVisitante.puntos += 1;
          console.log('🤝 Empate (+1 punto cada uno)');
        }
      } else {
        console.log('❌ Equipos no encontrados:', partido.equipoLocal, partido.equipoVisitante);
      }
    }
  });
  
  console.log('✅ Tabla recalculada. Equipos:', equipos.map(e => e.nombre + ': ' + e.puntos + 'pts'));
};

// Procesar hoja de cálculo con estadísticas de partidos
const procesarHojaCalculoEstadisticas = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Leer el archivo
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    if (data.length === 0) {
      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'La hoja de cálculo está vacía'
      });
    }

    // Crear una copia profunda de los datos específicos
    const datosEspecificos = JSON.parse(JSON.stringify(evento.datosEspecificos || {}));
    const partidos = datosEspecificos.liga?.partidos || [];
    const equipos = datosEspecificos.liga?.equipos || [];

    let partidosActualizados = 0;
    let partidosNoEncontrados = [];
    const errores = [];

    // Procesar cada fila de la hoja de cálculo
    for (const row of data) {
      try {
        // Intentar identificar el partido por diferentes columnas posibles
        const equipoLocal = (row['Equipo Local'] || row['EquipoLocal'] || row['Local'] || row['Equipo 1'] || row['Equipo1'] || '').toString().trim();
        const equipoVisitante = (row['Equipo Visitante'] || row['EquipoVisitante'] || row['Visitante'] || row['Equipo 2'] || row['Equipo2'] || '').toString().trim();
        const fechaStr = row['Fecha'] || row['fecha'] || row['Date'] || row['date'];
        
        if (!equipoLocal || !equipoVisitante) {
          errores.push(`Fila sin equipos identificados: ${JSON.stringify(row)}`);
          continue;
        }

        // Buscar el partido correspondiente
        let partidoIndex = -1;
        if (fechaStr) {
          // Intentar buscar por fecha y equipos
          const fechaRow = new Date(fechaStr);
          partidoIndex = partidos.findIndex(p => {
            const fechaPartido = new Date(p.fecha);
            return fechaPartido.toDateString() === fechaRow.toDateString() &&
                   (p.equipoLocal === equipoLocal || p.equipoLocal === equipoLocal.split(' ')[0]) &&
                   (p.equipoVisitante === equipoVisitante || p.equipoVisitante === equipoVisitante.split(' ')[0]);
          });
        }
        
        // Si no se encontró por fecha, buscar solo por equipos
        if (partidoIndex === -1) {
          partidoIndex = partidos.findIndex(p => 
            (p.equipoLocal === equipoLocal || p.equipoLocal.includes(equipoLocal) || equipoLocal.includes(p.equipoLocal)) &&
            (p.equipoVisitante === equipoVisitante || p.equipoVisitante.includes(equipoVisitante) || equipoVisitante.includes(p.equipoVisitante))
          );
        }

        if (partidoIndex === -1) {
          partidosNoEncontrados.push(`${equipoLocal} vs ${equipoVisitante}`);
          continue;
        }

        // Extraer estadísticas de la fila
        const statsLocal = {
          hits: parseInt(row['Local Hits'] || row['LocalHits'] || row['Hits Local'] || row['HitsLocal'] || row['Local - Hits'] || 0) || 0,
          catches: parseInt(row['Local Catches'] || row['LocalCatches'] || row['Catches Local'] || row['CatchesLocal'] || row['Local - Catches'] || 0) || 0,
          dodges: parseInt(row['Local Dodges'] || row['LocalDodges'] || row['Dodges Local'] || row['DodgesLocal'] || row['Local - Dodges'] || 0) || 0,
          bloqueos: parseInt(row['Local Bloqueos'] || row['LocalBloqueos'] || row['Bloqueos Local'] || row['BloqueosLocal'] || row['Local - Bloqueos'] || 0) || 0,
          quemados: parseInt(row['Local Quemados'] || row['LocalQuemados'] || row['Quemados Local'] || row['QuemadosLocal'] || row['Local - Quemados'] || 0) || 0,
          tarjetasAmarillas: parseInt(row['Local Tarjetas Amarillas'] || row['LocalTarjetasAmarillas'] || row['Tarjetas Amarillas Local'] || row['Local - Tarjetas Amarillas'] || 0) || 0,
          tarjetasRojas: parseInt(row['Local Tarjetas Rojas'] || row['LocalTarjetasRojas'] || row['Tarjetas Rojas Local'] || row['Local - Tarjetas Rojas'] || 0) || 0
        };

        const statsVisitante = {
          hits: parseInt(row['Visitante Hits'] || row['VisitanteHits'] || row['Hits Visitante'] || row['HitsVisitante'] || row['Visitante - Hits'] || 0) || 0,
          catches: parseInt(row['Visitante Catches'] || row['VisitanteCatches'] || row['Catches Visitante'] || row['CatchesVisitante'] || row['Visitante - Catches'] || 0) || 0,
          dodges: parseInt(row['Visitante Dodges'] || row['VisitanteDodges'] || row['Dodges Visitante'] || row['DodgesVisitante'] || row['Visitante - Dodges'] || 0) || 0,
          bloqueos: parseInt(row['Visitante Bloqueos'] || row['VisitanteBloqueos'] || row['Bloqueos Visitante'] || row['BloqueosVisitante'] || row['Visitante - Bloqueos'] || 0) || 0,
          quemados: parseInt(row['Visitante Quemados'] || row['VisitanteQuemados'] || row['Quemados Visitante'] || row['QuemadosVisitante'] || row['Visitante - Quemados'] || 0) || 0,
          tarjetasAmarillas: parseInt(row['Visitante Tarjetas Amarillas'] || row['VisitanteTarjetasAmarillas'] || row['Tarjetas Amarillas Visitante'] || row['Visitante - Tarjetas Amarillas'] || 0) || 0,
          tarjetasRojas: parseInt(row['Visitante Tarjetas Rojas'] || row['VisitanteTarjetasRojas'] || row['Tarjetas Rojas Visitante'] || row['Visitante - Tarjetas Rojas'] || 0) || 0
        };

        // Actualizar las estadísticas del partido
        if (!partidos[partidoIndex].estadisticas) {
          partidos[partidoIndex].estadisticas = { local: {}, visitante: {} };
        }
        partidos[partidoIndex].estadisticas.local = statsLocal;
        partidos[partidoIndex].estadisticas.visitante = statsVisitante;
        
        partidosActualizados++;
      } catch (error) {
        errores.push(`Error procesando fila: ${error.message}`);
      }
    }

    // Generar y guardar resumen por categoría/equipo/jugador
    try {
      const resumen = buildSummaryFromRows(data);
      if (!evento.datosEspecificos) evento.datosEspecificos = {};
      if (!evento.datosEspecificos.liga) evento.datosEspecificos.liga = {};
      evento.datosEspecificos.liga.resumenEstadisticas = resumen;
    } catch (e) {
      console.warn('No se pudo generar resumen de estadísticas:', e.message);
    }

    // Actualizar el evento (partidos + resumen)
    evento.datosEspecificos = {
      ...(evento.datosEspecificos || {}),
      liga: {
        ...((evento.datosEspecificos || {}).liga || {}),
        ...(datosEspecificos.liga || {})
      }
    };
    await evento.save();

    // Actualizar estadísticas generales de jugadores desde el resumen
    let jugadoresActualizados = 0;
    let jugadoresNoEncontrados = [];
    try {
      const resumen = evento.datosEspecificos?.liga?.resumenEstadisticas;
      if (resumen?.categories) {
        const totalPorJugador = {};
        for (const dataCat of Object.values(resumen.categories)) {
          for (const [jug, info] of Object.entries(dataCat.jugadores || {})) {
            if (!totalPorJugador[jug]) totalPorJugador[jug] = {};
            for (const [k, v] of Object.entries(info.totals || {})) {
              totalPorJugador[jug][k] = (totalPorJugador[jug][k] || 0) + (Number(v) || 0);
            }
          }
        }

        const normalize = (s) => (s || '')
          .toString()
          .normalize('NFD')
          .replace(/\p{Diacritic}+/gu, '')
          .toLowerCase()
          .trim();

        const jugadoresDocs = await Jugador.find({ activo: true }).lean(false);
        const index = new Map();
        for (const j of jugadoresDocs) {
          index.set(normalize(j.nombre), j);
          index.set(normalize(`${j.nombre} ${j.apellido}`), j);
        }

        const keyMap = {
          tirosTotales: 'tirosTotales',
          hits: 'hits',
          quemados: 'quemados',
          asistencias: 'asistencias',
          tirosRecibidos: 'tirosRecibidos',
          tirosRecibidosAcertados: 'hitsRecibidos',
          esquives: 'esquives',
          esquivesSinEsfuerzo: 'esquivesExitosos',
          ponchado: 'ponchado',
          catches: 'catches',
          catchesIntentos: 'catchesIntentos',
          catchesRecibidos: 'catchesRecibidos',
          bloqueos: 'bloqueos',
          bloqueosIntentos: 'bloqueosIntentos',
          tarjetasAmarillas: 'tarjetasAmarillas',
          tarjetasRojas: 'tarjetasRojas',
          pisoLinea: 'pisoLinea',
          setsJugados: 'setsJugados',
          indiceAtaque: 'indiceAtaque',
          indiceDefensa: 'indiceDefensa',
          ponderadorSet: 'puntos'
        };

        for (const [jugadorNombre, totals] of Object.entries(totalPorJugador)) {
          const doc = index.get(normalize(jugadorNombre));
          if (!doc) {
            jugadoresNoEncontrados.push(jugadorNombre);
            continue;
          }
          const eg = doc.estadisticasGenerales || {};
          for (const [k, v] of Object.entries(totals)) {
            const field = keyMap[k];
            if (!field) continue;
            eg[field] = (eg[field] || 0) + (Number(v) || 0);
          }
          doc.estadisticasGenerales = eg;
          await doc.save();
          jugadoresActualizados++;
        }
      }
    } catch (e) {
      console.error('Error actualizando jugadores desde resumen:', e);
    }

    // Eliminar el archivo temporal
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error al eliminar archivo temporal:', error);
    }

    res.json({
      success: true,
      message: 'Hoja de cálculo procesada exitosamente',
      data: {
        partidosActualizados,
        partidosNoEncontrados: partidosNoEncontrados.length > 0 ? partidosNoEncontrados : undefined,
        errores: errores.length > 0 ? errores : undefined,
        totalFilas: data.length,
        jugadoresActualizados,
        jugadoresNoEncontrados: jugadoresNoEncontrados.length ? jugadoresNoEncontrados : undefined
      }
    });

  } catch (error) {
    console.error('Error al procesar hoja de cálculo:', error);
    
    // Intentar eliminar el archivo temporal en caso de error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error al eliminar archivo temporal:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar la hoja de cálculo',
      error: error.message
    });
  }
};

// Previsualizar hoja de cálculo sin persistir cambios
const previsualizarHojaCalculoEstadisticas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo' });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    try { fs.unlinkSync(filePath); } catch {}

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'La hoja de cálculo está vacía' });
    }

    const summary = buildSummaryFromRows(data);

    return res.json({
      success: true,
      message: 'Previsualización generada',
      data: {
        totalFilas: data.length,
        categorias: Object.keys(summary.categories).length,
        resumen: summary
      }
    });
  } catch (error) {
    console.error('Error en previsualización:', error);
    return res.status(500).json({ success: false, message: 'Error al generar la previsualización', error: error.message });
  }
};

// Obtener jugadores de los equipos de un evento (por nombre de equipo)
const obtenerJugadoresEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findById(id)
      .populate('equipos.integrantes', 'nombre apellido')
      .lean();
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }
    const ligaEquipos = (evento.datosEspecificos?.liga?.equipos || []);
    const nombresEquipos = ligaEquipos.map(e => e.nombre).filter(Boolean);
    if (!nombresEquipos.length) {
      return res.json({ success: true, data: { equipos: [] } });
    }

    const equiposDocs = await Equipo.find({ nombre: { $in: nombresEquipos } })
      .populate('jugadores.jugador', 'nombre apellido')
      .lean();

    const equiposMap = new Map();
    const nameToId = new Map();
    // From Equipo model (Jugador)
    for (const eq of equiposDocs) {
      if (eq?.nombre && eq?._id) nameToId.set(eq.nombre, eq._id);
      const list = (eq.jugadores || [])
        .filter(j => j.jugador)
        .map(j => ({
          id: j.jugador._id,
          nombre: j.jugador.nombre,
          apellido: j.jugador.apellido,
          nombreCompleto: `${j.jugador.nombre} ${j.jugador.apellido}`.trim(),
          numeroCamiseta: j.numeroCamiseta || null,
          posicion: j.posicion || null
        }));
      equiposMap.set(eq.nombre, list);
    }

    // From Evento.equipos (Usuario) as fallback
    for (const eq of (evento.equipos || [])) {
      if (!eq?.nombre) continue;
      const existentes = equiposMap.get(eq.nombre) || [];
      const adicionales = (eq.integrantes || []).map(u => ({
        id: u._id,
        nombre: u.nombre,
        apellido: u.apellido,
        nombreCompleto: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
        numeroCamiseta: null,
        posicion: null
      }));
      // Merge por nombreCompleto para evitar duplicados
      const byName = new Map(existentes.map(p => [p.nombreCompleto.toLowerCase(), p]));
      for (const p of adicionales) {
        const key = p.nombreCompleto.toLowerCase();
        if (!byName.has(key)) byName.set(key, p);
      }
      equiposMap.set(eq.nombre, Array.from(byName.values()));
    }

  // Fallback/merge adicional: buscar jugadores por nombreEquipo e ID de equipo en Jugador.estadisticasPorEquipo
  {
    const equipoIds = Array.from(nameToId.values()).filter(Boolean);
    // Construir regex por nombre (insensible a mayúsculas, opcional "the " inicial y plural final)
    const toPattern = (s) => {
      const base = (s || '').toString().trim().replace(/^the\s+/i, '');
      const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^(?:the\\s+)?${escaped}s?$`, 'i');
    };
    const nombreRegexes = nombresEquipos.map(toPattern);

    const jugadoresCoincidentes = await Jugador.find({
      $or: [
        { 'estadisticasPorEquipo.nombreEquipo': { $in: nombreRegexes } },
        equipoIds.length ? { 'estadisticasPorEquipo.equipo': { $in: equipoIds } } : { _id: { $exists: true } }
      ]
    }).select('nombre apellido estadisticasPorEquipo').lean();

    // Construir helpers de normalización y mapeos por nombre
    const normalize = (s) => (s || '')
      .toString()
      .toLowerCase()
      .replace(/^\s*the\s+/, '') // quitar artículo inicial común
      .replace(/\s+/g, ' ')
      .trim();
    const stripPlural = (s) => s.endsWith('s') ? s.slice(0, -1) : s;

    const eventNameByNorm = new Map();
    for (const nombre of nombresEquipos) {
      const n = normalize(nombre);
      eventNameByNorm.set(n, nombre);
      eventNameByNorm.set(stripPlural(n), nombre);
    }

    // Capturar todos los equipoIds que aparecen en estadísticas de jugadores
    const allEquipoIdsFromStats = new Set();
    for (const jug of jugadoresCoincidentes) {
      for (const st of (jug.estadisticasPorEquipo || [])) {
        if (st?.equipo) allEquipoIdsFromStats.add(st.equipo.toString());
      }
    }
    // Traer nombres reales de esos equipos por ID
    const equiposDeStats = await Equipo.find({ _id: { $in: Array.from(allEquipoIdsFromStats) } })
      .select('_id nombre')
      .lean();
    const equipoIdToNombre = new Map(equiposDeStats.map(e => [e._id.toString(), e.nombre]));

    for (const jug of jugadoresCoincidentes) {
      const nombreCompleto = `${jug.nombre || ''} ${jug.apellido || ''}`.trim();
      for (const stat of (jug.estadisticasPorEquipo || [])) {
        const targetNames = new Set();
        if (stat?.nombreEquipo && nombresEquipos.includes(stat.nombreEquipo)) {
          targetNames.add(stat.nombreEquipo);
        }
        if (stat?.equipo) {
          // mapear por ID → nombre
          for (const [nombre, id] of nameToId.entries()) {
            if (id?.toString && id.toString() === stat.equipo.toString()) {
              targetNames.add(nombre);
            }
          }
          // intentar por normalización de nombres (p. ej. singular/plural, mayúsculas)
          const equipoNombreReal = equipoIdToNombre.get(stat.equipo.toString());
          if (equipoNombreReal) {
            const normReal = normalize(equipoNombreReal);
            const direct = eventNameByNorm.get(normReal);
            const strip = eventNameByNorm.get(stripPlural(normReal));
            if (direct) targetNames.add(direct);
            if (strip) targetNames.add(strip);
          }
        }
        for (const nombreEquipo of targetNames) {
          const existentes = equiposMap.get(nombreEquipo) || [];
          const keyLc = nombreCompleto.toLowerCase();
          if (!existentes.find(p => (p.nombreCompleto || '').toLowerCase() === keyLc)) {
            existentes.push({
              id: jug._id,
              nombre: jug.nombre,
              apellido: jug.apellido,
              nombreCompleto,
              numeroCamiseta: null,
              posicion: null
            });
          }
          equiposMap.set(nombreEquipo, existentes);
        }
      }
    }
  }

    // Merge adicional: nombres libres cargados en el evento (plantelNombres)
    for (const eq of ligaEquipos) {
      if (!eq?.nombre) continue;
      const existentes = equiposMap.get(eq.nombre) || [];
      const adicionales = (eq.plantelNombres || []).map(n => ({
        id: null,
        nombre: n,
        apellido: '',
        nombreCompleto: n,
        numeroCamiseta: null,
        posicion: null
      }));
      const byName = new Map(existentes.map(p => [String(p.nombreCompleto || '').toLowerCase(), p]));
      for (const p of adicionales) {
        const key = p.nombreCompleto.toLowerCase();
        if (!byName.has(key)) byName.set(key, p);
      }
      equiposMap.set(eq.nombre, Array.from(byName.values()));
    }

    const equipos = Array.from(equiposMap.entries()).map(([nombre, jugadores]) => ({ nombre, id: nameToId.get(nombre) || null, jugadores }));

    return res.json({ success: true, data: { equipos } });
  } catch (error) {
    console.error('Error al obtener jugadores del evento:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
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
  obtenerEstadisticasParticipacion,
  actualizarEquiposLiga,
  actualizarFixtureLiga,
  actualizarResultadoPartido,
  actualizarEstadisticasPartido,
  actualizarPremiosLiga,
  obtenerPartidoDetalle,
  obtenerEstadisticasEvento,
  procesarHojaCalculoEstadisticas,
  previsualizarHojaCalculoEstadisticas,
  obtenerJugadoresEvento,
  actualizarEstadisticasLigaManual
};
