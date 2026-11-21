import { PrismaClient } from '../../generated/client/index.js';
import { env } from '../env.js';

export const prisma = new PrismaClient({
  log: env.isProd ? ['error'] : ['error', 'warn']
});