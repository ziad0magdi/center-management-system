import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'smart_center_super_secret_jwt_key_2026_educational_cms';

export const verifyToken = (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    // Also support Authorization header as fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session token found.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Synchronize with server session if present
    if (req.session) {
      req.session.user = decoded;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: err.message
    });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const role = req.user.role ? req.user.role.toLowerCase() : '';
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles.map(r => r.toLowerCase()) : [allowedRoles.toLowerCase()];

    if (!rolesArray.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${rolesArray.join(', ')}]. Current role: ${role}`
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireTeacher = requireRole(['admin', 'teacher']);
export const requireStudent = requireRole(['admin', 'student']);
