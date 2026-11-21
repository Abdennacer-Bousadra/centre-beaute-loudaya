import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../lib/ApiError.js';
import { signAdminToken } from '../lib/jwt.js';
import { requireAdmin, setAdminCookie, clearAdminCookie } from '../middleware/auth.js';
import { validateBody } from '../middleware/index.js';
import { serializeBooking } from './bookings.routes.js';
import { EXTRA_OPTIONS } from '../lib/whatsapp.js';

export const adminRouter = Router();

/* ------------------------------------------------------------------ */
/* Rate limiting : login (protection brute force)                       */
/* ------------------------------------------------------------------ */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
    }
  }
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse e-mail invalide').max(160),
  password: z.string().min(8, 'Mot de passe trop court').max(200)
});

/* ------------------------------------------------------------------ */
/* POST /api/admin/login                                               */
/* ------------------------------------------------------------------ */

adminRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });

    const passwordHash = admin?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!admin || !passwordMatches) {
      throw ApiError.unauthorized('E-mail ou mot de passe incorrect');
    }

    const token = signAdminToken(admin);
    setAdminCookie(res, token);

    res.json({
      message: 'Connexion réussie',
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* POST /api/admin/logout                                              */
/* ------------------------------------------------------------------ */

adminRouter.post('/logout', (req, res) => {
  clearAdminCookie(res);
  res.json({ message: 'Déconnexion réussie' });
});

/* ------------------------------------------------------------------ */
/* GET /api/admin/me — vérifie la validité du token                     */
/* ------------------------------------------------------------------ */

adminRouter.get('/me', requireAdmin, async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true }
    });
    if (!admin) {
      throw ApiError.unauthorized('Compte introuvable');
    }
    res.json({ admin });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Everything below requires a valid JWT                               */
/* ------------------------------------------------------------------ */

adminRouter.use(requireAdmin);

/* ---------------------------- Réservations ------------------------- */

const bookingInclude = {
  items: { orderBy: { id: 'asc' } },
  service: { select: { id: true, slug: true, nameFr: true, nameAr: true } }
};

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'])
});

/** GET /api/admin/bookings — toutes les réservations (optionnel ?status=). */
adminRouter.get('/bookings', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(String(status).toUpperCase())) {
      where.status = String(status).toUpperCase();
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: [{ date: 'asc' }, { time: 'asc' }, { id: 'desc' }]
    });

    res.json({ bookings: bookings.map(serializeBooking) });
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/admin/bookings/:id/status — changement de statut. */
adminRouter.patch('/bookings/:id/status', validateBody(statusSchema), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw ApiError.badRequest('INVALID_ID', 'Identifiant de réservation invalide');
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: req.body.status },
      include: bookingInclude
    });

    res.json({ message: 'Statut mis à jour', booking: serializeBooking(booking) });
  } catch (error) {
    next(error);
  }
});

/** DELETE /api/admin/bookings/:id */
adminRouter.delete('/bookings/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw ApiError.badRequest('INVALID_ID', 'Identifiant de réservation invalide');
    }

    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Réservation supprimée' });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------ Services --------------------------- */

/** GET /api/admin/services — toutes les prestations, y compris indisponibles. */
adminRouter.get('/services', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { services: { orderBy: [{ order: 'asc' }, { id: 'asc' }] } }
    });

    res.json({
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        nameFr: category.nameFr,
        nameAr: category.nameAr,
        icon: category.icon,
        descriptionFr: category.descriptionFr,
        descriptionAr: category.descriptionAr,
        order: category.order,
        services: category.services.map((service) => ({
          id: service.id,
          slug: service.slug,
          categoryId: category.slug,
          nameFr: service.nameFr,
          nameAr: service.nameAr,
          descriptionFr: service.descriptionFr,
          descriptionAr: service.descriptionAr,
          price: service.price,
          priceMax: service.priceMax,
          priceFrom: service.priceFrom,
          priceNote: service.priceNote,
          duration: service.duration,
          popular: service.popular,
          badge: service.badge,
          available: service.available,
          active: service.active,
          order: service.order
        }))
      })),
      extraOptions: Object.values(EXTRA_OPTIONS)
    });
  } catch (error) {
    next(error);
  }
});

const serviceBodySchema = z.object({
  nameFr: z.string().trim().min(2).max(160),
  nameAr: z.string().trim().min(2).max(160),
  descriptionFr: z.string().trim().max(1000).nullish(),
  descriptionAr: z.string().trim().max(1000).nullish(),
  categoryId: z.union([z.number().int().positive(), z.string().trim().min(1).max(64)]),
  price: z.number().int().positive().max(100000),
  priceMax: z.number().int().positive().max(100000).nullish(),
  priceFrom: z.boolean().optional(),
  active: z.boolean().optional(),
  priceNote: z.string().trim().max(40).optional(),
  duration: z.string().trim().min(2).max(20).optional(),
  popular: z.boolean().optional(),
  badge: z.string().trim().max(80).nullish(),
  available: z.boolean().optional(),
  order: z.number().int().min(0).max(9999).optional()
});

/** Résout le slug de catégorie en id. */
async function resolveCategoryId(value) {
  if (Number.isInteger(value) && value > 0) {
    const category = await prisma.category.findUnique({ where: { id: value } });
    if (!category) throw ApiError.badRequest('UNKNOWN_CATEGORY', 'Catégorie inconnue');
    return category.id;
  }
  if (typeof value === 'string') {
    const category = await prisma.category.findUnique({ where: { slug: value } });
    if (!category) throw ApiError.badRequest('UNKNOWN_CATEGORY', 'Catégorie inconnue');
    return category.id;
  }
  throw ApiError.badRequest('UNKNOWN_CATEGORY', 'Catégorie inconnue');
}

