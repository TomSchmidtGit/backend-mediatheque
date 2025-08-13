import express from 'express';
import { paginate } from '../middlewares/pagination.js';
import {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  addReview,
  updateReview,
} from '../controllers/mediaController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

/**
 * @swagger
 * /api/media:
 *   post:
 *     summary: Ajouter un nouveau média avec upload d'image
 *     description: Cette route permet d'ajouter un média (film, livre, musique) avec une image envoyée via `form-data`.
 *     tags: [Médias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Le Seigneur des Anneaux"
 *               type:
 *                 type: string
 *                 enum: ["book", "movie", "music"]
 *                 example: "movie"
 *               author:
 *                 type: string
 *                 example: "Peter Jackson"
 *               year:
 *                 type: integer
 *                 example: 2001
 *               description:
 *                 type: string
 *                 example: "Un film culte !"
 *               category:
 *                 type: string
 *                 description: ID de la catégorie (facultatif)
 *                 example: "661e2fe9b842fe7cbd6df154"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste d'IDs de tags (facultatif)
 *                 example: ["661e3105b842fe7cbd6df158", "661e3117b842fe7cbd6df15a"]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Média ajouté avec succès.
 *       400:
 *         description: Erreur de validation des champs ou image manquante.
 *       401:
 *         description: Non autorisé. Nécessite un token.
 */
router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  upload.single('image'),
  createMedia
);

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Récupérer une liste paginée de médias
 *     tags: [Médias]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page à récupérer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de médias par page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [book, movie, music]
 *         description: Type de média à filtrer (book, movie, music etc.)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: ID de la catégorie (facultatif)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Liste d'IDs de tags séparés par virgule (tag1,tag2 etc.)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par mot-clé dans le titre, la description ou l'auteur
 *     responses:
 *       200:
 *         description: Liste paginée des médias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalItems:
 *                   type: integer
 *                   example: 50
 *       500:
 *         description: Erreur serveur
 */
router.get('/', paginate(), getAllMedia);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     summary: Récupérer un média par son ID
 *     description: Retourne les détails d'un média spécifique.
 *     tags: [Médias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Média trouvé.
 *       404:
 *         description: Média non trouvé.
 */
router.get('/:id', getMediaById);

/**
 * @swagger
 * /api/media/{id}:
 *   put:
 *     summary: Modifier un média
 *     description: Permet à un administrateur de modifier un média existant.
 *     tags: [Médias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *               author:
 *                 type: string
 *               year:
 *                 type: integer
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               category:
 *                 type: string
 *                 description: ID de la catégorie (facultatif)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste d'IDs de tags (facultatif)
 *     responses:
 *       200:
 *         description: Média mis à jour avec succès.
 *       404:
 *         description: Média non trouvé.
 */
router.put(
  '/:id',
  protect,
  authorizeRoles('admin'),
  upload.single('image'),
  updateMedia
);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Supprimer un média
 *     description: Permet à un administrateur de supprimer un média existant.
 *     tags: [Médias]
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
 *         description: Média supprimé avec succès.
 *       404:
 *         description: Média non trouvé.
 */
router.delete('/:id', protect, authorizeRoles('admin'), deleteMedia);

/**
 * @swagger
 * /api/media/{id}/reviews:
 *   post:
 *     summary: Ajouter un avis sur un média
 *     description: Un utilisateur peut ajouter un avis avec une note (1-5) et un commentaire.
 *     tags: [Médias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Excellent film !"
 *     responses:
 *       201:
 *         description: Avis ajouté avec succès.
 *       400:
 *         description: L'utilisateur a déjà noté ce média.
 */
router.post('/:id/reviews', protect, addReview);

/**
 * @swagger
 * /api/media/{id}/reviews:
 *   put:
 *     summary: Modifier un avis sur un média
 *     description: Un utilisateur peut modifier son avis existant.
 *     tags: [Médias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Très bon mais un peu long"
 *     responses:
 *       200:
 *         description: Avis mis à jour avec succès.
 *       404:
 *         description: Aucun avis trouvé pour cet utilisateur sur ce média.
 */
router.put('/:id/reviews', protect, updateReview);

router.post('/test-upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "L'image n'a pas été reçue par multer" });
  }

  res
    .status(200)
    .json({ message: 'Image reçue avec succès', imageUrl: req.file.path });
});

export default router;
