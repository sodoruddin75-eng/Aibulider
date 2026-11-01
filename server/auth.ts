import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const SALT = 'buildai_salt_pro_secure_2026';
const JWT_SECRET = process.env.JWT_SECRET || 'buildai_super_secret_session_key_983749';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

export function generateToken(payload: { id: string; email: string; role: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64url') + '.' + signature;
}

export function verifyToken(token: string): { id: string; email: string; role: string; exp: number } | null {
  try {
    const [dataBase64, signature] = token.split('.');
    if (!dataBase64 || !signature) return null;
    const data = Buffer.from(dataBase64, 'base64url').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expectedSignature) return null;
    const parsed = JSON.parse(data);
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    referral_code: string;
    email_verified: number;
    free_credits_claimed: number;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.user = undefined;
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    req.user = undefined;
    return next();
  }

  const user = db.prepare(`
    SELECT id, email, name, role, status, referral_code, email_verified, free_credits_claimed
    FROM users WHERE id = ?
  `).get(payload.id) as any;

  if (user && user.status === 'active') {
    req.user = user;
  } else {
    req.user = undefined;
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account is suspended. Please contact support.' });
  }
  next();
}

export const SOLE_SUPER_ADMIN_EMAIL = 'tanvirahamedapon99@gmail.com';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // Strictly lock admin access to the sole owner
  if (req.user.email.toLowerCase() !== SOLE_SUPER_ADMIN_EMAIL || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Strictly restricted to the owner only.' });
  }
  next();
}
