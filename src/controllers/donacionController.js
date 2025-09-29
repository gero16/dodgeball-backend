const Donacion = require('../models/Donacion');

// Crear nueva donación
const crearDonacion = async (req, res) => {
  try {
    const {
      donante,
      monto,
      moneda = 'USD',
      metodoPago,
      mensaje,
      proposito = 'general'
    } = req.body;

    const donacion = new Donacion({
      donante,
      monto,
      moneda,
      metodoPago,
      mensaje,
      proposito
    });

    await donacion.save();

    // Generar ID de transacción único
    const transaccionId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    donacion.transaccionId = transaccionId;
    await donacion.save();

    res.status(201).json({
      success: true,
      message: 'Donación creada exitosamente',
      data: { 
        donacion,
        transaccionId 
      }
    });
  } catch (error) {
    console.error('Error al crear donación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todas las donaciones (admin)
const obtenerDonaciones = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      estado = '', 
      proposito = '',
      fechaInicio = '',
      fechaFin = ''
    } = req.query;
    
    const skip = (pagina - 1) * limite;
    let filtros = {};

    // Filtros
    if (estado) filtros.estado = estado;
    if (proposito) filtros.proposito = proposito;
    
    if (fechaInicio || fechaFin) {
      filtros.createdAt = {};
      if (fechaInicio) filtros.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.createdAt.$lte = new Date(fechaFin);
    }

    const donaciones = await Donacion.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limite));

    const total = await Donacion.countDocuments(filtros);

    // Calcular estadísticas
    const estadisticas = await Donacion.aggregate([
      { $match: { estado: 'completada' } },
      {
        $group: {
          _id: null,
          totalDonaciones: { $sum: 1 },
          montoTotal: { $sum: '$monto' },
          promedioDonacion: { $avg: '$monto' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        donaciones,
        estadisticas: estadisticas[0] || { totalDonaciones: 0, montoTotal: 0, promedioDonacion: 0 },
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener donaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener donación por ID
const obtenerDonacion = async (req, res) => {
  try {
    const { id } = req.params;

    const donacion = await Donacion.findById(id);

    if (!donacion) {
      return res.status(404).json({
        success: false,
        message: 'Donación no encontrada'
      });
    }

    res.json({
      success: true,
      data: { donacion }
    });
  } catch (error) {
    console.error('Error al obtener donación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estado de donación
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, paypalOrderId } = req.body;

    const donacion = await Donacion.findById(id);
    if (!donacion) {
      return res.status(404).json({
        success: false,
        message: 'Donación no encontrada'
      });
    }

    donacion.estado = estado;
    if (paypalOrderId) donacion.paypalOrderId = paypalOrderId;
    
    if (estado === 'completada') {
      donacion.fechaPago = new Date();
      donacion.procesado = true;
      donacion.fechaProcesamiento = new Date();
    }

    await donacion.save();

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: { donacion }
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de donaciones
const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Donacion.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
          totalMonto: { $sum: '$monto' }
        }
      }
    ]);

    const porProposito = await Donacion.aggregate([
      { $match: { estado: 'completada' } },
      {
        $group: {
          _id: '$proposito',
          count: { $sum: 1 },
          totalMonto: { $sum: '$monto' }
        }
      }
    ]);

    const ultimosMeses = await Donacion.aggregate([
      { $match: { estado: 'completada' } },
      {
        $group: {
          _id: {
            año: { $year: '$createdAt' },
            mes: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalMonto: { $sum: '$monto' }
        }
      },
      { $sort: { '_id.año': -1, '_id.mes': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        porEstado: estadisticas,
        porProposito,
        ultimosMeses
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Procesar pago de PayPal
const procesarPagoPayPal = async (req, res) => {
  try {
    const { transaccionId, paypalOrderId, estado } = req.body;

    const donacion = await Donacion.findOne({ transaccionId });
    if (!donacion) {
      return res.status(404).json({
        success: false,
        message: 'Donación no encontrada'
      });
    }

    donacion.paypalOrderId = paypalOrderId;
    donacion.estado = estado;
    
    if (estado === 'completada') {
      donacion.fechaPago = new Date();
      donacion.procesado = true;
      donacion.fechaProcesamiento = new Date();
    }

    await donacion.save();

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: { donacion }
    });
  } catch (error) {
    console.error('Error al procesar pago PayPal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearDonacion,
  obtenerDonaciones,
  obtenerDonacion,
  actualizarEstado,
  obtenerEstadisticas,
  procesarPagoPayPal
};
