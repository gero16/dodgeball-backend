const Donacion = require('../models/Donacion');
const axios = require('axios');
const paypal = require('@paypal/checkout-server-sdk');

// Crear nueva donación
const crearDonacion = async (req, res) => {
  try {
    const {
      donante,
      monto,
      moneda = (process.env.DEFAULT_DONATION_CURRENCY || 'UYU'),
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
      moneda = (process.env.DEFAULT_DONATION_CURRENCY || 'UYU'),
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

// === PayPal Helpers ===
const getPayPalClient = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
  const environment = env === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
};

// Crear orden de PayPal para donación
const crearOrdenPayPal = async (req, res) => {
  try {
    const {
      donante,
      monto,
      moneda = (process.env.DEFAULT_DONATION_CURRENCY || 'UYU'),
      mensaje,
      proposito = 'general'
    } = req.body;

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return res.status(500).json({ success: false, message: 'Configurar PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET' });
    }

    // Forzar moneda soportada por PayPal (p.ej. USD)
    const paypalCurrency = (process.env.PAYPAL_CURRENCY || 'USD').toUpperCase();

    const donacion = new Donacion({
      donante,
      monto,
      moneda: paypalCurrency,
      metodoPago: 'paypal',
      mensaje,
      proposito,
      estado: 'pendiente'
    });
    await donacion.save();

    const transaccionId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    donacion.transaccionId = transaccionId;
    await donacion.save();

    const backendBaseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: paypalCurrency,
            value: Number(monto).toFixed(2)
          },
          description: mensaje || 'Donación voluntaria',
          reference_id: transaccionId
        }
      ],
      application_context: {
        brand_name: 'Dodgeball',
        user_action: 'PAY_NOW',
        return_url: `${frontendBaseUrl}/donar?pp_status=success&ref=${encodeURIComponent(transaccionId)}`,
        cancel_url: `${frontendBaseUrl}/donar?pp_status=cancel&ref=${encodeURIComponent(transaccionId)}`
      }
    });

    const client = getPayPalClient();
    const order = await client.execute(request);
    const orderId = order.result.id;
    donacion.paypalOrderId = orderId;
    await donacion.save();

    const approveLink = (order.result.links || []).find(l => l.rel === 'approve')?.href;

    return res.status(201).json({
      success: true,
      message: 'Orden de PayPal creada',
      data: { transaccionId, orderId, approveUrl: approveLink }
    });
  } catch (error) {
    console.error('Error al crear orden PayPal:', error?.message || error);
    return res.status(500).json({ success: false, message: 'No se pudo crear la orden de PayPal' });
  }
};

// Capturar orden de PayPal
const capturarOrdenPayPal = async (req, res) => {
  try {
    const { orderId, transaccionId } = req.body;
    if (!orderId || !transaccionId) {
      return res.status(400).json({ success: false, message: 'orderId y transaccionId son requeridos' });
    }

    const donacion = await Donacion.findOne({ transaccionId, paypalOrderId: orderId });
    if (!donacion) {
      return res.status(404).json({ success: false, message: 'Donación no encontrada' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const client = getPayPalClient();
    const capture = await client.execute(request);

    const status = capture?.result?.status || 'COMPLETED';
    if (status === 'COMPLETED') {
      donacion.estado = 'completada';
      donacion.fechaPago = new Date();
      donacion.procesado = true;
      donacion.fechaProcesamiento = new Date();
    } else {
      donacion.estado = 'procesando';
    }
    await donacion.save();

    return res.json({ success: true, message: 'Orden capturada', data: { donacion } });
  } catch (error) {
    console.error('Error al capturar PayPal:', error?.message || error);
    return res.status(500).json({ success: false, message: 'No se pudo capturar la orden de PayPal' });
  }
};

// Listar donaciones de Mercado Pago (público, sin auth, para admin simple)
const listarDonacionesMPPublic = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      estado = '',
      fechaInicio = '',
      fechaFin = ''
    } = req.query;

    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const filtros = { metodoPago: 'mercadopago' };

    if (estado) filtros.estado = estado;
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

    res.json({
      success: true,
      data: {
        donaciones,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          paginas: Math.ceil(total / parseInt(limite))
        }
      }
    });
  } catch (error) {
    console.error('Error al listar donaciones MP:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Estadísticas rápidas de Mercado Pago (público)
const statsDonacionesMPPublic = async (req, res) => {
  try {
    const [sumario] = await Donacion.aggregate([
      { $match: { metodoPago: 'mercadopago' } },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
          totalMonto: { $sum: '$monto' }
        }
      }
    ]);

    const totalCompletadas = await Donacion.aggregate([
      { $match: { metodoPago: 'mercadopago', estado: 'completada' } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalMonto: { $sum: '$monto' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        sumarioPorEstado: sumario ? [sumario] : [],
        completadas: totalCompletadas[0] || { count: 0, totalMonto: 0 }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas MP:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Listar donaciones PayPal (público)
const listarDonacionesPayPalPublic = async (req, res) => {
  try {
    const { pagina = 1, limite = 20, estado = '', fechaInicio = '', fechaFin = '' } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const filtros = { metodoPago: 'paypal' };
    if (estado) filtros.estado = estado;
    if (fechaInicio || fechaFin) {
      filtros.createdAt = {};
      if (fechaInicio) filtros.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.createdAt.$lte = new Date(fechaFin);
    }
    const donaciones = await Donacion.find(filtros).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limite));
    const total = await Donacion.countDocuments(filtros);
    res.json({ success: true, data: { donaciones, paginacion: { pagina: parseInt(pagina), limite: parseInt(limite), total, paginas: Math.ceil(total / parseInt(limite)) } } });
  } catch (error) {
    console.error('Error al listar donaciones PayPal:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Estadísticas PayPal (público)
const statsDonacionesPayPalPublic = async (req, res) => {
  try {
    const porEstado = await Donacion.aggregate([
      { $match: { metodoPago: 'paypal' } },
      { $group: { _id: '$estado', count: { $sum: 1 }, totalMonto: { $sum: '$monto' } } }
    ]);
    const completadas = await Donacion.aggregate([
      { $match: { metodoPago: 'paypal', estado: 'completada' } },
      { $group: { _id: null, count: { $sum: 1 }, totalMonto: { $sum: '$monto' } } }
    ]);
    res.json({ success: true, data: { porEstado, completadas: completadas[0] || { count: 0, totalMonto: 0 } } });
  } catch (error) {
    console.error('Error stats PayPal:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
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
  webhookMercadoPago,
  listarDonacionesMPPublic,
  statsDonacionesMPPublic,
  crearOrdenPayPal,
  capturarOrdenPayPal,
  listarDonacionesPayPalPublic,
  statsDonacionesPayPalPublic
};
