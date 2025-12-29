import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        picture?: string;
      };
    }
  }
}

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export function isEmailWhitelisted(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      name: string;
      picture?: string;
    };

    if (!isEmailWhitelisted(decoded.email)) {
      res.status(403).json({ error: 'Access denied. Email not whitelisted.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(401).json({ error: 'Invalid token' });
  }
}
