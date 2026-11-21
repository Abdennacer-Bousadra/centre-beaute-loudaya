import { ApiError } from '../lib/ApiError.js';
import { verifyAdminToken } from '../lib/jwt.js';
import { env } from '../env.js';

const COOKIE_NAME = 'admin_token';

/**
 * Extrait le token JWT de l'en-tête Authorization: Bearer <token>
 * ou du cookie httpOnly.
 */
function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  return null;
}

/** Options pour le cookie httpOnly sécurisé. */
export const adminCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/'
};

/** Garde les routes /api/admin/* : JWT valide obligatoire. */
export function requireAdmin(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(ApiError.unauthorized('Jeton manquant'));
  }

  try {
    const payload = verifyAdminToken(token);
    if (payload.role !== 'admin') {
      return next(ApiError.forbidden('Rôle non autorisé'));
    }
    req.admin = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'TOKEN_EXPIRED', 'Session expirée, veuillez vous reconnecter'));
    }
    return next(ApiError.unauthorized('Jeton invalide'));
  }
}

/** Définit le cookie d'authentification admin. */
export function setAdminCookie(res, token) {
  res.cookie(COOKIE_NAME, token, adminCookieOptions);
}

/** Supprime le cookie d'authentification admin. */
export function clearAdminCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...adminCookieOptions, maxAge: 0 });
}