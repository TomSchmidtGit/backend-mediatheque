import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

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

        if (user && (await user.matchPassword(password))) {
            logger.info(`Connexion réussie pour: ${email}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            logger.warn(`Tentative de connexion échouée pour: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logger.error(`Erreur lors de la connexion: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};