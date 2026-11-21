import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './env.js';
import { servicesRouter } from './routes/services.routes.js';
import { bookingsRouter } from './routes/bookings.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIST_PATH = path.resolve(__dirname, '../../dist');

export function createApp(distPath = DEFAULT_DIST_PATH) {
  const app = express();

  // Dossier du build frontend (Vite). Optionnel : sans lui, l'app ne sert que l'API.
  const indexFile = distPath ? path.join(distPath, 'index.html') : null;
  const staticDir = indexFile && fs.existsSync(indexFile) ? distPath : null;

  if (distPath && !staticDir) {
    console.warn(`[static] index.html introuvable dans ${distPath} — le frontend ne sera pas servi.`);
  }

  // Derrière un proxy (Vite / reverse proxy / cPanel) pour obtenir la vraie IP
  app.set('trust proxy', 1);

  /* ---------------------------- Sécurité ---------------------------- */

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (env.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origine non autorisée par la politique CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 600
    })
  );

  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());

  /* --------------------- Rate limiting global ---------------------- */

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        error: { code: 'RATE_LIMITED', message: 'Trop de requêtes, merci de ralentir.' }
      }
    })
  );

  /* ---------------------------- Routes ---------------------------- */

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'loudaya-api', time: new Date().toISOString() });
  });

  app.use('/api/services', servicesRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/admin', adminRouter);

  /* ------------------------ Frontend (SPA) ------------------------ */

  if (staticDir) {
    // Fichiers du build : /assets/*, logo, robots.txt, sitemap.xml, etc.
    app.use(
      express.static(staticDir, {
        index: false,
        etag: true,
        setHeaders(res, filePath) {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        }
      })
    );

    // Fallback SPA : toute route GET hors /api renvoie index.html.
    // React Router gère ensuite /services-categories, /booking-section,
    // /services/massage, /reservation, /admin, etc. sans 404.
    app.get('*', (req, res, next) => {
      if (req.path === '/api' || req.path.startsWith('/api/')) return next();
      res.sendFile(indexFile, (error) => {
        if (error) next(error);
      });
    });
  }

  /* --------------------------- Erreurs ---------------------------- */

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}