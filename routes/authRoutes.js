import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser, requestPasswordReset, resetPassword, changePassword } from '../controllers/authController.js';
import { protect, logout } from '../middlewares/authMiddleware.js';
import { body, validationResult } from 'express-validator';
import { loginRateLimiter } from '../middlewares/rateLimiters.js';
import { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator, changePasswordValidator } from '../validators/authValidator.js';
import { validateRequest } from '../middlewares/validateRequest.js';

// Middleware de validation
const validateUser = [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion des utilisateurs et authentification
 */

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur dans les données fournies
 */
router.post('/register', registerValidator, validateRequest, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur existant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/login', loginRateLimiter, loginValidator, validateRequest, loginUser);


/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     description: Révoque le token actuel pour empêcher toute utilisation ultérieure.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnexion réussie
 *       401:
 *         description: Non autorisé - Token invalide ou absent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Non autorisé, token manquant
 */

router.post('/logout', protect, logoutUser);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès (JWT) à l'aide d'un refresh token valide
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de rafraîchissement fourni à la connexion
 *     responses:
 *       200:
 *         description: Nouveau token d'accès généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Token manquant
 *       403:
 *         description: Token invalide ou expiré
 */
router.post('/refresh', refreshAccessToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé (si l'email existe)
 *       400:
 *         description: Email manquant
 *       403:
 *         description: Compte désactivé
 */
router.post('/forgot-password', forgotPasswordValidator, validateRequest, requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialisation du mot de passe avec token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de réinitialisation reçu par email
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Données manquantes ou token invalide/expiré
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Changement de mot de passe (utilisateur connecté)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
 *       400:
 *         description: Ancien mot de passe incorrect ou nouveau mot de passe invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/change-password', protect, changePasswordValidator, validateRequest, changePassword);

export default router;