import express from 'express';
import {
  createTag,
  getAllTags,
  updateTag,
  deleteTag,
} from '../controllers/tagController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Obtenir tous les tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Liste des tags récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 */
router.get('/', getAllTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Créer un nouveau tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Adapté au cinéma"
 *     responses:
 *       201:
 *         description: Tag créé avec succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', protect, adminOnly, createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Modifier un tag existant
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Thriller psychologique"
 *     responses:
 *       200:
 *         description: Tag mis à jour avec succès
 *       404:
 *         description: Tag non trouvé
 */
router.put('/:id', protect, adminOnly, updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Supprimer un tag existant
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag supprimé avec succès
 *       404:
 *         description: Tag non trouvé
 */
router.delete('/:id', protect, adminOnly, deleteTag);

export default router;
