import { AuthService } from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const AuthController = {
  async login(req, res, next) {
    try {
      const { username, password, role } = req.body;
      const { token, user } = await AuthService.login({ username, password, role });

      // 1. Store JWT in HTTP-Only secure cookie
      res.cookie('token', token, COOKIE_OPTIONS);

      // 2. Also store session state in server-side session
      if (req.session) {
        req.session.user = user;
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user,
        token // sent as well for flexibility
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('token', COOKIE_OPTIONS);
      if (req.session) {
        req.session.destroy();
      }
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated.'
        });
      }

      const profile = await AuthService.getProfile(req.user);
      res.status(200).json({
        success: true,
        user: profile
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }
};
