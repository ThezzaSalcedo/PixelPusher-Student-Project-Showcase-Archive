import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const app = express();
const PORT = 3000;
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Authentication will fail.');
}

app.set('trust proxy', 1);

interface User {
  id: string;
  displayName: string;
  email: string;
  photo?: string;
  role: 'student' | 'admin' | 'guest';
  onboarded: boolean;
  studentId?: string;
  department?: string;
  advisor?: string;
}

// In-memory mock DB for the demo session
const usersDb: Record<string, User> = {};

// Passport initialization
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: `${process.env.APP_URL}/auth/google/callback`,
    scope: ['profile', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value?.toLowerCase() || '';
    const isNEU = email.endsWith('@neu.edu.ph');

    if (!isNEU) {
      return done(null, false, { message: 'Please log-in with your institutional account.' });
    }
    
    let user = usersDb[profile.id];
    if (!user) {
      user = {
        id: profile.id,
        displayName: profile.displayName,
        email: email,
        photo: profile.photos?.[0]?.value,
        role: 'student',
        onboarded: false
      };
      usersDb[profile.id] = user;
    }

    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

app.use(cookieParser());
app.use(express.json());

// Essential for AI Studio iframe context
app.use(session({
  secret: 'neu-archive-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // Required for SameSite=None
    sameSite: 'none',  // Required for cross-origin iframe
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const getRedirectUri = (req: express.Request, pathSuffix: string) => {
  let baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    // Attempt rescue from host header if env missing, but warn
    baseUrl = `${req.protocol}://${req.get('host')}`;
    console.warn('APP_URL env missing, falling back to discovered URL:', baseUrl);
  }
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}${pathSuffix}`;
};

// Auth Routes
app.post('/api/auth/google/verify', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid token payload' });

    const email = payload.email.toLowerCase();
    const isNEU = email.endsWith('@neu.edu.ph');

    if (!isNEU) {
      return res.status(403).json({ message: 'Please log-in with your institutional account.' });
    }

    let user = usersDb[payload.sub];
    if (!user) {
      user = {
        id: payload.sub,
        displayName: payload.name || 'Student',
        email: email,
        photo: payload.picture,
        role: 'student',
        onboarded: false
      };
      usersDb[payload.sub] = user;
    }

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: 'Failed to establish session' });
      res.json({ authenticated: true, user });
    });
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
});

app.post('/api/auth/google/code', async (req, res) => {
  const { code } = req.body;
  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: 'postmessage' // GIS popups use 'postmessage' for code exchange
    });
    
    if (!tokens.id_token) throw new Error('No ID Token');
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid payload' });

    const email = payload.email.toLowerCase();
    if (!email.endsWith('@neu.edu.ph')) {
      return res.status(403).json({ message: 'Please log-in with your institutional account.' });
    }

    let user = usersDb[payload.sub];
    if (!user) {
      user = {
        id: payload.sub,
        displayName: payload.name || 'Student',
        email: payload.email,
        photo: payload.picture,
        role: 'student',
        onboarded: false
      };
      usersDb[payload.sub] = user;
    }

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: 'Session failed' });
      res.json({ success: true, user });
    });
  } catch (err) {
    res.status(500).json({ message: 'Code exchange failed' });
  }
});

app.get('/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('CRITICAL: GOOGLE_CLIENT_ID is not defined in environment variables.');
  }
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: getRedirectUri(req, '/auth/google/callback'),
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
  };
  const qs = new URLSearchParams(options);
  const authUrl = `${rootUrl}?${qs.toString()}`;
  console.log('Redirecting to legacy Google Auth:', authUrl);
  res.redirect(authUrl);
});

// Helper for popup communication
const sendAuthMessage = (res: express.Response, data: any) => {
  res.send(`
    <html>
      <body>
        <script>
          window.opener.postMessage(${JSON.stringify(data)}, "*");
          window.close();
        </script>
      </body>
    </html>
  `);
};

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err: any, user: any, info: any) => {
    if (err) {
      return sendAuthMessage(res, { type: 'AUTH_ERROR', message: 'An unexpected error occurred.' });
    }
    if (!user) {
      return sendAuthMessage(res, { type: 'AUTH_ERROR', message: info?.message || 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) return sendAuthMessage(res, { type: 'AUTH_ERROR', message: 'Failed to establish session.' });
      return sendAuthMessage(res, { type: 'AUTH_SUCCESS', user });
    });
  })(req, res, next);
});

app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    // Validate input
    if (!email || !password || !displayName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.endsWith('@neu.edu.ph')) {
      return res.status(400).json({ message: 'Please use your official @neu.edu.ph email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // For demo, create user in memory (in production, this would use Supabase)
    const userId = `user_${Date.now()}`;
    const newUser = {
      id: userId,
      displayName,
      email,
      role,
      onboarded: false,
    };

    usersDb[userId] = newUser;

    res.status(201).json({ 
      message: 'Registration successful! You can now log in.',
      user: {
        id: userId,
        email: email,
        displayName: displayName,
        role: role,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!email.endsWith('@neu.edu.ph')) {
      return res.status(400).json({ message: 'Please use your official @neu.edu.ph email address' });
    }

    // Find user in memory database
    const user = Object.values(usersDb).find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    // For demo, accept any password (in production, verify actual password)
    if (password.length < 1) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

app.post('/api/user/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  const { studentId, department, advisor } = req.body;
  const user = req.user as User;
  
  if (usersDb[user.id]) {
    usersDb[user.id] = {
      ...usersDb[user.id],
      studentId,
      department,
      advisor,
      onboarded: true
    };
    req.logIn(usersDb[user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Session update failed' });
      res.json({ success: true, user: usersDb[user.id] });
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
