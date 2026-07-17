/**
 * Sincronización plantel (nombres) ↔ Jugador + Equipo.jugadores.
 * Con replace:true baja membresías que no estén en la lista; no borra documentos Jugador.
 */
const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');

const normalizeName = (s) => (s || '')
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const escapeRegExp = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const uniquePlantelNames = (names) => {
  const seen = new Set();
  const out = [];
  for (const n of names || []) {
    const name = String(n || '').trim();
    if (!name) continue;
    const k = normalizeName(name);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(name);
  }
  return out;
};

const splitNombreCompleto = (nombreCompleto) => {
  const clean = String(nombreCompleto || '').trim().replace(/\s+/g, ' ');
  if (!clean) return { nombre: '', apellido: '' };
  const parts = clean.split(' ');
  if (parts.length === 1) {
    return { nombre: parts[0], apellido: 'SinApellido' };
  }
  return {
    nombre: parts[0],
    apellido: parts.slice(1).join(' ')
  };
};

const displayName = (jugador) => {
  if (!jugador) return '';
  const n = String(jugador.nombre || '').trim();
  const a = String(jugador.apellido || '').trim();
  if (!a || normalizeName(a) === 'sinapellido') return n;
  return `${n} ${a}`.trim();
};

/**
 * Busca o crea un Jugador por nombre completo.
 * No crea Usuario (usuario queda opcional).
 */
const ensureJugadorByNombreCompleto = async (nombreCompleto) => {
  const clean = String(nombreCompleto || '').trim().replace(/\s+/g, ' ');
  if (!clean) return null;

  const inputNorm = normalizeName(clean);
  const { nombre, apellido } = splitNombreCompleto(clean);

  // 1) Match exacto nombre+apellido (case-insensitive)
  let jugador = await Jugador.findOne({
    nombre: new RegExp(`^${escapeRegExp(nombre)}$`, 'i'),
    apellido: new RegExp(`^${escapeRegExp(apellido)}$`, 'i')
  });

  // 2) Fallback: candidatos activos y comparar nombre completo normalizado
  if (!jugador) {
    const candidatos = await Jugador.find({
      activo: { $ne: false },
      $or: [
        { nombre: new RegExp(escapeRegExp(nombre), 'i') },
        { apellido: new RegExp(escapeRegExp(nombre), 'i') }
      ]
    }).limit(40);

    jugador = candidatos.find((j) => normalizeName(displayName(j)) === inputNorm) || null;
  }

  if (!jugador) {
    jugador = await Jugador.create({
      nombre,
      apellido,
      posicion: 'versatil',
      activo: true
    });
  }

  return jugador;
};

/**
 * Vincula jugadores al club según lista de nombres.
 * @param {object} opts
 * @param {boolean} [opts.replace=false] — si true, quita de Equipo.jugadores a quien no esté en la lista
 */
const syncEquipoJugadoresFromNombres = async (equipoIdOrDoc, nombres, { replace = false } = {}) => {
  const lista = uniquePlantelNames(nombres);
  const equipo = typeof equipoIdOrDoc === 'object' && equipoIdOrDoc?._id
    ? equipoIdOrDoc
    : await Equipo.findById(equipoIdOrDoc);

  if (!equipo) return null;

  const ensured = [];
  for (const name of lista) {
    const j = await ensureJugadorByNombreCompleto(name);
    if (j) ensured.push({ jugador: j, nombre: name });
  }

  if (!Array.isArray(equipo.jugadores)) equipo.jugadores = [];

  const existingById = new Map(
    equipo.jugadores
      .filter((row) => row?.jugador)
      .map((row) => [row.jugador.toString(), row])
  );

  const keepIds = new Set();
  for (const { jugador } of ensured) {
    const id = jugador._id.toString();
    keepIds.add(id);
    if (!existingById.has(id)) {
      equipo.jugadores.push({
        jugador: jugador._id,
        posicion: jugador.posicion || 'versatil',
        fechaIngreso: new Date(),
        activo: true
      });
    } else {
      const row = existingById.get(id);
      row.activo = true;
    }
  }

  if (replace) {
    const now = new Date();
    for (const row of equipo.jugadores || []) {
      const id = row?.jugador?.toString?.() || String(row?.jugador || '');
      if (!keepIds.has(id) && isMembershipActive(row, now)) {
        row.activo = false;
        row.fechaHasta = now;
      }
    }
  }

  // Espejo de nombres (preserva orden preferido de la lista enviada)
  const fromLinked = [];
  if (!replace) {
    // Mantener nombres previos + nuevos
    const prev = Array.isArray(equipo.plantelNombres) ? equipo.plantelNombres : [];
    fromLinked.push(...prev);
  }
  fromLinked.push(...lista);
  equipo.plantelNombres = uniquePlantelNames(fromLinked);

  equipo.markModified('jugadores');
  equipo.markModified('plantelNombres');
  await equipo.save();
  return equipo;
};