const servicePatchSchema = serviceBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Aucun champ à modifier' }
);

/** POST /api/admin/services — créer une prestation. */
adminRouter.post('/services', validateBody(serviceBodySchema), async (req, res, next) => {
  try {
    const body = req.body;
    const categoryId = await resolveCategoryId(body.categoryId);

    if (body.priceMax != null && body.priceMax < body.price) {
      throw ApiError.badRequest(
        'INVALID_PRICE_RANGE',
        'Le prix maximum doit être supérieur ou égal au prix minimum'
      );
    }

    const count = await prisma.service.count({ where: { categoryId } });
    const baseSlug = slugify(body.nameFr) || `service-${Date.now()}`;

    const service = await prisma.service.create({
      data: {
        slug: await uniqueSlug(baseSlug),
        nameFr: body.nameFr,
        nameAr: body.nameAr,
        descriptionFr: body.descriptionFr || null,
        descriptionAr: body.descriptionAr || null,
        categoryId,
        price: body.price,
        priceMax: body.priceMax ?? null,
        priceFrom: body.priceFrom ?? false,
        active: body.active ?? true,
        priceNote: body.priceNote || 'DH',
        duration: body.duration || '30 min',
        popular: body.popular ?? false,
        badge: body.badge || null,
        available: body.available ?? true,
        order: body.order ?? count
      }
    });

    res.status(201).json({ message: 'Prestation créée', service });
  } catch (error) {
    next(error);
  }
});

/** PUT /api/admin/services/:id — modifier une prestation. */
adminRouter.put('/services/:id', validateBody(servicePatchSchema), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw ApiError.badRequest('INVALID_ID', 'Identifiant de prestation invalide');
    }

    const body = req.body;
    const data = {};

    if (body.nameFr !== undefined) data.nameFr = body.nameFr;
    if (body.nameAr !== undefined) data.nameAr = body.nameAr;
    if (body.descriptionFr !== undefined) data.descriptionFr = body.descriptionFr || null;
    if (body.descriptionAr !== undefined) data.descriptionAr = body.descriptionAr || null;
    if (body.price !== undefined) data.price = body.price;
    if (body.priceMax !== undefined) data.priceMax = body.priceMax;
    if (body.priceFrom !== undefined) data.priceFrom = body.priceFrom;
    if (body.active !== undefined) data.active = body.active;
    if (body.priceNote !== undefined) data.priceNote = body.priceNote;
    if (body.duration !== undefined) data.duration = body.duration;
    if (body.popular !== undefined) data.popular = body.popular;
    if (body.badge !== undefined) data.badge = body.badge || null;
    if (body.available !== undefined) data.available = body.available;
    if (body.order !== undefined) data.order = body.order;
    if (body.categoryId !== undefined) {
      data.categoryId = await resolveCategoryId(body.categoryId);
      if (data.nameFr) data.slug = await uniqueSlug(slugify(body.nameFr), id);
    }

    if (body.price !== undefined || body.priceMax !== undefined) {
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) throw ApiError.notFound('Prestation introuvable');

      const nextPrice = body.price !== undefined ? body.price : existing.price;
      const nextPriceMax = body.priceMax !== undefined ? body.priceMax : existing.priceMax;

      if (nextPriceMax != null && nextPriceMax < nextPrice) {
        throw ApiError.badRequest(
          'INVALID_PRICE_RANGE',
          'Le prix maximum doit être supérieur ou égal au prix minimum'
        );
      }
    }

    const service = await prisma.service.update({ where: { id }, data });

    res.json({ message: 'Prestation mise à jour', service });
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/admin/services/:id/price — changement de tarif rapide. */
const priceSchema = z.object({ price: z.number().int().positive().max(100000) });

adminRouter.patch('/services/:id/price', validateBody(priceSchema), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw ApiError.badRequest('INVALID_ID', 'Identifiant de prestation invalide');
    }

    const service = await prisma.service.update({
      where: { id },
      data: { price: req.body.price }
    });

    res.json({ message: 'Tarif mis à jour', service });
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/admin/services/:id/availability — masquer / afficher une prestation. */
const availabilitySchema = z.object({ available: z.boolean() });

adminRouter.patch('/services/:id/availability', validateBody(availabilitySchema), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw ApiError.badRequest('INVALID_ID', 'Identifiant de prestation invalide');
    }

    const service = await prisma.service.update({
      where: { id },
      data: { available: req.body.available }
    });

    res.json({ message: 'Disponibilité mise à jour', service });
  } catch (error) {
    next(error);
  }
});

/** DELETE /api/admin/services/:id */
adminRouter.delete('/services/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw ApiError.badRequest('INVALID_ID', 'Identifiant de prestation invalide');
    }

    const used = await prisma.booking.count({ where: { serviceId: id } });
    const usedInItems = await prisma.bookingItem.count({ where: { serviceId: id } });

    if (used > 0 || usedInItems > 0) {
      const service = await prisma.service.update({
        where: { id },
        data: { active: false, available: false }
      });
      return res.json({
        message: 'Prestation déjà réservée : elle a été désactivée au lieu d\'être supprimée',
        service,
        disabled: true
      });
    }

    await prisma.service.delete({ where: { id } });
    return res.json({ message: 'Prestation supprimée' });
  } catch (error) {
    return next(error);
  }
});

/* ------------------------------ Helpers ---------------------------- */

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

async function uniqueSlug(base, excludeId = null) {
  const root = base || 'service';
  let candidate = root;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.service.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
}