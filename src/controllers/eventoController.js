const Evento = require('../models/Evento');

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

    const eventos = await Evento.find(filtros)
      .populate('organizador', 'nombre email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limite));

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

// Obtener evento por ID
const obtenerEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findById(id)
      .populate('organizador', 'nombre email')
      .populate('inscripciones.usuario', 'nombre email');

    if (!evento || !evento.activo) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
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

// Crear nuevo evento
const crearEvento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      fecha,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      categoria,
      precio,
      cupoMaximo,
      requisitos,
      destacado
    } = req.body;

    const evento = new Evento({
      titulo,
      descripcion,
      fecha,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      categoria,
      precio,
      cupoMaximo,
      cupoDisponible: cupoMaximo,
      requisitos: requisitos || [],
      destacado: destacado || false,
      organizador: req.usuario.id,
      imagen: req.file ? req.file.path : ''
    });

    await evento.save();
    await evento.populate('organizador', 'nombre email');

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar evento
const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      fecha,
      horaInicio,
      horaFin,
      ubicacion,
      tipo,
      categoria,
      precio,
      cupoMaximo,
      requisitos,
      destacado
    } = req.body;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar permisos (organizador o admin)
    if (evento.organizador.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este evento'
      });
    }

    // Actualizar campos
    if (titulo) evento.titulo = titulo;
    if (descripcion) evento.descripcion = descripcion;
    if (fecha) evento.fecha = fecha;
    if (horaInicio) evento.horaInicio = horaInicio;
    if (horaFin) evento.horaFin = horaFin;
    if (ubicacion) evento.ubicacion = ubicacion;
    if (tipo) evento.tipo = tipo;
    if (categoria) evento.categoria = categoria;
    if (precio !== undefined) evento.precio = precio;
    if (cupoMaximo) {
      evento.cupoMaximo = cupoMaximo;
      evento.cupoDisponible = cupoMaximo - evento.inscripciones.filter(ins => ins.estado === 'confirmada').length;
    }
    if (requisitos) evento.requisitos = requisitos;
    if (destacado !== undefined) evento.destacado = destacado;
    if (req.file) evento.imagen = req.file.path;

    await evento.save();
    await evento.populate('organizador', 'nombre email');

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar evento
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar permisos (organizador o admin)
    if (evento.organizador.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este evento'
      });
    }

    // Desactivar en lugar de eliminar
    evento.activo = false;
    await evento.save();

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

// Inscribirse en evento
const inscribirseEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;
    const usuarioId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento || !evento.activo) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar si ya está inscrito
    const yaInscrito = evento.inscripciones.find(
      ins => ins.usuario.toString() === usuarioId
    );

    if (yaInscrito) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás inscrito en este evento'
      });
    }

    // Verificar cupo disponible
    if (evento.cupoDisponible <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay cupo disponible para este evento'
      });
    }

    // Agregar inscripción
    const inscripcion = {
      usuario: usuarioId,
      observaciones: observaciones || ''
    };

    evento.inscripciones.push(inscripcion);
    await evento.save();

    res.json({
      success: true,
      message: 'Inscripción realizada exitosamente',
      data: { evento }
    });
  } catch (error) {
    console.error('Error al inscribirse en evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener eventos próximos
const obtenerProximos = async (req, res) => {
  try {
    const ahora = new Date();
    const eventos = await Evento.find({
      activo: true,
      fecha: { $gte: ahora }
    })
      .populate('organizador', 'nombre email')
      .sort({ fecha: 1 })
      .limit(5);

    res.json({
      success: true,
      data: { eventos }
    });
  } catch (error) {
    console.error('Error al obtener eventos próximos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener eventos pasados
const obtenerPasados = async (req, res) => {
  try {
    const ahora = new Date();
    const eventos = await Evento.find({
      activo: true,
      fecha: { $lt: ahora }
    })
      .populate('organizador', 'nombre email')
      .sort({ fecha: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { eventos }
    });
  } catch (error) {
    console.error('Error al obtener eventos pasados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerEventos,
  obtenerEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  inscribirseEvento,
  obtenerProximos,
  obtenerPasados
};
