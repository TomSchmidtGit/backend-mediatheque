import rateLimit from 'express-rate-limit';

// Rate limiter spécifique pour la route de login
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 5, // Désactiver en mode test
    message: {
        error: "Trop de tentatives de connexion. Réessayez dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' // Désactiver complètement en mode test
});