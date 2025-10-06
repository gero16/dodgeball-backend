// Script para calcular manualmente los índices de Felipe Demarco
// Datos de Felipe Demarco:
const datos = {
  setsJugados: 9,
  tirosTotales: 61,
  hits: 20,
  quemados: 18,
  asistencias: 2,
  catchesRecibidos: 0,
  bloqueos: 18,
  catches: 0,
  esquives: 3,
  esquivesSinEsfuerzo: 15,
  hitsRecibidos: 22,
  tirosRecibidos: 47
};

console.log('📊 Datos de Felipe Demarco:');
console.log(datos);
console.log('');

// Cálculo manual de los índices

// Índice de Ataque (Offensive Power Index)
const accionesOfensivas = (0.5 * datos.hits) + (1 * datos.quemados) + (0.75 * datos.asistencias) - (0.5 * datos.catchesRecibidos);
const eficienciaOfensiva = datos.tirosTotales > 0 ? accionesOfensivas / datos.tirosTotales : 0;
const indiceAtaque = (accionesOfensivas / Math.sqrt(datos.setsJugados)) + (0.5 * eficienciaOfensiva);

console.log('⚔️ Cálculo del Índice de Ataque:');
console.log(`Acciones Ofensivas = (0.5 × ${datos.hits}) + (1 × ${datos.quemados}) + (0.75 × ${datos.asistencias}) - (0.5 × ${datos.catchesRecibidos})`);
console.log(`Acciones Ofensivas = ${0.5 * datos.hits} + ${1 * datos.quemados} + ${0.75 * datos.asistencias} - ${0.5 * datos.catchesRecibidos} = ${accionesOfensivas}`);
console.log(`Eficiencia Ofensiva = ${accionesOfensivas} / ${datos.tirosTotales} = ${eficienciaOfensiva.toFixed(4)}`);
console.log(`Índice Ataque = (${accionesOfensivas} / √${datos.setsJugados}) + (0.5 × ${eficienciaOfensiva.toFixed(4)})`);
console.log(`Índice Ataque = (${accionesOfensivas} / ${Math.sqrt(datos.setsJugados).toFixed(2)}) + ${(0.5 * eficienciaOfensiva).toFixed(4)}`);
console.log(`Índice Ataque = ${(accionesOfensivas / Math.sqrt(datos.setsJugados)).toFixed(4)} + ${(0.5 * eficienciaOfensiva).toFixed(4)} = ${indiceAtaque.toFixed(4)}`);
console.log('');

// Índice de Defensa (Defensive Power Index)
const accionesDefensivas = (0.75 * datos.bloqueos) + (2.75 * 2 * datos.catches) + (0.75 * datos.esquives) + (0.1 * datos.esquivesSinEsfuerzo);
const impactoNegativo = datos.hitsRecibidos - datos.catches - datos.bloqueos;
const defensaNeta = accionesDefensivas - impactoNegativo;
const bonusExposicion = 0.2 * Math.sqrt(datos.tirosRecibidos);
const indiceDefensa = (defensaNeta / Math.sqrt(datos.setsJugados)) + bonusExposicion;

console.log('🛡️ Cálculo del Índice de Defensa:');
console.log(`Acciones Defensivas = (0.75 × ${datos.bloqueos}) + (2.75 × 2 × ${datos.catches}) + (0.75 × ${datos.esquives}) + (0.1 × ${datos.esquivesSinEsfuerzo})`);
console.log(`Acciones Defensivas = ${0.75 * datos.bloqueos} + ${2.75 * 2 * datos.catches} + ${0.75 * datos.esquives} + ${0.1 * datos.esquivesSinEsfuerzo} = ${accionesDefensivas}`);
console.log(`Impacto Negativo = ${datos.hitsRecibidos} - ${datos.catches} - ${datos.bloqueos} = ${impactoNegativo}`);
console.log(`Defensa Neta = ${accionesDefensivas} - ${impactoNegativo} = ${defensaNeta}`);
console.log(`Bonus Exposición = 0.2 × √${datos.tirosRecibidos} = 0.2 × ${Math.sqrt(datos.tirosRecibidos).toFixed(2)} = ${bonusExposicion.toFixed(4)}`);
console.log(`Índice Defensa = (${defensaNeta} / √${datos.setsJugados}) + ${bonusExposicion.toFixed(4)}`);
console.log(`Índice Defensa = (${defensaNeta} / ${Math.sqrt(datos.setsJugados).toFixed(2)}) + ${bonusExposicion.toFixed(4)}`);
console.log(`Índice Defensa = ${(defensaNeta / Math.sqrt(datos.setsJugados)).toFixed(4)} + ${bonusExposicion.toFixed(4)} = ${indiceDefensa.toFixed(4)}`);
console.log('');

// Índice de Poder Total
const indicePoder = (0.6 * indiceAtaque) + (0.4 * indiceDefensa);

console.log('⚖️ Cálculo del Índice de Poder Total:');
console.log(`Poder Total = 0.6 × ${indiceAtaque.toFixed(4)} + 0.4 × ${indiceDefensa.toFixed(4)}`);
console.log(`Poder Total = ${(0.6 * indiceAtaque).toFixed(4)} + ${(0.4 * indiceDefensa).toFixed(4)} = ${indicePoder.toFixed(4)}`);
console.log('');

console.log('🎯 Resultados:');
console.log(`Índice Ataque: ${indiceAtaque.toFixed(2)}`);
console.log(`Índice Defensa: ${indiceDefensa.toFixed(2)}`);
console.log(`Índice Poder: ${indicePoder.toFixed(2)}`);
console.log('');
console.log(`Valor esperado del Excel: 90.62`);
console.log(`Diferencia: ${(indicePoder - 90.62).toFixed(2)}`);
