import express from 'express';
import {
    createMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia
} from '../controllers/mediaController.js';

const router = express.Router();

router.post('/', createMedia);      // Ajouter un média
router.get('/', getAllMedia);       // Obtenir tous les médias
router.get('/:id', getMediaById);   // Obtenir un média spécifique
router.put('/:id', updateMedia);    // Modifier un média
router.delete('/:id', deleteMedia); // Supprimer un média

export default router;