/** Agrega un nombre al plantel del club + crea/vincula Jugador. */
const addNombreToClubPlantel = async (equipoNombre, nombre) => {
  const name = String(nombre || '').trim();
  const clubName = String(equipoNombre || '').trim();
  if (!name || !clubName) return null;

  const escaped = escapeRegExp(clubName);
  const equipo = await Equipo.findOne({
    nombre: { $regex: new RegExp(`^${escaped}$`, 'i') }
  });
  if (!equipo) return null;

  return syncEquipoJugadoresFromNombres(equipo, [name], { replace: false });
};

/**
 * Tras agregar un Jugador document a Equipo.jugadores, espeja el nombre en plantelNombres.
 */
const mirrorJugadorNameIntoPlantel = async (equipoDoc, jugadorDoc) => {
  if (!equipoDoc || !jugadorDoc) return equipoDoc;
  const name = displayName(jugadorDoc);
  if (!name) return equipoDoc;
  equipoDoc.plantelNombres = uniquePlantelNames([
    ...(Array.isArray(equipoDoc.plantelNombres) ? equipoDoc.plantelNombres : []),
    name
  ]);
  equipoDoc.markModified('plantelNombres');
  return equipoDoc;
};

/**
 * Al remover un jugador del equipo, quita su nombre del plantelNombres (best-effort).
 */
const removeJugadorNameFromPlantel = async (equipoDoc, jugadorDoc) => {
  if (!equipoDoc || !jugadorDoc) return equipoDoc;
  const key = normalizeName(displayName(jugadorDoc));
  if (!key) return equipoDoc;
  const prev = Array.isArray(equipoDoc.plantelNombres) ? equipoDoc.plantelNombres : [];
  equipoDoc.plantelNombres = prev.filter((n) => normalizeName(n) !== key);
  equipoDoc.markModified('plantelNombres');
  return equipoDoc;
};

const isMembershipActive = (row, atDate = new Date()) => {
  if (!row) return false;
  if (row.activo === false) return false;
  if (row.fechaHasta) {
    const hasta = new Date(row.fechaHasta);
    if (!Number.isNaN(hasta.getTime()) && hasta.getTime() <= new Date(atDate).getTime()) {
      return false;
    }
  }
  return true;
};

/** Reconstruye plantelNombres solo con membresías activas (populate jugadores.jugador). */
const rebuildPlantelNombresFromMemberships = async (equipoDoc) => {
  if (!equipoDoc) return equipoDoc;
  const needsPopulate = (equipoDoc.jugadores || []).some(
    (r) => r?.jugador && typeof r.jugador === 'object' && !r.jugador.nombre
  ) || (equipoDoc.jugadores || []).some((r) => r?.jugador && typeof r.jugador !== 'object');
  if (needsPopulate) {
    await equipoDoc.populate('jugadores.jugador', 'nombre apellido activo');
  }
  const names = [];
  for (const row of equipoDoc.jugadores || []) {
    if (!isMembershipActive(row)) continue;
    const j = row.jugador;
    if (!j || typeof j !== 'object') continue;
    const name = displayName(j);
    if (name) names.push(name);
  }
  equipoDoc.plantelNombres = uniquePlantelNames(names);
  equipoDoc.markModified('plantelNombres');
  return equipoDoc;
};

/** Propaga plantelNombres del club a todos los eventos donde participa. */
const propagatePlantelNombresToEventos = async (equipoDoc) => {
  if (!equipoDoc?.nombre) return;
  const Evento = require('../models/Evento');
  const clubKey = normalizeName(equipoDoc.nombre);
  const plantel = Array.isArray(equipoDoc.plantelNombres) ? [...equipoDoc.plantelNombres] : [];
  const eventos = await Evento.find({}).select('datosEspecificos');
  for (const ev of eventos) {
    if (!ev.datosEspecificos) continue;
    const ds = ev.datosEspecificos;
    const tipo = ds.liga ? 'liga' : ds.campeonato ? 'campeonato' : ds.torneo ? 'torneo' : null;
    if (!tipo || !Array.isArray(ds[tipo]?.equipos)) continue;
    let changed = false;
    ds[tipo].equipos = ds[tipo].equipos.map((eq) => {
      if (normalizeName(eq?.nombre) !== clubKey) return eq;
      changed = true;
      const base = (eq && typeof eq.toObject === 'function') ? eq.toObject() : { ...eq };
      return { ...base, plantelNombres: [...plantel] };
    });
    if (changed) {
      ev.markModified('datosEspecificos');
      await ev.save();
    }
  }
};

/**
 * Transfiere un jugador: cierra membresía(s) de origen, abre destino, registra Transferencia.
 * No modifica stats de partidos.
 */
