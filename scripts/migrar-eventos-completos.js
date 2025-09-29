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
              fecha: new Date('2024-10-15'),
              equipoLocal: 'Los Guerreros',
              equipoVisitante: 'Los Relámpagos',
              golesLocal: 3,
              golesVisitante: 1,
              estado: 'finalizado',
              estadisticas: {
                tarjetasAmarillas: 2,
                tarjetasRojas: 0,
                tiempoJuego: 60
              }
            }
          ],
          reglas: [
            'Partidos de 60 minutos',
            'Máximo 8 jugadores por equipo',
            'Sistema de puntos: 3 por victoria, 1 por empate',
            'En caso de empate, diferencia de goles'
          ],
          premios: [
            { posicion: 1, premio: 'Trofeo de Campeón', valor: 5000 },
            { posicion: 2, premio: 'Medalla de Plata', valor: 3000 },
            { posicion: 3, premio: 'Medalla de Bronce', valor: 1000 }
          ]
        };
      } else if (evento.titulo.includes('Panamericano')) {
        // Datos para participaciones internacionales
        datosEspecificos.participacion = {
          pais: evento.titulo.includes('Argentina') ? 'Argentina' : 'Colombia',
          ciudad: evento.titulo.includes('Argentina') ? 'Buenos Aires' : 'Chía-Sopó',
          organizador: 'Federación Panamericana de Dodgeball',
          categoria: 'Mixto',
          posicion: evento.titulo.includes('2025') ? 8 : 12,
          totalParticipantes: evento.titulo.includes('2025') ? 12 : 8,
          resultados: [
            {
              fase: 'Grupos',
              rival: 'Brasil',
              resultado: '2-1',
              fecha: new Date(evento.fecha)
            },
            {
              fase: 'Octavos',
              rival: 'México',
              resultado: evento.titulo.includes('2025') ? '3-2' : '1-3',
              fecha: new Date(evento.fecha)
            }
          ],
          estadisticas: {
            partidosJugados: evento.titulo.includes('2025') ? 6 : 4,
            partidosGanados: evento.titulo.includes('2025') ? 4 : 1,
            partidosPerdidos: evento.titulo.includes('2025') ? 2 : 3,
            golesFavor: evento.titulo.includes('2025') ? 18 : 8,
            golesContra: evento.titulo.includes('2025') ? 12 : 15
          },
          logros: evento.titulo.includes('2025') 
            ? ['Clasificación a octavos de final', 'Mejor rendimiento histórico']
            : ['Primera participación internacional'],
          medallas: evento.titulo.includes('2025') 
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
