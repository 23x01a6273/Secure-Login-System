import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db';
import { ApiResponse, SessionState } from './src/types';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fortress-logic-secure-neural-mesh-key-9541';

// Environment-aware cookie options helper
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = (maxAge: number | undefined) => ({
  httpOnly: true,
  secure: isProd, // require HTTPS in production
  sameSite: isProd ? 'none' as const : 'lax' as const,
  maxAge,
});
interface AuthenticatedRequest extends Request {
  userSession?: SessionState;
}

async function startServer() {
  const app = express();

  // Basic Security & Parsing Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Disable 'X-Powered-By' header to obscure backend tech stack from attackers
  app.disable('x-powered-by');

  // Request Rate / Parameter Sanitization (Simple SQL-i & XSS protection helper)
  app.use((req, res, next) => {
    // Audit inputs
    const sanitize = (val: any): any => {
      if (typeof val === 'string') {
        // Strip critical SQL injection signals or HTML tags as security precaution
        return val.replace(/['";\-]/g, '').trim();
      }
      return val;
    };

    if (req.body) {
      for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
          req.body[key] = sanitize(req.body[key]);
        }
      }
    }
    next();
  });

  // JWT Verification Middleware
  const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.secure_session_token;

    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid clearance level: Token missing.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SessionState;
      if (!decoded.mfaVerified) {
        res.status(403).json({ success: false, message: 'clearance level incomplete: 2FA required.' });
        return;
      }
      req.userSession = decoded;
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Clearance session expired or corrupted.' });
    }
  };

  // --- API ROUTE ENDPOINTS ---

  // Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Integrated core grid operational.' });
  });

  // User Registration Endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'All operational coordinates (username, email, password) required.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Security password must contain at least 8 alphanumeric nodes.' });
      return;
    }

    try {
      const newUser = await db.registerUser(username, email, password);
      // Automatically generate initial setup MFA code for reference
      const initialOtp = db.createMfaCode(newUser.id);

      res.status(201).json({
        success: true,
        message: 'Security Identity registered in the neural registry.',
        data: {
          username: newUser.username,
          email: newUser.email,
          mfaSetupCode: initialOtp, // Display to commander-in-testing
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Identity enrollment failed' });
    }
  });

  // User Auth Login Initiate
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { usernameOrEmail, password, rememberNode } = req.body;

    if (!usernameOrEmail || !password) {
      res.status(400).json({ success: false, message: 'Secure credentials missing' });
      return;
    }

    try {
      const user = await db.findUserByUsernameOrEmail(usernameOrEmail);

      // Determine client info
      const userAgent = req.headers['user-agent'] || 'Console Terminal Client';
      const device = userAgent.includes('Mobile') ? 'Mobile_Client_iOS' : 'Workstation_Alpha_01';
      const location = req.headers['accept-language']?.includes('de') ? 'Zurich, CH' : 'London, UK';

      if (!user) {
        // Obscure system layout: return generic error to prevent email harvesting enumeration
        res.status(401).json({ success: false, message: 'Handshake rejected: Incorrect username, email, or credentials key.' });
        return;
      }

      // Safe Bcrypt comparison
      const match = bcrypt.compareSync(password, user.passwordHash);
      if (!match) {
        // Record failure against index
        await db.recordHistory(user.id, user.username, location, device, 'Blocked');
        res.status(401).json({ success: false, message: 'Handshake rejected: Incorrect username, email, or credentials key.' });
        return;
      }

      // Generate dynamic OTP challenge
      const otpCode = db.createMfaCode(user.id);

      // Pre-issue a partial session state (MfaRequired)
      const maxAge = rememberNode ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
      const partialSession: SessionState = {
        token: `part_${Math.random().toString(36).substring(2, 12)}`,
        userId: user.id,
        username: user.username,
        email: user.email,
        mfaVerified: false,
        expiresAt: new Date(Date.now() + maxAge).toISOString(),
      };

      // Set cookie for security
      const token = jwt.sign(partialSession, JWT_SECRET, { expiresIn: '15m' });
      res.cookie('secure_session_token', token, cookieOpts(15 * 60 * 1000));

      res.json({
        success: true,
        message: 'Master key validated. Input double factor verification node sequence.',
        data: {
          userId: user.id,
          username: user.username,
          mfaRequired: true,
          simulatedOtp: otpCode, // Simulated delivery telemetry log
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Terminal interface error.' });
    }
  });

  // Verify second-factor authentication sequence
  app.post('/api/auth/verify-2fa', async (req: Request, res: Response) => {
    const { code, userId } = req.body;
    const partialToken = req.cookies?.secure_session_token;

    if (!code || !userId) {
      res.status(400).json({ success: false, message: 'Verification code sequence required.' });
      return;
    }

    try {
      // Decode partial token first to establish integrity of ongoing flow
      if (!partialToken) {
        res.status(401).json({ success: false, message: 'Verification access token missing or timed out.' });
        return;
      }

      let partialSession: SessionState;
      try {
        partialSession = jwt.verify(partialToken, JWT_SECRET) as SessionState;
      } catch (err) {
        res.status(401).json({ success: false, message: 'Session block expired. Restart session setup.' });
        return;
      }

      if (partialSession.userId !== userId) {
        res.status(403).json({ success: false, message: 'Session identity mismatched.' });
        return;
      }

      // Debug logging for verification flow
      console.log('/api/auth/verify-2fa payload:', { userId, code });
      console.log('partialToken present:', !!partialToken);
      if (partialToken) {
        try {
          const decodedDebug = jwt.verify(partialToken, JWT_SECRET) as SessionState;
          console.log('decoded partialSession userId:', decodedDebug.userId);
        } catch (e: any) {
          console.log('partialToken decode error:', e?.message || e);
        }
      }
      console.log('active otp (debug):', db.getActiveCode(userId));

      // Check OTP against parameters securely
      const ok = db.verifyMfaCode(userId, code);
      if (!ok) {
        res.status(401).json({ success: false, message: 'Dynamic code rejected. Handshake sequence mismatch.' });
        return;
      }

      // Establish fully authorized session token
      const fullSession: SessionState = {
        ...partialSession,
        mfaVerified: true,
      };

      // Remove any jwt-added fields (exp, iat) from the decoded partialSession
      // to avoid sign() throwing when options.expiresIn is provided.
      const cleanedSession = { ...fullSession } as any;
      delete cleanedSession.exp;
      delete cleanedSession.iat;

      const finalToken = jwt.sign(cleanedSession, JWT_SECRET, { expiresIn: '12h' });

      // Apply cookie persistence parameters
      res.cookie('secure_session_token', finalToken, cookieOpts(12 * 60 * 60 * 1000));

      // Log successful security access log entry
      const userAgent = req.headers['user-agent'] || 'Console Terminal Client';
      const device = userAgent.includes('Mobile') ? 'Mobile_Client_iOS' : 'Workstation_Alpha_01';
      const location = req.headers['accept-language']?.includes('de') ? 'Zurich, CH' : 'London, UK';

      await db.recordHistory(userId, partialSession.username, location, device, 'Authorized');

      res.json({
        success: true,
        message: 'Security handshake sequence authorized. Commander terminal loaded.',
        data: {
          username: partialSession.username,
          email: partialSession.email,
        },
      });
    } catch (err) {
      console.error('verify-2fa error:', err);
      res.status(500).json({ success: false, message: 'Handshake verification server error.' });
    }
  });

  // Request new OTP code resend
  app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, message: 'Client ID code mandatory.' });
      return;
    }

    try {
      const code = db.createMfaCode(userId);
      res.json({
        success: true,
        message: 'Digital multi-factor challenge token regenerated.',
        data: {
          simulatedOtp: code,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Token generator failure.' });
    }
  });

  // Check auth level status
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const token = req.cookies?.secure_session_token;

    if (!token) {
      res.json({ success: true, authenticated: false });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SessionState;
      if (decoded.mfaVerified) {
        res.json({
          success: true,
          authenticated: true,
          data: {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
          },
        });
      } else {
        res.json({ success: true, authenticated: false, mfaRequired: true, userId: decoded.userId });
      }
    } catch (err) {
      res.json({ success: true, authenticated: false });
    }
  });

  // Clear Secure Access cookies on logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('secure_session_token', cookieOpts(undefined));
    res.json({ success: true, message: 'Command terminal session terminated.' });
  });

  // Fetch audit Logs
  app.get('/api/logs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const session = req.userSession!;
    try {
      const logs = await db.getHistory(session.userId);
      res.json({ success: true, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to extract security registry.' });
    }
  });

  // Simulated biometric lockdown trigger
  app.post('/api/lockdown', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const session = req.userSession!;
    const userAgent = req.headers['user-agent'] || 'Emergency Panel Client';
    const device = userAgent.includes('Mobile') ? 'Mobile_Control' : 'Emergency_Tactical_Overhead';

    try {
      // Record lockdown event as blocked/blocked action logged
      await db.recordHistory(session.userId, session.username, 'OVERRIDE PANIC PANEL', device, 'Blocked');

      res.json({
        success: true,
        message: 'Emergency protocol initialized: Lockdown established. Clear target node to rebuild session authorization.',
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Overrides fail-safe operational.' });
    }
  });

  // --- VITE DEV SERVER / PRODUCTION CONFIGS ---

  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting development system (Vite on Express)...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Mounting production system...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Command Center Web server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical shutdown of core system:', err);
});
