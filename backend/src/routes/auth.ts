import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { isEmailWhitelisted } from '../middleware/auth.js';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface GoogleAuthRequest {
  credential: string;
}

router.post('/google', async (req: Request<{}, {}, GoogleAuthRequest>, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'No credential provided' });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid token payload' });
      return;
    }

    const { email, name, picture } = payload;

    if (!isEmailWhitelisted(email)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Your email is not authorized to access this application.'
      });
      return;
    }

    const token = jwt.sign(
      { email, name, picture },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      token,
      user: { email, name, picture }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

router.get('/me', (req: Request, res: Response) => {
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
      res.status(403).json({ error: 'Email no longer whitelisted' });
      return;
    }

    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
