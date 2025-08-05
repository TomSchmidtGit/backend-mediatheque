import express from 'express';
import { 
    getDashboardStats, 
    getBorrowStatsByPeriod,
    getMediaStatsByCategory 
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Tableau de bord administrateur
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtenir les statistiques complètes du dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du dashboard récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     active:
 *                       type: integer
 *                       example: 145
 *                     inactive:
 *                       type: integer
 *                       example: 5
 *                     newThisMonth:
 *                       type: integer
 *                       example: 12
 *                 media:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 500
 *                     byType:
 *                       type: object
 *                       properties:
 *                         book:
 *                           type: integer
 *                           example: 300
 *                         movie:
 *                           type: integer
 *                           example: 150
 *                         music:
 *                           type: integer
 *                           example: 50
 *                 borrows:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: integer
 *                       example: 45
 *                     overdue:
 *                       type: integer
 *                       example: 3
 *                     returned:
 *                       type: integer
 *                       example: 250
 *                     total:
 *                       type: integer
 *                       example: 295
 *                 topBorrowedMedia:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       type:
 *                         type: string
 *                       author:
 *                         type: string
 *                       borrowCount:
 *                         type: integer
 *                 recentBorrows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       media:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           type:
 *                             type: string
 *                       borrowDate:
 *                         type: string
 *                         format: date-time
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                 mostActiveUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       borrowCount:
 *                         type: integer
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [warning, info, error]
 *                       message:
 *                         type: string
 *                       priority:
 *                         type: string
 *                         enum: [high, medium, low]
 *                 overdueDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       media:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       daysOverdue:
 *                         type: integer
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Réservé aux administrateurs
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', protect, adminOnly, getDashboardStats);

/**
 * @swagger
 * /api/dashboard/borrows/stats:
 *   get:
 *     summary: Obtenir les statistiques d'emprunts par période
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *         description: Période pour les statistiques
 *     responses:
 *       200:
 *         description: Statistiques d'emprunts récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   example: month
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Date au format YYYY-MM-DD ou YYYY-MM
 *                       count:
 *                         type: integer
 *                         description: Nombre d'emprunts
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Réservé aux administrateurs
 *       500:
 *         description: Erreur serveur
 */
router.get('/borrows/stats', protect, adminOnly, getBorrowStatsByPeriod);

/**
 * @swagger
 * /api/dashboard/media/categories:
 *   get:
 *     summary: Obtenir les statistiques des médias par catégorie
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par catégorie récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Nom de la catégorie
 *                     example: Science-fiction
 *                   types:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: [book, movie, music]
 *                         count:
 *                           type: integer
 *                   total:
 *                     type: integer
 *                     description: Nombre total de médias dans cette catégorie
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Réservé aux administrateurs
 *       500:
 *         description: Erreur serveur
 */
router.get('/media/categories', protect, adminOnly, getMediaStatsByCategory);

export default router;