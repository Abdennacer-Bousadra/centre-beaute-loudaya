import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Prisma } from '../../generated/client/index.js';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../lib/ApiError.js';
import { validateBody, validateQuery } from '../middleware/index.js';
import {
  parseBookingDate,
  parseDurationToMinutes,
  timeToMinutes,
  validateSlot,
  overlaps
} from '../lib/bookingRules.js';
import { buildBookingWhatsAppLink, resolveExtraOption } from '../lib/whatsapp.js';

export const bookingsRouter = Router();

/* ------------------------------------------------------------------ */
/* Schémas de validation                                               */
/* ------------------------------------------------------------------ */

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:(?:\+|00)212|0)[5-7]\d{8}$/,
    'Numéro marocain invalide (ex: 0666923910)'
  );

/** Parse une valeur en nombre si possible, sinon retourne la string (pour slug). */
function toNumberOrString(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = Number(val);
    return Number.isInteger(n) && n > 0 ? n : val;
  }
  return val;
}

const createBookingSchema = z
  .object({
    clientName: z.string().trim().min(3, 'Nom trop court').max(120),
    phone: phoneSchema,
    serviceId: z.union([z.number().int().positive(), z.string().trim().min(1)]).optional(),
    serviceIds: z.array(z.union([z.number().int().positive(), z.string().trim().min(1)])).min(1).max(10).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu AAAA-MM-JJ'),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Heure invalide (HH:MM)'),
    notes: z.string().trim().max(500).optional().default(''),
    extraOptionSlug: z.string().trim().max(40).nullable().optional(),
    lang: z.enum(['fr', 'ar']).optional().default('fr')
  })
  .strip()
  .transform((data) => {
    const rawIds = data.serviceIds?.length
      ? Array.from(new Set(data.serviceIds))
      : data.serviceId
        ? [data.serviceId]
        : [];
    // Normalize: numbers stay numbers, numeric strings become numbers, slugs stay strings
    return {
      ...data,
      serviceIds: rawIds.map(toNumberOrString)
    };
  })
  .refine((data) => data.serviceIds.length > 0, {
    message: 'Au moins une prestation est requise',
    path: ['serviceIds']
  });

const availabilityQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu AAAA-MM-JJ')
});

/* ------------------------------------------------------------------ */
/* GET /api/bookings/availability?date=YYYY-MM-DD                      */
/* Créneaux déjà occupés (aucune donnée client exposée)                */
/* ------------------------------------------------------------------ */

