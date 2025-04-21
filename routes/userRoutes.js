import express from 'express';
import { getUsers, updateUser } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { toggleFavorite, getMyFavorites } from '../controllers/userController.js';
import { deactivateUser } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer la liste des utilisateurs (Admin uniquement)
 *     description: Permet à un administrateur de récupérer tous les utilisateurs inscrits.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60d0fe4f5311236168a109ca"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "johndoe@example.com"
 *                   role:
 *                     type: string
 *                     example: "user"
 *       401:
 *         description: Accès refusé. Token manquant ou invalide.
 *       403:
 *         description: Accès interdit. Seuls les administrateurs peuvent voir cette liste.
 */
router.get('/', protect, authorizeRoles('admin'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur (Admin uniquement)
 *     description: Permet à un administrateur de modifier un utilisateur existant.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à modifier.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated User"
 *               email:
 *                 type: string
 *                 example: "updateduser@example.com"
 *               role:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *       401:
 *         description: Accès refusé. Token manquant ou invalide.
 *       403:
 *         description: Accès interdit. Seuls les administrateurs peuvent modifier les utilisateurs.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.put('/:id', protect, authorizeRoles('admin'), updateUser);

/**
 * @swagger
 * /api/users/favorites/toggle:
 *   post:
 *     summary: Ajouter ou retirer un média des favoris
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favori ajouté ou retiré avec succès
 */
router.post('/favorites/toggle', protect, toggleFavorite);

/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: Récupérer les favoris de l'utilisateur connecté
 *     tags: [Utilisateurs]
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
 *         description: Liste paginée des favoris
 */
router.get('/favorites', protect, getMyFavorites);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Désactiver un utilisateur
 *     description: Permet à un administrateur de désactiver un compte utilisateur sans le supprimer.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à désactiver.
 *     responses:
 *       200:
 *         description: Utilisateur désactivé avec succès.
 *       400:
 *         description: L'utilisateur est déjà désactivé.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.patch('/:id/deactivate', protect, authorizeRoles('admin'), deactivateUser);

export default router;