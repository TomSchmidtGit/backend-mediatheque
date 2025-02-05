import express from 'express';
import {
    createMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia
} from '../controllers/mediaController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Gestion des médias (livres, films, musiques)
 */

/**
 * @swagger
 * /api/media:
 *   post:
 *     summary: Ajouter un nouveau média (admin uniquement)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - author
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Matrix
 *               type:
 *                 type: string
 *                 enum: [book, movie, music]
 *                 example: movie
 *               author:
 *                 type: string
 *                 example: Wachowski Sisters
 *               year:
 *                 type: number
 *                 example: 1999
 *     responses:
 *       201:
 *         description: Média créé avec succès
 *       400:
 *         description: Erreur dans les données fournies
 */
router.post('/', protect, authorizeRoles('admin'), createMedia);

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Récupérer tous les médias
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Liste de tous les médias
 */
router.get('/', getAllMedia);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     summary: Récupérer un média spécifique par son ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du média
 *     responses:
 *       200:
 *         description: Détails du média
 *       404:
 *         description: Média non trouvé
 */
router.get('/:id', getMediaById);

/**
 * @swagger
 * /api/media/{id}:
 *   put:
 *     summary: Modifier un média existant (admin uniquement)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du média à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Matrix Reloaded
 *               year:
 *                 type: number
 *                 example: 2003
 *     responses:
 *       200:
 *         description: Média modifié avec succès
 *       404:
 *         description: Média non trouvé
 */
router.put('/:id', protect, authorizeRoles('admin'), updateMedia);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Supprimer un média (admin uniquement)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du média à supprimer
 *     responses:
 *       200:
 *         description: Média supprimé avec succès
 *       404:
 *         description: Média non trouvé
 */
router.delete('/:id', protect, authorizeRoles('admin'), deleteMedia);

export default router;