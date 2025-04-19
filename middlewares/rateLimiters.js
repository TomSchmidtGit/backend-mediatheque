import rateLimit from 'express-rate-limit';

// Rate limiter spécifique pour la route de login
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: {
        error: "Trop de tentatives de connexion. Réessayez dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});