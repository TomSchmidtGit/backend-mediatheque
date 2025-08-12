// routes/contactRoutes.js
import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter spécifique pour le contact (éviter le spam)
const contactRateLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute en test, 15 en prod
    max: process.env.NODE_ENV === 'test' ? 100 : 3, // 100 messages max en test, 3 en prod
    message: {
        message: "Trop de messages envoyés. Veuillez attendre 15 minutes avant de renvoyer un message."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Validation des données du formulaire de contact
const contactValidator = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Veuillez fournir une adresse email valide'),
    body('subject')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Le sujet doit contenir entre 5 et 200 caractères'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Le message doit contenir entre 10 et 2000 caractères'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone('fr-FR')
        .withMessage('Numéro de téléphone invalide (format français attendu)')
];

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Formulaire de contact
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Envoyer un message de contact
 *     description: Permet d'envoyer un message via le formulaire de contact. Un email sera envoyé à la médiathèque et une confirmation sera envoyée à l'expéditeur.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Jean Dupont"
 *                 description: Nom de l'expéditeur
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *                 description: Adresse email de l'expéditeur
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Question sur les horaires d'ouverture"
 *                 description: Sujet du message
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: "Bonjour, j'aimerais connaître les horaires d'ouverture pendant les vacances scolaires."
 *                 description: Contenu du message
 *               phone:
 *                 type: string
 *                 example: "06 12 34 56 78"
 *                 description: Numéro de téléphone (optionnel)
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais."
 *                 contactId:
 *                   type: string
 *                   example: "contact_1640995200000_abc123def"
 *                   description: Identifiant unique du message pour le suivi
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tous les champs obligatoires doivent être remplis"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Le nom doit contenir entre 2 et 100 caractères"]
 *       429:
 *         description: Trop de tentatives
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trop de messages envoyés. Veuillez attendre 15 minutes."
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Une erreur interne s'est produite."
 */
router.post('/', contactRateLimiter, contactValidator, validateRequest, sendContactMessage);

export default router;