/**
 * Erreur applicative porteuse d'un code HTTP et d'un code métier stable.
 * Le code métier permet au frontend de traduire le message en FR / AR.
 */
export class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(code, message, details) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = 'Authentification requise') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Accès refusé') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Ressource introuvable') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(code, message) {
    return new ApiError(409, code, message);
  }

  static tooManyRequests(message = 'Trop de requêtes, merci de réessayer plus tard') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }
}