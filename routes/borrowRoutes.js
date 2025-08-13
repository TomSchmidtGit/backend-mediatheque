import express from 'express';
import {
  borrowMedia,
  returnMedia,
  getUserBorrows,
  getAllBorrows,
  getMyBorrows,
} from '../controllers/borrowController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/borrow:
 *   post:
 *     summary: Emprunter un média
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               media:
 *                 type: string
 *     responses:
 *       201:
 *         description: Emprunt créé avec succès
 *       400:
 *         description: Média déjà emprunté
 */
router.post('/', protect, authorizeRoles('admin'), borrowMedia);

/**
 * @swagger
 * /api/borrow/{id}/return:
 *   put:
 *     summary: Retourner un média
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Média retourné avec succès
 */
router.put('/:id/return', protect, returnMedia);

/**
 * @swagger
 * /api/borrow/user/{userId}:
 *   get:
 *     summary: Voir les emprunts d’un utilisateur (admin uniquement)
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste paginée des emprunts de l'utilisateur
 *       403:
 *         description: Accès interdit - réservé aux administrateurs
 */
router.get('/user/:userId', protect, authorizeRoles('admin'), getUserBorrows);

/**
 * @swagger
 * /api/borrow/mine:
 *   get:
 *     summary: Voir ses propres emprunts
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste paginée des emprunts de l'utilisateur
 */
router.get('/mine', protect, getMyBorrows);

/**
 * @swagger
 * /api/borrow:
 *   get:
 *     summary: Voir tous les emprunts (admin)
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste paginée de tous les emprunts
 */
router.get('/', protect, authorizeRoles('admin'), getAllBorrows);

export default router;
