const Producto = require('../models/Producto');

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 12, 
      categoria = '', 
      busqueda = '', 
      destacados = false,
      precioMin = '',
      precioMax = '',
      ordenar = 'nombre'
    } = req.query;
    
    const skip = (pagina - 1) * limite;
    let filtros = { activo: true };
    let sort = { nombre: 1 };

    // Filtros
    if (categoria) filtros.categoria = categoria;
    if (destacados === 'true') filtros.destacado = true;
    
    if (busqueda) {
      filtros.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } },
        { etiquetas: { $in: [new RegExp(busqueda, 'i')] } }
      ];
    }

    // Filtros de precio
    if (precioMin || precioMax) {
      filtros.precio = {};
      if (precioMin) filtros.precio.$gte = parseFloat(precioMin);
      if (precioMax) filtros.precio.$lte = parseFloat(precioMax);
    }

    // Ordenamiento
    switch (ordenar) {
      case 'precio_asc':
        sort = { precio: 1 };
        break;
      case 'precio_desc':
        sort = { precio: -1 };
        break;
      case 'nombre':
        sort = { nombre: 1 };
        break;
      case 'destacados':
        sort = { destacado: -1, nombre: 1 };
        break;
      default:
        sort = { nombre: 1 };
    }

    const productos = await Producto.find(filtros)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Producto.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        productos,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener producto por ID
const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);

    if (!producto || !producto.activo) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { producto }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo producto
const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      precioDescuento,
      categoria,
      tallas,
      colores,
      stock,
      sku,
      etiquetas,
      destacado,
      peso,
      dimensiones
    } = req.body;

    const producto = new Producto({
      nombre,
      descripcion,
      precio,
      precioDescuento,
      categoria,
      tallas: tallas || [],
      colores: colores || [],
      stock,
      sku,
      etiquetas: etiquetas || [],
      destacado: destacado || false,
      peso,
      dimensiones,
      imagenes: req.files ? req.files.map(file => file.path) : []
    });

    await producto.save();

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { producto }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
      precioDescuento,
      categoria,
      tallas,
      colores,
      stock,
      sku,
      etiquetas,
      destacado,
      peso,
      dimensiones
    } = req.body;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Actualizar campos
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (precio !== undefined) producto.precio = precio;
    if (precioDescuento !== undefined) producto.precioDescuento = precioDescuento;
    if (categoria) producto.categoria = categoria;
    if (tallas) producto.tallas = tallas;
    if (colores) producto.colores = colores;
    if (stock !== undefined) producto.stock = stock;
    if (sku) producto.sku = sku;
    if (etiquetas) producto.etiquetas = etiquetas;
    if (destacado !== undefined) producto.destacado = destacado;
    if (peso !== undefined) producto.peso = peso;
    if (dimensiones) producto.dimensiones = dimensiones;
    if (req.files && req.files.length > 0) {
      producto.imagenes = [...producto.imagenes, ...req.files.map(file => file.path)];
    }

    await producto.save();

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { producto }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Desactivar en lugar de eliminar
    producto.activo = false;
    await producto.save();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Producto.distinct('categoria', { activo: true });
    
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

// Obtener productos destacados
const obtenerDestacados = async (req, res) => {
  try {
    const productos = await Producto.find({ 
      destacado: true, 
      activo: true,
      stock: { $gt: 0 }
    })
      .sort({ nombre: 1 })
      .limit(8);

    res.json({
      success: true,
      data: { productos }
    });
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar stock
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    producto.stock = stock;
    await producto.save();

    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: { producto }
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerDestacados,
  actualizarStock
};
