import express from 'express';
import {
  searchExternalMedia,
  searchBooks,
  searchMovies,
  searchMusic,
  getExternalMediaById,
  advancedSearch,
} from '../controllers/externalApiController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/external/search:
 *   get:
 *     summary: Rechercher des médias via les APIs externes
 *     description: Recherche dans Google Books (livres), TMDB (films) et MusicBrainz (musique). Réservé aux administrateurs.
 *     tags: [APIs Externes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [book, movie, music]
 *         description: Type de média à rechercher
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum de résultats
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé, réservé aux administrateurs
 */
router.get('/search', protect, authorizeRoles('admin'), searchExternalMedia);

/**
 * @swagger
 * /api/external/search/books:
 *   get:
 *     summary: Rechercher des livres via Google Books
 *     tags: [APIs Externes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum de résultats
 *     responses:
 *       200:
 *         description: Livres trouvés
 */
router.get('/search/books', protect, authorizeRoles('admin'), searchBooks);

/**
 * @swagger
 * /api/external/search/movies:
 *   get:
 *     summary: Rechercher des films via TMDB
 *     tags: [APIs Externes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum de résultats
 *     responses:
 *       200:
 *         description: Films trouvés
 */
router.get('/search/movies', protect, authorizeRoles('admin'), searchMovies);

/**
 * @swagger
 * /api/external/search/music:
 *   get:
 *     summary: Rechercher de la musique via MusicBrainz
 *     tags: [APIs Externes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum de résultats
 *     responses:
 *       200:
 *         description: Musique trouvée
 */
router.get('/search/music', protect, authorizeRoles('admin'), searchMusic);

/**
 * @swagger
 * /api/external/search/advanced:
 *   get:
 *     summary: Recherche avancée avec filtres
 *     tags: [APIs Externes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Terme de recherche (titre)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Auteur/artiste
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [book, movie, tv, music]
 *         description: Type de média
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Année
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [google_books, tmdb, musicbrainz]
 *         description: Source de l'API
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum de résultats
 *     responses:
 *       200:
 *         description: Résultats de la recherche avancée
 */
router.get(
  '/search/advanced',
  protect,
  authorizeRoles('admin'),
  advancedSearch
);

/**
 * @swagger
 * /api/external/media/{source}/{type}/{id}:
 *   get:
 *     summary: Récupérer un média spécifique par ID externe
 *     tags: [APIs Externes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [google_books, tmdb, musicbrainz]
 *         description: Source de l'API
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [book, movie, tv, music]
 *         description: Type de média
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID externe du média
 *     responses:
 *       200:
 *         description: Média trouvé
 *       404:
 *         description: Média non trouvé
 */
router.get(
  '/media/:source/:type/:id',
  protect,
  authorizeRoles('admin'),
  getExternalMediaById
);

export default router;
