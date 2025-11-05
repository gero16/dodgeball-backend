const Donacion = require('../models/Donacion');
const axios = require('axios');

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

// Crear preferencia de Mercado Pago para donación
const crearPreferenciaMercadoPago = async (req, res) => {
  try {
    const {
      donante,
      monto,
      moneda = 'USD',
      mensaje,
      proposito = 'general'
    } = req.body;

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN en el servidor'
      });
    }

    // Crear registro de donación en estado pendiente
    const donacion = new Donacion({
      donante,
      monto,
      moneda,
      metodoPago: 'mercadopago',
      mensaje,
      proposito,
      estado: 'pendiente'
    });
    await donacion.save();

    // Generar ID de transacción único y guardar
    const transaccionId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    donacion.transaccionId = transaccionId;
    await donacion.save();

    const backendBaseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const preferencePayload = {
      items: [
        {
          title: 'Donación Dodgeball',
          description: mensaje || 'Donación voluntaria',
          quantity: 1,
          unit_price: Number(monto),
          currency_id: moneda
        }
      ],
      payer: {
        name: donante?.nombre,
        email: donante?.email
      },
      external_reference: transaccionId,
      back_urls: {
        success: `${frontendBaseUrl}/donar?mp_status=success&ref=${encodeURIComponent(transaccionId)}`,
        failure: `${frontendBaseUrl}/donar?mp_status=failure&ref=${encodeURIComponent(transaccionId)}`,
        pending: `${frontendBaseUrl}/donar?mp_status=pending&ref=${encodeURIComponent(transaccionId)}`
      },
      auto_return: 'approved',
      notification_url: `${backendBaseUrl}/api/donaciones/mercadopago/webhook`
    };

    const resp = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferencePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const preference = resp.data;

    donacion.mercadoPagoPreferenceId = preference.id;
    await donacion.save();

    return res.status(201).json({
      success: true,
      message: 'Preferencia creada exitosamente',
      data: {
        transaccionId,
        preferenceId: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point || null
      }
    });
  } catch (error) {
    console.error('Error al crear preferencia MP:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'No se pudo crear la preferencia de Mercado Pago'
    });
  }
};

// Webhook de Mercado Pago
const webhookMercadoPago = async (req, res) => {
  try {
    // Mercado Pago puede enviar GET o POST dependiendo de la configuración
    const paymentId = req.query.id || req.query['data.id'] || req.body?.data?.id;

    if (!paymentId) {
      // Aceptamos igualmente para no reintentar indefinidamente
      return res.status(200).json({ received: true });
    }

    // Obtener detalle del pago
    const payResp = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      }
    );

    const pago = payResp.data;
    const transaccionId = pago.external_reference;

    if (!transaccionId) {
      return res.status(200).json({ processed: false });
    }

    const donacion = await Donacion.findOne({ transaccionId });
    if (!donacion) {
      return res.status(200).json({ processed: false });
    }

    donacion.mercadoPagoPaymentId = String(pago.id);
    donacion.mercadoPagoStatus = pago.status;

    if (pago.status === 'approved') {
      donacion.estado = 'completada';
      donacion.fechaPago = new Date();
      donacion.procesado = true;
      donacion.fechaProcesamiento = new Date();
    } else if (pago.status === 'in_process' || pago.status === 'pending') {
      donacion.estado = 'procesando';
    } else if (pago.status === 'rejected' || pago.status === 'cancelled') {
      donacion.estado = 'fallida';
    }

    await donacion.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en webhook MP:', error?.response?.data || error.message);
    // Responder 200 para evitar reintentos excesivos, pero loguear el error
    return res.status(200).json({ success: false });
  }
};

module.exports = {
  crearDonacion,
  obtenerDonaciones,
  obtenerDonacion,
  actualizarEstado,
  obtenerEstadisticas,
  procesarPagoPayPal,
  crearPreferenciaMercadoPago,
  webhookMercadoPago
};
