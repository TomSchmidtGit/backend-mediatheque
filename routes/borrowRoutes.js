import express from 'express';
import {
    borrowMedia,
    returnMedia,
    getUserBorrows,
    getAllBorrows
} from '../controllers/borrowController.js';

const router = express.Router();

router.post('/', borrowMedia);        // Emprunter un média
router.put('/:id/return', returnMedia); // Rendre un média
router.get('/user/:userId', getUserBorrows);  // Voir les emprunts d'un utilisateur
router.get('/', getAllBorrows);       // Voir tous les emprunts (admin)

export default router;
