import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import sendWelcomeEmail from '../utils/sendMails/sendWelcomeEmail.js';
import sendPasswordResetEmail from '../utils/sendMails/sendPasswordReset.js';

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

            // Envoyer email de bienvenue seulement si pas en mode test
            if (process.env.NODE_ENV !== 'test') {
                try {
                    await sendWelcomeEmail(user);
                } catch (emailError) {
                    console.error('Erreur envoi email bienvenue:', emailError.message);
                    // Ne pas faire échouer l'inscription si l'email ne fonctionne pas
                }
            }

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

// Demande de réinitialisation de mot de passe
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email requis' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
            logger.info(`Demande de réinitialisation de mot de passe pour un email inexistant: ${email}`);
            return res.status(200).json({ 
                message: 'Si cet email existe dans notre base, vous recevrez un lien de réinitialisation' 
            });
        }

        if (!user.actif) {
            logger.warn(`Tentative de réinitialisation de mot de passe pour un compte désactivé: ${email}`);
            return res.status(403).json({ message: 'Ce compte a été désactivé' });
        }

        // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
        await PasswordResetToken.deleteMany({ email: user.email });

        // Générer un nouveau token de réinitialisation
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

        await PasswordResetToken.create({
            email: user.email,
            token: resetToken,
            expiresAt
        });

        // Construire le lien de réinitialisation
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        // Envoyer l'email de réinitialisation
        try {
            await sendPasswordResetEmail(user, resetLink);
            logger.info(`Email de réinitialisation de mot de passe envoyé à ${email}`);
        } catch (emailError) {
            logger.error(`Erreur lors de l'envoi de l'email de réinitialisation: ${emailError.message}`);
            // Supprimer le token si l'email n'a pas pu être envoyé
            await PasswordResetToken.deleteMany({ email: user.email });
            return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
        }

        res.status(200).json({ 
            message: 'Si cet email existe dans notre base, vous recevrez un lien de réinitialisation' 
        });

    } catch (error) {
        logger.error(`Erreur lors de la demande de réinitialisation: ${error.message}`);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Réinitialisation du mot de passe avec token
export const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: 'Token, email et nouveau mot de passe requis' });
        }

        // Vérifier que le mot de passe respecte les critères
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        // Vérifier le token de réinitialisation
        const resetToken = await PasswordResetToken.findOne({ 
            token, 
            email: email.toLowerCase() 
        });

        if (!resetToken) {
            return res.status(400).json({ message: 'Token de réinitialisation invalide' });
        }

        if (resetToken.expiresAt < new Date()) {
            await resetToken.deleteOne();
            return res.status(400).json({ message: 'Token de réinitialisation expiré' });
        }

        // Trouver l'utilisateur
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();

        // Supprimer le token de réinitialisation
        await resetToken.deleteOne();

        // Supprimer tous les refresh tokens de l'utilisateur (déconnexion forcée)
        await RefreshToken.deleteMany({ user: user._id });

        logger.info(`Mot de passe réinitialisé avec succès pour ${email}`);

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        logger.error(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Changement de mot de passe (utilisateur connecté)
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
        }

        // Vérifier que le nouveau mot de passe respecte les critères
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        // Trouver l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier l'ancien mot de passe
        const isPasswordValid = await user.matchPassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Ancien mot de passe incorrect' });
        }

        // Vérifier que le nouveau mot de passe est différent de l'ancien
        if (await user.matchPassword(newPassword)) {
            return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l\'ancien' });
        }

        // Mettre à jour le mot de passe
        user.password = newPassword;
        user.markModified('password');
        await user.save();

        // Supprimer tous les refresh tokens de l'utilisateur (déconnexion forcée)
        await RefreshToken.deleteMany({ user: user._id });

        logger.info(`Mot de passe changé avec succès pour l'utilisateur ${userId}`);

        res.status(200).json({ message: 'Mot de passe modifié avec succès' });

    } catch (error) {
        logger.error(`Erreur lors du changement de mot de passe: ${error.message}`);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};