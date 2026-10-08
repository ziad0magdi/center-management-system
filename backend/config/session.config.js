import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

export const sessionConfig = session({
  name: 'smart_center_sid',
  secret: process.env.SESSION_SECRET || 'smart_center_session_secure_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
});
