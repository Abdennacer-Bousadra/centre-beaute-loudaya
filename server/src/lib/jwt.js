import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function verifyAdminToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}