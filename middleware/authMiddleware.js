import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Vérifie si l'utilisateur est authentifié
export const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraction du token
            token = req.headers.authorization.split(' ')[1];

            // Décodage du token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Récupération de l'utilisateur (sans son mot de passe)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Passe à la suite
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Vérifie si l'utilisateur est admin
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Autoriser l'accès
    } else {
        res.status(403).json({ message: 'Access denied, admin only' });
    }
};