bookingsRouter.get('/availability', validateQuery(availabilityQuery), async (req, res, next) => {
  try {
    const date = parseBookingDate(req.query.date);
    if (!date) {
      throw ApiError.badRequest('INVALID_DATE', 'Date invalide');
    }

    const bookings = await prisma.booking.findMany({
      where: { date, status: { not: 'CANCELLED' } },
      select: { time: true, durationMinutes: true }
    });

    res.json({
      date: req.query.date,
      busy: bookings.map((booking) => ({
        time: booking.time,
        durationMinutes: booking.durationMinutes
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Anti-spam sur la création de réservation uniquement (le GET d'availability
 * reste libre) : 10 demandes par IP et par heure.
 */
const bookingCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Trop de demandes de réservation envoyées. Merci de réessayer plus tard ou de nous appeler.'
    }
  }
});

/* ------------------------------------------------------------------ */
/* POST /api/bookings                                                  */
/* ------------------------------------------------------------------ */

bookingsRouter.post('/', bookingCreationLimiter, validateBody(createBookingSchema), async (req, res, next) => {
  try {
    const {
      clientName,
      phone,
      serviceIds,
      date: dateString,
      time,
      notes,
      extraOptionSlug,
      lang
    } = req.body;

    const date = parseBookingDate(dateString);
    if (!date) {
      throw ApiError.badRequest('INVALID_DATE', 'Date invalide', [
        { field: 'date', message: 'Format attendu AAAA-MM-JJ' }
      ]);
    }

    // 1. Les prestations existent-elles et sont-elles disponibles ?
    // serviceIds peut contenir des IDs numériques, des strings numériques, ou des slugs
    const numericIds = serviceIds.filter((v) => typeof v === 'number');
    const slugs = serviceIds.filter((v) => typeof v === 'string');

    const services = await prisma.service.findMany({
      where: {
        OR: [
          ...(numericIds.length ? [{ id: { in: numericIds } }] : []),
          ...(slugs.length ? [{ slug: { in: slugs } }] : [])
        ]
      }
    });

    if (services.length !== serviceIds.length) {
      // Trouver lesquels manquent pour un message d'erreur précis
      const foundIds = new Set(services.map((s) => s.id));
      const foundSlugs = new Set(services.map((s) => s.slug));
      const missing = serviceIds.filter(
        (v) => (typeof v === 'number' && !foundIds.has(v)) || (typeof v === 'string' && !foundSlugs.has(v))
      );
      throw ApiError.badRequest('UNKNOWN_SERVICE', 'Prestation inconnue', [
        { field: 'serviceIds', message: `Prestation(s) introuvable(s): ${missing.join(', ')}` }
      ]);
    }

    const unavailable = services.filter((service) => !service.available);
    if (unavailable.length > 0) {
      throw ApiError.conflict('SERVICE_UNAVAILABLE', 'Une prestation sélectionnée n\'est plus disponible');
    }

    // Conserver l'ordre de sélection de la cliente
    const orderedServices = serviceIds
      .map((idOrSlug) => {
        if (typeof idOrSlug === 'number') {
          return services.find((service) => service.id === idOrSlug);
        }
        return services.find((service) => service.slug === idOrSlug);
      })
      .filter(Boolean);

    // 2. Durée totale et prix total (calculés côté serveur, jamais reçus du client)
    const durationMinutes = Math.max(
      orderedServices.reduce(
        (total, service) => total + parseDurationToMinutes(service.duration),
        0
      ),
      15
    );

    const extraOption = resolveExtraOption(extraOptionSlug);
    const servicesTotal = orderedServices.reduce((total, service) => total + service.price, 0);
    const totalPrice = servicesTotal + (extraOption ? extraOption.price : 0);

    // 3. Horaires : 10h-20h, fermé le dimanche, pas de date passée
    const slot = validateSlot({ date: dateString, time, durationMinutes });
    if (!slot.ok) {
      throw ApiError.badRequest(slot.code, slot.code);
    }

    // 4. Double réservation — contrôle + création sous verrou
    // Utilise findMany avec lock (FOR UPDATE) via $queryRaw avec le nom de table réel (lowercase)
    const booking = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM booking WHERE date = ${date} AND status <> 'CANCELLED' FOR UPDATE`
      );

      const sameDay = await tx.booking.findMany({
        where: { date, status: { not: 'CANCELLED' } },
        select: { time: true, durationMinutes: true }
      });

      const requestedStart = timeToMinutes(time);
      const requestedEnd = requestedStart + durationMinutes;

      const collision = sameDay.find((existing) => {
        const existingStart = timeToMinutes(existing.time);
        const existingEnd = existingStart + existing.durationMinutes;
        return overlaps(requestedStart, requestedEnd, existingStart, existingEnd);
      });

      if (collision) {
        throw ApiError.conflict('SLOT_TAKEN', 'Ce créneau est déjà réservé');
      }

      const ref = await nextBookingRef(tx);

      return tx.booking.create({
        data: {
          ref,
          clientName,
          phone,
          serviceId: orderedServices[0].id,
          date,
          time,
          status: 'PENDING',
          notes: notes || null,
          extraOptionSlug: extraOption ? extraOption.slug : null,
          extraOptionName: extraOption ? extraOption.nameFr : null,
          extraOptionPrice: extraOption ? extraOption.price : 0,
          totalPrice,
          durationMinutes,
          items: {
            create: orderedServices.map((service) => ({
              serviceId: service.id,
              nameFr: service.nameFr,
              nameAr: service.nameAr,
              price: service.price,
              duration: service.duration
            }))
          }
        },
        include: { items: true }
      });
    });

    // 5. Lien WhatsApp (wa.me) vers le salon avec le récapitulatif
    const whatsappLink = buildBookingWhatsAppLink({
      booking: {
        ref: booking.ref,
        clientName: booking.clientName,
        phone: booking.phone,
        date: booking.date.toISOString().slice(0, 10),
        time: booking.time,
        totalPrice: booking.totalPrice,
        durationMinutes: booking.durationMinutes,
        extraOptionSlug: booking.extraOptionSlug,
        items: booking.items
      },
      lang
    });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { whatsappLink },
      include: { items: true, service: { select: { slug: true, nameFr: true, nameAr: true } } }
    });

    res.status(201).json({
      message: 'Réservation enregistrée',
      booking: serializeBooking(updated),
      whatsappLink
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Référence lisible du type RDV-XXXX, garantie unique. */
async function nextBookingRef(tx) {
  const year = new Date().getFullYear();
  const last = await tx.booking.findFirst({
    where: { ref: { startsWith: `RDV-${year}` } },
    orderBy: { id: 'desc' },
    select: { ref: true }
  });

  const lastNumber = last ? parseInt(last.ref.split('-')[1], 10) || 0 : 0;
  const nextNumber = lastNumber + 1;
  return `RDV-${year}${String(nextNumber).padStart(4, '0')}`;
}

/** Réponse publique d'une réservation : aucun champ sensible exposé. */
export function serializeBooking(booking) {
  return {
    id: booking.id,
    ref: booking.ref,
    clientName: booking.clientName,
    phone: booking.phone,
    date: booking.date.toISOString().slice(0, 10),
    time: booking.time,
    status: booking.status,
    notes: booking.notes,
    extraOption: booking.extraOptionName
      ? { nameFr: booking.extraOptionName, price: booking.extraOptionPrice }
      : null,
    totalPrice: booking.totalPrice,
    durationMinutes: booking.durationMinutes,
    whatsappLink: booking.whatsappLink,
    createdAt: booking.createdAt,
    service: booking.service
      ? {
          id: booking.service.id,
          nameFr: booking.service.nameFr,
          nameAr: booking.service.nameAr,
          slug: booking.service.slug
        }
      : null,
    items: (booking.items || []).map((item) => ({
      id: item.serviceId,
      nameFr: item.nameFr,
      nameAr: item.nameAr,
      price: item.price,
      duration: item.duration
    }))
  };
}