import jwt from 'jsonwebtoken';

// Fonction pour générer un JWT sécurisé
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Le token expire après 1 heure
    });
};