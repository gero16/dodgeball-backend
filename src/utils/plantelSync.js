/**
 * Sincronización aditiva plantel (nombres) ↔ Jugador + Equipo.jugadores.
 * No borra documentos Jugador; mantiene plantelNombres como espejo legible.
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
    equipo.jugadores = equipo.jugadores.filter((row) => {
      const id = row?.jugador?.toString?.() || String(row?.jugador || '');
      return keepIds.has(id);
    });
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

module.exports = {
  normalizeName,
  uniquePlantelNames,
  splitNombreCompleto,
  displayName,
  ensureJugadorByNombreCompleto,
  syncEquipoJugadoresFromNombres,
  addNombreToClubPlantel,
  mirrorJugadorNameIntoPlantel,
  removeJugadorNameFromPlantel
};
