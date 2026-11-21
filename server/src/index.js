import { createApp } from './app.js';
import { env } from './env.js';
import { prisma } from './lib/prisma.js';
import { shutdown } from './middleware/index.js';

async function main() {
  const app = createApp();

  try {
    await prisma.$connect();
    if (!env.isProd) {
      console.log('[db] Connexion MySQL réussie.');
    }
  } catch (error) {
    console.error('\n[db] Connexion MySQL impossible :', error.message);
    if (!env.isProd) {
      console.error('\n     Vérifiez que MySQL est démarré et que la base existe.');
      console.error('\n     Puis lancez : npx prisma migrate dev --name init\n');
    }
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    if (!env.isProd) {
      console.log(`\n  ✅ API Centre de Beauté Loudaya`);
      console.log(`     → http://localhost:${env.PORT}/api`);
      console.log(`     → environnement : ${env.NODE_ENV}`);
      console.log(`     → CORS autorisé pour : ${env.corsOrigins.join(', ')}\n`);
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n[server] Le port ${env.PORT} est déjà utilisé. Changez PORT dans server/.env.\n`);
      process.exit(1);
    }
    throw error;
  });

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();