const transferirJugador = async ({
  jugadorId,
  haciaEquipoId,
  desdeEquipoId = null,
  fecha = new Date(),
  motivo = '',
  creadoPor = null,
  numeroCamiseta = null,
  posicion = null
}) => {
  const Transferencia = require('../models/Transferencia');
  const fechaTx = new Date(fecha);
  if (Number.isNaN(fechaTx.getTime())) {
    const err = new Error('Fecha de transferencia inválida');
    err.statusCode = 400;
    throw err;
  }

  const jugador = await Jugador.findById(jugadorId);
  if (!jugador) {
    const err = new Error('Jugador no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const hacia = await Equipo.findById(haciaEquipoId);
  if (!hacia) {
    const err = new Error('Equipo destino no encontrado');
    err.statusCode = 404;
    throw err;
  }

  let desde = null;
  if (desdeEquipoId) {
    desde = await Equipo.findById(desdeEquipoId);
    if (!desde) {
      const err = new Error('Equipo de origen no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (desde._id.toString() === hacia._id.toString()) {
      const err = new Error('Origen y destino no pueden ser el mismo equipo');
      err.statusCode = 400;
      throw err;
    }
  }

  const closedEquipos = [];

  const closeMembership = async (equipoDoc) => {
    let closed = false;
    for (const row of equipoDoc.jugadores || []) {
      if (row.jugador?.toString() !== jugadorId.toString()) continue;
      if (!isMembershipActive(row, fechaTx)) continue;
      row.activo = false;
      row.fechaHasta = fechaTx;
      closed = true;
    }
    if (closed) {
      await rebuildPlantelNombresFromMemberships(equipoDoc);
      equipoDoc.markModified('jugadores');
      await equipoDoc.save();
      await propagatePlantelNombresToEventos(equipoDoc);
      closedEquipos.push(equipoDoc);
    }
    return closed;
  };

  if (desde) {
    const ok = await closeMembership(desde);
    if (!ok) {
      const err = new Error('El jugador no tiene membresía activa en el equipo de origen');
      err.statusCode = 400;
      throw err;
    }
  } else {
    // Cerrar todas las membresías activas en otros clubes
    const otros = await Equipo.find({
      _id: { $ne: hacia._id },
      'jugadores.jugador': jugadorId,
      activo: true
    });
    for (const eq of otros) {
      await closeMembership(eq);
    }
  }

  // Abrir / reactivar en destino
  if (!Array.isArray(hacia.jugadores)) hacia.jugadores = [];
  const existing = hacia.jugadores.find(
    (r) => r.jugador?.toString() === jugadorId.toString()
  );
  if (existing && isMembershipActive(existing, fechaTx)) {
    const err = new Error('El jugador ya está activo en el equipo destino');
    err.statusCode = 400;
    throw err;
  }
  if (existing) {
    existing.activo = true;
    existing.fechaIngreso = fechaTx;
    existing.fechaHasta = null;
    if (numeroCamiseta != null) existing.numeroCamiseta = numeroCamiseta;
    if (posicion) existing.posicion = posicion;
  } else {
    hacia.jugadores.push({
      jugador: jugadorId,
      numeroCamiseta: numeroCamiseta || null,
      posicion: posicion || jugador.posicion || 'versatil',
      fechaIngreso: fechaTx,
      fechaHasta: null,
      activo: true
    });
  }
  await rebuildPlantelNombresFromMemberships(hacia);
  hacia.markModified('jugadores');
  await hacia.save();
  await propagatePlantelNombresToEventos(hacia);

  const registro = await Transferencia.create({
    jugador: jugadorId,
    desdeEquipo: desde?._id || (closedEquipos[0]?._id || null),
    haciaEquipo: hacia._id,
    fecha: fechaTx,
    motivo: String(motivo || '').trim(),
    creadoPor: creadoPor || null
  });

  await registro.populate([
    { path: 'jugador', select: 'nombre apellido' },
    { path: 'desdeEquipo', select: 'nombre' },
    { path: 'haciaEquipo', select: 'nombre' }
  ]);

  return {
    transferencia: registro,
    jugador,
    desdeEquiposCerrados: closedEquipos.map((e) => ({ _id: e._id, nombre: e.nombre })),
    haciaEquipo: { _id: hacia._id, nombre: hacia.nombre }
  };
};

module.exports = {
  normalizeName,
  uniquePlantelNames,
  splitNombreCompleto,
  displayName,
  ensureJugadorByNombreCompleto,
  syncEquipoJugadoresFromNombres,
  addNombreToClubPlantel,
  mirrorJugadorNameIntoPlantel,
  removeJugadorNameFromPlantel,
  isMembershipActive,
  rebuildPlantelNombresFromMemberships,
  propagatePlantelNombresToEventos,
  transferirJugador
};
