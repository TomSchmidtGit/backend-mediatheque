import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Inscription
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            logger.warn(`Tentative d'inscription avec un email existant: ${email}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (user) {
            logger.info(`Nouvel utilisateur inscrit: ${email}`);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        logger.error(`Erreur lors de l'inscription: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

// Connexion
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && !user.actif) {
            return res.status(403).json({ message: 'Ce compte a été désactivé par un administrateur.' });
          }          

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Générer un access token
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '15m'
        });

        // Générer un refresh token (chaîne aléatoire sécurisée)
        const refreshTokenString = crypto.randomBytes(40).toString('hex');

        // Stocker le refresh token en BDD
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

        await RefreshToken.create({
            token: refreshTokenString,
            user: user._id,
            expiresAt
        });

        // Renvoyer les deux tokens
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
            refreshToken: refreshTokenString
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Aucun token fourni' });
        }

        const accessToken = authHeader.split(' ')[1];

        // On cherche tous les refresh tokens liés à cet utilisateur
        const userId = req.user?._id;

        if (!userId) {
            return res.status(403).json({ message: 'Utilisateur non identifié' });
        }

        await RefreshToken.deleteMany({ user: req.user._id });

        res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('Erreur lors du logout :', error);
        res.status(500).json({ message: 'Erreur serveur lors du logout' });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token manquant' });
        }

        // Chercher le token en base
        const existingToken = await RefreshToken.findOne({ token: refreshToken });

        if (!existingToken) {
            return res.status(403).json({ message: 'Refresh token invalide' });
        }

        // Vérifier expiration
        if (existingToken.expiresAt < new Date()) {
            await existingToken.deleteOne(); // suppression automatique
            return res.status(403).json({ message: 'Refresh token expiré' });
        }

        // Générer un nouveau access token
        const newAccessToken = jwt.sign({ id: existingToken.user }, process.env.JWT_SECRET, {
            expiresIn: '15m'
        });

        res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
        console.error('Erreur refresh token:', error);
        res.status(500).json({ message: 'Erreur lors du rafraîchissement du token' });
    }
};