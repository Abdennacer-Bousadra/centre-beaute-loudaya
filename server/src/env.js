import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL manquant dans server/.env'),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  ADMIN_EMAIL: z.string().email().default('admin@loudaya.ma'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD doit faire au moins 8 caractères').default('CentreLoudaya2026'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  SALON_PHONE: z.string().default('0666923910'),
  SALON_WHATSAPP: z.string().default('212666923910')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error('\n[config] Variables d\'environnement invalides :\n' + details);
  console.error('\nCopiez server/.env.example vers server/.env puis complétez-le.\n');
  process.exit(1);
}

const corsOrigins = parsed.data.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (parsed.data.NODE_ENV === 'production') {
  const invalidOrigins = corsOrigins.filter((origin) => origin && !origin.startsWith('https://'));
  if (invalidOrigins.length > 0) {
    console.error('\n[config] ERREUR: En production, tous les CORS_ORIGINS doivent utiliser HTTPS:');
    invalidOrigins.forEach((o) => console.error(`  - ${o}`));
    process.exit(1);
  }
  if (corsOrigins.length === 0) {
    console.error('\n[config] ERREUR: CORS_ORIGINS doit contenir au moins un domaine en production.');
    process.exit(1);
  }
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  corsOrigins
};