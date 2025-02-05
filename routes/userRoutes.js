import express from 'express';
import { getUsers, updateUser } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

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

export default router;