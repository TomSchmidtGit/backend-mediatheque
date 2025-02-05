import express from 'express';
import {
    createMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia
} from '../controllers/mediaController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, adminOnly, createMedia);      // Seuls les admins peuvent ajouter un média
router.get('/', getAllMedia);       // Accès public
router.get('/:id', getMediaById);   // Accès public
router.put('/:id', protect, adminOnly, updateMedia);    // Seuls les admins peuvent modifier un média
router.delete('/:id', protect, adminOnly, deleteMedia); // Seuls les admins peuvent supprimer un média

export default router;