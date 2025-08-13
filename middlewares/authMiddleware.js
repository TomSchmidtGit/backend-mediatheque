import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Liste temporaire des tokens révoqués
const blacklistedTokens = new Set();

// Middleware de protection des routes
export const protect = async (req, res, next) => {
  let token;

  // Récupération du token depuis les headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    try {
      // Vérification : token révoqué ?
      if (blacklistedTokens.has(token)) {
        return res.status(401).json({ message: 'Token expiré ou révoqué' });
      }

      // Décodage du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupération de l'utilisateur
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      next(); // OK, passe à la suite
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré ou révoqué' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      } else {
        return res.status(401).json({ message: 'Non autorisé' });
      }
    }
  } else {
    return res
      .status(401)
      .json({ message: 'Non autorisé, aucun token fourni' });
  }
};

// Middleware pour révoquer un token à la déconnexion
export const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    blacklistedTokens.add(token);
  }
  res.status(200).json({ message: 'Déconnexion réussie' });
};

// Vérifie si l'utilisateur est admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res
      .status(403)
      .json({ message: 'Accès refusé, réservé aux administrateurs' });
  }
};

// Vérifie si le rôle utilisateur est autorisé
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    next();
  };
};
