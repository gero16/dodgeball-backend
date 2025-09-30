const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
require('dotenv').config();

async function migrarEventosCompletos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Actualizar eventos existentes con datos específicos
    const eventos = await Evento.find({ activo: true });

    for (const evento of eventos) {
      let datosEspecificos = {};

      if (evento.titulo.includes('Liga')) {
        // Datos para liga
        datosEspecificos.liga = {
          temporada: '2024-2025',
          division: 'Primera División',
          formato: 'todos-contra-todos',
          equipos: [
            {
              nombre: 'Los Guerreros',
              logo: '/logos/guerreros.png',
              puntos: 15,
              partidosJugados: 5,
              partidosGanados: 5,
              partidosEmpatados: 0,
              partidosPerdidos: 0,
              golesFavor: 25,
              golesContra: 10,
              diferenciaGoles: 15
            },
            {
              nombre: 'Los Relámpagos',
              logo: '/logos/relampagos.png',
              puntos: 12,
              partidosJugados: 5,
              partidosGanados: 4,
              partidosEmpatados: 0,
              partidosPerdidos: 1,
              golesFavor: 20,
              golesContra: 12,
              diferenciaGoles: 8
            },
            {
              nombre: 'Los Titanes',
              logo: '/logos/titanes.png',
              puntos: 9,
              partidosJugados: 5,
              partidosGanados: 3,
              partidosEmpatados: 0,
              partidosPerdidos: 2,
              golesFavor: 18,
              golesContra: 15,
              diferenciaGoles: 3
            }
          ],
          partidos: [
            {
              fecha: new Date('2024-07-15'),
              equipoLocal: 'Los Guerreros',
              equipoVisitante: 'Los Relámpagos',
              golesLocal: 3,
              golesVisitante: 1,
              estado: 'finalizado'
            },
            {
              fecha: new Date('2024-07-22'),
              equipoLocal: 'Los Titanes',
              equipoVisitante: 'Los Guerreros',
              golesLocal: 2,
              golesVisitante: 4,
              estado: 'finalizado'
            }
          ],
          reglas: [
            '2 tiempos de 12 minutos',
            '4 minutos de descanso en el entretiempo',
            '1 set es cuando todo un equipo es quemado'
          ],
          premios: [
            { posicion: 1, premio: 'Trofeo de Campeón', valor: 5000 },
            { posicion: 2, premio: 'Medalla de Plata', valor: 2500 },
            { posicion: 3, premio: 'Medalla de Bronce', valor: 1000 }
          ]
        };
      } else if (evento.titulo.includes('Panamericano')) {
        // Datos para participaciones internacionales
        const esArgentina = evento.titulo.includes('Argentina');
        const equipoLocal = esArgentina ? 'Argentina' : 'Colombia';
        const pais = esArgentina ? 'Argentina' : 'Colombia';
        const ciudad = esArgentina ? 'Buenos Aires' : 'Chía-Sopó';
        const es2025 = evento.titulo.includes('2025');
        
        datosEspecificos.participacion = {
          pais: pais,
          ciudad: ciudad,
          organizador: 'Federación Panamericana de Dodgeball',
          categoria: 'Mixto',
          posicion: es2025 ? 8 : 12,
          totalParticipantes: es2025 ? 12 : 8,
          equipoLocal: equipoLocal,
          resultados: [
            {
              fase: 'Grupos',
              rival: 'Brasil',
              resultado: '2-1',
              fecha: new Date(evento.fecha),
              equipoLocal: equipoLocal
            },
            {
              fase: 'Octavos',
              rival: 'México',
              resultado: es2025 ? '3-2' : '1-3',
              fecha: new Date(evento.fecha),
              equipoLocal: equipoLocal
            }
          ],
          estadisticas: {
            partidosJugados: es2025 ? 6 : 4,
            partidosGanados: es2025 ? 4 : 1,
            partidosPerdidos: es2025 ? 2 : 3,
            golesFavor: es2025 ? 18 : 8,
            golesContra: es2025 ? 12 : 15
          },
          logros: es2025 
            ? ['Clasificación a octavos de final', 'Mejor rendimiento histórico']
            : ['Primera participación internacional'],
          medallas: es2025 
            ? [{ tipo: 'bronce', categoria: 'Espíritu Deportivo' }]
            : []
        };
      } else if (evento.titulo.includes('Torneo')) {
        // Datos para campeonato
        datosEspecificos.campeonato = {
          formato: 'eliminacion-simple',
          fases: [
            {
              nombre: 'Octavos de Final',
              fechaInicio: new Date(evento.fecha),
              fechaFin: new Date(evento.fecha),
              equipos: ['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D'],
              partidos: []
            }
          ],
          premios: [
            { posicion: 1, premio: 'Trofeo de Campeón', valor: 10000, ganador: 'Por definir' },
            { posicion: 2, premio: 'Medalla de Plata', valor: 5000, ganador: 'Por definir' },
            { posicion: 3, premio: 'Medalla de Bronce', valor: 2000, ganador: 'Por definir' }
          ]
        };
      } else if (evento.titulo.includes('Entrenamiento')) {
        // Datos para práctica
        datosEspecificos.practica = {
          nivel: 'mixto',
          instructor: 'Santiago Nicotera',
          duracion: 120,
          materialNecesario: ['Pelotas de dodgeball', 'Conos', 'Chalecos'],
          objetivos: [
            'Mejorar técnica de lanzamiento',
            'Trabajar en trabajo en equipo',
            'Preparación física'
          ]
        };
      }

      // Actualizar el evento con los datos específicos
      await Evento.findByIdAndUpdate(evento._id, {
        $set: { datosEspecificos }
      });

      console.log(`✅ Actualizado: ${evento.titulo}`);
    }

    console.log('\n✅ Migración completada');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

migrarEventosCompletos();
