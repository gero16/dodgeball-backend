const PublicacionInstagram = require('../models/PublicacionInstagram');

/**
 * Acepta URL limpia o el HTML completo del embed de Instagram
 * (blockquote con data-instgrm-permalink).
 */
const normalizarUrlInstagram = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // Si pegaron el código embed completo, extraer el permalink
  let candidato = trimmed;
  const fromAttr = trimmed.match(/data-instgrm-permalink=["']([^"']+)["']/i);
  const fromHref = trimmed.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^"']+)["']/i);
  if (fromAttr) candidato = fromAttr[1];
  else if (fromHref) candidato = fromHref[1];

  // Decodificar entidades HTML típicas del embed
  candidato = candidato
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  let parsed;
  try {
    parsed = new URL(candidato);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  if (host !== 'instagram.com' && host !== 'instagr.am') return null;

  const match = parsed.pathname.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;

  const tipo = match[1].toLowerCase();
  const codigo = match[2];
  return `https://www.instagram.com/${tipo}/${codigo}/`;
};

const esReel = (url) => /\/reel\//i.test(url || '');

// Listado: públicas solo activas; con ?todas=true requiere adminAuth (ver ruta)
const obtenerPublicaciones = async (req, res) => {
  try {
    const { limite, todas } = req.query;
    const filtros = {};
    if (todas !== 'true') filtros.activa = true;

    let query = PublicacionInstagram.find(filtros).sort({ orden: 1, createdAt: -1 });
    if (limite) query = query.limit(parseInt(limite, 10));

    const publicaciones = await query;
    res.json({
      success: true,
      data: { publicaciones }
    });
  } catch (error) {
    console.error('Error al obtener publicaciones Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const crearPublicacion = async (req, res) => {
  try {
    const url = normalizarUrlInstagram(req.body.url);
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL o código embed inválido. Pegá el link del post/reel, o el código completo que da Instagram (Embed).'
      });
    }

    const existente = await PublicacionInstagram.findOne({ url });
    if (existente && existente.activa) {
      return res.status(400).json({
        success: false,
        message: 'Esa publicación ya está cargada'
      });
    }
    if (existente && !existente.activa) {
      existente.activa = true;
      existente.titulo = req.body.titulo !== undefined ? String(req.body.titulo).trim() : existente.titulo;
      if (req.body.orden !== undefined) {
        const o = Number(req.body.orden);
        if (Number.isFinite(o)) existente.orden = o;
      }
      await existente.save();
      return res.status(200).json({
        success: true,
        message: 'Publicación reactivada',
        data: { publicacion: existente }
      });
    }

    let orden = Number(req.body.orden);
    if (!Number.isFinite(orden)) {
      const ultimo = await PublicacionInstagram.findOne().sort({ orden: -1 }).select('orden');
      orden = (ultimo?.orden ?? -1) + 1;
    }

    const publicacion = await PublicacionInstagram.create({
      url,
      titulo: req.body.titulo ? String(req.body.titulo).trim() : '',
      orden,
      activa: true
    });

    res.status(201).json({
      success: true,
      message: 'Publicación de Instagram creada',
      data: { publicacion }
    });
  } catch (error) {
    console.error('Error al crear publicación Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const actualizarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const publicacion = await PublicacionInstagram.findById(id);
    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    if (req.body.url !== undefined) {
      const url = normalizarUrlInstagram(req.body.url);
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL o código embed inválido. Pegá el link o el código Embed de Instagram.'
        });
      }
      publicacion.url = url;
    }
    if (req.body.titulo !== undefined) publicacion.titulo = String(req.body.titulo).trim();
    if (req.body.orden !== undefined) {
      const o = Number(req.body.orden);
      if (Number.isFinite(o)) publicacion.orden = o;
    }
    if (req.body.activa !== undefined) {
      publicacion.activa = req.body.activa === true || req.body.activa === 'true';
    }

    await publicacion.save();
    res.json({
      success: true,
      message: 'Publicación actualizada',
      data: { publicacion }
    });
  } catch (error) {
    console.error('Error al actualizar publicación Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const publicacion = await PublicacionInstagram.findById(id);
    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Soft delete para poder reactivar si se vuelve a pegar la misma URL
    publicacion.activa = false;
    await publicacion.save();

    res.json({
      success: true,
      message: 'Publicación eliminada de la página principal'
    });
  } catch (error) {
    console.error('Error al eliminar publicación Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerPublicaciones,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  normalizarUrlInstagram,
  esReel
};
