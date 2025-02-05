import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Liste des tokens révoqués
const blacklistedTokens = new Set();

// ✅ Middleware de protection (vérification du token)
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraction du token
            token = req.headers.authorization.split(' ')[1];

            // Vérifier si le token est révoqué
            if (blacklistedTokens.has(token)) {
                return res.status(401).json({ message: 'Token expiré ou révoqué' });
            }

            // Décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Récupérer l'utilisateur (sans son mot de passe)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Passe à la suite
        } catch (error) {
            return res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
    }
};

// ✅ Middleware pour révoquer un token lors de la déconnexion
export const logout = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        blacklistedTokens.add(token);
    }
    res.status(200).json({ message: 'Déconnexion réussie' });
};

// ✅ Vérifie si l'utilisateur est admin
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Autoriser l'accès
    } else {
        res.status(403).json({ message: 'Accès refusé, réservé aux administrateurs' });
    }
};

// ✅ Vérifie si le rôle est autorisé
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès interdit' });
        }
        next();
    };
};