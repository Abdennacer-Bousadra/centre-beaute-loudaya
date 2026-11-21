import { ZodError } from 'zod';
import { ApiError } from '../lib/ApiError.js';
import { prisma } from '../lib/prisma.js';

/**
 * Valide req.body avec un schéma zod et le remplace par la version "parsée"
 * (données nettoyées, typées). Les champs inconnus sont rejetés.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body ?? {});
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message
        }));
        return next(
          ApiError.badRequest('VALIDATION_ERROR', 'Données invalides', details)
        );
      }
      return next(error);
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query ?? {});
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(ApiError.badRequest('VALIDATION_ERROR', 'Paramètres de requête invalides'));
      }
      return next(error);
    }
  };
}

/** 404 JSON pour toute route inconnue. */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`));
}

/**
 * Gestionnaire d'erreurs central : ne renvoie jamais de detail technique
 * (stack, message Prisma, SQL) au client.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  let status = error.status || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Erreur interne du serveur';

  if (error instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Données invalides';
  } else if (error?.code === 'P2002') {
    status = 409;
    code = 'DUPLICATE';
    message = 'Cette ressource existe déjà';
  } else if (error?.code === 'P2025') {
    status = 404;
    code = 'NOT_FOUND';
    message = 'Ressource introuvable';
  } else if (error?.code === 'P2003') {
    status = 400;
    code = 'FOREIGN_KEY';
    message = 'Référence invalide (catégorie ou service inexistant)';
  } else if (error?.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Corps de requête JSON invalide';
  }

  if (status >= 500) {
    console.error('[error]', error);
  }

  const body = {
    error: { code, message }
  };
  if (error.details) {
    body.error.details = error.details;
  }

  res.status(status).json(body);
}

/** Ferme proprement le pool Prisma à l'arrêt. */
export async function shutdown(signal) {
  console.log(`\n[server] ${signal} reçu, fermeture...`);
  await prisma.$disconnect();
  process.exit(0);
}