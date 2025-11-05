const Publicacion = require('../models/Publicacion');
const mongoose = require('mongoose');

// Obtener todas las publicaciones
const obtenerPublicaciones = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      categoria = '', 
      busqueda = '', 
      destacadas = false 
    } = req.query;
    
    const skip = (pagina - 1) * limite;
    let filtros = { activa: true };

    // Filtros
    if (categoria) filtros.categoria = categoria;
    if (destacadas === 'true') filtros.destacada = true;
    
    if (busqueda) {
      filtros.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { contenido: { $regex: busqueda, $options: 'i' } },
        { etiquetas: { $in: [new RegExp(busqueda, 'i')] } }
      ];
    }

    const publicaciones = await Publicacion.find(filtros)
      .populate('autor', 'nombre email')
      .sort({ fechaPublicacion: -1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Publicacion.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        publicaciones,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener publicación por ID
const obtenerPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const publicacion = await Publicacion.findById(id)
      .populate('autor', 'nombre email')
      .populate('comentarios.usuario', 'nombre email');

    if (!publicacion || !publicacion.activa) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Incrementar vistas
    publicacion.vistas += 1;
    await publicacion.save();

    res.json({
      success: true,
      data: { publicacion }
    });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva publicación
const crearPublicacion = async (req, res) => {
  try {
    const { titulo, contenido, resumen, categoria, etiquetas, destacada } = req.body;
    const allowUnauth = process.env.ALLOW_UNAUTH_PUBLICATIONS === 'true';
    let autorId = req.usuario?.id || process.env.DEFAULT_AUTHOR_ID;

    // En modo sin auth, si no hay autor definido, usar un ObjectId anónimo
    if (!autorId && allowUnauth) {
      autorId = new mongoose.Types.ObjectId();
    }

    if (!autorId && !allowUnauth) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const publicacion = new Publicacion({
      titulo,
      contenido,
      resumen,
      categoria,
      etiquetas: Array.isArray(etiquetas) ? etiquetas : (etiquetas ? [etiquetas] : []),
      destacada: destacada || false,
      autor: autorId,
      imagen: req.file ? req.file.path : ''
    });

    await publicacion.save();
    await publicacion.populate('autor', 'nombre email');

    res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente',
      data: { publicacion }
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar publicación
const actualizarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, resumen, categoria, etiquetas, destacada } = req.body;
    const usuarioId = req.usuario.id;

    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    const allowUnauth = process.env.ALLOW_UNAUTH_PUBLICATIONS === 'true';
    // Verificar permisos (autor o admin) a menos que esté habilitado el bypass
    if (!allowUnauth) {
      if (!req.usuario) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }
      if (publicacion.autor.toString() !== usuarioId && req.usuario.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar esta publicación'
        });
      }
    }

    // Actualizar campos
    if (titulo) publicacion.titulo = titulo;
    if (contenido) publicacion.contenido = contenido;
    if (resumen !== undefined) publicacion.resumen = resumen;
    if (categoria) publicacion.categoria = categoria;
    if (etiquetas) publicacion.etiquetas = etiquetas;
    if (destacada !== undefined) publicacion.destacada = destacada;
    if (req.file) publicacion.imagen = req.file.path;

    await publicacion.save();
    await publicacion.populate('autor', 'nombre email');

    res.json({
      success: true,
      message: 'Publicación actualizada exitosamente',
      data: { publicacion }
    });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar publicación
const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const allowUnauth = process.env.ALLOW_UNAUTH_PUBLICATIONS === 'true';
    const usuarioId = req.usuario?.id;

    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Verificar permisos (autor o admin) salvo bypass
    if (!allowUnauth) {
      if (!req.usuario) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }
      if (publicacion.autor.toString() !== usuarioId && req.usuario.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta publicación'
        });
      }
    }

    // Desactivar en lugar de eliminar
    publicacion.activa = false;
    await publicacion.save();

    res.json({
      success: true,
      message: 'Publicación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Publicacion.distinct('categoria', { activa: true });
    
    res.json({
      success: true,
      data: { categorias }
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener publicaciones destacadas
const obtenerDestacadas = async (req, res) => {
  try {
    const publicaciones = await Publicacion.find({ 
      destacada: true, 
      activa: true 
    })
      .populate('autor', 'nombre email')
      .sort({ fechaPublicacion: -1 })
      .limit(5);

    res.json({
      success: true,
      data: { publicaciones }
    });
  } catch (error) {
    console.error('Error al obtener publicaciones destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar comentario
const agregarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    const usuarioId = req.usuario.id;

    const publicacion = await Publicacion.findById(id);
    if (!publicacion || !publicacion.activa) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    const comentario = {
      usuario: usuarioId,
      contenido
    };

    publicacion.comentarios.push(comentario);
    await publicacion.save();

    await publicacion.populate('comentarios.usuario', 'nombre email');

    res.json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: { publicacion }
    });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  obtenerCategorias,
  obtenerDestacadas,
  agregarComentario
};
