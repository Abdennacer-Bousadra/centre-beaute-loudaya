import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const servicesRouter = Router();

/** Formate une catégorie + ses prestations pour la réponse publique. */
function toPublicCategory(category) {
  return {
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
      // Le frontend manipule des identifiants de catégorie textuels (slugs).
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
      active: service.active
    }))
  };
}

/** GET /api/services — toutes les catégories avec leurs prestations. */
servicesRouter.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        services: {
          where: { available: true, active: true },
          orderBy: [{ order: 'asc' }, { id: 'asc' }]
        }
      }
    });

    res.json({ categories: categories.map(toPublicCategory) });
  } catch (error) {
    next(error);
  }
});

/** GET /api/services/:categorySlug — prestations d'une catégorie. */
servicesRouter.get('/:categorySlug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.categorySlug },
      include: {
        services: {
          where: { available: true, active: true },
          orderBy: [{ order: 'asc' }, { id: 'asc' }]
        }
      }
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Catégorie introuvable' } });
    }

    const payload = toPublicCategory(category);
    return res.json({
      category: {
        id: payload.id,
        slug: payload.slug,
        nameFr: payload.nameFr,
        nameAr: payload.nameAr,
        icon: payload.icon,
        descriptionFr: payload.descriptionFr,
        descriptionAr: payload.descriptionAr
      },
      services: payload.services
    });
  } catch (error) {
    return next(error);
  }
});