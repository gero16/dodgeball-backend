const Horario = require('../models/Horario');

// Obtener horarios por fecha
const obtenerHorariosPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    const horarios = await Horario.find({
      fecha: new Date(fecha),
      activo: true
    }).sort({ horaInicio: 1 });

    res.json({
      success: true,
      data: { horarios }
    });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo horario
const crearHorario = async (req, res) => {
  try {
    const {
      fecha,
      horaInicio,
      horaFin,
      tipo,
      ubicacion,
      instructor,
      descripcion,
      cupoMaximo,
      precio
    } = req.body;

    const horario = new Horario({
      fecha,
      horaInicio,
      horaFin,
      tipo,
      ubicacion,
      instructor,
      descripcion,
      cupoMaximo,
      cupoDisponible: cupoMaximo,
      precio
    });

    await horario.save();

    res.status(201).json({
      success: true,
      message: 'Horario creado exitosamente',
      data: { horario }
    });
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agendar horario
const agendarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;
    const usuarioId = req.usuario.id;

    const horario = await Horario.findById(id);
    if (!horario || !horario.activo) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }

    // Verificar si ya está agendado
    const yaAgendado = horario.reservas.find(
      res => res.usuario.toString() === usuarioId
    );

    if (yaAgendado) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una reserva en este horario'
      });
    }

    // Verificar cupo disponible
    if (horario.cupoDisponible <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay cupo disponible para este horario'
      });
    }

    // Agregar reserva
    const reserva = {
      usuario: usuarioId,
      observaciones: observaciones || ''
    };

    horario.reservas.push(reserva);
    await horario.save();

    res.json({
      success: true,
      message: 'Horario agendado exitosamente',
      data: { horario }
    });
  } catch (error) {
    console.error('Error al agendar horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener agenda (admin)
const obtenerAgenda = async (req, res) => {
  try {
    const { fecha } = req.query;
    let filtros = { activo: true };

    if (fecha) {
      filtros.fecha = new Date(fecha);
    }

    const horarios = await Horario.find(filtros)
      .populate('reservas.usuario', 'nombre email telefono')
      .populate('instructor', 'nombre email')
      .sort({ fecha: 1, horaInicio: 1 });

    res.json({
      success: true,
      data: { horarios }
    });
  } catch (error) {
    console.error('Error al obtener agenda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar horario
const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha,
      horaInicio,
      horaFin,
      tipo,
      ubicacion,
      instructor,
      descripcion,
      cupoMaximo,
      precio
    } = req.body;

    const horario = await Horario.findById(id);
    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }

    // Actualizar campos
    if (fecha) horario.fecha = fecha;
    if (horaInicio) horario.horaInicio = horaInicio;
    if (horaFin) horario.horaFin = horaFin;
    if (tipo) horario.tipo = tipo;
    if (ubicacion) horario.ubicacion = ubicacion;
    if (instructor) horario.instructor = instructor;
    if (descripcion) horario.descripcion = descripcion;
    if (cupoMaximo) {
      horario.cupoMaximo = cupoMaximo;
      horario.cupoDisponible = cupoMaximo - horario.reservas.filter(res => res.estado === 'confirmada').length;
    }
    if (precio !== undefined) horario.precio = precio;

    await horario.save();

    res.json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: { horario }
    });
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar horario
const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const horario = await Horario.findById(id);
    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }

    // Desactivar en lugar de eliminar
    horario.activo = false;
    await horario.save();

    res.json({
      success: true,
      message: 'Horario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerHorariosPorFecha,
  crearHorario,
  agendarHorario,
  obtenerAgenda,
  actualizarHorario,
  eliminarHorario
};
