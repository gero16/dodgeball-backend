/**
 * Migración aditiva: plantelNombres (club + eventos) → documentos Jugador
 * y Equipo.jugadores. No borra ni modifica partidos/stats.
 *
 * Uso:
 *   node scripts/migrate-plantel-to-jugadores.js
 *   DRY_RUN=1 node scripts/migrate-plantel-to-jugadores.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Equipo = require('../src/models/Equipo');
const Evento = require('../src/models/Evento');
const {
  uniquePlantelNames,
  syncEquipoJugadoresFromNombres,
  normalizeName
} = require('../src/utils/plantelSync');

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

const equiposFromEvento = (ev) => {
  const ds = ev?.datosEspecificos || {};
  return ds.liga?.equipos || ds.campeonato?.equipos || ds.torneo?.equipos || [];
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB conectado', DRY_RUN ? '(DRY_RUN)' : '');

  /** @type {Map<string, Set<string>>} */
  const nombresPorClub = new Map();

  const addNames = (clubNombre, names) => {
    const key = normalizeName(clubNombre);
    if (!key) return;
    if (!nombresPorClub.has(key)) {
      nombresPorClub.set(key, { display: String(clubNombre).trim(), names: new Set() });
    }
    const bucket = nombresPorClub.get(key);
    for (const n of uniquePlantelNames(names)) {
      bucket.names.add(n);
    }
  };

  const equipos = await Equipo.find({}).select('nombre plantelNombres jugadores');
  for (const eq of equipos) {
    addNames(eq.nombre, eq.plantelNombres || []);
  }

  const eventos = await Evento.find({}).select('datosEspecificos');
  for (const ev of eventos) {
    for (const eq of equiposFromEvento(ev)) {
      if (eq?.nombre) addNames(eq.nombre, eq.plantelNombres || []);
    }
  }

  let clubsTouched = 0;
  let playersLinked = 0;

  for (const [, bucket] of nombresPorClub) {
    const lista = [...bucket.names];
    if (!lista.length) continue;

    const escaped = bucket.display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let equipo = await Equipo.findOne({
      nombre: { $regex: new RegExp(`^${escaped}$`, 'i') }
    });

    if (!equipo) {
      console.warn(`Club no encontrado en Equipo: "${bucket.display}" (${lista.length} nombres en eventos)`);
      continue;
    }

    console.log(`→ ${equipo.nombre}: ${lista.length} nombres`);
    if (DRY_RUN) {
      clubsTouched += 1;
      playersLinked += lista.length;
      continue;
    }

    const before = (equipo.jugadores || []).length;
    equipo = await syncEquipoJugadoresFromNombres(equipo, lista, { replace: false });
    const after = (equipo.jugadores || []).length;
    clubsTouched += 1;
    playersLinked += Math.max(0, after - before);
    console.log(`  jugadores: ${before} → ${after}`);
  }

  console.log('Listo.', { clubsTouched, playersLinkedApprox: playersLinked, dryRun: DRY_RUN });
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
