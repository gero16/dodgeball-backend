const mongoose = require('mongoose');
const Evento = require('../src/models/Evento');
require('dotenv').config();

async function actualizarCampeonatos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar eventos de tipo torneo que deberían ser campeonatos
    const torneos = await Evento.find({ 
      tipo: 'torneo', 
      activo: true,
      'datosEspecificos.campeonato': { $exists: true }
    });

    for (const torneo of torneos) {
      // Actualizar el tipo a 'campeonato'
      await Evento.findByIdAndUpdate(torneo._id, {
        tipo: 'campeonato',
        $set: {
          'datosEspecificos.campeonato': {
            formato: 'eliminacion-simple',
            equipos: [
              {
                nombre: 'Equipo A',
                logo: '/logos/equipo-a.png',
                grupo: 'A',
                puntos: 6,
                partidosJugados: 2,
                partidosGanados: 2,
                partidosEmpatados: 0,
                partidosPerdidos: 0,
                golesFavor: 8,
                golesContra: 3,
                diferenciaGoles: 5
              },
              {
                nombre: 'Equipo B',
                logo: '/logos/equipo-b.png',
                grupo: 'A',
                puntos: 3,
                partidosJugados: 2,
                partidosGanados: 1,
                partidosEmpatados: 0,
                partidosPerdidos: 1,
                golesFavor: 5,
                golesContra: 6,
                diferenciaGoles: -1
              },
              {
                nombre: 'Equipo C',
                logo: '/logos/equipo-c.png',
                grupo: 'B',
                puntos: 4,
                partidosJugados: 2,
                partidosGanados: 1,
                partidosEmpatados: 1,
                partidosPerdidos: 0,
                golesFavor: 6,
                golesContra: 4,
                diferenciaGoles: 2
              },
              {
                nombre: 'Equipo D',
                logo: '/logos/equipo-d.png',
                grupo: 'B',
                puntos: 1,
                partidosJugados: 2,
                partidosGanados: 0,
                partidosEmpatados: 1,
                partidosPerdidos: 1,
                golesFavor: 3,
                golesContra: 6,
                diferenciaGoles: -3
              }
            ],
            grupos: [
              {
                nombre: 'Grupo A',
                equipos: ['Equipo A', 'Equipo B'],
                partidos: [
                  {
                    fecha: new Date('2024-07-15'),
                    hora: '10:00',
                    equipo1: 'Equipo A',
                    equipo2: 'Equipo B',
                    resultado: '4-2',
                    estado: 'finalizado',
                    estadisticas: {
                      tarjetasAmarillas: 3,
                      tarjetasRojas: 0,
                      tiempoJuego: 60
                    }
                  }
                ]
              },
              {
                nombre: 'Grupo B',
                equipos: ['Equipo C', 'Equipo D'],
                partidos: [
                  {
                    fecha: new Date('2024-07-15'),
                    hora: '12:00',
                    equipo1: 'Equipo C',
                    equipo2: 'Equipo D',
                    resultado: '2-2',
                    estado: 'finalizado',
                    estadisticas: {
                      tarjetasAmarillas: 2,
                      tarjetasRojas: 0,
                      tiempoJuego: 60
                    }
                  }
                ]
              }
            ],
            eliminatorias: [
              {
                fase: 'Semifinales',
                partidos: [
                  {
                    fecha: new Date('2024-07-16'),
                    hora: '10:00',
                    equipo1: 'Equipo A',
                    equipo2: 'Equipo C',
                    resultado: '3-1',
                    estado: 'finalizado',
                    estadisticas: {
                      tarjetasAmarillas: 2,
                      tarjetasRojas: 0,
                      tiempoJuego: 60
                    }
                  },
                  {
                    fecha: new Date('2024-07-16'),
                    hora: '12:00',
                    equipo1: 'Equipo B',
                    equipo2: 'Equipo D',
                    resultado: '2-0',
                    estado: 'finalizado',
                    estadisticas: {
                      tarjetasAmarillas: 1,
                      tarjetasRojas: 0,
                      tiempoJuego: 60
                    }
                  }
                ]
              },
              {
                fase: 'Final',
                partidos: [
                  {
                    fecha: new Date('2024-07-17'),
                    hora: '15:00',
                    equipo1: 'Equipo A',
                    equipo2: 'Equipo B',
                    resultado: '2-1',
                    estado: 'finalizado',
                    estadisticas: {
                      tarjetasAmarillas: 4,
                      tarjetasRojas: 0,
                      tiempoJuego: 60
                    }
                  }
                ]
              }
            ],
            bracket: {
              semifinales: [
                {
                  partido: 1,
                  equipo1: 'Equipo A',
                  equipo2: 'Equipo C',
                  resultado: '3-1',
                  ganador: 'Equipo A'
                },
                {
                  partido: 2,
                  equipo1: 'Equipo B',
                  equipo2: 'Equipo D',
                  resultado: '2-0',
                  ganador: 'Equipo B'
                }
              ],
              final: {
                partido: 3,
                equipo1: 'Equipo A',
                equipo2: 'Equipo B',
                resultado: '2-1',
                ganador: 'Equipo A'
              },
              tercerPuesto: {
                partido: 4,
                equipo1: 'Equipo C',
                equipo2: 'Equipo D',
                resultado: '1-0',
                ganador: 'Equipo C'
              }
            },
            reglas: [
              'Partidos de 60 minutos',
              'Máximo 8 jugadores por equipo',
              'Sistema de eliminación directa',
              'En caso de empate, prórroga de 10 minutos'
            ],
            premios: [
              { posicion: 1, premio: 'Trofeo de Campeón', valor: 10000, ganador: 'Equipo A' },
              { posicion: 2, premio: 'Medalla de Plata', valor: 5000, ganador: 'Equipo B' },
              { posicion: 3, premio: 'Medalla de Bronce', valor: 2000, ganador: 'Equipo C' }
            ]
          }
        }
      });

      console.log(`✅ Actualizado: ${torneo.titulo} -> Campeonato`);
    }

    console.log('\n✅ Actualización de campeonatos completada');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

actualizarCampeonatos();
