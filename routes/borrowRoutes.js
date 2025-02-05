import express from 'express';
import {
    borrowMedia,
    returnMedia,
    getUserBorrows,
    getAllBorrows
} from '../controllers/borrowController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Borrow
 *   description: Gestion des emprunts de médias
 */

/**
 * @swagger
 * /api/borrow:
 *   post:
 *     summary: Emprunter un média (utilisateur connecté)
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - media
 *             properties:
 *               user:
 *                 type: string
 *                 example: 60d5f8f1f2951c001c8e4d9a
 *               media:
 *                 type: string
 *                 example: 60d5f8f1f2951c001c8e4d9b
 *     responses:
 *       201:
 *         description: Emprunt créé avec succès
 *       400:
 *         description: Média déjà emprunté
 */
router.post('/', protect, borrowMedia);

/**
 * @swagger
 * /api/borrow/{id}/return:
 *   put:
 *     summary: Retourner un média emprunté
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'emprunt
 *     responses:
 *       200:
 *         description: Média retourné avec succès
 *       404:
 *         description: Emprunt non trouvé
 */
router.put('/:id/return', protect, returnMedia);

/**
 * @swagger
 * /api/borrow/user/{userId}:
 *   get:
 *     summary: Voir les emprunts d'un utilisateur
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des emprunts de l'utilisateur
 */
router.get('/user/:userId', protect, getUserBorrows);

/**
 * @swagger
 * /api/borrow:
 *   get:
 *     summary: Voir tous les emprunts (admin uniquement)
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les emprunts
 */
router.get('/', protect, authorizeRoles('admin'), getAllBorrows);

export default router;